import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Youtube, MessageCircle } from 'lucide-react';
import { versionedAsset } from '@/lib/static-assets';

export default function LandingFooter() {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        {
            title: "المنظومة",
            links: [
                { name: "عن تاجر أونلاين", href: "/#about" },
                { name: "كيف نعمل؟", href: "/#how-it-works" },
                { name: "المميزات", href: "/#features" },
                { name: "باقات الأسعار", href: "/#pricing" },
            ]
        },
        {
            title: "المجتمع",
            links: [
                { name: "الأكاديمية", href: "/#academy" },
                { name: "المنتدى", href: "/#forum" },
                { name: "قصص النجاح", href: "/#success-stories" },
                { name: "الشركاء", href: "/#partners" },
            ]
        },
        {
            title: "الدعم",
            links: [
                { name: "الأسئلة الشائعة", href: "/#faq" },
                { name: "الدعم الفني", href: "/#support" },
                { name: "تواصل معنا", href: "/#contact" },
                { name: "المدونة", href: "/#blog" },
            ]
        },
        {
            title: "قانوني",
            links: [
                { name: "شروط الاستخدام", href: "/terms" },
                { name: "سياسة الخصوصية", href: "/privacy" },
                { name: "سياسة الكوكيز", href: "/cookies" },
            ]
        }
    ];

    return (
        <footer className="bg-[#041412] border-t border-white/10 pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative h-12 w-12 bg-brand-primary/20 rounded-xl p-2 group-hover:rotate-3 transition-transform">
                                <Image
                                    src={versionedAsset('/logo.png')}
                                    alt="تاجر أونلاين"
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white tracking-tighter">تاجر أونلاين</span>
                                <span className="text-xs text-brand-accent font-bold tracking-widest uppercase opacity-80">Tajer Online</span>
                            </div>
                        </Link>
                        <p className="text-white/50 text-lg leading-relaxed max-w-sm">
                            منصة تمكين متكاملة للتجار للنمو والنجاح في التجارة الإلكترونية. نساعدك تبدأ، تتعلم، وتبيع باحترافية.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-brand-accent hover:text-[#043832] transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-brand-accent hover:text-[#043832] transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-brand-accent hover:text-[#043832] transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-brand-accent hover:text-[#043832] transition-all">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    {footerLinks.map((group) => (
                        <div key={group.title} className="space-y-6">
                            <h4 className="text-white font-bold text-lg">{group.title}</h4>
                            <ul className="space-y-4">
                                {group.links.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-white/50 hover:text-brand-accent transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-white/30 text-sm font-medium">
                        © {currentYear} تاجر أونلاين. جميع الحقوق محفوظة.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-white/30 text-sm">
                            <span>صنع بكل حب في</span>
                            <span className="text-red-500">❤️</span>
                            <span className="font-bold">مصر</span>
                        </div>
                        <Link href="/#support" className="flex items-center gap-2 text-brand-accent font-bold text-sm hover:underline">
                            <MessageCircle className="w-4 h-4" />
                            تحدث مع الدعم
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
