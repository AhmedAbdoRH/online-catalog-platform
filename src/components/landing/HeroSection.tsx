'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import ScrollAnimation from './ScrollAnimation';

const PLAY_STORE_URL = 'https://play.google.com/apps/testing/com.nextcatalog.app';
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
// idle → adding (1.2s) → loading (1.5s) → success (2s) → reset
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
          // pause at idle then restart
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

// ─── Single product card matching screenshot layout ────────────────────────────
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

        {/* Scan line */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: 36 * size,
          background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.055),transparent)',
          animation: `scanLineCard 4.2s ease-in-out infinite ${scanDelay}`,
          pointerEvents: 'none', zIndex: 10,
        }} />

        {/* ── Image area ── */}
        <div style={{
          background: p.bgTop,
          height: 82 * size,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36 * size,
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}>
          {/* subtle radial shine */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 60% 30%, ${p.color}30 0%, transparent 65%)`,
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>{p.emoji}</span>

          {/* Flying item animation when adding */}
          {activeStage === 'adding' && (
            <span style={{
              position: 'absolute', fontSize: 18 * size, zIndex: 20,
              animation: 'itemFlyUp 0.9s ease forwards',
            }}>{p.emoji}</span>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ padding: `${8 * size}px ${9 * size}px ${9 * size}px` }}>

          {/* Category label */}
          <div style={{
            fontSize: 7 * size, color: 'rgba(255,255,255,0.35)',
            marginBottom: 3 * size, fontWeight: 600, letterSpacing: '0.3px',
          }}>
            {p.category}
          </div>

          {/* Product name */}
          <div style={{ fontSize: 11 * size, color: 'rgba(255,255,255,0.92)', fontWeight: 700, lineHeight: 1.3, marginBottom: 3 * size }}>
            {p.name}
          </div>

          {/* Description */}
          <div style={{
            fontSize: 8 * size, color: 'rgba(255,255,255,0.35)',
            lineHeight: 1.4, marginBottom: 7 * size,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {p.desc}
          </div>

          {/* Price */}
          <div style={{
            fontSize: 14 * size, fontWeight: 900,
            background: `linear-gradient(90deg, ${NEON}, #CFFFF8, ${NEON})`,
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'shimmerPrice 2.5s linear infinite',
            marginBottom: 7 * size,
          }}>
            {p.price} ج.م
          </div>

          {/* ── Order button with animation ── */}
          <div style={{ position: 'relative' }}>

            {/* Progress bar under button during loading */}
            {activeStage === 'loading' && (
              <div style={{
                position: 'absolute', top: -4, left: 0, right: 0,
                height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: `linear-gradient(90deg, #86EFAC, #22C55E)`,
                  animation: 'progressFill 1.3s ease forwards',
                }} />
              </div>
            )}

            <div style={{
              height: 26 * size,
              borderRadius: 8 * size,
              background: activeStage === 'success'
                ? `linear-gradient(135deg, #86EFAC, #4ADE80)`
                : `linear-gradient(135deg, #86EFAC, #22C55E)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 5 * size,
              cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
              transition: 'background 0.4s ease',
              animation: activeStage === 'idle' ? 'btnPulse 3s ease-in-out infinite' : 'none',
              boxShadow: activeStage === 'success'
                ? '0 4px 16px rgba(74,222,128,0.55)'
                : '0 4px 14px rgba(134,239,172,0.4)',
            }}>

              {/* Ripple on adding */}
              {activeStage === 'adding' && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 8 * size,
                  background: 'rgba(255,255,255,0.25)',
                  animation: 'ripple 0.9s ease forwards',
                }} />
              )}

              {/* Button content */}
              {activeStage === 'loading' ? (
                <div style={{
                  width: 12 * size, height: 12 * size,
                  border: `2px solid rgba(255,255,255,0.3)`,
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
              ) : activeStage === 'success' ? (
                <span style={{
                  fontSize: 12 * size, color: '#fff',
                  animation: 'checkPop 0.45s cubic-bezier(.36,.07,.19,.97) both',
                  display: 'inline-block',
                }}>✓ تم الطلب</span>
              ) : (
                <>
                  <span style={{ fontSize: 11 * size, color: '#fff' }}>🛒</span>
                  <span style={{ fontSize: 9 * size, color: '#fff', fontWeight: 700 }}>أضف للسلة</span>
                </>
              )}
            </div>

            {/* Success badge */}
            {activeStage === 'success' && (
              <div style={{
                position: 'absolute', top: -22 * size, left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(17,167,152,0.95)',
                color: '#fff', fontSize: 7 * size, fontWeight: 700,
                padding: `${2 * size}px ${6 * size}px`,
                borderRadius: 99, whiteSpace: 'nowrap',
                animation: 'badgeSlideIn 0.35s ease both',
                boxShadow: '0 2px 8px rgba(42,181,109,0.5)',
              }}>
                ✓ أضيف للسلة!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Animated stacked cards widget ────────────────────────────────────────────
function AnimatedProductCards() {
  const [cardIndices, setCardIndices] = useState([0, 1, 2]);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSwapping(true);
      setTimeout(() => {
        setCardIndices(prev => [
          (prev[0] + 1) % products.length,
          (prev[1] + 1) % products.length,
          (prev[2] + 1) % products.length,
        ]);
        setIsSwapping(false);
      }, 700);
    }, 6200); // تبديل كل ~6.2 ثواني مع مدة الأنيميشن
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{productCardStyles}</style>

      <div
        className={`hero-cards-wrapper absolute -top-12 -right-12 sm:-top-16 sm:-right-16 md:-top-20 md:-right-20 z-[999] scale-[0.5] sm:scale-[0.6] md:scale-[0.7] origin-top-right ${isSwapping ? 'deck-swapping' : ''}`}
        style={{ width: 190, height: 260, perspective: '1200px' }}
      >
        {/* Ambient glow - محسّنة */}
        <div style={{
          position: 'absolute', inset: '-30px', borderRadius: '50%',
          background: `radial-gradient(ellipse 140% 120% at 50% 40%, ${TEAL_LIGHT}60 0%, rgba(21,94,88,0.2) 50%, transparent 85%)`,
          animation: 'glowPulseCard 5.5s ease-in-out infinite',
          filter: 'blur(30px)', pointerEvents: 'none',
          boxShadow: `0 0 80px ${TEAL_LIGHT}40`,
        }} />

        {/* Grid texture محسّنة */}
        <div style={{
          position: 'absolute', inset: '-35px', opacity: 0.08,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          animation: 'gridMove 8s linear infinite',
          borderRadius: 18, pointerEvents: 'none',
        }} />

        {/* Orbiting dot محسّن */}
        <div style={{ position: 'absolute', top: '48%', left: '42%', width: 0, height: 0 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: NEON, 
            boxShadow: `0 0 20px ${NEON}, 0 0 40px ${NEON}80`,
            animation: 'orbitDot 10s linear infinite',
            marginTop: -4, marginLeft: -4,
            filter: 'drop-shadow(0 0 6px rgba(85,249,230,0.8))',
          }} />
        </div>

        {/* Card 3 — back */}
        <div key={`card-3-${cardIndices[2]}`} className={`pc-third ${isSwapping ? 'deck-back-to-mid' : ''}`} style={{
          position: 'absolute', top: 24, left: -44, zIndex: 1,
          filter: 'brightness(0.6) blur(0.5px)',
          transformStyle: 'preserve-3d',
        }}>
          <MiniProductCard p={products[cardIndices[2]]} size={0.76} scanDelay="2.8s" showOrder={false} />
        </div>

        {/* Card 2 — middle */}
        <div key={`card-2-${cardIndices[1]}`} className={`pc-sec ${isSwapping ? 'deck-mid-to-front' : ''}`} style={{
          position: 'absolute', top: 12, left: -22, zIndex: 2,
          filter: 'brightness(0.75)',
          transformStyle: 'preserve-3d',
        }}>
          <MiniProductCard p={products[cardIndices[1]]} size={0.87} scanDelay="2s" showOrder={false} />
        </div>

        {/* Card 1 — front (مع أنيميشن الطلب) */}
        <div key={`card-1-${cardIndices[0]}`} className={`pc-main ${isSwapping ? 'deck-front-to-back' : ''}`} style={{ 
          position: 'relative', 
          zIndex: 3,
          transformStyle: 'preserve-3d',
        }}>
          <MiniProductCard p={products[cardIndices[0]]} size={1} scanDelay="1.1s" showOrder={true} />
        </div>
      </div>
    </>
  );
}

// ─── HeroSection ──────────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section className="relative pt-14 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32 lg:pt-24 lg:pb-36 overflow-hidden bg-aurora">

      {/* Background Decor */}
      <div className="absolute -top-24 right-[-120px] w-[360px] h-[360px] sm:w-[520px] sm:h-[520px] landing-glow opacity-70" />
      <div className="absolute bottom-0 left-[-160px] w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] landing-glow opacity-50" />
      <div className="absolute inset-0 landing-grid opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-24">

          {/* ── Visuals — Right Side ── */}
          <div className="flex-1 w-full max-w-[320px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-none order-1 lg:order-2">
            <div className="relative">

              {/* Main Hero Card */}
              <ScrollAnimation animation="reveal-3d-up" duration={1} delay={0.2}>
                <div className="relative z-20 rounded-3xl p-6 sm:p-8 landing-card landing-sheen">
                  <div className="relative aspect-[4/3] w-full rounded-2xl bg-black/20 flex items-center justify-center overflow-visible p-2">
                    <Image
                      src="/caracter.png"
                      alt="Online Catalog Character"
                      width={500}
                      height={500}
                      className="relative z-20 object-contain scale-[1.05] -translate-y-4 drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)] animate-float"
                      priority
                    />
                  </div>
                </div>
              </ScrollAnimation>

              {/* ✅ Animated Product Cards — Top Right */}
              <AnimatedProductCards />

              {/* Bottom Left — Success Card */}
              <div className="absolute -bottom-6 -left-6 z-30 bg-black/40 backdrop-blur-md p-4 rounded-2xl shadow-[0_30px_80px_rgba(4,20,18,0.45)] border border-white/10 w-40 md:w-60 animate-float-slow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-accent/15 flex items-center justify-center text-brand-accent shadow-inner">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="h-2 w-20 bg-brand-accent/20 rounded-full mb-2" />
                    <div className="text-[10px] md:text-xs font-bold text-foreground">تم إطلاق المتجر بنجاح!</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Content — Left Side ── */}
          <div className="flex-1 text-center lg:text-right space-y-8 md:space-y-10 order-2 lg:order-1">

            <div className="space-y-4">
              <ScrollAnimation animation="blur-in" delay={0.1}>
                <span className="inline-block px-4 py-1.5 rounded-full bg-brand-accent/15 text-brand-accent text-sm font-bold tracking-wide animate-fade-in ring-1 ring-brand-accent/30 shadow-[0_0_18px_rgba(85,249,230,0.35)]">
                  🚀 أطلق متجرك في 3 خطوات بسيطة
                </span>
              </ScrollAnimation>
              
              <ScrollAnimation animation="reveal-3d-up" delay={0.2}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-headline tracking-tight text-foreground leading-[1.2]">
                  <span className="block mb-2 text-foreground/90">متجرك الرقمي...</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F1C] via-[#FFC800] to-[#34D399] block py-2 text-gradient-anim">
                    جاهز في دقائق.
                  </span>
                </h1>
              </ScrollAnimation>
            </div>

            <ScrollAnimation animation="fade-up" delay={0.4}>
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                سجّل، أضف منتجاتك، وابدأ البيع فوراً برابط مخصص لمتجرك.
                <span className="block mt-4 text-brand-accent/90 text-base md:text-lg font-mono" dir="ltr">
                  Online-Catalog.net/store-name
                </span>
              </p>
            </ScrollAnimation>

            <div className="flex flex-col items-center gap-4 md:gap-5 justify-center lg:justify-start">

              {/* Google Play Button */}
              <ScrollAnimation animation="scale-up" delay={0.6}>
                <Button
                  size="lg"
                  className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl bg-white text-[#0b3c35] font-bold w-full sm:w-auto transition-all duration-300 shadow-[0_18px_45px_rgba(4,20,18,0.25)] hover:shadow-[0_20px_60px_rgba(85,249,230,0.25)] hover:scale-[1.02] active:scale-95 border border-white/60 group"
                  asChild
                >
                  <Link href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                    <Image src={GOOGLE_PLAY_ICON} alt="Google Play" width={36} height={36} className="rounded-lg shadow-sm w-9 h-9 object-contain" />
                    حمل التطبيق الآن
                  </Link>
                </Button>
              </ScrollAnimation>

              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full sm:w-auto justify-center lg:justify-start">

                {/* Start Free Button */}
                <ScrollAnimation animation="fade-right" delay={0.7}>
                  <Button
                    size="lg"
                    className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl shadow-[0_16px_45px_rgba(85,249,230,0.35)] hover:shadow-[0_20px_60px_rgba(85,249,230,0.45)] transition-all font-bold group w-full sm:w-auto bg-brand-accent text-[#043832] hover:scale-105 active:scale-95"
                    asChild
                  >
                    <Link href="/home">
                      ابدأ رحلتك مجاناً
                      <ArrowRight className="mr-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </ScrollAnimation>

                {/* Demo Store Button */}
                <ScrollAnimation animation="fade-left" delay={0.8}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl border border-brand-accent/40 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:text-brand-accent w-full sm:w-auto transition-all font-bold"
                    asChild
                  >
                    <Link href="https://online-catalog.net/elfath" target="_blank" rel="noopener noreferrer">
                      تصفح متجر تجريبي
                    </Link>
                  </Button>
                </ScrollAnimation>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
