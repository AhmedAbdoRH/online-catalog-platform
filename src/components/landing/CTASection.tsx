'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ScrollAnimation from './ScrollAnimation';
import { Rocket, ShoppingBag, MessageCircle } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-[#041412]">

      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(85,249,230,0.07),transparent_65%)] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-[radial-gradient(ellipse,rgba(245,158,11,0.05),transparent_65%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollAnimation animation="reveal-3d-up" duration={1} viewport={{ once: true, amount: 0.3 }}>
          <div
            className="relative overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] mx-auto max-w-4xl p-8 sm:p-16 md:p-20 text-center"
            style={{
              background: 'rgba(6, 32, 29, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(85, 249, 230, 0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Corner glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(85,249,230,0.1),transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />

            <div className="relative z-10">

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 mb-8 rounded-2xl bg-brand-accent/20 border border-brand-accent/40 shadow-lg shadow-brand-accent/20">
                <Rocket className="w-8 h-8 text-brand-accent" />
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                جاهز للانطلاق؟
              </h2>

              {/* Sub-text */}
              <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
                ابدأ متجرًا رقميًا منظمًا وشارك منتجاتك مع عملائك بسهولة من خلال منظومة تاجر أونلاين المتكاملة.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                {/* Primary CTA */}
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 sm:px-10 text-base sm:text-lg font-black rounded-2xl bg-brand-accent text-[#043832] shadow-[0_10px_30px_-8px_rgba(255,215,0,0.4)] hover:shadow-[0_16px_40px_-8px_rgba(255,215,0,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto gap-2.5"
                >
                  <Link href="https://play.google.com/store/apps/details?id=com.nextcatalog.app" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5">
                    <ShoppingBag className="w-5 h-5" />
                    ابدأ مجاناً الآن
                  </Link>
                </Button>

                {/* Secondary CTA */}
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 sm:px-10 text-base sm:text-lg font-black rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-md hover:bg-white/[0.12] text-white w-full sm:w-auto transition-all duration-300 gap-2.5 hover:border-white/30"
                >
                  <Link
                    href="https://wa.me/201008116452"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5"
                  >
                    <MessageCircle className="w-5 h-5 text-brand-accent" />
                    تواصل مع الدعم
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
