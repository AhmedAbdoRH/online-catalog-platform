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

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
                    <div className='container mx-auto px-4 relative'>
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute bottom-3 left-3 right-3 md:left-8 md:right-auto md:w-auto bg-brand-accent text-[#043832] backdrop-blur-lg p-3 sm:p-4 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4 justify-between pointer-events-auto border border-white/10 shadow-[0_20px_50px_rgba(255,215,0,0.3)]"
                        >
                            <div className="font-black text-base sm:text-lg px-4">
                                جاهز تبيع أونلاين؟
                            </div>
                            <Button size="lg" className="rounded-xl font-black bg-[#043832] text-brand-accent hover:bg-[#032f29] shadow-lg px-6 py-3 text-sm sm:text-base transition-all hover:scale-105" asChild>
                                <Link href="/home">
                                    ابدأ مجاناً
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
