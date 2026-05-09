'use client';

import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Rocket, 
  ShieldCheck, 
  Infinity, 
  EyeOff, 
  Database, 
  Layout, 
  Zap,
  BarChart3
} from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';
import { cn } from '@/lib/utils';

const proFeatures = [
  {
    title: 'منتجات بلا حدود',
    description: 'أضف أي عدد من المنتجات والتصنيفات دون قيود، لتعرض كل ما لديك لعملائك.',
    icon: Infinity,
    iconColor: 'text-brand-accent',
    bgGradient: 'from-brand-accent/20 to-transparent',
  },
  {
    title: 'إزالة شعار المنصة',
    description: 'اجعل متجرك يعبر عنك وحدك، مع إمكانية إزالة شعار "تاجر أونلاين" بالكامل.',
    icon: EyeOff,
    iconColor: 'text-brand-primary',
    bgGradient: 'from-brand-primary/20 to-transparent',
  },
  {
    title: 'تصدير البيانات',
    description: 'احصل على بيانات عملائك وطلباتك في ملفات CSV لتحليلها وتطوير تجارتك.',
    icon: Database,
    iconColor: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-transparent',
  },
  {
    title: 'أنماط عرض متعددة',
    description: 'اختر من بين عدة قوالب وأنماط لعرض منتجاتك بالشكل الذي يناسب ذوقك.',
    icon: Layout,
    iconColor: 'text-brand-accent',
    bgGradient: 'from-brand-accent/20 to-transparent',
  },
  {
    title: 'أولوية الدعم',
    description: 'احصل على دعم فني ومتابعة عملية ذات أولوية لضمان سير عملك بسلاسة.',
    icon: Zap,
    iconColor: 'text-brand-primary',
    bgGradient: 'from-brand-primary/20 to-transparent',
  },
  {
    title: 'إحصائيات متقدمة',
    description: 'راقب أداء متجرك، عدد الزيارات، والمنتجات الأكثر طلباً بدقة عالية.',
    icon: BarChart3,
    iconColor: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-transparent',
  },
];

export default function ProFeaturesHighlight() {
  return (
    <section className="py-24 sm:py-32 bg-[#041412] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(85,249,230,0.05)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(255,215,0,0.05)_0%,transparent_50%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 space-y-6">
          <ScrollAnimation animation="reveal-3d-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-4">
              <Sparkles className="w-5 h-5 text-brand-accent" />
              <span className="text-xs font-black text-brand-accent uppercase tracking-widest">باقة المحترفين - PRO</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              استعرض عضلاتك مع <span className="text-brand-accent">مميزات البرو</span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              عندما تبدأ تجارتك في التوسع، نوفر لك الأدوات التي تجعلك تسيطر على سوقك باحترافية تامة.
            </p>
          </ScrollAnimation>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {proFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={cn(
                "group relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 border border-white/10 bg-white/[0.03] backdrop-blur-3xl transition-all duration-500 flex flex-col items-center text-center h-full shadow-2xl hover:border-brand-accent/30"
              )}
            >
              <div className={cn(
                "absolute -top-[20%] -right-[20%] w-[140%] h-[140%] opacity-20 blur-[100px] pointer-events-none -z-10",
                feature.bgGradient === 'from-brand-accent/20 to-transparent' ? 'bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.3),transparent_70%)]' : 
                feature.bgGradient === 'from-brand-primary/20 to-transparent' ? 'bg-[radial-gradient(circle_at_center,rgba(85,249,230,0.3),transparent_70%)]' :
                'bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.3),transparent_70%)]'
              )} />
              
              <div className="relative h-full flex flex-col items-center justify-center z-10">
                <div className="flex flex-col items-center gap-6">
                  <div className={cn(
                    "p-5 rounded-2xl bg-white/5 border border-white/10 scale-110 transition-all duration-500 shadow-inner group-hover:scale-125 group-hover:rotate-6",
                    feature.iconColor
                  )}>
                    <feature.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black mb-3 text-white group-hover:text-brand-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/50 text-lg leading-relaxed group-hover:text-white/80 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <ScrollAnimation animation="reveal-3d-up" delay={0.6}>
          <div className="mt-20 relative p-0.5 rounded-[3rem] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary animate-gradient-xy opacity-20 group-hover:opacity-60 transition-opacity duration-700" />
            
            <div className="relative bg-[#041412]/95 backdrop-blur-xl rounded-[2.9rem] p-10 sm:p-20 flex flex-col items-center justify-center text-center border border-white/10">
              <Sparkles className="w-16 h-16 text-brand-accent mb-8 animate-pulse" />
              <h3 className="text-3xl sm:text-5xl font-black mb-6 text-white leading-tight">
                هل تريد أن يرى الجميع متجرك <br className="hidden sm:block" /> بالصورة التي <span className="text-brand-accent">يستحقها</span>؟
              </h3>
              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md mt-10">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#pricing"
                  className="flex-1 px-10 py-5 bg-brand-accent text-[#043832] font-black rounded-2xl text-xl shadow-[0_10px_30px_rgba(255,215,0,0.3)] hover:shadow-[0_20px_50px_rgba(255,215,0,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <Rocket className="w-6 h-6" />
                  ابدأ الآن
                </motion.a>
                
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://wa.me/201008116452?text=مرحباً، أريد معرفة المزيد عن مميزات باقة البرو في منظومة تاجر أونلاين"
                  className="flex-1 px-10 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl text-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-6 h-6 text-brand-accent" />
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
