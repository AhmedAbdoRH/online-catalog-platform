'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ScrollAnimation from './ScrollAnimation';
import { Sparkles, ShoppingBag, MessageCircle } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-aurora">

      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(85,249,230,0.07),transparent_65%)] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-[radial-gradient(ellipse,rgba(245,158,11,0.05),transparent_65%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollAnimation animation="reveal-3d-up" duration={1} viewport={{ once: true, amount: 0.3 }}>
          <div
            className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] mx-auto max-w-4xl"
            style={{
              background: 'linear-gradient(145deg, #0a2218 0%, #0d2b1f 50%, #061a12 100%)',
              border: '1px solid rgba(85,249,230,0.12)',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Inner shine sweep */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5 pointer-events-none" />

            {/* Corner glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(85,249,230,0.12),transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[radial-gradient(circle,rgba(245,158,11,0.1),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 py-16 px-6 sm:py-20 sm:px-16 text-center">

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 mb-8 rounded-2xl bg-amber-400/15 border border-amber-400/25 shadow-lg shadow-amber-400/10">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-headline text-foreground leading-tight mb-6 tracking-tight">
                هل تريد أن يرى الجميع متجرك{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400">
                    بالصورة التي يستحقها؟
                  </span>
                </span>
              </h2>

              {/* Sub-text */}
              <p className="text-base sm:text-lg text-white/55 max-w-xl mx-auto mb-10 leading-relaxed">
                انضم لمئات التجار الذين يعرضون منتجاتهم باحترافية كاملة وابدأ رحلتك اليوم.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                {/* Primary CTA */}
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-10 text-base font-bold rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-[#0a1f15] shadow-[0_10px_30px_-8px_rgba(245,158,11,0.55)] hover:shadow-[0_16px_40px_-8px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto gap-2.5"
                >
                  <Link href="/home" className="flex items-center justify-center gap-2.5">
                    <ShoppingBag className="w-5 h-5" />
                    ابدأ الآن
                  </Link>
                </Button>

                {/* Secondary CTA */}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 px-10 text-base font-bold rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-sm hover:bg-white/[0.1] text-foreground w-full sm:w-auto transition-all duration-300 gap-2.5"
                >
                  <Link
                    href="https://wa.me/201000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5"
                  >
                    <MessageCircle className="w-4 h-4 opacity-70" />
                    استشارة مجانية
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
