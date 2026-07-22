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
    const { supabase, response } = createClient(request)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const url = new URL(request.url)
    const hostname = request.headers.get('host') || ''
    const subdomain = getSubdomain(hostname)

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
      url.pathname.startsWith('/_next')

    // 2. Auth protection & redirects
    if (user && (url.pathname === '/login' || url.pathname === '/signup' || url.pathname === '/home' || url.pathname === '/go')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!user && url.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Subdomain Routing logic:
    // If request comes from storename.tagr-online.com and it's NOT a system path,
    // rewrite internally to /storename or /storename/path
    if (subdomain && !isSystemPath) {
      // Avoid double prefixing if path already starts with /subdomain
      const rewritePath = url.pathname.startsWith(`/${subdomain}`)
        ? url.pathname
        : `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`

      return NextResponse.rewrite(new URL(rewritePath, request.url), {
        request: {
          headers: request.headers,
        },
      })
    }

    return response
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
    '/((?!_next/.*|favicon.ico|api/.*|.*\\..*).*)',
  ],
}


