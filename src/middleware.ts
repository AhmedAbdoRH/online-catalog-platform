import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

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

  // Main domain check
  const rootDomain = 'tagr-online.com'

  // Handle direct access to root domain
  if (host === rootDomain || host === `www.${rootDomain}`) {
    return null
  }

  // Handle subdomains
  if (host.endsWith(`.${rootDomain}`)) {
    const sub = host.replace(`.${rootDomain}`, '')
    if (sub && sub !== 'www' && sub !== 'app' && sub !== 'admin' && sub !== 'api') {
      return sub
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
        data: { user },
      } = await supabase.auth.getUser()

      // Auth protection & redirects.
      if (user && (url.pathname === '/login' || url.pathname === '/signup' || url.pathname === '/home' || url.pathname === '/go')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      if (!user && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      return response
    }

    // 1. System paths that shouldn't be rewritten to store subdomain
    const isSystemPath =
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/signup') ||
      url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/forgot-password') ||
      url.pathname.startsWith('/reset-password') ||
      url.pathname.startsWith('/verify-otp') ||
      url.pathname.startsWith('/privacy') ||
      url.pathname.startsWith('/health') ||
      url.pathname.startsWith('/go') ||
      url.pathname.startsWith('/home') ||
      url.pathname.startsWith('/auth') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/_next') ||
      url.pathname === '/favicon.ico'

    // 2. Subdomain Routing logic:
    // If request comes from storename.tagr-online.com and it's NOT a system path,
    // rewrite internally to /storename or /storename/path so the dynamic
    // [slug] route is the single source of truth for storefront rendering.
    if (subdomain && !isSystemPath) {
      // Avoid double prefixing if path already starts with /subdomain
      const rewritePath = url.pathname.startsWith(`/${subdomain}`)
        ? url.pathname
        : `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`

      const response = NextResponse.rewrite(new URL(rewritePath, request.url), {
        request: {
          headers: request.headers,
        },
      });

      // Public subdomain storefronts are safe to cache only when the request
      // does not carry user credentials or cookies. This lets Cloudflare serve
      // repeat public visits without running the Worker while protecting private sessions.
      const hasPrivateCredentials = request.headers.has('authorization') || request.headers.has('cookie');
      if (!hasPrivateCredentials && request.method === 'GET') {
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
      }

      return response;
    }

    // 3. Path-based fallback on the root domain (e.g. tagr-online.com/mediaconnecthub)
    // is routed to the same dynamic [slug] handler. This is the exact same target
    // Next.js would pick up naturally, but doing the rewrite here keeps both access
    // methods identical (same headers, same rewrite semantics) so the storefront
    // works regardless of whether the visitor uses a subdomain or the path.
    // We also do NOT add a Cache-Control header for path-based access because
    // mixing the public site (root domain landing pages) with cached storefront
    // responses can cause cross-store pollution.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  } catch (e) {
    console.error('Middleware Error:', e);
    const url = new URL(request.url);
    if (url.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
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


