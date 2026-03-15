'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ScrollAnimation from './ScrollAnimation';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-150px] left-[-200px] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(85,249,230,0.1),transparent_70%)] blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-200px] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15),transparent_60%)] blur-3xl opacity-40 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <ScrollAnimation animation="reveal-3d-up" duration={1} viewport={{ once: true, amount: 0.3 }}>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl shadow-brand-primary/5 hover:shadow-brand-primary/10 transition-shadow duration-500 group">
            
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

            <div className="relative z-10 py-16 px-6 sm:px-12 md:py-20 md:px-24 text-center">
              <div className="inline-flex items-center justify-center p-3 mb-8 bg-brand-primary/10 rounded-full text-brand-primary ring-1 ring-brand-primary/20 shadow-inner">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground leading-tight">
                جاهز لبدء <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">رحلتك الرقمية؟</span>
              </h2>
              
              <p className="text-lg sm:text-xl text-muted-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                انضم إلى مجتمع التجار الناجحين وابدأ في بناء متجرك الإلكتروني المتكامل في دقائق معدودة. لا خبرة تقنية مطلوبة.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <Button 
                  asChild 
                  size="lg" 
                  className="h-14 px-10 text-lg font-bold rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-[#043832] shadow-[0_10px_30px_-10px_rgba(85,249,230,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(85,249,230,0.6)] hover:scale-105 transition-all duration-300 w-full sm:w-auto group/btn"
                >
                  <Link href="/home" className="flex items-center justify-center gap-2">
                    ابدأ الآن مجاناً
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline"
                  size="lg" 
                  className="h-14 px-10 text-lg font-bold rounded-xl border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-foreground w-full sm:w-auto transition-all duration-300"
                >
                  <Link href="/contact">
                    تواصل معنا
                  </Link>
                </Button>
              </div>
            </div>
            
{/* Decorative Patterns */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-brand-primary/20 to-transparent rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-brand-accent/20 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
