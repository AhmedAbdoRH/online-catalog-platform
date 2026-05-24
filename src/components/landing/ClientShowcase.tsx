'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, ExternalLink, ShieldCheck, Sparkles, Store, Wrench } from 'lucide-react';
import Image from 'next/image';
import ScrollAnimation from './ScrollAnimation';
import { versionedAsset } from '@/lib/static-assets';

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
}

const clients: ClientStore[] = [
  {
    id: 'dream-store',
    name: 'دريم ستور',
    tagline: 'نموذج لمتجر يعرض منتجاته بشكل منظم وسهل المشاركة مع العملاء.',
    url: 'https://tagr-online.com/01155881165',
    category: 'أثاث وأدوات منزلية',
    categoryIcon: '🏠',
    image: versionedAsset('/showcase-dream-store.png'),
    accentFrom: 'from-emerald-500',
    accentTo: 'to-teal-400',
    glowColor: 'rgba(16,185,129,0.4)',
    badge: 'نموذج متجر',
  },
  {
    id: 'saffir-alotoor',
    name: 'سفير العطور',
    tagline: 'واجهة بسيطة تساعد العميل على تصفح المنتجات وطلبها مباشرة عبر الرابط.',
    url: 'https://tagr-online.com/perfume-ambassador',
    category: 'عطور فاخرة',
    categoryIcon: '✨',
    image: versionedAsset('/showcase-saffir-alotoor.png'),
    accentFrom: 'from-amber-400',
    accentTo: 'to-yellow-300',
    glowColor: 'rgba(245,158,11,0.4)',
    badge: 'تجربة عرض',
  },
  {
    id: 'sultan-spices',
    name: 'عطارة السلطان',
    tagline: 'كتالوج واضح للمنتجات والأقسام، مناسب للمشاركة على واتساب والسوشيال ميديا.',
    url: 'https://tagr-online.com/01114228095',
    category: 'بهارات وتوابل',
    categoryIcon: '🌿',
    image: versionedAsset('/showcase-sultan-spices.png'),
    accentFrom: 'from-orange-500',
    accentTo: 'to-red-400',
    glowColor: 'rgba(249,115,22,0.4)',
    badge: 'مستخدم برو',
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

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] text-white/40">نوع المتجر</div>
              <div className={`text-sm font-black bg-gradient-to-r ${store.accentFrom} ${store.accentTo} bg-clip-text text-transparent mt-0.5 truncate`}>
                {store.category}
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
                <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">نماذج متاجر حقيقية</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                متاجر منظمة <span className="text-brand-accent">وجاهزة للمشاركة</span>
              </h2>
              <p className="text-lg md:text-xl text-white/50 leading-relaxed">
                شاهد كيف يظهر كتالوج المنتجات للعميل، وكيف يمكن للتاجر مشاركة رابط متجره واستقبال الطلبات بطريقة مباشرة.
              </p>
            </ScrollAnimation>
          </div>

          <ScrollAnimation animation="fade-in" delay={0.3}>
            <div className="flex gap-4 sm:gap-8">
              <div className="flex flex-col items-center max-w-24">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <Store className="w-6 h-6 text-brand-accent" />
                </div>
                <div className="text-xs text-white/70 font-bold text-center leading-relaxed">واجهة متجر واضحة</div>
              </div>
              <div className="w-px h-16 bg-white/10 self-center" />
              <div className="flex flex-col items-center max-w-24">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <Wrench className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="text-xs text-white/70 font-bold text-center leading-relaxed">إدارة سهلة</div>
              </div>
              <div className="w-px h-16 bg-white/10 self-center" />
              <div className="flex flex-col items-center max-w-24">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-xs text-white/70 font-bold text-center leading-relaxed">دعم ومتابعة</div>
              </div>
            </div>
          </ScrollAnimation>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {clients.map((store, idx) => (
            <StoreCard key={store.id} store={store} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
