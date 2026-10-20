import { type NextRequest } from "next/server";

// Cloudflare Workers Cache is keyed by path by default, not hostname. `Vary`
// below partitions the cache by Host so a subdomain can never receive another
// merchant's cached response. Keep the browser copy uncacheable; only the edge
// cache should retain the shared storefront shell.
export const PUBLIC_STOREFRONT_CACHE_CONTROL =
    "public, max-age=0, s-maxage=300, stale-while-revalidate=60";
export const PRIVATE_NO_STORE_CACHE_CONTROL = "private, no-store";

const SYSTEM_PREFIXES = [
    "/_next",
    "/api",
    "/auth",
    "/dashboard",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
    "/health",
    "/privacy",
    "/go",
    "/home",
];

export function isSystemPath(pathname: string): boolean {
    if (pathname === "/favicon.ico") return true;
    return SYSTEM_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isAnonymousStorefrontRequest(request: NextRequest): boolean {
    if (request.method !== "GET" && request.method !== "HEAD") {
        return false;
    }

    // Workers Cache is checked before middleware runs. Query strings can carry
    // preview/personalization state, and cookies must be isolated by Vary.
    if (
        request.headers.has("cookie") ||
        request.headers.has("authorization") ||
        new URL(request.url).search
    ) {
        return false;
    }

    return true;
}

export function setStorefrontCacheHeaders(
    headers: Headers,
    cacheable: boolean,
): void {
    headers.set(
        "Cache-Control",
        cacheable ? PUBLIC_STOREFRONT_CACHE_CONTROL : PRIVATE_NO_STORE_CACHE_CONTROL,
    );

    if (!cacheable) return;

    // The Workers Cache does not include hostname or cookies in its default
    // key. Vary makes these request headers part of the response variant key.
    const existingVary = headers.get("Vary");
    const varyValues = new Set(
        (existingVary || "")
            .split(",")
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean),
    );
    varyValues.add("host");
    varyValues.add("cookie");
    varyValues.add("x-forwarded-host");
    headers.set("Vary", [...varyValues].join(", "));
}
