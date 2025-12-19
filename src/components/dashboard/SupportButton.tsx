'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function SupportButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-full max-w-xs px-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="bg-card border-2 border-zinc-700 shadow-2xl rounded-2xl p-4 w-full mb-3 relative"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-3 w-3" />
                        </Button>

                        <div className="flex flex-col gap-3 pt-2">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <MessageCircle className="h-5 w-5" />
                                <span className="font-bold text-sm">الدعم الفني</span>
                            </div>
                            <p className="text-sm text-balance text-foreground font-medium">
                                تواجه أي مشكلة؟ تواصل معنا مباشرة عبر الواتساب للمساعدة الفورية.
                            </p>
                            <Button
                                asChild
                                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white gap-2 font-bold shadow-lg"
                            >
                                <a
                                    href="https://wa.me/201008116452"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    تواصل على الواتساب
                                </a>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="sm"
                className="rounded-t-xl rounded-b-none shadow-2xl gap-1.5 h-8 w-auto px-4 bg-[#1e293b] hover:bg-[#0f172a] text-white border-x border-t border-white/10 transition-all"
                onClick={() => setIsOpen(!isOpen)}
            >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="font-bold text-[10px]">هل تواجه أي مشكلة؟</span>
            </Button>
        </div>
    );
}
