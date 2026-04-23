import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import ValueProps from '@/components/landing/ValueProps';
import Features from '@/components/landing/Features';
import ProFeaturesHighlight from '@/components/landing/ProFeaturesHighlight';
import ClientShowcase from '@/components/landing/ClientShowcase';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';
import StickyCTA from '@/components/landing/StickyCTA';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden landing-shell">
      <LandingHeader />
      <main>
        {/* 1. الهيرو — الوعد الأساسي وجذب الانتباه */}
        <HeroSection />

        {/* 2. القيمة المضافة — "ليه تختارنا؟" الفوائد قبل المميزات */}
        <ValueProps />

        {/* 3. معرض العملاء — الإثبات الاجتماعي القوي يبني الثقة فوراً */}
        <ClientShowcase />

        {/* 4. طريقة العمل — "الموضوع بسيط" تقليل الاحتكاك النفسي */}
        <HowItWorks />

        {/* 5. المميزات المتكاملة — التفاصيل التقنية اللي بتطمن المحترفين */}
        <Features />

        {/* 6. مميزات الباقة Pro — استعراض العضلات للمشاريع الكبيرة */}
        <ProFeaturesHighlight />

        {/* 7. الأسعار — عرض التكلفة بعد ترسيخ القيمة */}
        <Pricing />

        {/* 8. أسئلة شائعة — إزالة أي عوائق أخيرة */}
        <FAQ />

        {/* 9. CTA الختامي — التوجيه للبدء فوراً */}
        <CTASection />
      </main>
      <LandingFooter />
      <StickyCTA />
    </div>
  );
}
