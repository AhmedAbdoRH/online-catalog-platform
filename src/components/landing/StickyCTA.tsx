
"use client";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function StickyCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling down 500px
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
            <div className='container mx-auto px-4 relative'>
                <div className="absolute bottom-3 left-3 right-3 md:left-8 md:right-auto md:w-auto bg-gradient-to-r from-brand-accent/90 to-brand-accent/80 text-[#043832] backdrop-blur-lg p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl flex items-center gap-3 sm:gap-4 justify-between animate-in slide-in-from-bottom-10 fade-in duration-500 pointer-events-auto ring-2 ring-brand-accent/25 border border-brand-accent/30 shadow-[0_18px_45px_rgba(85,249,230,0.25)]">
                    <div className="font-bold text-base sm:text-lg sm:hidden md:block px-4">
                        جاهز تبيع اونلاين؟
                    </div>
                    <Button size="sm" className="rounded-md sm:rounded-lg font-bold bg-[#043832] text-brand-accent hover:bg-[#032f29] shadow-md sm:shadow-lg shadow-white/20 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base transition-all hover:scale-105 border-2 border-brand-accent/30 mr-4" asChild>
                        <Link href="/home">
                            ابدأ مجاناً
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
