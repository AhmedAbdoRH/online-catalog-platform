import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Lock, Eye, UserCheck, Bell, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | ممتن',
  description: 'تعرف على كيفية حماية بياناتك وخصوصيتك في تطبيق ممتن.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-full mb-4">
            <ShieldCheck className="w-10 h-10 text-brand-accent" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-brand-accent">سياسة الخصوصية</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نحن في تطبيق ممتن نضع خصوصيتك في مقدمة أولوياتنا. توضح هذه السياسة التزامنا بحماية بياناتك الشخصية.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 bg-card border border-border rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <section className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ArrowRight className="w-5 h-5 text-brand-accent rotate-180" />
              </div>
              <h2 className="text-2xl font-semibold text-brand-accent">مقدمة</h2>
            </div>
            <p className="text-foreground/90 leading-relaxed">
              مرحبًا بك في تطبيق ممتن. نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك واستخدامها وحمايتها.
            </p>
          </section>

          <section className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="w-5 h-5 text-brand-accent" />
              </div>
              <h2 className="text-2xl font-semibold text-brand-accent">المعلومات التي نجمعها</h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-foreground/90">
              <li className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2 shrink-0" />
                <span><strong>معلومات الحساب:</strong> البريد الإلكتروني والاسم وصورة الملف الشخصي.</span>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2 shrink-0" />
                <span><strong>المحتوى:</strong> الصور والتعليقات والرسائل التي تشاركها.</span>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2 shrink-0" />
                <span><strong>بيانات الاستخدام:</strong> كيفية تفاعلك مع التطبيق.</span>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2 shrink-0" />
                <span><strong>معلومات الجهاز:</strong> نوع الجهاز ونظام التشغيل.</span>
              </li>
            </ul>
          </section>

          <section className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserCheck className="w-5 h-5 text-brand-accent" />
              </div>
              <h2 className="text-2xl font-semibold text-brand-accent">كيف نستخدم معلوماتك</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl border border-border bg-background/40">
                <h3 className="font-medium mb-2 text-brand-accent">تحسين الخدمة</h3>
                <p className="text-sm text-muted-foreground">تقديم خدمات التطبيق وتحسينها باستمرار لتلبية احتياجاتك.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background/40">
                <h3 className="font-medium mb-2 text-brand-accent">التواصل</h3>
                <p className="text-sm text-muted-foreground">إرسال الإشعارات المتعلقة بحسابك والتحديثات والميزات الجديدة.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background/40">
                <h3 className="font-medium mb-2 text-brand-accent">الأمان</h3>
                <p className="text-sm text-muted-foreground">ضمان أمان التطبيق ومنع الاحتيال وحماية جميع المستخدمين.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background/40">
                <h3 className="font-medium mb-2 text-brand-accent">الدعم</h3>
                <p className="text-sm text-muted-foreground">التواصل معك للرد على استفساراتك وتقديم الدعم الفني.</p>
              </div>
            </div>
          </section>

          <section className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-5 h-5 text-brand-accent" />
              </div>
              <h2 className="text-2xl font-semibold text-brand-accent">مشاركة المعلومات</h2>
            </div>
            <p className="text-foreground/90 mb-4">
              لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
            </p>
            <ul className="space-y-2 text-foreground/90 mr-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
                <span>بموافقتك الصريحة والواضحة.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
                <span>للامتثال للمتطلبات القانونية والأنظمة المعمول بها.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
                <span>لحماية حقوقنا وسلامة مستخدمينا وممتلكاتنا.</span>
              </li>
            </ul>
          </section>

          <section className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-brand-accent" />
              </div>
              <h2 className="text-2xl font-semibold text-brand-accent">حماية البيانات</h2>
            </div>
            <p className="text-foreground/90 leading-relaxed">
              نستخدم تقنيات تشفير متقدمة وإجراءات أمنية صارمة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف. بياناتك مشفرة ومخزنة في بيئات آمنة.
            </p>
          </section>

          <section className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="w-5 h-5 text-brand-accent" />
              </div>
              <h2 className="text-2xl font-semibold text-brand-accent">حقوقك</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {['الوصول وتعديل البيانات', 'طلب حذف الحساب', 'إلغاء الإشعارات', 'تصدير البيانات'].map((right) => (
                <span key={right} className="px-4 py-2 bg-secondary border border-border rounded-full text-sm font-medium text-foreground/90">
                  {right}
                </span>
              ))}
            </div>
          </section>

          <section className="pt-6 border-t border-border relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-brand-accent">
                  <Mail className="w-5 h-5 text-brand-accent" />
                  تواصل معنا
                </h2>
                <p className="text-muted-foreground text-sm">
                  إذا كان لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا عبر التطبيق.
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm font-medium text-foreground/80">آخر تحديث</p>
                <p className="text-sm text-brand-accent font-bold">فبراير 2026</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-brand-accent hover:text-brand-accent/80 transition-colors font-medium"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
