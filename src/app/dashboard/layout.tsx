import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { DashboardActionFeedback } from "@/components/dashboard/DashboardActionFeedback";
import { cn } from "@/lib/utils";
import { checkSubscriptionStatus, formatPlanPrice, getProWhatsAppText, PRO_MONTHLY_ORIGINAL_PRICE_EGP, PRO_MONTHLY_PRICE_EGP } from "@/lib/plans";
import { startCatalogFreeTrial } from "@/app/actions/catalog";
import { Button } from "@/components/ui/button";
import { StartTrialButton } from "@/components/dashboard/StartTrialButton";
import Link from "next/link";
import { ArrowLeft, BarChart3, Link2, MessageCircle, ShieldCheck, Sparkles, Store, Zap } from "lucide-react";
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

  // 2. Expired State -> Friendly renewal screen: reassurance + value + clear CTA
  if (catalog && status && status.isExpired) {
    const benefits = [
      {
        icon: Store,
        title: "خلي منتجاتك متاحة لعملائك",
        desc: "متجرك يفضل مفتوح ومنتجاتك جاهزة للمشاهدة في أي وقت.",
        tone: "border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-600 dark:text-emerald-400",
      },
      {
        icon: MessageCircle,
        title: "استمر في استقبال الطلبات على واتساب",
        desc: "العميل يطلب منك مباشرة بسهولة وبدون شرح متكرر.",
        tone: "border-green-500/25 bg-gradient-to-br from-green-500/15 via-green-500/5 to-transparent text-green-600 dark:text-green-400",
      },
      {
        icon: Link2,
        title: "رابط متجرك يفضل شغال",
        desc: "شارك رابط واحد ثابت بدل إرسال الصور والأسعار يدويًا كل مرة.",
        tone: "border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-transparent text-sky-600 dark:text-sky-400",
      },
      {
        icon: BarChart3,
        title: "تابع زيارات متجرك",
        desc: "اعرف عدد الزيارات واهتمام العملاء علشان تبيع بشكل أذكى.",
        tone: "border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-transparent text-violet-600 dark:text-violet-400",
      },
      {
        icon: ShieldCheck,
        title: "كل شغلك محفوظ وجاهز للعودة فورًا",
        desc: "فعّل الاشتراك وكمّل من نفس المكان بدون ما تبدأ من جديد.",
        tone: "border-amber-500/25 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent text-amber-600 dark:text-amber-400",
      },
    ];

    return (
      <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background p-4">
        {/* خلفية ناعمة */}
        <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl" />

        <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-card/95 shadow-2xl backdrop-blur sm:p-8">
          {/* شريط متدرج أعلى الكارت */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-emerald-500 via-teal-400 to-sky-500" />

          <div className="p-5 sm:p-3">
            {/* رأس الشاشة */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-emerald-500/40 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/25 via-emerald-500/10 to-transparent text-emerald-600 shadow-inner dark:text-emerald-400">
                  <Zap className="h-8 w-8 fill-current" />
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 sm:text-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
                منتجاتك وبياناتك كلها محفوظة في أمان
              </span>

              <h1 className="text-2xl font-black leading-snug text-foreground sm:text-3xl">
                متجرك جاهز يكمل…{" "}
                <span className="bg-gradient-to-l from-emerald-600 to-teal-400 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                  فعّل الاشتراك
                </span>{" "}
                وارجع تبيع
              </h1>

              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                فترتك المجانية انتهت، لكن كل شغلك لسه مكانه. فعّل الاشتراك الآن لاستعادة المتجر ومواصلة استقبال الطلبات من نفس اللحظة.
              </p>
            </div>

            {/* كروت القيمة — Carousel على الموبايل / Grid على الديسكتوب */}
            <div className="mt-6">
              <ul className="
                -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2
                [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
                sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0
              ">
                {benefits.map((benefit, i) => (
                  <li
                    key={benefit.title}
                    className={`
                      group flex min-w-[78%] snap-center flex-col gap-2.5 rounded-2xl border border-border/60 bg-background/60 p-4
                      text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-background hover:shadow-lg hover:shadow-emerald-500/5
                      sm:min-w-0 sm:flex-row sm:items-start sm:gap-3 sm:p-3.5
                      ${i === benefits.length - 1 ? "sm:col-span-2" : ""}
                    `}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${benefit.tone}`}>
                      <benefit.icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-foreground">{benefit.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{benefit.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* مؤشر السحب للموبايل */}
              <p className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-bold text-muted-foreground sm:hidden">
                اسحب لمشاهدة باقي المزايا
                <ArrowLeft className="h-3 w-3 animate-pulse" />
              </p>
            </div>

            {/* الأزرار */}
            <div className="mt-6 space-y-2.5">
              <Button asChild className="h-12 w-full rounded-xl bg-emerald-600 text-base font-black text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700">
                <Link href={`https://wa.me/201008116452?text=${encodeURIComponent(getProWhatsAppText('monthly'))}`} target="_blank">
                  <MessageCircle className="ml-2 h-5 w-5" />
                  فعّل متجرك الآن
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-11 w-full rounded-xl text-sm font-bold">
                <Link href="/#pricing">
                  عرض الباقات
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>

              <p className="pt-1 text-center text-xs leading-relaxed text-muted-foreground">
                اشترك بـ{" "}
                <span className="line-through opacity-60">{formatPlanPrice(PRO_MONTHLY_ORIGINAL_PRICE_EGP)}</span>{" "}
                <span className="font-black text-emerald-600 dark:text-emerald-400">{formatPlanPrice(PRO_MONTHLY_PRICE_EGP)}</span>{" "}
                شهرياً — تفعيل فوري بعد التواصل على واتساب.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] w-full max-w-full flex-col bg-background relative overflow-x-hidden">
      {catalog && <DashboardActionFeedback />}
      {catalog && <DashboardNav user={user} catalog={catalog} />}
      <div className={cn(
        "flex flex-col flex-1 w-full max-w-full min-w-0",
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
          "flex-1 w-full max-w-full min-w-0 overflow-x-hidden",
          catalog ? "p-3 sm:p-4 md:p-6" : "w-full animate-in fade-in duration-1000"
        )}>
          <div className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8">
            {children}
          </div>
        </main>
      </div>
      {catalog && <BottomNav />}
    </div>
  );
}
