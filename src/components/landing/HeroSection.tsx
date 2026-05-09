'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, BookOpen, Rocket } from 'lucide-react';
import { useEffect, useState } from 'react';
import ScrollAnimation from './ScrollAnimation';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.nextcatalog.app';
const GOOGLE_PLAY_ICON = 'https://res.cloudinary.com/dvikey3wc/image/upload/v1773216706/Online_Catalog_pmlblb.png';

const NEON = '#55F9E6';
const NEON_DARK = '#1BB7A4';
const TEAL_LIGHT = '#55F9E6';

// ─── Keyframes ────────────────────────────────────────────────────────────────
const productCardStyles = `
  @keyframes floatMain {
    0%,100% { transform: translateY(0px) translateX(0px) rotateZ(-1deg) rotateX(0deg) rotateY(-1deg); filter: drop-shadow(0 18px 38px rgba(0,0,0,0.45)); }
    50%      { transform: translateY(-18px) translateX(4px) rotateZ(0.8deg) rotateX(2deg) rotateY(1.5deg); filter: drop-shadow(0 28px 58px rgba(0,0,0,0.6)); }
  }
  @keyframes floatSec {
    0%,100% { transform: translateY(0px) translateX(0px) rotateZ(2.5deg) rotateX(0deg) rotateY(0.8deg) scale(0.88); }
    50%      { transform: translateY(-12px) translateX(-3px) rotateZ(-1.5deg) rotateX(-2deg) rotateY(-1deg) scale(0.88); }
  }
  @keyframes floatThird {
    0%,100% { transform: translateY(0px) translateX(0px) rotateZ(-2deg) rotateX(0deg) rotateY(-0.6deg) scale(0.76); }
    50%      { transform: translateY(-9px) translateX(2px) rotateZ(1.8deg) rotateX(2deg) rotateY(1deg) scale(0.76); }
  }
  
  @keyframes cardFlip {
    0%   { opacity: 0; transform: perspective(1200px) rotateY(100deg) rotateX(10deg) translateZ(30px); }
    50%  { opacity: 1; }
    100% { opacity: 1; transform: perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0px); }
  }
  @keyframes cardFlipOut {
    0%   { opacity: 1; transform: perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0px); }
    100% { opacity: 0; transform: perspective(1200px) rotateY(-100deg) rotateX(-10deg) translateZ(30px); }
  }
  @keyframes deckFrontToBack {
    0%   { transform: translateY(0) translateX(0) rotateZ(-1deg) rotateY(0deg) translateZ(30px) scale(1); opacity: 1; }
    60%  { transform: translateY(10px) translateX(6px) rotateZ(-8deg) rotateY(-12deg) translateZ(-30px) scale(0.92); opacity: 0.55; }
    100% { transform: translateY(18px) translateX(10px) rotateZ(-12deg) rotateY(-18deg) translateZ(-60px) scale(0.86); opacity: 0.35; }
  }
  @keyframes deckMidToFront {
    0%   { transform: translateY(10px) translateX(6px) rotateZ(3deg) rotateY(6deg) translateZ(-10px) scale(0.92); opacity: 0.7; }
    100% { transform: translateY(0) translateX(0) rotateZ(-1deg) rotateY(0deg) translateZ(30px) scale(1); opacity: 1; }
  }
  @keyframes deckBackToMid {
    0%   { transform: translateY(18px) translateX(10px) rotateZ(-6deg) rotateY(-8deg) translateZ(-60px) scale(0.86); opacity: 0.4; }
    100% { transform: translateY(10px) translateX(6px) rotateZ(3deg) rotateY(6deg) translateZ(-10px) scale(0.92); opacity: 0.7; }
  }
  
  @keyframes shimmerPrice {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes scanLineCard {
    0%   { left:-50px; opacity:0; }
    10%  { opacity:1; }
    90%  { opacity:1; }
    100% { left:115%; opacity:0; }
  }
  @keyframes glowPulseCard {
    0%,100% { opacity:0.22; }
    50%     { opacity:0.6; }
  }
  @keyframes gridMove {
    0%   { background-position: 0 0; }
    100% { background-position: 32px 32px; }
  }
  @keyframes orbitDot {
    0%   { transform: rotate(0deg) translateX(110px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(110px) rotate(-360deg); }
  }

  /* Order animation states */
  @keyframes btnPulse {
    0%,100% { transform: scale(1); box-shadow: 0 4px 14px rgba(85,249,230,0.4); }
    50%      { transform: scale(1.08); box-shadow: 0 6px 22px rgba(85,249,230,0.65); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes checkPop {
    0%   { transform: scale(0) rotate(-20deg); opacity:0; }
    60%  { transform: scale(1.25) rotate(5deg); opacity:1; }
    100% { transform: scale(1) rotate(0deg); opacity:1; }
  }
  @keyframes ripple {
    0%   { transform: scale(0.5); opacity:0.7; }
    100% { transform: scale(2.2); opacity:0; }
  }
  @keyframes badgeSlideIn {
    0%   { opacity:0; transform: translateY(-6px); }
    100% { opacity:1; transform: translateY(0); }
  }
  @keyframes progressFill {
    0%   { width: 0%; }
    100% { width: 100%; }
  }
  @keyframes itemFlyUp {
    0%   { opacity:1; transform: translateY(0) scale(1); }
    100% { opacity:0; transform: translateY(-28px) scale(0.5); }
  }

  .pc-main  { animation: floatMain  6.2s ease-in-out infinite; perspective: 1200px; transform-style: preserve-3d; will-change: transform; }
  .pc-sec   { animation: floatSec   7.6s ease-in-out infinite 0.9s; perspective: 1200px; transform-style: preserve-3d; will-change: transform; }
  .pc-third { animation: floatThird 6.6s ease-in-out infinite 1.7s; perspective: 1200px; transform-style: preserve-3d; will-change: transform; }

  @media (max-width: 640px) {
    .hero-cards-wrapper { width: 140px !important; height: 200px !important; top: 0 !important; right: 0 !important; }
    .hero-cards-wrapper .pc-third { top: 12px !important; left: -12px !important; }
    .hero-cards-wrapper .pc-sec { top: 6px !important; left: -6px !important; }
    .hero-cards-wrapper .pc-main { top: 0 !important; left: 0 !important; }
  }
  
  .card-flip-in  { animation: cardFlip 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); perspective: 1200px; transform-style: preserve-3d; }
  .card-flip-out { animation: cardFlipOut 0.6s ease-in; perspective: 1200px; transform-style: preserve-3d; }

  .deck-swapping .pc-main,
  .deck-swapping .pc-sec,
  .deck-swapping .pc-third {
    animation: none;
  }

  .deck-front-to-back { animation: deckFrontToBack 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .deck-mid-to-front  { animation: deckMidToFront 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .deck-back-to-mid   { animation: deckBackToMid 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

  @keyframes playBtnGlow {
    0%, 100% { box-shadow: 0 18px 45px rgba(4,20,18,0.25), 0 0 0 0 rgba(255,255,255,0); }
    50%       { box-shadow: 0 22px 55px rgba(85,249,230,0.35), 0 0 28px 6px rgba(255,255,255,0.18); }
  }
  @keyframes playBtnSubtlePulse {
    0% { transform: scale(1); opacity: 0.5; }
    70% { transform: scale(1.08); opacity: 0; }
    100% { transform: scale(1.08); opacity: 0; }
  }
`;

// ─── Products data ─────────────────────────────────────────────────────────────
const products = [
  {
    emoji: '🍯',
    name: 'برطمان عسل طبيعي',
    sub: 'عسل نقي، 500 جرام',
    category: 'مواد غذائية',
    desc: 'عسل طبيعي 100% من أجود أنواع النحل، طعم غني ومتوازن.',
    price: '115',
    color: '#d4a574',
    bgTop: 'linear-gradient(135deg, #5a4a34 0%, #8b7355 100%)',
  },
  {
    emoji: '👕',
    name: 'تي شيرت رجالي كتان',
    sub: 'حجم XL، 100% كتان',
    category: 'ملابس',
    desc: 'تيشيرت صيفي مريح وعصري بتصميم كلاسيكي أنيق.',
    price: '145',
    color: '#1e5a96',
    bgTop: 'linear-gradient(135deg, #0d2a4d 0%, #1a4d7a 100%)',
  },
  {
    emoji: '🔌',
    name: 'شاحن USB-C سريع',
    sub: '65W PD، شحن سريع',
    category: 'أجهزة كهربائية',
    desc: 'شاحن USB-C عالي الأداء يدعم Power Delivery للشحن السريع.',
    price: '195',
    color: '#ff6b35',
    bgTop: 'linear-gradient(135deg, #4d3420 0%, #8b5a2b 100%)',
  },
];

// ─── Order animation stages ────────────────────────────────────────────────────
const ORDER_CYCLE = ['idle', 'adding', 'loading', 'success', 'idle'];
const ORDER_DURATIONS = { idle: 2800, adding: 1100, loading: 1400, success: 2000 };

interface Product {
  emoji: string;
  name: string;
  sub: string;
  category: string;
  desc: string;
  price: string;
  color: string;
  bgTop: string;
}

function useOrderCycle() {
  const [stage, setStage] = useState<string>('idle');
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    function next(current: string) {
      const idx = ORDER_CYCLE.indexOf(current);
      const nextStage = ORDER_CYCLE[(idx + 1) % ORDER_CYCLE.length];
      timeout = setTimeout(() => {
        setStage(nextStage);
        if (nextStage !== 'idle') next(nextStage);
        else {
          timeout = setTimeout(() => {
            setStage('adding');
            next('adding');
          }, ORDER_DURATIONS.idle);
        }
      }, ORDER_DURATIONS[current as keyof typeof ORDER_DURATIONS]);
    }
    timeout = setTimeout(() => {
      setStage('adding');
      next('adding');
    }, ORDER_DURATIONS.idle);
    return () => clearTimeout(timeout);
  }, []);
  return stage;
}

function MiniProductCard({ p, size = 1, scanDelay = '1s', showOrder = false }: { p: Product, size?: number, scanDelay?: string, showOrder?: boolean }) {
  const stage = useOrderCycle();
  const activeStage = showOrder ? stage : 'idle';
  const cardW = Math.round(148 * size);

  return (
    <div style={{ width: cardW, fontFamily: 'Cairo, Tajawal, sans-serif', direction: 'rtl' }}>
      <div style={{
        position: 'relative',
        background: 'rgba(20,28,22,0.92)',
        backdropFilter: 'blur(18px)',
        borderRadius: 14 * size,
        border: '1px solid rgba(255,255,255,0.10)',
        overflow: 'hidden',
        boxShadow: `0 ${16 * size}px ${40 * size}px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: 36 * size,
          background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.055),transparent)',
          animation: `scanLineCard 4.2s ease-in-out infinite ${scanDelay}`,
          pointerEvents: 'none', zIndex: 10,
        }} />
        <div style={{
          background: p.bgTop,
          height: 82 * size,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36 * size,
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), transparent 70%)' }} />
          <span style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{p.emoji}</span>
        </div>
        <div style={{ padding: 10 * size }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 * size }}>
            <div style={{ fontSize: 11 * size, fontWeight: 800, color: '#fff', lineHeight: 1.2, maxWidth: '70%' }}>{p.name}</div>
            <div style={{ fontSize: 12 * size, fontWeight: 900, color: NEON, textShadow: `0 0 8px ${NEON}44` }}>{p.price}ج</div>
          </div>
          <div style={{ fontSize: 8 * size, color: 'rgba(255,255,255,0.45)', marginBottom: 8 * size, fontWeight: 500 }}>{p.sub}</div>
          <div style={{
            height: 26 * size,
            borderRadius: 6 * size,
            background: activeStage === 'success' ? '#10B981' : (activeStage === 'adding' || activeStage === 'loading' ? NEON : 'rgba(255,255,255,0.06)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative', overflow: 'hidden',
            border: activeStage === 'idle' ? '1px solid rgba(255,255,255,0.1)' : 'none',
          }}>
            {activeStage === 'idle' && <span style={{ fontSize: 9 * size, fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>إضافة للسلة</span>}
            {activeStage === 'adding' && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 10 * size, height: 10 * size, borderRadius: '50%', background: '#043832', animation: 'itemFlyUp 0.6s ease-out forwards' }} /></div>}
            {activeStage === 'loading' && <div style={{ width: 12 * size, height: 12 * size, border: `2px solid #043832`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
            {activeStage === 'success' && <div style={{ animation: 'checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', color: '#fff' }}><svg width={14 * size} height={14 * size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [deckIndex, setDeckIndex] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSwapping(true);
      setTimeout(() => {
        setDeckIndex((prev) => (prev + 1) % products.length);
        setIsSwapping(false);
      }, 700);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const p1 = products[deckIndex];
  const p2 = products[(deckIndex + 1) % products.length];
  const p3 = products[(deckIndex + 2) % products.length];

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden bg-[#041412]">
      <style dangerouslySetInnerHTML={{ __html: productCardStyles }} />
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(85,249,230,0.12)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${NEON} 1px, transparent 1px)`, backgroundSize: '32px 32px', animation: 'gridMove 20s linear infinite' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-right space-y-8 max-w-2xl">
            <ScrollAnimation animation="reveal-3d-right" duration={1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
                </span>
                <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">منظومة تمكين التاجر المحلي</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                جاهز تبيع <span className="text-brand-accent relative">أونلاين !
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" /></svg>
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed max-w-xl lg:ml-0 lg:mr-auto">
                حمّل تطبيق <span className="text-brand-accent font-bold">"تاجر أونلاين"</span> وانضم لأول مجتمع لتمكين التاجر المحلي من البيع أونلاين
              </p>

              <p className="text-lg text-white/60 font-medium">
                ابدأ متجرك .. اتعلم .. سوق وبيع مجاناً مع "تاجر أونلاين"
              </p>
            </ScrollAnimation>

            <ScrollAnimation animation="reveal-3d-right" delay={0.2} duration={1}>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <Button asChild size="lg" className="h-14 px-8 bg-brand-accent text-[#043832] hover:bg-brand-accent/90 font-black text-lg rounded-2xl shadow-[0_20px_40px_rgba(255,215,0,0.2)] transition-all hover:-translate-y-1 active:scale-95">
                  <Link href="/home" className="flex items-center gap-2">
                    ابدأ مجاناً
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" className="h-14 px-8 border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold text-lg rounded-2xl backdrop-blur-md transition-all hover:-translate-y-1 active:scale-95">
                  <Link href="#community" className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-accent" />
                    انضم للمجتمع
                  </Link>
                </Button>

                <Button variant="ghost" size="lg" className="h-14 px-8 text-white/70 hover:text-white hover:bg-white/5 font-bold text-lg rounded-2xl transition-all">
                  <Link href="#ecosystem" className="flex items-center gap-2">
                    استكشف المنصة
                  </Link>
                </Button>
              </div>
            </ScrollAnimation>

            {/* Trust Badges */}
            <ScrollAnimation animation="fade-in" delay={0.4} duration={1}>
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-8 pt-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl font-black text-white">+50K</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">تاجر نشط</span>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl font-black text-white">+1M</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">طلب تم معالجته</span>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl font-black text-white">98%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">رضا التجار</span>
                </div>
              </div>
            </ScrollAnimation>
          </div>

          {/* Visual Side - The Ecosystem Mockup */}
          <div className="flex-1 relative w-full max-w-[500px] lg:max-w-none aspect-square lg:aspect-auto lg:h-[600px]">
            <ScrollAnimation animation="reveal-3d-left" duration={1.2}>
              <div className={`relative w-full h-full flex items-center justify-center ${isSwapping ? 'deck-swapping' : ''}`}>
                
                {/* Main Ecosystem Visualization */}
                <div className="relative w-[280px] h-[500px] sm:w-[320px] sm:h-[580px]">
                  
                  {/* Background Glows */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-brand-primary/20 blur-[120px] rounded-full -z-10" />
                  
                  {/* Floating Cards representing the Ecosystem */}
                  <div className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ${isSwapping ? 'deck-front-to-back' : 'pc-main'}`}>
                    <MiniProductCard p={p1} size={1.8} showOrder={true} />
                  </div>
                  
                  <div className={`absolute top-12 -left-12 w-full h-full transition-all duration-700 ${isSwapping ? 'deck-mid-to-front' : 'pc-sec'}`}>
                    <div className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl w-[240px]">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 flex items-center justify-center">
                          <Users className="w-6 h-6 text-brand-accent" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">مجتمع التجار</div>
                          <div className="text-[10px] text-white/50">انضم لـ 50,000+ تاجر</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-accent w-3/4 animate-pulse" />
                        </div>
                        <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className={`absolute -top-8 -right-8 w-full h-full transition-all duration-700 ${isSwapping ? 'deck-back-to-mid' : 'pc-third'}`}>
                    <div className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl w-[220px]">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">تعلم وتطوير</div>
                          <div className="text-[10px] text-white/50">دروس عملية للنمو</div>
                        </div>
                      </div>
                      <div className="flex -space-x-2 rtl:space-x-reverse">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-brand-primary/30 flex items-center justify-center text-[10px] font-bold text-white">
                            {i}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Growth Indicator */}
                  <div className="absolute -bottom-4 -right-4 bg-brand-accent text-[#043832] px-6 py-4 rounded-2xl shadow-2xl font-black flex items-center gap-3 animate-bounce">
                    <Rocket className="w-6 h-6" />
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-tighter">معدل النمو</span>
                      <span className="text-xl">+240%</span>
                    </div>
                  </div>

                </div>
              </div>
            </ScrollAnimation>
          </div>

        </div>
      </div>
    </section>
  );
}
