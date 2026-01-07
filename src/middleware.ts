import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const url = new URL(request.url)

    // Log for debugging
    // console.log(`Middleware: ${url.pathname}, User: ${!!user}`);

    // 1. If at root, go to /home
    if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    // 2. If logged in and trying to access login/signup/home, go to dashboard
    if (user && (url.pathname === '/login' || url.pathname === '/signup' || url.pathname === '/home')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 3. If NOT logged in and trying to access dashboard, go to login
    if (!user && url.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch (e) {
    // If middleware fails, log it but don't break the app. 
    // Just allow the request to proceed.
    console.error('Middleware Error:', e);
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
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (files with extensions like .png, .jpg, etc.)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/.*|favicon.ico|api/.*|.*\\..*).*)',
  ],
}

