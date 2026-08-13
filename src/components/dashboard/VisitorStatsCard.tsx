"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type PeriodKey = "today" | "week" | "month" | "total";

interface VisitorStatsCardProps {
  stats: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  storeName?: string;
}

const PERIOD_CONFIG: Record<
  PeriodKey,
  {
    label: string;
    subtitle: string;
    iconBg: string;
    iconColor: string;
    iconRing: string;
    pill: string;
    activeText: string;
    glow: string;
    accent: string;
  }
> = {
  today: {
    label: "اليوم",
    subtitle: "حركة المرور اليوم",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-400",
    iconRing: "ring-sky-400/20",
    pill: "bg-sky-500/20 border border-sky-400/30 shadow-[0_0_20px_-6px] shadow-sky-500/25",
    activeText: "text-white",
    glow: "bg-sky-500/15",
    accent: "text-sky-400",
  },
  week: {
    label: "الأسبوع",
    subtitle: "منذ الأربعاء",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    iconRing: "ring-emerald-400/20",
    pill: "bg-emerald-500/20 border border-emerald-400/30 shadow-[0_0_20px_-6px] shadow-emerald-500/25",
    activeText: "text-white",
    glow: "bg-emerald-500/15",
    accent: "text-emerald-400",
  },
  month: {
    label: "الشهر",
    subtitle: "آخر ٣٠ يوماً",
    iconBg: "bg-pink-500/15",
    iconColor: "text-pink-400",
    iconRing: "ring-pink-400/20",
    pill: "bg-pink-500/20 border border-pink-400/30 shadow-[0_0_20px_-6px] shadow-pink-500/25",
    activeText: "text-white",
    glow: "bg-pink-500/15",
    accent: "text-pink-400",
  },
  total: {
    label: "إجمالًا",
    subtitle: "منذ إنشاء المتجر",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    iconRing: "ring-amber-400/20",
    pill: "bg-amber-500/20 border border-amber-400/30 shadow-[0_0_20px_-6px] shadow-amber-500/25",
    activeText: "text-white",
    glow: "bg-amber-500/15",
    accent: "text-amber-400",
  },
};

const PERIOD_ORDER: PeriodKey[] = ["today", "week", "month", "total"];

export function VisitorStatsCard({ stats, storeName }: VisitorStatsCardProps) {
  const [period, setPeriod] = useState<PeriodKey>("total");
  const config = PERIOD_CONFIG[period];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="col-span-2 lg:col-span-4"
    >
      <Card
        dir="rtl"
        className="glass-surface border-white/10 relative overflow-hidden transition-all hover:scale-[1.005]"
      >
        {/* توهّج خلفي بيتغيّر لونه مع الفترة */}
        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={`pointer-events-none absolute -top-24 -start-16 h-56 w-56 rounded-full blur-3xl ${config.glow}`}
          />
        </AnimatePresence>

        <CardHeader className="relative p-4 sm:p-5 pb-2 space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <motion.div
              animate={{ scale: [0.9, 1] }}
              transition={{ duration: 0.25 }}
              className={`p-2 sm:p-2.5 rounded-xl ring-1 shrink-0 transition-colors duration-500 ${config.iconBg} ${config.iconColor} ${config.iconRing}`}
            >
              <Store className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>

            <CardTitle className="text-sm sm:text-lg font-bold text-white min-w-0">
              عدد زوار متجرك
            </CardTitle>
          </div>

          {/* أزرار الفترات */}
          <div
            role="tablist"
            aria-label="فترة الإحصائيات"
            className="grid grid-cols-4 gap-1 w-full sm:w-auto sm:inline-flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm"
          >
            {PERIOD_ORDER.map((key) => {
              const item = PERIOD_CONFIG[key];
              const isActive = key === period;

              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setPeriod(key)}
                  className={`relative rounded-lg px-1.5 sm:px-3.5 py-1.5 text-[11px] sm:text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                    isActive
                      ? item.activeText
                      : "text-muted-foreground hover:text-white/80"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="visitor-period-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className={`absolute inset-0 rounded-lg ${item.pill}`}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="relative p-4 sm:p-5 pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={period}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="text-2xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
                {stats[period].toLocaleString("ar-EG")}
              </div>
              <p className="mt-1 sm:mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <TrendingUp
                  className={`h-3.5 w-3.5 shrink-0 transition-colors duration-500 ${config.accent}`}
                />
                {config.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
