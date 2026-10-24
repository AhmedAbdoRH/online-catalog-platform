import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'
import { isSystemPath, isAnonymousStorefrontRequest, setStorefrontCacheHeaders } from '@/lib/storefront-cache'
import { ROOT_DOMAINS, RESERVED_SUBDOMAINS } from '@/lib/store-urls'

// Extract subdomain from hostname if present
function getSubdomain(hostname: string): string | null {
  const host = hostname.split(':')[0].toLowerCase()

  // Ignore localhost / IP directly
  if (host === 'localhost' || host === '127.0.0.1') return null

  // Support local development with store.localhost
  if (host.endsWith('.localhost')) {
    const sub = host.replace('.localhost', '')
    if (sub && sub !== 'www') return sub
    return null
  }

  // Cloudflare pages domain check (e.g. online-catalog-platform.pages.dev)
  if (host.endsWith('.pages.dev')) {
    return null
  }

  // Main domain checks — storefronts are served under both root domains
  // (stores on tagr-online.com, restaurants on online-catalog.net).
  for (const rootDomain of ROOT_DOMAINS) {
    // Handle direct access to the root domain (apex or www)
    if (host === rootDomain || host === `www.${rootDomain}`) {
      return null
    }

    // Handle subdomains on any known root domain
    if (host.endsWith(`.${rootDomain}`)) {
      const sub = host.replace(`.${rootDomain}`, '')
      if (sub && !RESERVED_SUBDOMAINS.includes(sub as typeof RESERVED_SUBDOMAINS[number])) {
        return sub
      }
    }
  }

  return null
}

export async function middleware(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
    const subdomain = getSubdomain(hostname)

    // Public storefronts only need subdomain routing. Avoid an Auth request to
    // Supabase for every visitor; it does not affect catalog loading or visit
    // tracking, which are handled by the storefront itself.
    const needsAuth =
      url.pathname.startsWith('/dashboard') ||
      url.pathname === '/login' ||
      url.pathname === '/signup' ||
      url.pathname === '/home' ||
      url.pathname === '/go'

    if (needsAuth) {
      const { supabase, response } = createClient(request)
      const {
        data: { user: validatedUser },
      } = await supabase.auth.getUser()

      // If Supabase auth API is unreachable, getUser() returns null even with a
      // valid cookie session. Fall back to the local session so email/password
      // login is not immediately undone by a transient fetch failure.
      let user = validatedUser
      if (!user) {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        user = session?.user ?? null
      }

      // Auth protection & redirects.
      if (user && (url.pathname === '/login' || url.pathname === '/signup' || url.pathname === '/home' || url.pathname === '/go')) {
        const redirect = NextResponse.redirect(new URL('/dashboard', request.url))
        setStorefrontCacheHeaders(redirect.headers, false)
        return redirect
      }

      if (!user && url.pathname.startsWith('/dashboard')) {
        const redirect = NextResponse.redirect(new URL('/login', request.url))
        setStorefrontCacheHeaders(redirect.headers, false)
        return redirect
      }

      setStorefrontCacheHeaders(response.headers, false)
      return response
    }

    // 1. System paths that shouldn't be treated or rewritten as a store
    const isSys = isSystemPath(url.pathname);

    // 2. Subdomain Routing logic:
    // If request comes from storename.tagr-online.com or
    // storename.online-catalog.net and it's NOT a system path,
    // rewrite internally to /storename or /storename/path so the dynamic
    // [slug] route is the single source of truth for storefront rendering.
    if (subdomain && !isSys) {
      // Avoid double prefixing if path already starts with /subdomain
      const rewritePath = url.pathname.startsWith(`/${subdomain}`)
        ? url.pathname
        : `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`

      const response = NextResponse.rewrite(new URL(rewritePath, request.url), {
        request: {
          headers: request.headers,
        },
      });

      // Host-based storefront URLs (e.g. merchant.tagr-online.com/ or
      // merchant.online-catalog.net/) must vary
      // by hostname because Cloudflare's default Worker cache key omits it.
      setStorefrontCacheHeaders(response.headers, isAnonymousStorefrontRequest(request));

      return response;
    }

    // 3. Path-based storefront on root domain (e.g. tagr-online.com/mediaconnecthub)
    // If it is an anonymous GET on a non-system path (a merchant slug or product page),
    // apply the same public storefront cache policy.
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    setStorefrontCacheHeaders(
      response.headers,
      url.pathname !== '/' && !isSys && isAnonymousStorefrontRequest(request),
    );

    return response;
  } catch (e) {
    console.error('Middleware Error:', e);
    const url = new URL(request.url);
    if (url.pathname.startsWith('/dashboard')) {
      const response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      setStorefrontCacheHeaders(response.headers, false)
      return response
    }
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    setStorefrontCacheHeaders(response.headers, false)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files & assets
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
    },
  ],
}


