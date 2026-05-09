"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingHeader() {
    const router = useRouter();
    const [lastTap, setLastTap] = useState(0);

    const handleLogoClick = (e: React.MouseEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        if (now - lastTap < DOUBLE_TAP_DELAY) {
            e.preventDefault();
            router.push('/login?showEmail=true');
        }
        setLastTap(now);
    };

    const navLinks = [
        { name: "المنظومة", href: "/#ecosystem" },
        { name: "المجتمع", href: "/#community" },
        { name: "الباقات", href: "/#pricing" },
        { name: "قصص النجاح", href: "/#success-stories" },
        { name: "الأسئلة الشائعة", href: "/#faq" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#041412]/70 backdrop-blur-xl supports-[backdrop-filter]:bg-[#041412]/50">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between"
            >
                {/* Logo */}
                <Link 
                    href="/" 
                    className="flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 group"
                    onClick={handleLogoClick}
                >
                    <div className="relative h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-brand-primary/30 to-brand-accent/30 rounded-xl p-2 group-hover:rotate-3 transition-transform duration-300 shadow-[0_0_18px_rgba(85,249,230,0.18)]">
                            <Image
                                src="/logo.png"
                                alt="منصة تاجر أونلاين"
                                fill
                                className="object-contain p-1.5"
                                priority
                            />
                        </div>
                    <div className="flex flex-col">
                        <span className="text-lg sm:text-xl font-black text-white tracking-tighter leading-none">تاجر أونلاين</span>
                        <span className="text-[10px] sm:text-xs text-brand-accent font-bold tracking-widest uppercase opacity-80">Tajer Online</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-bold text-white/70 hover:text-brand-accent transition-all relative group py-2"
                        >
                            {link.name}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-accent transition-all group-hover:w-full shadow-[0_0_14px_rgba(85,249,230,0.6)]" />
                        </Link>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-4">
                    <Button variant="ghost" asChild className="font-bold text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-xl">
                        <Link href="/login">تسجيل دخول</Link>
                    </Button>
                    <Button asChild className="font-bold text-sm bg-brand-accent text-[#043832] hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/30 rounded-xl px-6">
                        <Link href="/home">ابدأ مجاناً</Link>
                    </Button>
                </div>

                {/* Mobile Menu & Login */}
                <div className="flex lg:hidden items-center gap-2">
                    <Button variant="outline" asChild className="font-bold text-sm h-9 px-4 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-md">
                        <Link href="/login">دخول</Link>
                    </Button>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-white">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80 sm:w-96 bg-[#041412] border-white/10">
                            <div className="flex flex-col gap-6 mt-8">
                            <Link href="/" className="flex items-center gap-3 mx-auto hover:opacity-80 transition-opacity">
                                <div className="relative h-12 w-12 bg-brand-primary/20 rounded-xl p-2">
                                        <Image
                                            src="/logo.png"
                                            alt="منصة تاجر أونلاين"
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                <span className="text-xl font-black text-white">تاجر أونلاين</span>
                            </Link>
                            <div className="flex flex-col gap-2 mt-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-lg font-bold text-white/70 hover:text-brand-accent transition-colors py-3 px-4 rounded-xl hover:bg-white/5"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3 mt-6 px-4">
                                <Button variant="outline" asChild className="w-full h-12 border-white/10 bg-white/5 text-white">
                                    <Link href="/login">تسجيل دخول</Link>
                                </Button>
                                <Button asChild className="w-full h-12 bg-brand-accent text-[#043832] font-black">
                                    <Link href="/home">ابدأ مجاناً</Link>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                </div>
            </motion.div>
        </header>
    );
}
