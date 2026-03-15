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
  },
  {
    icon: LayoutDashboard,
    title: 'لوحة تحكم بسيطة',
    description: 'إدارة المنتجات، الطلبات، والإحصاءات من مكان واحد.',
  },
  {
    icon: MessageCircle,
    title: 'تكامل واتساب',
    description: 'زر تواصل مباشر للطلبات يسهل عملية البيع.',
  },
  {
    icon: LinkIcon,
    title: 'روابط وقابلة للمشاركة',
    description: 'رابط ثابت + QR Code جاهز للطباعة والنشر.',
  },
  {
    icon: Smartphone,
    title: 'دعم متعدد الأجهزة',
    description: 'تصميم مُحسّن يعمل بكفاءة على الموبايل والكمبيوتر.',
  },
  {
    icon: Tags,
    title: 'تحكم بالأسعار والتخفيضات',
    description: 'إنشاء عروض وخصومات وتعديل الأسعار بسهولة.',
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
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-brand-accent/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 transform group-hover:scale-105" />
                
                <div className="h-full flex flex-col items-center text-center p-8 sm:p-10 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 group-hover:border-brand-primary/30 transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:-translate-y-2">
                  
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-accent/10 flex items-center justify-center text-brand-primary mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner ring-1 ring-white/10 group-hover:bg-brand-primary/30">
                    <feature.icon className="w-10 h-10 opacity-90" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-brand-primary transition-colors tracking-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground/80 text-lg leading-relaxed group-hover:text-muted-foreground transition-colors">
                    {feature.description}
                  </p>
                  
                  {/* Decorative Elements */}
                  <div className="mt-auto pt-8 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="w-16 h-1.5 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent rounded-full" />
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
