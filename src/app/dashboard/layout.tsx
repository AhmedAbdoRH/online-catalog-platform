import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { DashboardActionFeedback } from "@/components/dashboard/DashboardActionFeedback";
import { cn } from "@/lib/utils";
import { checkSubscriptionStatus, getProWhatsAppText } from "@/lib/plans";
import { startCatalogFreeTrial } from "@/app/actions/catalog";
import { Button } from "@/components/ui/button";
import { StartTrialButton } from "@/components/dashboard/StartTrialButton";
import Link from "next/link";
import { Crown, Lock, MessageCircle, Sparkles } from "lucide-react";
import type { Catalog } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const status = catalog ? checkSubscriptionStatus(catalog as Catalog) : null;

  // 1. Not Started State -> Show Welcome Screen to activate trial (skip for legacy basic users)
  if (catalog && status && status.isNotStarted && !status.isLegacyBasic) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col bg-background items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="bg-brand-primary/20 p-4 rounded-full text-brand-primary">
            <Sparkles className="h-10 w-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground">ابدأ شهرك المجاني الآن 🎁</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              احصل على 30 يوم تجربة مجانية لتفعيل كافة ميزات التطبيق وإنشاء متجرك الإلكتروني. لن يتم خصم أي مبالغ منك الآن.
            </p>
          </div>
          <form action={async () => {
            "use server";
            await startCatalogFreeTrial(catalog.id);
          }} className="w-full">
            <StartTrialButton />
          </form>
        </div>
      </div>
    );
  }

  // 2. Expired State -> Show Lock Screen demanding subscription
  if (catalog && status && status.isExpired) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col bg-background items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-red-500/20 rounded-3xl p-8 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="bg-red-500/10 p-4 rounded-full text-red-500">
            <Lock className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground">انتهت الفترة التجريبية 🔒</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              لقد انتهت فترة الـ 30 يوم بالإضافة إلى فترة السماح (10 أيام). يرجى الاشتراك لتفعيل متجرك واستعادة الوصول إلى لوحة التحكم.
            </p>
          </div>
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 rounded-xl text-base shadow-lg shadow-emerald-600/20">
            <Link href={`https://wa.me/201008116452?text=${encodeURIComponent(getProWhatsAppText('monthly'))}`} target="_blank">
              <MessageCircle className="h-5 w-5 ml-2" />
              تواصل معنا للاشتراك وتفعيل المتجر
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background relative overflow-x-clip">
      {catalog && <DashboardActionFeedback />}
      {catalog && <DashboardNav user={user} catalog={catalog} />}
      <div className={cn(
        "flex flex-col flex-1 w-full max-w-full",
        catalog ? "sm:gap-4 sm:py-4 sm:pr-14 pb-24 sm:pb-0" : "items-center justify-center min-h-[100dvh]"
      )}>
        {/* Trial/Grace Banners */}
        {catalog && status && status.isTrial && (
          <div className="bg-gradient-to-r from-blue-600 to-brand-primary text-white py-2.5 px-4 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm border-b border-white/5">
            <span>✨ أنت حالياً في الفترة التجريبية المجانية. متبقي لديك <strong>{status.remainingDays}</strong> يوم للاستمتاع بكافة مميزات المنصة.</span>
            <Link href={`https://wa.me/201008116452?text=${encodeURIComponent(getProWhatsAppText('monthly'))}`} target="_blank" className="underline hover:text-amber-200 transition-colors mr-2">
              اشترك الآن 🚀
            </Link>
          </div>
        )}
        
        {catalog && status && status.isGrace && (
          <div className="bg-gradient-to-r from-amber-500 to-red-600 text-white py-2.5 px-4 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm border-b border-white/5 animate-pulse">
            <span>⚠️ فترة السماح: متبقي لديك <strong>{status.remainingDays}</strong> أيام لتفعيل الاشتراك قبل إغلاق متجرك تلقائياً.</span>
            <Link href={`https://wa.me/201008116452?text=${encodeURIComponent(getProWhatsAppText('monthly'))}`} target="_blank" className="underline hover:text-amber-200 transition-colors mr-2 font-black">
              اشترك الآن وتجنب الإيقاف 💳
            </Link>
          </div>
        )}

        <main className={cn(
          "grid flex-1 items-start gap-4 md:gap-8 w-full max-w-full",
          catalog ? "p-4 sm:px-6 sm:py-0" : "w-full animate-in fade-in duration-1000"
        )}>
          {children}
        </main>
      </div>
      {catalog && <BottomNav />}
    </div>
  );
}
