'use client';

import {
  Palette,
  LayoutDashboard,
  MessageCircle,
  Link as LinkIcon,
  Smartphone,
  Tags,
} from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';

const features = [
  {
    icon: Palette,
    title: 'تخصيص الشعار والكفر',
    description: 'حافظ على هوية علامتك التجارية مع خيارات تخصيص مرنة.',
    // Violet / Purple
    iconBg: 'from-violet-500/25 to-purple-500/10',
    iconColor: 'text-violet-400',
    glow: 'from-violet-500/15 to-purple-500/8',
    border: 'group-hover:border-violet-500/35',
    bar: 'via-violet-400/60',
    ring: 'ring-violet-500/15',
    iconHoverBg: 'group-hover:bg-violet-500/30',
  },
  {
    icon: LayoutDashboard,
    title: 'لوحة تحكم بسيطة',
    description: 'إدارة المنتجات، الطلبات، والإحصاءات من مكان واحد.',
    // Sky / Cyan
    iconBg: 'from-sky-400/25 to-cyan-400/10',
    iconColor: 'text-sky-400',
    glow: 'from-sky-400/15 to-cyan-400/8',
    border: 'group-hover:border-sky-400/35',
    bar: 'via-sky-400/60',
    ring: 'ring-sky-400/15',
    iconHoverBg: 'group-hover:bg-sky-400/30',
  },
  {
    icon: MessageCircle,
    title: 'تكامل واتساب',
    description: 'زر تواصل مباشر للطلبات يسهل عملية البيع.',
    // Emerald / Green
    iconBg: 'from-emerald-400/25 to-green-500/10',
    iconColor: 'text-emerald-400',
    glow: 'from-emerald-400/15 to-green-500/8',
    border: 'group-hover:border-emerald-400/35',
    bar: 'via-emerald-400/60',
    ring: 'ring-emerald-400/15',
    iconHoverBg: 'group-hover:bg-emerald-400/30',
  },
  {
    icon: LinkIcon,
    title: 'روابط وقابلة للمشاركة',
    description: 'رابط ثابت + QR Code جاهز للطباعة والنشر.',
    // Amber / Orange
    iconBg: 'from-amber-400/25 to-orange-400/10',
    iconColor: 'text-amber-400',
    glow: 'from-amber-400/15 to-orange-400/8',
    border: 'group-hover:border-amber-400/35',
    bar: 'via-amber-400/60',
    ring: 'ring-amber-400/15',
    iconHoverBg: 'group-hover:bg-amber-400/30',
  },
  {
    icon: Smartphone,
    title: 'دعم متعدد الأجهزة',
    description: 'تصميم مُحسّن يعمل بكفاءة على الموبايل والكمبيوتر.',
    // Rose / Pink
    iconBg: 'from-rose-400/25 to-pink-500/10',
    iconColor: 'text-rose-400',
    glow: 'from-rose-400/15 to-pink-500/8',
    border: 'group-hover:border-rose-400/35',
    bar: 'via-rose-400/60',
    ring: 'ring-rose-400/15',
    iconHoverBg: 'group-hover:bg-rose-400/30',
  },
  {
    icon: Tags,
    title: 'تحكم بالأسعار والتخفيضات',
    description: 'إنشاء عروض وخصومات وتعديل الأسعار بسهولة.',
    // Teal (brand)
    iconBg: 'from-teal-400/25 to-brand-primary/10',
    iconColor: 'text-teal-400',
    glow: 'from-teal-400/15 to-brand-primary/8',
    border: 'group-hover:border-teal-400/35',
    bar: 'via-teal-400/60',
    ring: 'ring-teal-400/15',
    iconHoverBg: 'group-hover:bg-teal-400/30',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-aurora relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(85,249,230,0.03),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollAnimation animation="blur-in" duration={1}>
          <div className="text-center mb-16 sm:mb-24 space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline tracking-tight text-foreground leading-tight">
              ميزات <span className="text-brand-primary relative inline-block">
                متكاملة
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span> لنمو تجارتك
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed">
              كل الأدوات التي تحتاجها لإدارة متجرك باحترافية وسهولة تامة، مصممة خصيصاً لتلبية احتياجاتك.
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature, index) => (
            <ScrollAnimation
              key={index}
              animation="reveal-3d-up"
              delay={index * 0.1}
              duration={0.8}
              viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            >
              <div className="relative group h-full">
                {/* Card Glow — per-card color */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.glow} rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 transform group-hover:scale-105`} />

                <div className={`h-full flex flex-col items-center text-center p-8 sm:p-10 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 ${feature.border} transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:-translate-y-2`}>

                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center ${feature.iconColor} mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner ring-1 ${feature.ring} ${feature.iconHoverBg}`}>
                    <feature.icon className="w-10 h-10 opacity-90" strokeWidth={1.5} />
                  </div>

                  <h3 className={`text-2xl font-bold mb-4 text-foreground ${feature.iconColor.replace('text-', 'group-hover:text-')} transition-colors tracking-tight`}>
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground/80 text-lg leading-relaxed group-hover:text-muted-foreground transition-colors">
                    {feature.description}
                  </p>

                  {/* Bottom accent bar — per-card color */}
                  <div className="mt-auto pt-8 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className={`w-16 h-1.5 bg-gradient-to-r from-transparent ${feature.bar} to-transparent rounded-full`} />
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
