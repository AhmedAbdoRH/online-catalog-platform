import { Check, Package, Zap, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ScrollAnimation from './ScrollAnimation';
import {
  FREE_PLAN_MAX_PRODUCTS,
  formatPlanPrice,
  PRO_MONTHLY_ORIGINAL_PRICE_EGP,
  PRO_MONTHLY_PRICE_EGP,
  PRO_YEARLY_ORIGINAL_PRICE_EGP,
  PRO_YEARLY_PRICE_EGP,
} from '@/lib/plans';

const plans = [
  {
    name: 'الأساسية (Basic)',
    price: 'مجاناً',
    description: 'ابدأ وجرّب وانطلق في عالم التجارة الإلكترونية',
    icon: Package,
    features: [
      { text: `${FREE_PLAN_MAX_PRODUCTS} منتج متاح`, included: true },
      { text: 'رابط متجر مخصص', included: true },
      { text: 'مشاركة عبر واتساب وQR', included: true },
      { text: 'دخول للمجتمع الأساسي', included: true },
      { text: 'متابعة مبدئية للتفعيل', included: true },
    ],
    cta: 'ابدأ معنا الآن',
    ctaLink: 'https://play.google.com/store/apps/details?id=com.nextcatalog.app',
    popular: false,
  },
  {
    name: 'المتقدمة (Pro)',
    price: formatPlanPrice(PRO_MONTHLY_PRICE_EGP),
    period: '/ شهرياً',
    secondaryPrice: (
      <div className="text-[10px] text-brand-accent font-black animate-pulse">عرض النمو لفترة محدودة ⏳</div>
    ),
    description: 'لما تبدأ تكبر وتحتاج أدوات احترافية للنمو',
    icon: Zap,
    features: [
      { text: 'منتجات وتصنيفات غير محدودة', included: true },
      { text: 'إزالة شعار المنصة بالكامل', included: true },
      { text: 'أنماط عرض متعددة واحترافية', included: true },
      { text: 'تصدير بيانات العملاء والطلبات', included: true },
      { text: 'أولوية في الدعم والمتابعة', included: true },
    ],
    cta: 'طوّر للبرو الآن',
    ctaLink: `https://wa.me/201008116452?text=${encodeURIComponent(
      `أرغب في الترقية لباقة البرو في منظومة تاجر أونلاين`
    )}`,
    popular: true,
  },
  {
    name: 'الأعمال (Business)',
    prefix: 'حلول مخصصة - تبدأ من',
    price: '5000 ج.م',
    period: '',
    description: 'لو عندك احتياج أكبر أو براند خاص وتنفيذ مخصص',
    icon: Building,
    features: [
      { text: 'موقع إحترافي ومتجر إلكتروني متكامل', included: true },
      { text: 'دومين خاص وايميل بيزنيس رسمي', included: true },
      { text: 'لوحة تحكم كاملة', included: true },
      { text: '300 كارت بيزنس مجاناً مع QR Code', included: true },
      { text: 'AI خدمة عملاء للموقع والسوشيال ميديا', included: true },
    ],
    cta: 'اعرف المزيد',
    ctaLink: 'https://onlinecatalog.netlify.app/',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#041412] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <ScrollAnimation animation="blur-in" duration={1}>
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white">باقات الاستثمار في نجاحك</h2>
            <p className="text-xl text-white/50">اختر المسار المناسب لمرحلة نمو تجارتك</p>
          </div>
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollAnimation
              key={index}
              animation="reveal-3d-up"
              delay={index * 0.1}
              duration={0.8}
            >
              <div
                className={`relative rounded-[2.5rem] p-8 border flex flex-col h-full transition-all duration-500 hover:-translate-y-2 ${
                  plan.popular
                    ? 'border-brand-accent shadow-[0_20px_50px_rgba(255,215,0,0.15)] scale-105 z-10 bg-white/[0.05]'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-accent text-[#043832] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    الأكثر طلباً للنمو
                  </div>
                )}

                <div className="mb-8 text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${plan.popular ? 'bg-brand-accent text-[#043832]' : 'bg-white/5 text-white/70'}`}>
                    <plan.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                  <div className="text-white/40 mb-6 h-12 text-sm leading-relaxed">{plan.description}</div>
                  
                  <div className="flex flex-col gap-1 items-center">
                    {plan.prefix && <span className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-1">{plan.prefix}</span>}
                    <div className="flex items-baseline gap-1">
                      {plan.name.includes('Pro') ? (
                        <div className="flex flex-col items-center">
                           <span className="text-xs text-white/30 line-through italic mb-1">{formatPlanPrice(PRO_MONTHLY_ORIGINAL_PRICE_EGP)}</span>
                           <span className="text-4xl font-black text-white">{plan.price}</span>
                        </div>
                      ) : (
                        <span className="text-4xl font-black text-white">{plan.price}</span>
                      )}
                      {plan.period && <span className="text-white/40 text-sm">{plan.period}</span>}
                    </div>
                    {plan.secondaryPrice && (
                      <div className="mt-4 w-full">
                        {plan.secondaryPrice}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full h-px bg-white/10 mb-8" />

                <ul className="space-y-4 flex-1 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.popular ? 'bg-brand-accent/20 text-brand-accent' : 'bg-white/10 text-white/40'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-white/70">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'default' : 'outline'}
                  className={`w-full rounded-2xl py-7 text-lg font-black transition-all ${
                    plan.popular 
                      ? 'bg-brand-accent text-[#043832] hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20' 
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                  asChild
                >
                  <Link href={plan.ctaLink}>{plan.cta}</Link>
                </Button>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
