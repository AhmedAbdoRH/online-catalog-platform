
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
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
        { name: "الميزات", href: "/home#features" },
        { name: "كيف تعمل", href: "/home#how-it-works" },
        { name: "الأسعار", href: "/home#pricing" },
        { name: "الأسئلة", href: "/home#faq" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                {/* Logo */}
                <Link 
                    href="/home" 
                    className="flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 group"
                    onClick={handleLogoClick}
                >
                    <div className="relative h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-xl p-2 group-hover:rotate-3 transition-transform duration-300">
                            <Image
                                src="/logo.png"
                                alt="منصة اونلاين كاتلوج"
                                fill
                                className="object-contain p-1.5"
                                priority
                            />
                        </div>
                    <div className="flex flex-col">
                        <span className="text-lg sm:text-xl font-black text-foreground tracking-tighter leading-none">اونلاين كاتلوج</span>
                        <span className="text-[10px] sm:text-xs text-brand-primary font-bold tracking-widest uppercase opacity-80">Online Catalog</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-bold text-muted-foreground hover:text-brand-primary transition-all relative group py-2"
                        >
                            {link.name}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-4">
                    <Button variant="ghost" asChild className="font-bold text-sm hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl">
                        <Link href="/login">تسجيل دخول</Link>
                    </Button>
                    <Button asChild className="font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 rounded-xl px-6">
                        <Link href="/">ابدأ مجاناً</Link>
                    </Button>
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 sm:w-96">
                        <div className="flex flex-col gap-6 mt-8">
                            <Link href="/home" className="flex items-center gap-3 mx-auto hover:opacity-80 transition-opacity">
                                <div className="relative h-12 w-12">
                                        <Image
                                            src="/logo.png"
                                            alt="منصة اونلاين كاتلوج"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                <span className="text-xl font-bold text-foreground">منصة اونلاين كاتلوج</span>
                            </Link>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-secondary/50"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 mt-6 px-4">
                                <Button variant="outline" asChild className="w-full h-12">
                                    <Link href="/login">تسجيل دخول</Link>
                                </Button>
                                <Button asChild className="w-full h-12">
                                    <Link href="/">ابدأ مجاناً</Link>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
