'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const PageLoader = ({ logoUrl, fullScreen = true }: { logoUrl?: string | null, fullScreen?: boolean }) => {
    return (
        <div className={`flex items-center justify-center bg-background relative overflow-hidden flex-col gap-6 ${fullScreen ? 'min-h-[100dvh] w-full' : 'absolute inset-0 z-50'}`}>
            <div className="relative flex flex-col items-center justify-center">

                {logoUrl ? (
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-brand-primary/20 shadow-[0_0_40px_rgba(var(--brand-primary),0.15)] bg-white/5 backdrop-blur-md p-3 flex items-center justify-center z-10"
                    >
                        <img
                            src={logoUrl}
                            alt="Store Loading"
                            className="w-full h-full object-contain filter drop-shadow-md"
                        />
                        <div className="absolute inset-0 rounded-full border-t-[3px] border-brand-primary animate-spin" style={{ animationDuration: '2.5s' }} />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-b-brand-accent/50 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                    </motion.div>
                ) : (
                    <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/20 bg-background/50 p-1.5 backdrop-blur-md shadow-2xl flex items-center justify-center z-10">
                        <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-2xl animate-pulse" />
                        <Sparkles className="h-10 w-10 text-brand-primary opacity-50 animate-pulse" />
                    </div>
                )}

                {/* Decorative Glow */}
                <div className="absolute inset-0 -z-10 bg-brand-primary/10 blur-3xl rounded-full scale-[2]" />
            </div>

        </div>
    );
};
