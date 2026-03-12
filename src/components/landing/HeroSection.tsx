'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const PLAY_STORE_URL = 'https://play.google.com/apps/testing/com.nextcatalog.app';
const GOOGLE_PLAY_ICON = 'https://res.cloudinary.com/dvikey3wc/image/upload/v1773216706/Online_Catalog_pmlblb.png';

const GOLD = '#FFC800';
const GREEN_ACCENT = '#3DDC84';
const TEAL_LIGHT = '#155e58';

// ─── Keyframes ────────────────────────────────────────────────────────────────
const productCardStyles = `
  @keyframes floatMain {
    0%,100% { transform: translateY(0px) rotateX(0deg) rotateY(0deg) rotateZ(-1deg); filter: drop-shadow(0 14px 28px rgba(0,0,0,0.45)); }
    50%      { transform: translateY(-14px) rotateX(5deg) rotateY(-8deg) rotateZ(0.6deg); filter: drop-shadow(0 26px 40px rgba(0,0,0,0.55)); }
  }
  
  @keyframes orbitRight {
    0%   { transform: translateX(140px) rotateY(0deg) rotateZ(-5deg) translateY(-20px) scale(0.75); opacity: 0.2; }
    25%  { transform: translateX(0px) rotateY(90deg) rotateZ(0deg) translateY(0px) scale(0.85); opacity: 0.7; }
    50%  { transform: translateX(-140px) rotateY(180deg) rotateZ(5deg) translateY(-20px) scale(0.9); opacity: 1; }
    75%  { transform: translateX(0px) rotateY(270deg) rotateZ(0deg) translateY(20px) scale(0.85); opacity: 0.7; }
    100% { transform: translateX(140px) rotateY(360deg) rotateZ(-5deg) translateY(-20px) scale(0.75); opacity: 0.2; }
  }
  
  @keyframes orbitLeft {
    0%   { transform: translateX(-140px) rotateY(180deg) rotateZ(5deg) translateY(-20px) scale(0.9); opacity: 1; }
    25%  { transform: translateX(0px) rotateY(270deg) rotateZ(0deg) translateY(20px) scale(0.85); opacity: 0.7; }
    50%  { transform: translateX(140px) rotateY(360deg) rotateZ(-5deg) translateY(-20px) scale(0.75); opacity: 0.2; }
    75%  { transform: translateX(0px) rotateY(90deg) rotateZ(0deg) translateY(0px) scale(0.85); opacity: 0.7; }
    100% { transform: translateX(-140px) rotateY(180deg) rotateZ(5deg) translateY(-20px) scale(0.9); opacity: 1; }
  }
  
  @keyframes orbitBack {
    0%   { transform: translateX(0px) rotateY(90deg) rotateZ(0deg) translateY(0px) scale(0.85); opacity: 0.7; }
    25%  { transform: translateX(-140px) rotateY(180deg) rotateZ(5deg) translateY(-20px) scale(0.9); opacity: 1; }
    50%  { transform: translateX(0px) rotateY(270deg) rotateZ(0deg) translateY(20px) scale(0.85); opacity: 0.7; }
    75%  { transform: translateX(140px) rotateY(360deg) rotateZ(-5deg) translateY(-20px) scale(0.75); opacity: 0.2; }
    100% { transform: translateX(0px) rotateY(90deg) rotateZ(0deg) translateY(0px) scale(0.85); opacity: 0.7; }
  }

  @keyframes cardFlip3D {
    0%   { opacity: 0; transform: perspective(1200px) rotateY(90deg) rotateX(20deg) translateX(20px) scale(0.8); }
    50%  { opacity: 1; }
    100% { opacity: 1; transform: perspective(1200px) rotateY(0deg) rotateX(0deg) translateX(0) scale(1); }
  }
  
  @keyframes glowDynamic {
    0%   { box-shadow: 0 0 30px rgba(255, 193, 7, 0.3), inset 0 1px 0 rgba(255,255,255,0.06); }
    50%  { box-shadow: 0 0 50px rgba(255, 193, 7, 0.6), inset 0 1px 0 rgba(255,255,255,0.06); }
    100% { box-shadow: 0 0 30px rgba(255, 193, 7, 0.3), inset 0 1px 0 rgba(255,255,255,0.06); }
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
    0%,100% { opacity:0.18; }
    50%     { opacity:0.5; }
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
    0%,100% { transform: scale(1); box-shadow: 0 4px 14px rgba(61,220,132,0.4); }
    50%      { transform: scale(1.08); box-shadow: 0 6px 22px rgba(61,220,132,0.65); }
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

  .pc-main  { animation: floatMain  5.5s ease-in-out infinite; perspective: 1200px; transform-style: preserve-3d; }
  
  .card-orbit-right  { animation: orbitRight  7.2s ease-in-out infinite; transform-style: preserve-3d; }
  .card-orbit-left   { animation: orbitLeft   7.2s ease-in-out infinite; transform-style: preserve-3d; }
  .card-orbit-back   { animation: orbitBack   7.2s ease-in-out infinite; transform-style: preserve-3d; }
  
  .card-enter { animation: cardFlip3D 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55); perspective: 1200px; }
`;

// ─── Products data ─────────────────────────────────────────────────────────────
const products = [
  {
    emoji: '👕',
    name: 'قميص كتان أزرق فاتح',
    sub: 'حجم Large، 100% كتان',
    category: 'ملابس',
    desc: 'قميص صيفي مريح وأنيق من كتان عالي الجودة...',
    price: '185',
    color: '#3b9dd9',
    bgTop: 'linear-gradient(135deg, #1a2a4e 0%, #0d47a1 100%)',
  },
  {
    emoji: '�',
    name: 'تيشيرت رجالي كلاسيكي',
    sub: 'حجم L، قطن 100%',
    category: 'ملابس',
    desc: 'تيشيرت مريح وعملي مناسب للاستخدام اليومي...',
    price: '95',
    color: '#e53935',
    bgTop: 'linear-gradient(135deg, #3d1a1a 0%, #8b0000 100%)',
  },
  {
    emoji: '🎧',
    name: 'سماعات رأس لاسلكية',
    sub: 'بلوتوث 5.0، بطارية 30 ساعة',
    category: 'أجهزة',
    desc: 'سماعات احترافية بصوت عالي الجودة وراحة فائقة...',
    price: '385',
    color: '#ffc107',
    bgTop: 'linear-gradient(135deg, #4a3a00 0%, #8b7500 100%)',
  },
];

// ─── Order animation stages ────────────────────────────────────────────────────
// idle → adding (1.2s) → loading (1.5s) → success (2s) → reset
const ORDER_CYCLE = ['idle', 'adding', 'loading', 'success', 'idle'];
const ORDER_DURATIONS = { idle: 2800, adding: 1100, loading: 1400, success: 2000 };

function useOrderCycle() {
  const [stage, setStage] = useState('idle');
  useEffect(() => {
    let timeout;
    function next(current) {
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
      }, ORDER_DURATIONS[current]);
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
function MiniProductCard({ p, size = 1, scanDelay = '1s', showOrder = false }) {
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
        boxShadow: `0 ${16 * size}px ${40 * size}px rgba(0,0,0,0.5), 
                    0 0 ${30 * size}px rgba(${parseInt(p.color.slice(1,3), 16)}, ${parseInt(p.color.slice(3,5), 16)}, ${parseInt(p.color.slice(5,7), 16)}, 0.15),
                    inset 0 1px 0 rgba(255,255,255,0.06)`,
        transition: 'box-shadow 0.6s ease',
      }}>

        {/* Dynamic light reflection */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14 * size,
          background: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          pointerEvents: 'none', zIndex: 1,
        }} />

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
          <span style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{p.emoji}</span>

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
            <span style={{ display: 'block', fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontSize: 9.5 * size }}>{p.sub}</span>
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
            background: `linear-gradient(90deg, ${GOLD}, #FFE57A, ${GOLD})`,
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
                  background: `linear-gradient(90deg, ${GREEN_ACCENT}, #2ab56d)`,
                  animation: 'progressFill 1.3s ease forwards',
                }} />
              </div>
            )}

            <div style={{
              height: 26 * size,
              borderRadius: 8 * size,
              background: activeStage === 'success'
                ? 'linear-gradient(135deg, #2ab56d, #1d8f55)'
                : `linear-gradient(135deg, ${GREEN_ACCENT}, #2ab56d)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 5 * size,
              cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
              transition: 'background 0.4s ease',
              animation: activeStage === 'idle' ? 'btnPulse 3s ease-in-out infinite' : 'none',
              boxShadow: activeStage === 'success'
                ? '0 4px 16px rgba(42,181,109,0.55)'
                : '0 4px 14px rgba(61,220,132,0.4)',
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
                background: 'rgba(42,181,109,0.95)',
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCardIndices(prev => [
        (prev[0] + 1) % products.length,
        (prev[1] + 1) % products.length,
        (prev[2] + 1) % products.length,
      ]);
    }, 7200); // تبديل مع الأنيميشن
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{productCardStyles}</style>

      <div
        className="absolute -top-10 -right-10 z-30"
        style={{ 
          width: 190, 
          height: 260, 
          perspective: '1200px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Central glow container */}
        <div style={{
          position: 'absolute', inset: '-40px', borderRadius: '50%',
          background: `radial-gradient(ellipse, ${TEAL_LIGHT}80 0%, transparent 75%)`,
          animation: 'glowPulseCard 5s ease-in-out infinite',
          filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Rotating light effect */}
        <div style={{
          position: 'absolute', inset: '-24px', borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${GOLD}80, ${TEAL_LIGHT}40, ${GOLD}80)`,
          animation: 'orbitDot 12s linear infinite',
          filter: 'blur(25px)', pointerEvents: 'none', zIndex: 0, opacity: 0.4,
        }} />

        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: '-28px', opacity: 0.045,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          animation: 'gridMove 7s linear infinite',
          borderRadius: 18, pointerEvents: 'none',
        }} />

        {/* Orbiting dot */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: `linear-gradient(135deg, ${GOLD}, #FFE57A)`,
            boxShadow: `0 0 15px ${GOLD}, 0 0 30px ${GOLD}80`,
            animation: 'orbitDot 8s linear infinite',
            marginTop: -4, marginLeft: -4,
          }} />
        </div>

        {/* 3D Cards Orbit Container */}
        <div style={{
          position: 'absolute',
          inset: 0,
          perspective: '1200px',
          transformStyle: 'preserve-3d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

          {/* Card on Left (going back) */}
          <div 
            key={`card-left-${cardIndices[1]}`} 
            className="card-orbit-left card-enter" 
            style={{
              position: 'absolute',
              transformStyle: 'preserve-3d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'brightness(0.65)',
            }}
          >
            <MiniProductCard p={products[cardIndices[1]]} size={0.87} scanDelay="2s" showOrder={false} />
          </div>

          {/* Card in Back (hidden) */}
          <div 
            key={`card-back-${cardIndices[2]}`} 
            className="card-orbit-back card-enter" 
            style={{
              position: 'absolute',
              transformStyle: 'preserve-3d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'brightness(0.4) blur(0.5px)',
            }}
          >
            <MiniProductCard p={products[cardIndices[2]]} size={0.76} scanDelay="2.8s" showOrder={false} />
          </div>

          {/* Card in Front (hero card) */}
          <div 
            key={`card-front-${cardIndices[0]}`} 
            className="pc-main card-enter" 
            style={{ 
              position: 'absolute',
              transformStyle: 'preserve-3d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MiniProductCard p={products[cardIndices[0]]} size={1} scanDelay="1.1s" showOrder={true} />
          </div>

          {/* Card on Right (coming forward) */}
          <div 
            key={`card-right-${cardIndices[0]}`} 
            className="card-orbit-right card-enter" 
            style={{
              position: 'absolute',
              transformStyle: 'preserve-3d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'brightness(0.7)',
            }}
          >
            <MiniProductCard p={products[cardIndices[0]]} size={0.8} scanDelay="1.8s" showOrder={false} />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── HeroSection ──────────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section className="relative pt-12 sm:pt-14 md:pt-16 pb-12 sm:pb-20 md:pb-28 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-brand-primary/10 via-background to-background">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-brand-accent/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-brand-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse-slow" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-24">

          {/* ── Visuals — Right Side ── */}
          <div className="flex-1 w-full max-w-[320px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-none order-1 lg:order-2">
            <div className="relative">

              {/* Main Hero Card */}
              <div className="relative z-20 rounded-3xl bg-gradient-to-tr from-background/80 to-secondary/30 p-4 sm:p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20">
                <div className="relative aspect-[4/3] w-full rounded-2xl bg-muted/30 flex items-center justify-center overflow-visible">
                  <Image
                    src="/caracter.png"
                    alt="Online Catalog Character"
                    width={500}
                    height={500}
                    className="object-contain scale-[1.15] -translate-y-6 drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)] animate-float"
                    priority
                  />
                </div>
              </div>

              {/* ✅ Animated Product Cards — Top Right */}
              <AnimatedProductCards />

              {/* Bottom Left — Success Card */}
              <div className="absolute -bottom-6 -left-6 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 w-40 md:w-60 animate-float-slow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shadow-inner">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="h-2 w-20 bg-green-500/20 rounded-full mb-2" />
                    <div className="text-[10px] md:text-xs font-bold text-foreground">تم إطلاق المتجر بنجاح!</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Content — Left Side ── */}
          <div className="flex-1 text-center lg:text-right space-y-8 md:space-y-10 order-2 lg:order-1">

            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold tracking-wide animate-fade-in">
                🚀 أطلق متجرك في 3 خطوات بسيطة
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-headline tracking-tight text-foreground leading-[1.2]">
                <span className="block mb-2 text-zinc-800 dark:text-zinc-100">متجرك الرقمي...</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent via-[#FFC800] to-brand-primary block py-2">
                  جاهز في دقائق.
                </span>
              </h1>
            </div>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              سجّل، أضف منتجاتك، وابدأ البيع فوراً برابط مخصص لمتجرك.
              <span className="block mt-4 text-brand-primary/80 text-base md:text-lg font-mono" dir="ltr">
                Online-Catalog.net/store-name
              </span>
            </p>

            <div className="flex flex-col items-center gap-4 md:gap-5 justify-center lg:justify-start">

              {/* Google Play Button */}
              <Button
                size="lg"
                className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl bg-gradient-to-r from-[#3DDC84] via-[#34A853] to-[#4285F4] hover:from-[#34C76F] hover:via-[#2D9249] hover:to-[#3B7AE4] text-white font-bold w-full sm:w-auto transition-all duration-300 shadow-[0_8px_30px_rgba(61,220,132,0.35)] hover:shadow-[0_12px_40px_rgba(61,220,132,0.45)] hover:scale-105 active:scale-95 border-0 group"
                asChild
              >
                <Link href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                  <Image src={GOOGLE_PLAY_ICON} alt="Google Play" width={36} height={36} className="rounded-lg shadow-sm w-9 h-9 object-contain" />
                  حمل التطبيق الآن
                </Link>
              </Button>

              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full sm:w-auto justify-center lg:justify-start">

                {/* Start Free Button */}
                <Button
                  size="lg"
                  className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl shadow-[0_10px_30px_rgba(var(--brand-primary),0.3)] hover:shadow-brand-primary/40 transition-all font-bold group w-full sm:w-auto bg-brand-primary hover:scale-105 active:scale-95"
                  asChild
                >
                  <Link href="/home">
                    ابدأ رحلتك مجاناً
                    <ArrowRight className="mr-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                {/* Demo Store Button */}
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl border-2 border-primary/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 w-full sm:w-auto transition-all font-bold"
                  asChild
                >
                  <Link href="https://online-catalog.net/elfath" target="_blank" rel="noopener noreferrer">
                    تصفح متجر تجريبي
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}