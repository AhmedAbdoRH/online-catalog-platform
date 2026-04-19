'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Zap, 
  ShoppingCart, 
  EyeOff, 
  Eraser, 
  Palette, 
  BarChart3, 
  Download, 
  CheckCircle2,
  Crown,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';
import { cn } from '@/lib/utils';

const proFeatures = [
  {
    icon: ShoppingCart,
    title: 'نظام سلة ذكي',
    description: 'تجربة تسوق متكاملة تتيح لعملائك تجميع طلباتهم وإرسالها بضغطة واحدة، مما يرفع معدل تحويل المبيعات.',
    iconColor: 'text-brand-accent',
    bgGradient: 'from-brand-accent/20 to-transparent'
  },
  {
    icon: Eraser,
    title: 'سحر الـ AI لصورك',
    description: 'تقنية ذكاء اصطناعي مدمجة لإزالة خلفيات الصور فوراً وجعلها تبدو كأنها التقطت في استوديو محترف بضغطة زر.',
    iconColor: 'text-brand-primary',
    bgGradient: 'from-brand-primary/20 to-transparent'
  },
  {
    icon: EyeOff,
    title: 'براندك.. هو البطل',
    description: 'استمتع بنسخة نقية تماماً من حقوق المنصة، واجهة تعبر عنك وعن علامتك التجارية وتصاميمك فقط.',
    iconColor: 'text-brand-luxury',
    bgGradient: 'from-brand-luxury/20 to-transparent'
  },
  {
    icon: Palette,
    title: 'واجهات VIP',
    description: 'قوالب حصرية مصممة لتناسب أرقى المتاجر، مع إمكانية تخصيص الألوان والخطوط بدقة لتناسب هوية المحل.',
    iconColor: 'text-brand-success',
    bgGradient: 'from-brand-success/20 to-transparent'
  },
  {
    icon: BarChart3,
    title: 'إحصائيات متقدمة',
    description: 'لوحة قياس دقيقة تحلل سلوك زوارك وتخبرك من أين يأتي عملاؤك وما هي المنتجات الرابحة فعلياً وعدد النقرات.',
    iconColor: 'text-brand-primary',
    bgGradient: 'from-brand-primary/20 to-transparent'
  },
  {
    icon: Download,
    title: 'تصدير البيانات',
    description: 'إمكانية تصدير بيانات المنتجات والطلبات والعملاء بضغطة واحدة لاستخدامها في إدارتك الخاصة أو الأرشفة.',
    iconColor: 'text-brand-accent',
    bgGradient: 'from-brand-accent/20 to-transparent'
  }
];

export default function ProFeaturesHighlight() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-background">
      {/* Dynamic Background Patterns */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(0,209,201,0.05)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(255,200,0,0.05)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-20 text-center">
          <ScrollAnimation animation="blur-in">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent mb-8 backdrop-blur-md"
            >
              <Crown className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-bold tracking-widest uppercase">تجربة استثنائية للمحترفين</span>
            </motion.div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={0.2}>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black mb-8 font-headline leading-[1.1] tracking-tight text-white max-w-4xl">
              امتلك متجراً يصنع <span className="text-brand-accent">الفارق</span> الحقيقي
            </h2>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={0.4}>
            <p className="text-lg sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              باقة البرو تمنحك الأدوات اللازمة للتميز في السوق الرقمي والسيطرة على صناعتك باحترافية تامة.
            </p>
          </ScrollAnimation>
        </div>

        {/* Uniform Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {proFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={cn(
                "group relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 border border-brand-accent/20 bg-white/[0.06] backdrop-blur-3xl transition-all duration-500 flex flex-col items-center text-center h-full shadow-[0_20px_80px_rgba(0,0,0,0.4)]"
              )}
            >
              {/* Feature Gradient Backdrop - Now persistent with lower opacity to look balanced */}
              <div className={cn(
                "absolute -top-[20%] -right-[20%] w-[140%] h-[140%] opacity-30 blur-[100px] pointer-events-none -z-10",
                feature.bgGradient === 'from-brand-accent/20 to-transparent' ? 'bg-[radial-gradient(circle_at_center,rgba(255,200,0,0.4),transparent_70%)]' : 
                feature.bgGradient === 'from-brand-primary/20 to-transparent' ? 'bg-[radial-gradient(circle_at_center,rgba(0,209,201,0.4),transparent_70%)]' :
                'bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.4),transparent_70%)]'
              )} />

              <div className="relative h-full flex flex-col items-center justify-center z-10">
                <div className="flex flex-col items-center gap-6">
                  <div className={cn(
                    "p-4 rounded-2xl bg-white/10 border border-white/10 scale-110 transition-all duration-500 shadow-inner",
                    feature.iconColor
                  )}>
                    <feature.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black mb-3 text-brand-accent font-headline transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 text-lg leading-relaxed transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Corner Icon - Persistent but subtle */}
              <div className="absolute -bottom-4 -left-4 p-8 opacity-[0.03] rotate-45 transform scale-150">
                 <feature.icon className="w-24 h-24 text-white" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Premium CTA Box */}
        <ScrollAnimation animation="reveal-3d-up" delay={0.6}>
          <div className="mt-20 relative p-0.5 rounded-[3rem] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary animate-gradient-xy opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative bg-background/95 backdrop-blur-xl rounded-[2.9rem] p-10 sm:p-20 flex flex-col items-center justify-center text-center">
              <Sparkles className="w-16 h-16 text-brand-accent mb-8 animate-pulse" />
              <h3 className="text-3xl sm:text-5xl font-black mb-6 text-white font-headline leading-tight">
                هل تريد أن يرى الجميع متجرك <br className="hidden sm:block" /> بالصورة التي <span className="text-brand-accent">يستحقها</span>؟
              </h3>
              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md mt-10">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#pricing"
                  className="flex-1 px-10 py-5 bg-brand-accent text-brand-primary font-black rounded-2xl text-xl shadow-[0_0_30px_rgba(255,200,0,0.3)] hover:shadow-[0_0_50px_rgba(255,200,0,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <Rocket className="w-6 h-6" />
                  ابدأ الآن
                </motion.a>
                
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://wa.me/201008116452?text=مرحباً، أريد معرفة المزيد عن مميزات باقة البرو"
                  className="flex-1 px-10 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl text-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-6 h-6" />
                  استشارة مجانية
                </motion.a>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
