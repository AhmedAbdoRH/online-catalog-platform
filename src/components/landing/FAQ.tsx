import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FREE_PLAN_MAX_PRODUCTS,
  formatPlanPrice,
  PRO_MONTHLY_ORIGINAL_PRICE_EGP,
  PRO_MONTHLY_PRICE_EGP,
  PRO_YEARLY_ORIGINAL_PRICE_EGP,
  PRO_YEARLY_PRICE_EGP,
} from "@/lib/plans";

const faqs = [
  {
    q: "هل أحتاج لخبرة تقنية للبدء؟",
    a: "إطلاقاً. منظومة تاجر أونلاين مصممة لتكون بسيطة وعملية للتاجر المحلي. نحن نرافقك خطوة بخطوة من إنشاء المتجر وحتى استقبال أول طلب.",
  },
  {
    q: "هل يمكنني البدء مجاناً فعلاً؟",
    a: "نعم، يمكنك البدء بالباقة المجانية التي تتيح لك إنشاء متجرك، إضافة منتجاتك، ومشاركة رابطك. هدفنا هو تمكينك من التجربة والنجاح قبل التفكير في الترقية.",
  },
  {
    q: "ماذا يقصد بـ 'المتابعة العملية' بعد التسجيل؟",
    a: "نحن لا نتركك بمفردك بعد إنشاء الحساب. فريقنا يتابع معك جاهزية متجرك، ترتيب الأقسام، جودة صور المنتجات، ويقدم لك نصائح لتحسين ظهورك أمام العملاء.",
  },
  {
    q: "ما هو مجتمع تاجر أونلاين؟",
    a: "هو مجتمع يجمع آلاف التجار والخبراء لتبادل الخبرات، حضور جلسات تدريبية مباشرة، والحصول على محتوى تعليمي حصري يساعدك على زيادة مبيعاتك وتطوير تجارتك.",
  },
  {
    q: "متى أحتاج للترقية لباقة البرو؟",
    a: "تحتاج للبرو عندما تبدأ تجارتك في النمو وترغب في إزالة شعار المنصة، إضافة عدد غير محدود من المنتجات، والحصول على أدوات تحليل بيانات متقدمة ومظهر أكثر احترافية.",
  },
  {
    q: "كيف أستلم ثمن الطلبات من العملاء؟",
    a: "المنصة تتيح لك استقبال الطلبات مباشرة عبر واتساب، ويمكنك الاتفاق مع العميل على وسيلة الدفع التي تفضلها (كاش عند الاستلام، فودافون كاش، أو تحويل بنكي).",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24 bg-[#041412] relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white">الأسئلة الشائعة</h2>
          <p className="text-xl text-white/50">كل ما تحتاج معرفته عن منظومة تاجر أونلاين</p>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-white/10 bg-white/[0.02] rounded-2xl px-6">
              <AccordionTrigger className="text-lg font-bold text-white hover:text-brand-accent text-right no-underline py-6">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-white/60 leading-relaxed text-right pb-6 text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
