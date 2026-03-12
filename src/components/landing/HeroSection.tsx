
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const PLAY_STORE_URL = 'https://play.google.com/apps/testing/com.nextcatalog.app';
const GOOGLE_PLAY_ICON = 'https://res.cloudinary.com/dvikey3wc/image/upload/v1773216706/Online_Catalog_pmlblb.png';

export default function HeroSection() {
    return (
        <section className="relative pt-12 sm:pt-14 md:pt-16 pb-12 sm:pb-20 md:pb-28 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-brand-primary/10 via-background to-background">
            {/* Enhanced Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-brand-accent/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-brand-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse-slow" />
            
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-24">

                    {/* Visuals - Right Side (Desktop) */}
                    <div className="flex-1 w-full max-w-[320px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-none order-1 lg:order-2">
                        <div className="relative">
                            {/* Main Hero Card */}
                            <div className="relative z-20 rounded-3xl bg-gradient-to-tr from-background/80 to-secondary/30 p-4 sm:p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20">
                                <div className="relative aspect-[4/3] w-full rounded-2xl bg-muted/30 flex items-center justify-center overflow-visible">
                                    <Image
                                        src="/caracter.png"
                                        alt="Online Catalog Character"
                                        width={500}
                                        height={500}
                                        className="object-contain scale-[1.15] -translate-y-6 drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)] animate-float"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Decorative Floating Elements */}
                            <div className="absolute -top-8 -right-8 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 w-32 md:w-44 animate-bounce-slow">
                                <div className="flex flex-col gap-2">
                                    <div className="h-2 w-16 bg-brand-accent/40 rounded-full" />
                                    <div className="h-2 w-24 bg-muted rounded-full" />
                                    <div className="flex gap-1 mt-1">
                                        <div className="w-4 h-4 rounded-full bg-brand-primary/20" />
                                        <div className="w-4 h-4 rounded-full bg-brand-accent/20" />
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-6 -left-6 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 w-40 md:w-60 animate-float-slow">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shadow-inner">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="h-2 w-20 bg-green-500/20 rounded-full mb-2" />
                                        <div className="text-[10px] md:text-xs font-bold text-foreground">تم إطلاق المتجر بنجاح!</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content - Left Side (Desktop) */}
                    <div className="flex-1 text-center lg:text-right space-y-8 md:space-y-10 order-2 lg:order-1">
                        
                        <div className="space-y-4">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold tracking-wide animate-fade-in">
                                🚀 أطلق متجرك في 3 خطوات بسيطة
                            </span>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-headline tracking-tight text-foreground leading-[1.2]">
                                <span className="block mb-2 text-zinc-800 dark:text-zinc-100">متجرك الرقمي...</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent via-[#FFC800] to-brand-primary block py-2">
                                    جاهز في دقائق.
                                </span>
                            </h1>
                        </div>

                        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            سجّل، أضف منتجاتك، وابدأ البيع فوراً برابط مخصص واحترافي. 
                            <span className="block mt-4 text-brand-primary/80 text-base md:text-lg font-mono" dir="ltr">
                                Online-Catalog.net/store-name
                            </span>
                        </p>

                        <div className="flex flex-col items-center gap-4 md:gap-5 justify-center lg:justify-start">
                            <Button size="lg" className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl bg-gradient-to-r from-[#3DDC84] via-[#34A853] to-[#4285F4] hover:from-[#34C76F] hover:via-[#2D9249] hover:to-[#3B7AE4] text-white font-bold w-full sm:w-auto transition-all duration-300 shadow-[0_8px_30px_rgba(61,220,132,0.35)] hover:shadow-[0_12px_40px_rgba(61,220,132,0.45)] hover:scale-105 active:scale-95 border-0 group" asChild>
                                <Link href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                                    <Image src={GOOGLE_PLAY_ICON} alt="Google Play" width={36} height={36} className="rounded-lg shadow-sm w-9 h-9 object-contain" />
                                    حمل التطبيق الآن
                                </Link>
                            </Button>
                            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full sm:w-auto justify-center lg:justify-start">
                                <Button size="lg" className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl shadow-[0_10px_30px_rgba(var(--brand-primary),0.3)] hover:shadow-brand-primary/40 transition-all font-bold group w-full sm:w-auto bg-brand-primary hover:scale-105 active:scale-95" asChild>
                                    <Link href="/home">
                                        ابدأ رحلتك مجاناً
                                        <ArrowRight className="mr-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl rounded-2xl border-2 border-primary/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 w-full sm:w-auto transition-all font-bold" asChild>
                                    <Link href="https://online-catalog.net/elfath" target="_blank" rel="noopener noreferrer">
                                        تصفح متجر تجريبي
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
