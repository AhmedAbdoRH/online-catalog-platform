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
    <div className="min-h-screen bg-[#041412] text-foreground overflow-x-hidden landing-shell">
      <LandingHeader />
      <main>
        {/* 1. الهيرو — الوعد الأساسي وجذب الانتباه (تم تحديثه بالشعارات الجديدة) */}
        <HeroSection />

        {/* 2. ركائز المنظومة — "ليه تختارنا؟" (تم تحديثه ليعكس الـ 4 ركائز) */}
        <ValueProps />

        {/* 3. رحلة المستخدم — (تم تحديثه ليعكس الـ 6 مراحل من الاكتشاف للنمو) */}
        <HowItWorks />

        {/* 4. معرض العملاء — الإثبات الاجتماعي القوي */}
        <ClientShowcase />

        {/* 5. المميزات المتكاملة — التفاصيل التقنية */}
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
