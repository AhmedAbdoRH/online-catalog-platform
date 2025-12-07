"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // Basic validation
    if (!email || !password) {
        return redirect(`/login?message=${encodeURIComponent("البريد الإلكتروني وكلمة المرور مطلوبة")}`);
    }
    
    const supabase = await createClient();

    console.log("Attempting login for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Login error:", error.message);
        // More user-friendly error messages
        let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
        if (error.message.includes("Invalid login credentials")) {
            errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        }
        return redirect(`/login?message=${encodeURIComponent("خطأ: " + errorMessage)}`);
    }

    console.log("Login successful, redirecting to dashboard. Session:", data.session ? "Created" : "No Session");
    return redirect("/dashboard");
}

export async function signup(formData: FormData) {
    const originHeader = (await headers()).get("origin");
    const fallbackOrigin = process.env.NODE_ENV === 'production'
        ? "https://online-catalog.net"
        : "http://localhost:9003";
    const redirectTo = `${originHeader || fallbackOrigin}/auth/callback`;
    
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // Basic validation
    if (!email || !password) {
        return redirect(`/signup?message=${encodeURIComponent("البريد الإلكتروني وكلمة المرور مطلوبة")}`);
    }
    
    // Password strength check (minimum 6 characters)
    if (password.length < 6) {
        return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تكون 6 أحرف على الأقل")}`);
    }
    
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: redirectTo,
        },
    });

    if (error) {
        console.error("Signup error:", error.message);
        // More user-friendly error messages
        let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
        if (error.message.includes("User already registered")) {
            errorMessage = "هذا البريد الإلكتروني مسجل بالفعل";
        }
        return redirect(`/signup?message=${encodeURIComponent("خطأ: " + errorMessage)}`);
    }

    return redirect(`/login?message=${encodeURIComponent("تم إرسال رابط التأكيد إلى بريدك الإلكتروني")}`);
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/");
}