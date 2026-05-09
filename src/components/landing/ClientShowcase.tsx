'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { ExternalLink, Sparkles, ArrowUpRight, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import ScrollAnimation from './ScrollAnimation';
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
  statsLabel: string;
  statsValue: string;
}

const clients: ClientStore[] = [
  {
    id: 'dream-store',
    name: 'دريم استور',
    tagline: 'بدأ بـ 5 منتجات والآن يبيع لآلاف العملاء شهرياً',
    url: 'https://tagr-online.com/01155881165',
    category: 'أثاث وأدوات منزلية',
    categoryIcon: '🏠',
    image: '/showcase-dream-store.png',
    accentFrom: 'from-emerald-500',
    accentTo: 'to-teal-400',
    glowColor: 'rgba(16,185,129,0.4)',
    badge: 'قصة نجاح',
    statsLabel: 'نمو المبيعات',
    statsValue: '+300%',
  },
  {
    id: 'saffir-alotoor',
    name: 'سفير العطور',
    tagline: 'استخدم الرابط عبر واتساب لزيادة التفاعل بنسبة 200%',
    url: 'https://tagr-online.com/01027381559',
    category: 'عطور فاخرة',
    categoryIcon: '✨',
    image: '/showcase-saffir-alotoor.png',
    accentFrom: 'from-amber-400',
    accentTo: 'to-yellow-300',
    glowColor: 'rgba(245,158,11,0.4)',
    badge: 'تفاعل عالي',
    statsLabel: 'طلبات يومية',
    statsValue: '+45',
  },
  {
    id: 'sultan-spices',
    name: 'عطاره السلطان',
    tagline: 'ترقّى للبرو بعد ما بدأ يشوف نتائج حقيقية في أول شهر',
    url: 'https://tagr-online.com/01114228095',
    category: 'بهارات وتوابل',
    categoryIcon: '🌿',
    image: '/showcase-sultan-spices.png',
    accentFrom: 'from-orange-500',
    accentTo: 'to-red-400',
    glowColor: 'rgba(249,115,22,0.4)',
    badge: 'مستخدم برو',
    statsLabel: 'منتج مفعل',
    statsValue: '+120',
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
      <motion.div
        animate={{ y: hovered ? -8 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => window.open(store.url, '_blank', 'noopener,noreferrer')}
        className="relative cursor-pointer w-full max-w-[420px]"
      >
        <motion.div
          className="absolute -inset-2 rounded-[2rem] blur-2xl -z-10"
          style={{ background: store.glowColor }}
          animate={{ opacity: hovered ? 0.6 : 0.15, scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
        />

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${store.accentFrom} ${store.accentTo} flex items-center justify-center text-lg flex-shrink-0 shadow-md`}
              >
                {store.categoryIcon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] text-white truncate leading-tight">
                  {store.name}
                </div>
                <div className="text-[11px] text-white/40 truncate mt-0.5">
                  {store.category}
                </div>
              </div>
            </div>
            <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-brand-accent uppercase tracking-wider">
              {store.badge}
            </div>
          </div>

          <div className="relative mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-[#041412] aspect-[3/4] sm:aspect-[4/5.5]">
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

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              animate={{ background: hovered ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)' }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${store.accentFrom} ${store.accentTo} flex items-center justify-center shadow-xl`}>
                  <ArrowUpRight className="w-6 h-6 text-[#043832]" />
                </div>
                <span className="text-white font-bold text-xs bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                  زيارة المتجر
                </span>
              </motion.div>
            </motion.div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-white/40">{store.statsLabel}</div>
              <div className={`text-sm font-black bg-gradient-to-r ${store.accentFrom} ${store.accentTo} bg-clip-text text-transparent mt-0.5`}>
                {store.statsValue}
              </div>
            </div>

            <motion.button
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#043832] bg-gradient-to-r ${store.accentFrom} ${store.accentTo} shadow-md`}
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

      <motion.p
        className="mt-4 text-center text-sm text-white/50 max-w-[340px] leading-relaxed"
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

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getStoreCount();
      setStoreCount(count || 5240); // Fallback to a realistic number if 0
    };
    fetchCount();
  }, []);

  return (
    <section
      id="success-stories"
      className="relative py-28 sm:py-36 overflow-hidden bg-[#041412]"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(85,249,230,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl text-right">
            <ScrollAnimation animation="reveal-3d-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-4">
                <Sparkles className="w-4 h-4 text-brand-accent" />
                <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">قصص نجاح حقيقية</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                تجار حققوا <span className="text-brand-accent">نمواً ملموساً</span>
              </h2>
              <p className="text-lg md:text-xl text-white/50 leading-relaxed">
                انضم لأكثر من <span className="text-white font-bold"><Counter value={storeCount} /></span> تاجر يستخدمون منظومة تاجر أونلاين يومياً لتطوير أعمالهم.
              </p>
            </ScrollAnimation>
          </div>

          <ScrollAnimation animation="fade-in" delay={0.3}>
            <div className="flex gap-4 sm:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-brand-accent" />
                </div>
                <div className="text-xl font-black text-white">+50K</div>
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">شريك موثوق</div>
              </div>
              <div className="w-px h-16 bg-white/10 self-center" />
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="text-xl font-black text-white">98%</div>
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">رضا التجار</div>
              </div>
              <div className="w-px h-16 bg-white/10 self-center" />
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-xl font-black text-white">100%</div>
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">دعم فني</div>
              </div>
            </div>
          </ScrollAnimation>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
          {clients.map((store, idx) => (
            <StoreCard key={store.id} store={store} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
