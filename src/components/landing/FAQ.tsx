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
    q: "هل أحتاج لمهارات تقنية؟",
    a: "لا. المنصة مصممة للاستخدام البسيط بحيث يستطيع أي شخص استخدامها دون خبرة تقنية مسبقة.",
  },
  {
    q: "هل أستطيع تعديل الرابط بعد حجزه؟",
    a: "يفضل حجز اسم نهائي من البداية لثبات علامتك التجارية، لكن التغيير ما زال متاحاً داخل باقة البرو.",
  },
  {
    q: "كم عدد المنتجات المسموح بها؟",
    a: `الباقة المجانية تتيح لك حتى ${FREE_PLAN_MAX_PRODUCTS} منتجاً، بينما باقتا Pro وBusiness تمنحانك عدداً غير محدود من المنتجات.`,
  },
  {
    q: "ما أسعار باقة البرو؟",
    a: `باقة البرو متاحة حالياً بعرض لفترة محدودة بسعر ${formatPlanPrice(PRO_MONTHLY_PRICE_EGP)} شهرياً بدلاً من ${formatPlanPrice(PRO_MONTHLY_ORIGINAL_PRICE_EGP)}، أو ${formatPlanPrice(PRO_YEARLY_PRICE_EGP)} سنوياً بدلاً من ${formatPlanPrice(PRO_YEARLY_ORIGINAL_PRICE_EGP)}.`,
  },
  {
    q: "هل يوجد دعم فني؟",
    a: "نعم. نوفر دعماً فنياً عبر واتساب والبريد الإلكتروني لمساعدتك عند الحاجة.",
  },
  {
    q: "كيف أستلم المدفوعات؟",
    a: "المنصة توفر نظام عرض وطلب مرن، ويمكنك توجيه العميل للدفع عبر الوسيلة التي تفضلها مثل التحويل البنكي أو المحافظ الإلكترونية.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24 bg-aurora">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold font-headline">أسئلة متكررة</h2>
          <p className="text-xl text-muted-foreground">إجابات على الأسئلة الشائعة</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-medium text-right">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-right">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
