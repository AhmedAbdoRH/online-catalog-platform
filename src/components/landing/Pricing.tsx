import { Check, Package, Zap, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ScrollAnimation from './ScrollAnimation';
import {
  FREE_PLAN_MAX_PRODUCTS,
  formatPlanPrice,
  PRO_MONTHLY_PRICE_EGP,
  PRO_YEARLY_PRICE_EGP,
} from '@/lib/plans';

const plans = [
  {
    name: 'Basic',
    price: 'مجاناً',
    description: 'للمتاجر الصغيرة والناشئة',
    icon: Package,
    features: [
      { text: `${FREE_PLAN_MAX_PRODUCTS} منتج`, included: true },
      { text: '5 تصنيفات', included: true },
      { text: 'لوحة تحكم أساسية', included: true },
      { text: 'رابط مخصص', included: true },
      { text: 'دعم فني', included: true },
    ],
    cta: 'ابدأ مجاناً',
    ctaLink: '/signup',
    popular: true,
  },
  {
    name: 'Pro',
    price: formatPlanPrice(PRO_YEARLY_PRICE_EGP),
    period: '/ سنوياً',
    secondaryPrice: `أو ${formatPlanPrice(PRO_MONTHLY_PRICE_EGP)} / شهرياً`,
    description: 'للمتاجر المتنامية التي تحتاج المزيد',
    icon: Zap,
    features: [
      { text: 'عدد غير محدود من المنتجات والتصنيفات', included: true },
      { text: 'أنماط مظهر متعددة للمتجر', included: true },
      { text: 'إزالة شعار المنصة', included: true },
      { text: 'دعم فني بأولوية', included: true },
    ],
    cta: 'اشترك الآن',
    ctaLink: `https://wa.me/201008116452?text=${encodeURIComponent(
      `أرغب في الاشتراك في باقة البرو (${formatPlanPrice(PRO_MONTHLY_PRICE_EGP)} شهرياً أو ${formatPlanPrice(PRO_YEARLY_PRICE_EGP)} سنوياً)`
    )}`,
    popular: false,
  },
  {
    name: 'Business',
    prefix: 'ابتداءً من',
    price: '5000 ج.م',
    period: '/ سنوياً',
    description: 'للشركات التي تحتاج حلولاً مخصصة',
    icon: Building,
    features: [
      { text: 'موقع ومتجر إلكتروني كامل', included: true },
      { text: 'نطاق خاص (Domain)', included: true },
      { text: 'تصميم مخصص بالكامل', included: true },
      { text: 'لوحة تحكم متقدمة', included: true },
    ],
    cta: 'اعرف أكثر',
    ctaLink: 'https://onlinecatalog.netlify.app/',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollAnimation animation="blur-in" duration={1}>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold font-headline">باقات الأسعار</h2>
            <p className="text-xl text-muted-foreground">اختر الباقة المناسبة لحجم تجارتك</p>
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
                className={`relative rounded-3xl p-8 border flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular
                    ? 'border-primary shadow-2xl scale-105 z-10 bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-[#FFC800]/5 flex items-center justify-center text-primary mb-4 mx-auto">
                    <plan.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{plan.name}</h3>
                  <div className="text-muted-foreground mb-4 h-10 text-center">{plan.description}</div>
                  <div className="flex flex-col gap-1 items-center">
                    {plan.prefix && <span className="text-sm text-muted-foreground">{plan.prefix}</span>}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    {plan.secondaryPrice && (
                      <div className="text-sm text-brand-accent font-bold mt-1 bg-brand-accent/10 px-3 py-1 rounded-full">
                        {plan.secondaryPrice}
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'default' : 'outline'}
                  className={`w-full rounded-xl py-6 text-lg mt-8 ${plan.popular ? 'shadow-lg shadow-primary/20' : ''}`}
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
