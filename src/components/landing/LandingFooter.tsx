
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#0e343c] text-zinc-200/80 py-16 sm:py-20 border-t border-white/5 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[120px] -mb-64 -mr-32 pointer-events-none" />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/go" className="flex items-center gap-3 group">
                            <div className="relative h-10 w-10 bg-white/10 rounded-xl p-2 group-hover:bg-white/20 transition-colors">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <span className="text-xl font-black text-white tracking-tighter">اونلاين كاتلوج</span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs">
                            المنصة الأسرع والأسهل لإنشاء متجرك الرقمي وعرض منتجاتك باحترافية تامة في دقائق معدودة.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href="https://www.facebook.com/OnlineCatalog" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-accent/20 hover:border-brand-accent/50 transition-all cursor-pointer group">
                                <Facebook className="w-5 h-5 group-hover:text-brand-accent transition-colors" />
                            </Link>
                            <Link href="https://www.instagram.com/onlinecatalog.ecommerce/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-accent/20 hover:border-brand-accent/50 transition-all cursor-pointer group">
                                <Instagram className="w-5 h-5 group-hover:text-brand-accent transition-colors" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-lg tracking-tight">المنتج</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/go#benefits" className="hover:text-brand-accent transition-colors">??????????????</Link></li>
                            <li><Link href="/go#features" className="hover:text-brand-accent transition-colors">??????????</Link></li>
                            <li><Link href="/go#pricing" className="hover:text-brand-accent transition-colors">??????????????</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-lg tracking-tight">الدعم</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/login" className="hover:text-brand-accent transition-colors">تسجيل الدخول</Link></li>
                            <li><Link href="/" className="hover:text-brand-accent transition-colors">إنشاء حساب</Link></li>
                            <li><a href="mailto:support@online-catalog.net" className="hover:text-brand-accent transition-colors">تواصل معنا</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-lg tracking-tight">تواصل مباشر</h4>
                        <p className="text-sm">نحن هنا لمساعدتك في أي وقت.</p>
                        <a
                            href="https://wa.me/201008116452"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-brand-accent/15 text-brand-accent hover:bg-brand-accent/25 transition-all text-sm font-bold border border-brand-accent/30"
                        >
                            <MessageCircle className="w-5 h-5" />
                            تواصل عبر واتساب
                        </a>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
                    <p>© {currentYear} منصة اونلاين كاتلوج. جميع الحقوق محفوظة.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link>
                        <div className="flex items-center gap-2">
                            <span>صنع بكل حب في</span>
                            <span className="text-white font-bold">العالم العربي 🇸🇦</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
