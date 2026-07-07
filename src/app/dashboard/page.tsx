import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AutoCatalogCreator } from "@/components/dashboard/AutoCatalogCreator";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import { QRCodeButton } from "@/components/dashboard/QRCodeButton";
import { StorePreviewModal } from "@/components/dashboard/StorePreviewModal";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { APP_URL } from "@/lib/constants";
import { Eye, Settings, Package, Tags, ArrowRight, Zap, Crown, Building, PlusCircle, Palette, Sparkles, Smartphone, ArrowDown } from "lucide-react";
import * as motion from "framer-motion/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Extract phone number ONLY if it's a phone-based login (format: phone@catalog.app)
  const userPhone = user.email?.endsWith('@catalog.app') 
    ? user.email.replace('@catalog.app', '') 
    : '';

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!catalog) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-0 md:pt-8 px-0 md:px-4 min-h-[100dvh] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex-1 flex flex-col"
        >
          {/* Background Decorative Element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none hidden md:block" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-luxury/10 rounded-full blur-[100px] pointer-events-none hidden md:block" />

          <Card className="glass-surface border-0 md:border border-white/10 overflow-hidden shadow-none md:shadow-2xl flex-1 flex flex-col bg-transparent md:bg-white/5">
            <div className="p-0 flex-1 flex flex-col">
              <div className="px-4 py-6 md:px-12 md:py-12 flex-1 flex flex-col">
                <AutoCatalogCreator
                  userPhone={userPhone}
                  userEmail={user.email || undefined}
                  userName={user.user_metadata?.full_name || user.user_metadata?.name}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Get categories count
  let { count: categoriesCount } = await supabase
    .from("categories")
    .select("*", { count: 'exact', head: true })
    .eq("catalog_id", catalog.id);

  // If there are no categories, automatically create a default category "عام"
  if (categoriesCount === 0) {
    const { data: defaultCategory, error: createCatError } = await supabase
      .from("categories")
      .insert({
        catalog_id: catalog.id,
        name: "عام"
      })
      .select()
      .single();
    
    if (!createCatError && defaultCategory) {
      categoriesCount = 1;
    }
  }

  // Get items count
  const { count: itemsCount } = await supabase
    .from("menu_items")
    .select("*", { count: 'exact', head: true })
    .eq("catalog_id", catalog.id);

  const catalogUrl = process.env.NODE_ENV === 'production'
    ? `https://tagr-online.com/${catalog.name}`
    : `${APP_URL}/${catalog.name}`;

  // Always use production URL for QR code
  const qrCodeUrl = `https://tagr-online.com/${catalog.name}`;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-brand-primary/10 to-brand-luxury/5 border-brand-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <CardHeader className="py-4 px-4 sm:py-5 sm:px-6">
            <CardTitle className="flex items-center gap-2">
              <span className="text-base sm:text-lg">المتجر الخاص بك نشط ✨</span>
            </CardTitle>
            <CardDescription className="hidden sm:block text-xs">شارك هذا الرابط مع عملائك للوصول إلى متجرك.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 z-10 relative py-4 px-4 sm:px-6 pt-0">
            <div className="flex-1 bg-background/50 p-2 sm:p-3 rounded-lg border border-border/50 w-full font-mono text-xs sm:text-sm flex items-center justify-between gap-2 min-w-0">
              <Link href={catalogUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors truncate min-w-0">
                {catalogUrl}
              </Link>
              <div className="shrink-0">
                <QRCodeButton url={qrCodeUrl} storeName={catalog.name} />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <StorePreviewModal url={catalogUrl} storeName={catalog.display_name || catalog.name} logoUrl={catalog.logo_url} />
              <CopyLinkButton url={catalogUrl} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {itemsCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-surface border-amber-500/30 overflow-hidden relative p-6 sm:p-8"
        >
          {/* Decorative gradients */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-black">
                <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                <span>خطوة واحدة متبقية لإطلاق متجرك 🚀</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                ابدأ بإضافة منتجك الأول الآن ✨
              </h2>
              
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                لقد قمنا بإنشاء متجرك بنجاح وتجهيز تصنيف افتراضي باسم <strong className="text-amber-400">"عام"</strong> من أجلك. كل ما تحتاجه الآن هو إضافة منتجك الأول لتفعيل المتجر والبدء في عرض كتالوجك واستقبال الطلبات!
              </p>

              {/* Step Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                    ١
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200">تفاصيل المنتج</h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">أدخل اسم المنتج، سعره، وصورته الجذابة.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 opacity-60">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-400">
                    ٢
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-300">نشر ورؤية طلباتك</h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">سيظهر فوراً للعملاء ليرسلوا طلباتهم للواتساب الخاص بك.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Container */}
            <div className="w-full md:w-auto shrink-0 flex flex-col items-center justify-center mt-2 md:mt-0">
              {/* Desktop Button */}
              <div className="hidden sm:block">
                <Button asChild size="lg" className="bg-amber-400 hover:bg-amber-500 text-brand-primary font-black shadow-xl shadow-amber-400/20 px-8 py-6 rounded-xl text-base transition-all hover:scale-105 active:scale-95 cursor-pointer">
                  <Link href="/dashboard/items?add=true">
                    <PlusCircle className="h-5 w-5 ml-2" />
                    أضف منتجك الأول الآن
                  </Link>
                </Button>
              </div>

              {/* Mobile visual guide */}
              <div className="block sm:hidden w-full text-center bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,_rgba(251,191,36,0.1),_transparent_70%)] pointer-events-none" />
                <p className="text-[14px] font-bold text-amber-400 flex flex-col items-center gap-2.5 leading-relaxed relative z-10">
                  <Smartphone className="h-7 w-7 text-amber-400 animate-bounce" />
                  <span>اضغط على الزر الدائري الأصفر العائم <strong className="text-white bg-amber-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center justify-center font-black text-xs mx-1">+</strong> في أسفل الشاشة لإضافة أول منتج.</span>
                </p>
                <div className="mt-3 flex justify-center relative z-10">
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowDown className="h-5 w-5 text-amber-400" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {/* Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col"
        >
          <Link href="/dashboard/categories" className="block group">
            <Card className="glass-surface-hover flex flex-col cursor-pointer transition-all hover:scale-[1.01] rounded-b-none border-b-0">
              <CardHeader className="p-3 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-brand-accent/20 text-brand-accent">
                    <Tags className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {categoriesCount || 0} تصنيف
                  </span>
                </div>
                <CardTitle className="text-sm sm:text-lg mt-3">
                  أضف تصنيفاتك الآن
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs line-clamp-1">
                  نظّم منتجاتك في مجموعات سهلة
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-5 pt-0">
                <div className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 text-[11px] sm:text-sm font-medium transition-all group-hover:shadow-lg group-hover:shadow-brand-accent/30">
                  <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>إضافة تصنيف جديد</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/categories" className="block group">
            <div className="glass-surface-hover border border-t-0 p-2 sm:p-3 rounded-b-xl flex items-center justify-between transition-all hover:bg-white/5">
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground">إدارة التصنيفات</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-[-2px] transition-all" />
            </div>
          </Link>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col"
        >
          <Link href="/dashboard/items" className="block group">
            <Card className="glass-surface-hover flex flex-col cursor-pointer transition-all hover:scale-[1.01] rounded-b-none border-b-0">
              <CardHeader className="p-3 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-brand-luxury/20 text-brand-luxury">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {itemsCount || 0} منتج
                  </span>
                </div>
                <CardTitle className="text-sm sm:text-lg mt-3">
                  أضف منتجاتك الآن
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs line-clamp-1">
                  أضف صوراً وأسعاراً لمنتجاتك
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-5 pt-0">
                <div className="w-full bg-brand-luxury hover:bg-brand-luxury/90 text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 text-[11px] sm:text-sm font-medium transition-all group-hover:shadow-lg group-hover:shadow-brand-luxury/30">
                  <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>إضافة منتج جديد</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/items" className="block group">
            <div className="glass-surface-hover border border-t-0 p-2 sm:p-3 rounded-b-xl flex items-center justify-between transition-all hover:bg-white/5">
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground">إدارة المنتجات</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-[-2px] transition-all" />
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-surface border-white/10 overflow-hidden w-full max-w-full">
          <CardContent className="p-4 sm:p-6 w-full max-w-full overflow-x-hidden">
            <SettingsForm catalog={catalog} userPhone={userPhone} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
