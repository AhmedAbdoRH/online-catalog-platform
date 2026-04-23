'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useSpring, useTransform, animate } from 'framer-motion';
import { ExternalLink, ShoppingBag, Sparkles, ArrowLeft, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import ScrollAnimation from './ScrollAnimation';
import { createClient } from '@/lib/supabase/client';
import { getStoreCount } from '@/app/actions/stats';

function Counter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, value, {
        duration: 2,
        ease: 'easeOut',
        onUpdate(latest) {
          if (ref.current) {
            ref.current.textContent = prefix + Math.floor(latest).toLocaleString() + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [value, isInView, prefix, suffix]);

  return <span ref={ref}>0</span>;
}

interface ClientStore {
  id: string;
  name: string;
  tagline: string;
  url: string;
  category: string;
  categoryIcon: string;
  image: string;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
  badge: string;
  phoneColor: string;
  statsLabel: string;
  statsValue: string;
}

const clients: ClientStore[] = [
  {
    id: 'dream-store',
    name: 'دريم استور',
    tagline: 'اشتري من مصنع، أفضل جودة وأقل سعر',
    url: 'https://online-catalog.net/01155881165',
    category: 'أثاث وأدوات منزلية',
    categoryIcon: '🏠',
    image: '/showcase-dream-store.png',
    accentFrom: 'from-emerald-500',
    accentTo: 'to-teal-400',
    glowColor: 'rgba(16,185,129,0.4)',
    badge: 'أثاث',
    phoneColor: 'linear-gradient(145deg, #1a2e1a 0%, #162616 50%, #0f2010 100%)',
    statsLabel: 'منتج متاح',
    statsValue: '+50',
  },
  {
    id: 'saffir-alotoor',
    name: 'سفير العطور',
    tagline: 'عطور حكاية والفوحان ملوش نهاية',
    url: 'https://online-catalog.net/01027381559',
    category: 'عطور فاخرة',
    categoryIcon: '✨',
    image: '/showcase-saffir-alotoor.png',
    accentFrom: 'from-amber-400',
    accentTo: 'to-yellow-300',
    glowColor: 'rgba(245,158,11,0.4)',
    badge: 'عطور',
    phoneColor: 'linear-gradient(145deg, #2e2610 0%, #261f0c 50%, #1a1508 100%)',
    statsLabel: 'عطر نيش',
    statsValue: '+20',
  },
  {
    id: 'sultan-spices',
    name: 'عطاره السلطان',
    tagline: 'أجود البهارات الطبيعية من مصادر مختارة',
    url: 'https://online-catalog.net/01114228095',
    category: 'بهارات وتوابل',
    categoryIcon: '🌿',
    image: '/showcase-sultan-spices.png',
    accentFrom: 'from-orange-500',
    accentTo: 'to-red-400',
    glowColor: 'rgba(249,115,22,0.4)',
    badge: 'بهارات',
    phoneColor: 'linear-gradient(145deg, #2e1a0a 0%, #261508 50%, #1a0e05 100%)',
    statsLabel: 'منتج متاح',
    statsValue: '+20',
  },
];

function StoreCard({ store, index }: { store: ClientStore; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px -8% 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer card container */}
      <motion.div
        animate={{ y: hovered ? -8 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => window.open(store.url, '_blank', 'noopener,noreferrer')}
        className="relative cursor-pointer w-full max-w-[420px]"
      >
        {/* Ambient glow behind card */}
        <motion.div
          className="absolute -inset-2 rounded-[2rem] blur-2xl -z-10"
          style={{ background: store.glowColor }}
          animate={{ opacity: hovered ? 0.6 : 0.15, scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Glass card */}
        <motion.div
          className="relative rounded-[2rem] p-4 backdrop-blur-xl shadow-xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          animate={{
            borderColor: hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
            boxShadow: hovered
              ? `0 30px 60px -20px ${store.glowColor}, 0 0 0 1px rgba(255,255,255,0.1)`
              : '0 15px 35px -10px rgba(0,0,0,0.4)',
          }}
          transition={{ duration: 0.4 }}
        >
          {/* Card header: store info */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${store.accentFrom} ${store.accentTo} flex items-center justify-center text-lg flex-shrink-0 shadow-md`}
              style={{ filter: 'saturate(0.9)' }}
            >
              {store.categoryIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[15px] text-foreground truncate leading-tight">
                {store.name}
              </div>
              <div className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                {store.category}
              </div>
            </div>
          </div>

          {/* ─── Store Preview Area ─── */}
          <div className="relative mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-[#0d1a15] aspect-[3/4] sm:aspect-[4/5.5]">
            {/* Store screenshot with scroll effect on hover */}
            <motion.div 
              className="absolute top-0 left-0 w-full"
              animate={{ y: hovered ? '-78%' : '0%' }}
              transition={{ duration: 7, ease: [0.45, 0, 0.55, 1] }}
            >
              <Image
                src={store.image}
                alt={`${store.name} - متجر إلكتروني`}
                width={800}
                height={1600}
                className="w-full h-auto"
                priority={index === 0}
              />
            </motion.div>

            {/* Subtle vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

            {/* Hover overlay: "افتح المتجر" */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(0,0,0,0)' }}
              animate={{
                background: hovered ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${store.accentFrom} ${store.accentTo} flex items-center justify-center shadow-xl`}
                >
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xs bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                  زيارة المتجر
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats & Action strip */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-muted-foreground/60">{store.statsLabel}</div>
              <div className={`text-sm font-bold bg-gradient-to-r ${store.accentFrom} ${store.accentTo} bg-clip-text text-transparent mt-0.5`}>
                {store.statsValue}
              </div>
            </div>

            <motion.button
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${store.accentFrom} ${store.accentTo} shadow-md`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(store.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <span>تصفح</span>
              <ExternalLink className="w-3 h-3 opacity-90" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Tagline below */}
      <motion.p
        className="mt-4 text-center text-sm text-muted-foreground/60 max-w-[340px] leading-relaxed"
        animate={{ opacity: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.3 }}
      >
        {store.tagline}
      </motion.p>
    </motion.div>
  );
}

export default function ClientShowcase() {
  const [storeCount, setStoreCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 1. Fetch initial count
    const fetchCount = async () => {
      const count = await getStoreCount();
      setStoreCount(count);
      setIsLoading(false);
    };

    fetchCount();

    // 2. Realtime subscription
    const channel = supabase
      .channel('catalogs_count')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'catalogs' },
        () => {
          setStoreCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'catalogs' },
        () => {
          setStoreCount((prev) => Math.max(0, prev - 1));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section
      id="client-showcase"
      className="relative py-28 sm:py-36 overflow-hidden bg-aurora"
    >
      {/* ── Background decorations ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large radial glow top-center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(85,249,230,0.05),transparent_65%)]" />
        {/* Subtle bottom glow */}
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[350px] bg-[radial-gradient(ellipse,rgba(245,158,11,0.04),transparent_65%)]" />
        <div className="absolute top-1/2 right-1/6 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(249,115,22,0.035),transparent_65%)]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating orbs */}
        {[
          { x: '10%', y: '20%', size: 6, delay: 0, color: 'rgba(85,249,230,0.5)' },
          { x: '85%', y: '15%', size: 4, delay: 1, color: 'rgba(245,158,11,0.5)' },
          { x: '20%', y: '75%', size: 5, delay: 0.7, color: 'rgba(249,115,22,0.5)' },
          { x: '75%', y: '65%', size: 3, delay: 1.5, color: 'rgba(85,249,230,0.4)' },
          { x: '50%', y: '85%', size: 4, delay: 0.4, color: 'rgba(245,158,11,0.4)' },
          { x: '60%', y: '30%', size: 3, delay: 2, color: 'rgba(249,115,22,0.4)' },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              background: orb.color,
            }}
            animate={{ y: [-10, 10, -10], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <ScrollAnimation animation="blur-in" duration={1}>
          <div className="text-center mb-20 sm:mb-28 space-y-7">

            {/* Badge pill */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-sm font-semibold shadow-lg shadow-brand-primary/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>عملاؤنا الفعّالون</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline tracking-tight text-foreground leading-tight">
              متاجر{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-brand-primary">حقيقية</span>
                {/* Underline decoration */}
                <svg
                  className="absolute -bottom-1 left-0 w-full text-brand-accent/50 overflow-visible"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  style={{ height: 12 }}
                >
                  <path
                    d="M0 7 Q 25 2 50 7 Q 75 12 100 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              بنتائج حقيقية
            </h2>

            {/* Sub-heading */}
            <p className="text-lg sm:text-xl text-muted-foreground/75 max-w-2xl mx-auto leading-relaxed">
              شوف بنفسك متاجر عملائنا الفعليين — لا تصاميم وهمية، ده اللي بيحصل فعلاً على منصتنا
            </p>

            {/* Stats bar */}
            <div className="flex items-center justify-center gap-10 sm:gap-24 pt-4">
              {[
                { 
                  value: storeCount || 44, 
                  label: 'متجر نشط', 
                  color: 'from-emerald-400 to-teal-300',
                  glow: 'rgba(52, 211, 153, 0.2)',
                  prefix: '+',
                  suffix: ''
                },
                { 
                  value: 24, 
                  label: 'دعم مستمر', 
                  color: 'from-amber-400 to-yellow-300',
                  glow: 'rgba(251, 191, 36, 0.2)',
                  suffix: '/7'
                },
              ].map((stat, i) => (
                <div key={i} className="relative group">
                  {/* Subtle glow behind stat */}
                  <div 
                    className="absolute -inset-4 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: stat.glow }}
                  />
                  
                  <div className="relative text-center">
                    <div className={`text-3xl sm:text-5xl font-black tracking-tighter bg-gradient-to-br ${stat.color} bg-clip-text text-transparent drop-shadow-sm`}>
                      <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>

        {/* ── Store Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8 lg:gap-10 w-full">
          {clients.map((store, index) => (
            <StoreCard key={store.id} store={store} index={index} />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <ScrollAnimation animation="fade-up" delay={0.4} duration={1}>
          <div className="mt-24 sm:mt-32 flex flex-col items-center gap-5">
            {/* Divider */}
            <div className="flex items-center gap-4 w-full max-w-sm">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-xs text-muted-foreground/40 font-medium whitespace-nowrap">ابدأ رحلتك معنا</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <p className="text-muted-foreground/65 text-base sm:text-lg text-center max-w-md leading-relaxed">
              متجرك ممكن يكون التالي — أنشئ متجرك الاحترافي في أقل من 5 دقائق
            </p>

            <motion.a
              href="#pricing"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base sm:text-lg bg-gradient-to-r from-brand-primary to-brand-accent text-background shadow-xl shadow-brand-primary/20"
              whileHover={{ scale: 1.05, y: -3, boxShadow: '0 30px 60px -15px rgba(85,249,230,0.35)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              <ShoppingBag className="w-5 h-5" />
              أنشئ متجرك الآن مجاناً
              <ArrowLeft className="w-4 h-4 opacity-70" />
            </motion.a>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
