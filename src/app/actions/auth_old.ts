"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    
    // Basic validation
    if (!phone || !password) {
        return redirect(`/login?message=${encodeURIComponent("رقم الهاتف وكلمة المرور مطلوبة")}`);
    }
    
    // Convert phone to email format for Supabase (since Supabase uses email as primary identifier)
    const email = `${phone}@catalog.app`;
    
    const supabase = await createClient();

    console.log("Attempting login for phone:", phone);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
            data: {
                phone: phone,
                login_method: 'phone'
            }
        }
    });

    if (error) {
        console.error("Login error:", error.message);
        // More user-friendly error messages
        let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
        if (error.message.includes("Invalid login credentials")) {
            errorMessage = "رقم الهاتف أو كلمة المرور غير صحيحة";
        }
        return redirect(`/login?message=${encodeURIComponent("خطأ: " + errorMessage)}`);
    }

    // Update user metadata with phone number if not already set
    if (data.user && !data.user.user_metadata?.phone) {
        await supabase.auth.updateUser({
            data: {
                phone: phone,
                login_method: 'phone'
            }
        });
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
    
    const countryCode = formData.get("countryCode") as string || "+20";
    const confirmCountryCode = formData.get("confirmCountryCode") as string || "+20";
    const phone = formData.get("phone") as string;
    const confirmPhone = formData.get("confirmPhone") as string;
    const password = formData.get("password") as string;
    
    // Combine country code with phone number
    const fullPhone = countryCode + phone;
    const fullConfirmPhone = confirmCountryCode + confirmPhone;
    
    // Basic validation
    if (!phone || !confirmPhone || !password) {
        return redirect(`/signup?message=${encodeURIComponent("جميع الحقول مطلوبة")}`);
    }
    
    // Phone validation
    if (fullPhone !== fullConfirmPhone) {
        return redirect(`/signup?message=${encodeURIComponent("رقم الهاتف وتأكيد الرقم لا يتطابقان")}`);
    }
    
    // Basic phone format validation (Egyptian numbers without country code)
    if (!/^01[0-9]{9}$/.test(phone)) {
        return redirect(`/signup?message=${encodeURIComponent("رقم الهاتف غير صحيح")}`);
    }
    
    // Password strength check (minimum 8 characters with uppercase, lowercase, and number)
    if (password.length < 8) {
        return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تكون 8 أحرف على الأقل")}`);
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
        return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل")}`);
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
        return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل")}`);
    }
    
    if (!/(?=.*\d)/.test(password)) {
        return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل")}`);
    }
    
    // Convert phone to email format for Supabase (use full phone with country code)
    const email = `${fullPhone}@catalog.app`;
    
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: redirectTo,
            data: {
                phone: phone,
                login_method: 'phone'
            }
        },
    });

    if (error) {
        console.error("Signup error:", error.message);
        // More user-friendly error messages
        let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
        if (error.message.includes("User already registered")) {
            errorMessage = "رقم الهاتف مسجل بالفعل";
        }
        return redirect(`/signup?message=${encodeURIComponent("خطأ: " + errorMessage)}`);
    }

    return redirect(`/login?message=${encodeURIComponent("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول")}`);
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/");
}