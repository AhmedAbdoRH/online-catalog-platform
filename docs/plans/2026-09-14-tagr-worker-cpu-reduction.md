# Tagr Online Worker CPU Reduction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent `tagr-online-platform` from hitting Cloudflare Workers resource-limit errors on the Free plan, while preserving every storefront, product page, SEO metadata, subdomain routing, and the merchant visit counter.

**Architecture:** Keep the dashboard and authenticated APIs dynamic, but make public storefront delivery cache-first. Remove avoidable Next.js/metadata work from repeated public requests, cache only public HTML using a host-and-path-safe key, and isolate visit recording so it cannot make the storefront render expensive. Measure production CPU by route before and after every rollout; a display average alone is not a deployment decision.

**Tech Stack:** Next.js 15 App Router, OpenNext Cloudflare 1.19.5, Cloudflare Workers/Cache/R2 (conditional), Supabase JS/Postgres, Wrangler, existing Cloudflare usage dashboard.

---

## Findings that drive this plan

- The current Free-plan CPU target is **10 ms per Worker invocation**. A displayed average of 100 ms or more is a real warning: even though it is an average rather than a per-request guarantee, it makes `1102: Worker exceeded resource limits` likely for similar requests.
- Both public route shells are forced dynamic: `src/app/[slug]/page.tsx` and `src/app/[slug]/item/[itemId]/page.tsx` use `force-dynamic` and `revalidate = 0`. Each HTML visit also runs `generateMetadata`, which initializes Supabase and queries `catalogs`.
- `src/middleware.ts` no longer authenticates public storefront traffic, which is the correct first optimization. It must remain that way. The current cache header is only applied to subdomain rewrites, not root-domain fallback URLs, and must be validated from the final HTML response before it is trusted.
- Images are already configured with `images.unoptimized = true`; Next’s image optimizer is therefore **not** the current CPU explanation.
- The visit counter is intentionally debounced in the browser to once per store per 24 hours. Its current server action uses the service-role client. It must never be exposed to the browser.

## Non-negotiable safeguards

- Do not put `SUPABASE_SERVICE_ROLE_KEY` or a Cloudflare token in client code, Git, logs, or a public RPC.
- Do not cache `/dashboard`, auth pages, `/api`, server actions, requests carrying credentials, or personalized responses.
- Cache keys must include the hostname as well as the pathname. `merchant-a.tagr-online.com/` must never return merchant B’s response.
- Roll out one change at a time, retain the last working deployment, and roll back immediately if a storefront returns the wrong merchant, stale paid-plan state, or a visit counter regression.

## Task 1 — Establish an evidence-based CPU baseline

**Files:** `wrangler.toml`, Cloudflare usage dashboard in `C:\Users\Ahmed\RH-net-2`

1. Enable Workers Observability in `wrangler.toml` using the current Wrangler syntax, with a conservative sampling rate suitable for production. Do not add secrets to the file.
2. In Cloudflare Workers Analytics/Logs, capture a 24-hour baseline segmented by route class: storefront home, product page, server action, dashboard, manifest, and static assets. Record requests, CPU average/max where available, status codes, and `1102`/`1027` counts.
3. Use `curl -I` against a representative subdomain storefront, root-domain path fallback, product URL, dashboard URL, and an authenticated request. Record `cf-cache-status`, `cache-control`, host, and response status. This proves what is and is not cacheable today.
4. Correct the monitoring UI labels: show CPU as an observed average, the actual Free-plan 10 ms invocation budget, the time window/sample count, and `1102` separately. Never present the average as an absolute per-request limit check.

**Verification:** Baseline document includes at least five representative URLs, their cache headers/statuses, and production error counts. The dashboard shows the reading timestamp and sample size.

## Task 2 — Make public HTML cacheable without changing what the visitor sees

**Files:** `src/middleware.ts`, `src/app/[slug]/page.tsx`, `src/app/[slug]/item/[itemId]/page.tsx`, `wrangler.toml`, `open-next.config.ts`

1. Create a small shared `public-storefront` cache policy module. It must accept only anonymous `GET`/`HEAD` storefront requests and form a cache identity from normalized hostname + pathname + approved query parameters.
2. Apply the same explicit policy to both subdomain and root-domain path fallback traffic only after proving that the root paths are storefront routes. Keep all system routes excluded.
3. Replace the blanket `force-dynamic`/`revalidate = 0` setup with the smallest safe static/ISR strategy supported by the installed OpenNext version. Keep `dynamicParams = true` so newly created merchant URLs work without a rebuild.
4. If on-demand ISR needs persistent incremental cache, bind a dedicated R2 bucket in `wrangler.toml` and enable OpenNext’s R2 incremental-cache override. Create it only after confirming the account’s R2 allowance and after a preview test; do not silently rely on per-instance cache.
5. Set final-page `Cache-Control` headers from the route response, not merely an intermediate rewrite. Start with a short freshness period (for example five minutes) plus stale-while-revalidate, then make freshness configurable per store if merchants require faster publication.
6. Preserve a no-cache path for a storefront request containing cookies or authorization; it must still render correctly.

**Verification:**

- A first request and a repeat anonymous request return the correct merchant content and `cf-cache-status` progresses to `HIT`.
- `merchant-a` and `merchant-b` with the same pathname produce distinct cache entries.
- Root-path and subdomain URLs serve the same merchant, while dashboard/auth/API routes never show public cache headers.
- Create, edit, hide, and close a catalog in staging; confirm the maximum visible staleness matches the chosen TTL and that a cache purge/revalidation path works.

## Task 3 — Remove repeated metadata database work from the hot path

**Files:** `src/app/[slug]/page.tsx`, `src/app/[slug]/item/[itemId]/page.tsx`, new `src/lib/storefront-metadata.ts`

1. Extract the duplicated catalog metadata lookup into one typed, cookie-free helper with a bounded cache and a safe fallback title/logo.
2. Make its cache key include catalog slug and invalidate/revalidate it whenever a merchant edits name, slogan, or logo.
3. Keep server-rendered canonical/Open Graph metadata for search engines; do not replace it solely with client-side `Head` updates.
4. Time the helper in preview and production logs/samples. If it remains above the CPU budget on cache misses, defer it from the HTML hot path only after agreeing on the SEO fallback.

**Verification:** Store name, slogan, canonical URL, OG image, and product title remain correct for two distinct merchants. A metadata lookup failure still returns a valid page and does not create a 5xx response.

## Task 4 — Keep the visit counter while taking it off the expensive storefront render path

**Files:** `src/app/[slug]/ClientCatalogPage.tsx`, `src/app/actions/stats.ts`, new migration under `supabase/migrations/` only if required

1. Leave the existing 24-hour `localStorage` debounce intact; it already prevents repeat visits from opening extra counter requests.
2. Measure the existing `recordStoreVisit` Server Action as its own route class. Do not assume it is the same cost as the storefront page.
3. If it materially contributes to Worker CPU, replace only that transport with a dedicated lightweight ingestion endpoint or a carefully designed Supabase database path. The browser may send a catalog ID and opaque visit token, but must not receive a service-role credential.
4. If a database function is needed, first inspect `increment_store_visit`. Do not grant anonymous access to the current admin function. Use a least-privilege design: fixed search path, narrow validation, duplicate prevention, explicit grants, RLS on any exposed table, and a rate-limit/abuse decision documented before release.
5. Keep the atomic increment and deduplication behavior. Failed analytics writes must not block the customer from viewing the storefront.

**Verification:** In a clean browser profile, one eligible storefront visit increases that merchant’s count exactly once; reloads/new tabs within 24 hours do not increase it. A user cannot submit a visit for an invalid catalog, and storefront rendering still succeeds when analytics is deliberately unavailable.

## Task 5 — Reduce client database chatter without reducing catalog features

**Files:** `src/app/[slug]/ClientCatalogPage.tsx`, `src/app/[slug]/item/[itemId]/ClientProductPage.tsx`, relevant typed Supabase query/helper files

1. Record the exact number of Supabase calls made by catalog and product pages. The product page currently makes sequential catalog, entitlement, product, variants, images, category, and related-product calls.
2. Consolidate only public, read-only data into narrow select/RPC endpoints, returning exactly the fields the UI needs. Preserve RLS and do not use the admin client for storefront reads.
3. Fetch independent product data in parallel after catalog validation, and cache immutable catalog settings briefly in the browser by catalog/version.
4. Keep free-plan entitlement filtering, hidden-product behavior, product variants, gallery, checkout/WhatsApp actions, and subscription closure logic unchanged.

**Verification:** Compare browser network traces before/after: fewer Supabase requests and no larger sensitive payload. Test a free merchant with hidden and over-entitlement products, plus an unlimited merchant, to prove visibility rules did not change.

## Task 6 — Bundle and runtime audit after the hot path is fixed

**Files:** `package.json`, `src/lib/background-removal.ts`, imports reached from public storefront routes

1. Run an OpenNext production build and inspect the Worker bundle/module graph. Identify whether Firebase, Genkit, ONNX/background-removal, Capacitor, or other heavy packages reach the public Worker bundle.
2. Move non-storefront or browser-only imports behind route-level dynamic imports; remove them from the Worker graph only after an import-trace test proves they are not required server-side.
3. Keep `images.unoptimized` unless measured evidence shows a different deliberate image-delivery design is safe. Do not re-enable Worker image optimization on the Free CPU budget.

**Verification:** `npm run build` succeeds, the Worker bundle does not grow, and public storefront/product flows still pass manual smoke tests on desktop and mobile dimensions.

## Task 7 — Safe rollout and acceptance criteria

**Files:** deployment workflow, Cloudflare usage dashboard

1. Deploy first to a preview Worker/domain, run the verification matrix, then release to one low-risk production merchant before the full route deployment.
2. Watch the next 24 hours of production data. Revert the most recent cache/runtime change if `1102` occurs, cache identity is wrong, or catalog updates exceed the agreed freshness window.
3. Treat `1027` separately: it is daily Worker request-limit exhaustion, not CPU exhaustion. Keep the dashboard’s daily/monthly edge-request indicators and per-Worker breakdown active alongside CPU/error monitoring.

**Acceptance criteria:**

- No `1102` errors during a representative 24-hour production window.
- Public cached storefront requests do not execute the Next.js Worker after cache warm-up.
- The `tagr-online-platform` CPU average is below 8 ms for the monitored workload; any remaining cache miss is measured and documented rather than hidden by an average.
- No cross-merchant cached content, no authentication regression, and no loss or double-counting of valid merchant visits.
- Build succeeds and the production monitor records the last successful reading, error counts, and the next recommended action.

## Rollback plan

Keep the previous Worker deployment available. Revert first by disabling only the new public HTML cache policy, then restore the previous page runtime configuration if needed. Do not roll back the existing middleware change that removed public `auth.getUser()` calls unless a targeted test proves it caused a regression.
