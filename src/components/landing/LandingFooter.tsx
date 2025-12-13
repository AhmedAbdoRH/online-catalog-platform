
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Mail, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-secondary/10 border-t border-border pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <div className="relative h-10 w-32">
                            <Image
                                src="/mainlogo.png"
                                alt="Online Catalog"
                                fill
                                className="object-contain object-left grayscale opacity-80"
                            />
                        </div>
                        <p className="text-muted-foreground text-sm">
                            منصتك المتكاملة لإنشاء كاتلوج رقمي احترافي وإدارة متجرك بسهولة.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold mb-6">المنتج</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#features" className="hover:text-primary transition-colors">الميزات</Link></li>
                            <li><Link href="#how-it-works" className="hover:text-primary transition-colors">كيف تعمل</Link></li>
                            <li><Link href="#pricing" className="hover:text-primary transition-colors">الأسعار</Link></li>
                            <li><Link href="#testimonials" className="hover:text-primary transition-colors">تجارب العملاء</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold mb-6">الدعم</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/login" className="hover:text-primary transition-colors">تسجيل الدخول</Link></li>
                            <li><Link href="/signup" className="hover:text-primary transition-colors">إنشاء حساب</Link></li>
                            <li><a href="mailto:support@online-catalog.net" className="hover:text-primary transition-colors">تواصل معنا</a></li>
                            <li><Link href="#faq" className="hover:text-primary transition-colors">الأسئلة الشائعة</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-6">تواصل معنا</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                support@online-catalog.net
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-bold text-primary">واتساب:</span>
                                <span dir="ltr">+20 123 456 7890</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Email Registration CTA Section */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 mb-12 text-center border border-primary/20">
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold mb-4">ابدأ رحلتك الآن</h3>
                        <p className="text-muted-foreground mb-6">
                            انضم إلى آلاف التجار الذين يستخدمون منصتنا لإدارة متاجرهم الرقمية بسهولة وفعالية
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="gap-2 h-14 px-8 text-base font-medium">
                                <Link href="/signup">
                                    <UserPlus className="w-5 h-5" />
                                    سجل حساب جديد بالبريد الإلكتروني
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="gap-2 h-14 px-8 text-base font-medium">
                                <Link href="/login">
                                    تسجيل الدخول
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {currentYear} Online Catalog. كل الحقوق محفوظة.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-primary">سياسة الخصوصية</Link>
                        <Link href="/terms" className="hover:text-primary">شروط الاستخدام</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
