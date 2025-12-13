import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

export async function POST(request: NextRequest) {
    try {
        const { email, password, action } = await request.json()
        const supabase = await createClient()

        if (action === 'signin') {
            // Handle email/password sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('Sign in error:', error)
                return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الدخول: ' + error.message }, { status: 400 })
            }

            return NextResponse.json({ success: true, user: data.user })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('Auth callback POST error:', error)
        return NextResponse.json({ error: 'حدث خطأ غير متوقع: ' + error.message }, { status: 500 })
    }
}