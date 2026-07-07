"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Tags, Plus, X, Home, ArrowDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ItemForm } from "./ItemForm";
import { createClient } from "@/lib/supabase/client";
import type { Category, Catalog } from "@/lib/types";
import { isProPlan } from "@/lib/plans";

const leftNavItems = [
  {
    label: "التصنيفات",
    href: "/dashboard/categories",
    icon: Tags,
  },
];

const rightNavItems = [
  {
    label: "المنتجات",
    href: "/dashboard/items",
    icon: Package,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemsCount, setItemsCount] = useState<number | null>(null);
  const [dismissedOverlay, setDismissedOverlay] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dismissedOnboardingOverlay");
      if (stored === "true") {
        setDismissedOverlay(true);
      }
    }
  }, []);

  const handleDismissOverlay = () => {
    localStorage.setItem("dismissedOnboardingOverlay", "true");
    setDismissedOverlay(true);
  };

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: catalogData } = await supabase
      .from("catalogs")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (catalogData) {
      setCatalog(catalogData);

      // Fetch items count
      const { count } = await supabase
        .from("menu_items")
        .select("*", { count: 'exact', head: true })
        .eq("catalog_id", catalogData.id);
      
      setItemsCount(count || 0);

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("catalog_id", catalogData.id);
      
      setCategories(categoriesData || []);
    }
  };

  useEffect(() => {
    if (isAddItemOpen) {
      fetchData();
    }
  }, [isAddItemOpen]);

  useEffect(() => {
    fetchData();

    // Listen for category addition to show tooltip
    const handleCategoryAdded = () => {
      fetchData().then(() => {
        // Only show if there are still no items
        // We use a small delay to ensure fetchData completed and state is updated
        setTimeout(() => {
          setShowTooltip(true);
        }, 500);
      });
    };

    window.addEventListener('categoryAdded', handleCategoryAdded);
    return () => window.removeEventListener('categoryAdded', handleCategoryAdded);
  }, []);

  useEffect(() => {
    // Show product tooltip after 2 seconds only if there are no items
    if (itemsCount === 0) {
      const showTimer = setTimeout(() => {
        setShowTooltip(true);
      }, 2000);

      return () => clearTimeout(showTimer);
    } else {
      setShowTooltip(false);
    }
  }, [itemsCount]);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 150 }}
      className="fixed bottom-0 left-0 right-0 z-50 block sm:hidden"
    >
      <div className="relative flex h-24 w-full items-center justify-center border-t border-white/20 bg-brand-primary px-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,179,0,0.05),_transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-brand-accent/40" />
        
        {/* Floating Home Button - Above the bar, centered, circular, neutral */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center translate-y-1">
          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-xl shadow-2xl transition-all duration-300",
                pathname === "/dashboard" ? "ring-2 ring-brand-accent/50 scale-105 bg-brand-primary/40" : "hover:bg-white/5"
              )}
            >
              <Home className={cn("h-8 w-8", pathname === "/dashboard" ? "text-brand-accent" : "text-white/80")} />
            </motion.div>
          </Link>
          <span className="mt-1.5 text-[10px] font-bold text-white/40 tracking-widest uppercase">الرئيسية</span>
        </div>

        {/* Nav Items Container */}
        <div className="flex w-full items-center justify-between px-2 translate-y-1.5">
          {/* Left Side Items */}
          <div className="flex flex-1 items-center justify-start gap-1">
            {leftNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 transition-all duration-300 min-w-[100px]",
                    isActive ? "scale-120 opacity-100" : "opacity-80 hover:opacity-100"
                  )}
                >
                  <Icon className={cn("h-9 w-9 mb-2", isActive ? "text-brand-accent" : "text-white")} />
                  <span className={cn("text-[16px] font-black tracking-tight", isActive ? "text-brand-accent" : "text-white/95")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute -bottom-1 h-[2px] w-12 rounded-full bg-brand-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Vertical Separator under Home Button */}
          <div className="relative flex h-12 w-16 items-center justify-center">
            <div className="h-8 w-[1px] bg-white/20" />
          </div>

          {/* Right Side Items */}
          <div className="flex flex-1 items-center justify-end gap-1">
            {rightNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 transition-all duration-300 min-w-[100px]",
                    isActive ? "scale-120 opacity-100" : "opacity-80 hover:opacity-100"
                  )}
                >
                  <Icon className={cn("h-9 w-9 mb-2", isActive ? "text-brand-accent" : "text-white")} />
                  <span className={cn("text-[16px] font-black tracking-tight", isActive ? "text-brand-accent" : "text-white/95")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute -bottom-1 h-[2px] w-12 rounded-full bg-brand-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className="fixed bottom-28 left-4 z-[60] block sm:hidden">
        {/* Onboarding Spotlight Guide Card */}
        {itemsCount === 0 && !dismissedOverlay && !isAddItemOpen && (
          <div className="absolute bottom-24 left-0 w-[calc(100vw-32px)] max-w-[340px] bg-slate-900/95 border border-amber-400/40 rounded-2xl p-5 text-right shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-5 duration-500 z-[61]">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5 text-amber-400 font-black text-[11px] uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>دليل البدء السريع</span>
              </div>
              <button 
                onClick={handleDismissOverlay}
                className="text-slate-400 hover:text-white text-[11px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md transition-all font-bold"
              >
                تخطي الإرشاد
              </button>
            </div>
            <h4 className="text-white font-black text-sm mb-1">أضف منتجك الأول هنا 👇</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              اضغط على هذا الزر الذهبي المضيء لتبدأ في إضافة أول منتج وتفعيل متجرك الإلكتروني.
            </p>
            
            {/* Arrow Pointer */}
            <div className="absolute -bottom-7 left-5 text-amber-400">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              >
                <ArrowDown className="h-8 w-8 stroke-[2.5px]" />
              </motion.div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showTooltip && dismissedOverlay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ 
                opacity: 1,
                scale: 1,
                y: [0, -6, 0],
              }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{
                y: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 }
              }}
              className="absolute bottom-20 left-0 whitespace-nowrap"
            >
              <div className={cn(
                "relative rounded-2xl px-4 py-2.5 text-[13px] font-black shadow-[0_10px_25px_rgba(245,158,11,0.3)] ring-2",
                itemsCount === 0 
                  ? "bg-amber-400 text-brand-primary ring-amber-300"
                  : "bg-brand-primary text-white ring-white/20"
              )}>
                أضف منتجاتك من هنا
                <div className={cn(
                  "absolute -bottom-1.5 left-6 h-3 w-3 rotate-45",
                  itemsCount === 0 ? "bg-amber-400" : "bg-brand-primary"
                )} />
                <button 
                  onClick={() => setShowTooltip(false)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-lg ring-1 ring-white/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Glow effect surrounding the button if itemsCount === 0 */}
        {itemsCount === 0 && (
          <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-30 pointer-events-none" style={{ animationDuration: '2.5s' }} />
        )}

        <button 
          onClick={() => setIsAddItemOpen(true)} 
          aria-label="إضافة منتج جديد"
          disabled={!catalog}
          className="relative"
        >
          <motion.div
            initial={{ y: 0 }}
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1],
              rotate: [0, -2, 2, 0]
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 4, ease: "linear" }
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="relative"
          >
            <div className="absolute -inset-5 rounded-full bg-[conic-gradient(from_0deg,rgba(251,191,36,0.2)_0%,transparent_25%,rgba(251,191,36,0.1)_60%,transparent_100%)] blur-2xl opacity-60" />
            <motion.div 
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn(
                "absolute -inset-1.5 rounded-full blur-md",
                itemsCount === 0 ? "bg-amber-400/30" : "bg-amber-400/10"
              )} 
            />
            <div className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-full text-white ring-1 ring-white/40 transition-all duration-300",
              itemsCount === 0 
                ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 shadow-[0_0_30px_rgba(245,158,11,0.75)] scale-110" 
                : "bg-amber-400 shadow-[0_15px_35px_rgba(245,158,11,0.25)]"
            )}>
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.4),_transparent_70%)] opacity-50" />
              <div className="absolute inset-0.5 rounded-full ring-1 ring-white/20" />
              <Plus className="relative h-10 w-10 stroke-[1.5px] text-brand-primary font-black" />
            </div>
          </motion.div>
        </button>
      </div>

      {/* Spotlight Backdrop Overlay */}
      {itemsCount === 0 && !dismissedOverlay && !isAddItemOpen && (
        <div 
          className="fixed inset-0 z-[58] block sm:hidden bg-black/65 backdrop-blur-sm transition-all duration-300 animate-in fade-in cursor-pointer"
          onClick={handleDismissOverlay}
        />
      )}

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="w-full h-[100dvh] sm:max-w-[500px] sm:h-auto sm:max-h-[90vh] top-1/2 sm:top-1/2 translate-y-[-50%] p-0 sm:p-6 overflow-y-auto rounded-none sm:rounded-lg border-none sm:border">
          <div className="p-6 pt-20 sm:pt-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-center sm:text-right">إضافة منتج جديد</DialogTitle>
            </DialogHeader>
            {catalog && (
              <ItemForm
                catalogId={catalog.id}
                isPro={isProPlan(catalog)}
                categories={categories}
                onSuccess={() => setIsAddItemOpen(false)}
                onCancel={() => setIsAddItemOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
