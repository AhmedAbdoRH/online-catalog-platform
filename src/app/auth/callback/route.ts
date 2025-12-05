import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth callback error:', error)
            return NextResponse.redirect(new URL('/login?message=حدث خطأ في التحقق', requestUrl.origin))
        }
    }

    // Redirect to dashboard after successful verification
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
