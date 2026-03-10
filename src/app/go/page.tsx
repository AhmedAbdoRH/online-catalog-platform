"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Store, Phone, ChevronDown } from "lucide-react";

const countries = [
  { code: '+20', name: 'مصر', flag: '🇪🇬' },
  { code: '+966', name: 'السعودية', flag: '🇸🇦' },
  { code: '+971', name: 'الإمارات', flag: '🇦🇪' },
  { code: '+212', name: 'المغرب', flag: '🇲🇦' },
];

function GoPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'onboarding' | 'registration'>('onboarding');
  const [storeName, setStoreName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '471992011728-n051jite6n017emj40qm5nht9a999jn6.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  const handleGoogleAuth = async (isSignup: boolean) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      if (isSignup) {
        localStorage.setItem('pendingStoreName', storeName);
        localStorage.setItem('pendingWhatsapp', selectedCountry.code + whatsapp);
        localStorage.setItem('pendingStoreSlug', whatsapp.replace(/[^\d]/g, ''));
      }

      if (Capacitor.isNativePlatform()) {
        const user = await GoogleAuth.signIn();
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: user.authentication.idToken,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: { access_type: 'offline', prompt: 'consent' },
            redirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      let friendlyMessage = 'حدث خطأ أثناء تسجيل الدخول بجوجل.';
      if (String(errorMessage).includes('10:')) friendlyMessage = 'خطأ في الإعدادات. تأكد من SHA-1 في Firebase.';
      else if (String(errorMessage).includes('12501')) friendlyMessage = 'تم إلغاء تسجيل الدخول.';
      if (String(errorMessage).includes('both auth code and code verifier')) { setIsLoading(false); return; }
      toast({ variant: "destructive", title: "خطأ", description: friendlyMessage });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-white relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent dark:from-orange-500/10" />
      <div className="relative w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-20 w-20">
            <Image src="/logo.png" alt="اونلاين كاتلوج" width={80} height={80} className="object-contain" priority />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">متجرك جاهز للانطلاق.</h1>
            <p className="text-base text-gray-400">امتلك متجرك في 3 دقائق. <span className="text-[#2eb872] font-bold">مجاناً!</span></p>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 w-full max-w-[280px] text-center">
                <div className="w-10 h-10 border-4 border-[#2eb872]/20 border-t-[#2eb872] rounded-full animate-spin mx-auto" />
                <span className="text-[#2eb872] font-medium block mt-3">جاري تسجيل الدخول...</span>
              </div>
            </div>
          )}

          {step === 'onboarding' ? (
            <div className="space-y-4">
              <Input placeholder="اسم متجرك" className="bg-black/40 border-2 h-14 pr-12 text-lg rounded-xl border-gray-800 focus-visible:ring-[#2eb872] text-right" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              <div className="relative flex items-center overflow-hidden bg-black/40 border-2 rounded-xl border-gray-800 focus-within:border-[#2eb872]">
                <div className="flex items-center h-14 bg-white/5 border-r-2 border-gray-800/50 px-4">
                  <select value={selectedCountry.code} onChange={(e) => { const c = countries.find(x => x.code === e.target.value); if (c) setSelectedCountry(c); }} className="bg-transparent text-white font-bold cursor-pointer outline-none" dir="ltr">
                    {countries.map((c) => <option key={c.code} value={c.code} className="bg-[#1a1a1a]">{c.flag} {c.code}</option>)}
                  </select>
                </div>
                <Input placeholder="رقم الواتساب" className="h-14 pr-4 border-0 bg-transparent text-right text-white" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d]/g, ''))} />
              </div>
              <Button onClick={() => storeName && whatsapp ? setStep('registration') : toast({ variant: "destructive", title: "بيانات ناقصة", description: "اسم المتجر ورقم الواتساب مطلوب" })} className="w-full h-14 bg-[#2eb872] hover:bg-[#25965d] text-[#05110d] font-bold text-xl rounded-xl">
                أنشئ متجرك الآن ✨
              </Button>
              <div className="pt-8 border-t border-gray-800 space-y-6">
                <div className="text-center text-white font-bold text-lg">هل لديك حساب بالفعل؟</div>
                <Button onClick={() => handleGoogleAuth(false)} disabled={isLoading} variant="outline" className="w-full h-14 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  تسجيل الدخول بجوجل
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2eb872]/20 text-[#2eb872]">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-[#2eb872]">رائع! ابدأ متجرك الآن</h2>
                <p className="text-gray-400 text-sm">سجل دخولك بجوجل لتفعيل متجرك</p>
              </div>
              <Button onClick={() => handleGoogleAuth(true)} disabled={isLoading} className="w-full h-16 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xl rounded-xl flex items-center justify-center gap-4">
                <svg className="w-7 h-7" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                التسجيل باستخدام جوجل
              </Button>
              <button onClick={() => setStep('onboarding')} className="w-full text-gray-500 hover:text-gray-300 text-sm font-medium">تعديل بيانات المتجر</button>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-gray-600 pt-8">بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية.</p>
      </div>
    </div>
  );
}

export default function GoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2eb872]" /></div>}>
      <GoPageContent />
    </Suspense>
  );
}
