'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowRight, ChevronDown, Facebook, MessageCircle, ShoppingBag, Store, TrendingUp, UsersRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { versionedAsset } from '@/lib/static-assets';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.nextcatalog.app';
const GOOGLE_PLAY_ICON = 'https://res.cloudinary.com/dvikey3wc/image/upload/v1773216706/Online_Catalog_pmlblb.png';
const MERCHANTS_WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb8HBRN6mYPSvZzfgo2Y';
const MERCHANTS_FACEBOOK_GROUP_URL = 'https://www.facebook.com/share/g/1Dna48xdyp/';

export default function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center pt-24 pb-16 overflow-hidden bg-[#020D0A]">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/20 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/4 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-accent/10 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/4 mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#55F9E6 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-right space-y-10 max-w-2xl lg:max-w-none w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(85,249,230,0.1)]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-accent"></span>
                </span>
                <span className="text-sm font-bold text-white/90 tracking-wide">منظومة متكاملة لتمكين التاجر المحلي</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black text-white leading-[1.1] tracking-tight mb-6">
                انقل تجارتك <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-[#2DD4BF] relative inline-block mt-2">
                  للعالم الرقمي !
                  <motion.svg 
                    className="absolute -bottom-3 left-0 w-full h-4 text-brand-accent/40" 
                    viewBox="0 0 100 10" preserveAspectRatio="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                  >
                    <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                  </motion.svg>
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/70 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                حمّل تطبيق <span className="text-white font-bold">"تاجر أونلاين"</span> وابدأ متجرك الاحترافي في دقائق. اتعلم، سوّق، وبيع منتجاتك بكل سهولة.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-wrap justify-center lg:justify-start gap-5 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <Button asChild size="lg" className="h-16 px-10 bg-brand-accent text-[#020D0A] hover:bg-brand-accent/90 font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(85,249,230,0.3)] transition-all hover:scale-105 active:scale-95 group">
                <Link href="/home" className="flex items-center gap-3">
                  ابدأ مجاناً الآن
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:-translate-x-2" />
                </Link>
              </Button>
              
              <Button asChild size="lg" className="h-16 px-8 bg-white text-[#020D0A] hover:bg-white/90 font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95 group">
                <Link href={PLAY_STORE_URL} target="_blank" className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Image 
                      src={GOOGLE_PLAY_ICON} 
                      alt="Google Play" 
                      width={32} 
                      height={32} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  حمل التطبيق من المتجر
                </Link>
              </Button>

              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="group relative h-16 w-full overflow-hidden rounded-2xl border border-white/70 bg-white px-7 text-lg font-black text-[#04251F] shadow-[0_22px_55px_rgba(255,255,255,0.14),0_0_34px_rgba(85,249,230,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#F2FFFC] hover:shadow-[0_26px_70px_rgba(85,249,230,0.24)] active:scale-95 sm:w-auto sm:text-xl">
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(85,249,230,0.38),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(219,255,246,0.82))]" />
                    <span className="relative flex items-center justify-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#04251F] text-brand-accent shadow-[0_10px_28px_rgba(4,37,31,0.24)] ring-4 ring-brand-accent/20">
                        <UsersRound className="w-5 h-5" />
                      </span>
                      انضم لمجتمع التجار
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#04251F]/8 text-[#04251F]">
                        <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                      </span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" sideOffset={10} className="w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-[1.25rem] border border-white/80 bg-[linear-gradient(135deg,#E8FFF7_0%,#F7FFF2_36%,#EAF3FF_100%)] p-2 text-right text-[#04251F] shadow-[0_24px_70px_rgba(0,0,0,0.28),0_0_40px_rgba(85,249,230,0.24)] backdrop-blur-2xl">
                  <DropdownMenuItem asChild className="cursor-pointer rounded-2xl p-0 focus:bg-transparent focus:text-white">
                    <Link href={MERCHANTS_WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="group/item mb-1.5 flex items-center gap-3 rounded-2xl bg-[#F0FFF7] px-3.5 py-3 transition-all hover:bg-[#E2FFF0]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_22px_rgba(37,211,102,0.24)]">
                        <MessageCircle className="h-4.5 w-4.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-[#04251F]">قناة الواتساب</span>
                        <span className="mt-0.5 block text-[11px] font-bold leading-tight text-[#5B7A72]">تنبيهات ونصائح سريعة</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#25D366] opacity-70 transition-transform group-hover/item:-translate-x-1" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-2xl p-0 focus:bg-transparent focus:text-white">
                    <Link href={MERCHANTS_FACEBOOK_GROUP_URL} target="_blank" rel="noopener noreferrer" className="group/item flex items-center gap-3 rounded-2xl bg-[#F1F7FF] px-3.5 py-3 transition-all hover:bg-[#E5F0FF]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-[0_10px_22px_rgba(24,119,242,0.24)]">
                        <Facebook className="h-4.5 w-4.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-[#04251F]">مجتمع الفيسبوك</span>
                        <span className="mt-0.5 block text-[11px] font-bold leading-tight text-[#5B7A72]">نقاشات وتجارب التجار</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#1877F2] opacity-70 transition-transform group-hover/item:-translate-x-1" />
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              className="flex flex-wrap justify-center lg:justify-start items-center gap-10 pt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              {[
                { title: 'متجر رقمي سريع', label: 'جاهز للمشاركة' },
                { title: 'طلبات مباشرة', label: 'عبر واتساب' },
                { title: 'إدارة بسيطة', label: 'من لوحة واحدة' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start group">
                  <span className="text-lg sm:text-xl font-black text-white group-hover:text-brand-accent transition-colors">{stat.title}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visual Side - Character & Floating Elements */}
          <div className="flex-1 relative w-full lg:h-[700px] flex items-center justify-center mt-12 lg:mt-0">
            
            {/* Main Glowing Circle */}
            <motion.div 
              className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-white/5 bg-gradient-to-b from-brand-primary/10 to-transparent flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              {/* Decorative dashed circle */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="49" fill="none" stroke="#55F9E6" strokeWidth="0.5" strokeDasharray="2 4" />
              </svg>
            </motion.div>

            {/* Character Image */}
            <motion.div
              className="relative z-10 w-[280px] md:w-[450px] h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Image 
                src={versionedAsset('/caracter.png')} 
                alt="تاجر أونلاين" 
                width={600} 
                height={800} 
                className="w-full h-auto object-contain"
                priority
              />
            </motion.div>

            {/* Floating Card 1: Store View */}
            <motion.div 
              className="absolute -right-4 md:-right-8 top-1/4 z-20"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="bg-[#0A1A17]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 w-48 md:w-56 transform -rotate-6 hover:rotate-0 transition-transform cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-accent to-emerald-400 flex items-center justify-center shadow-inner">
                  <Store className="w-6 h-6 text-[#020D0A]" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">متجرك الخاص</div>
                  <div className="text-brand-accent/80 text-xs font-medium">جاهز في 3 دقائق</div>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 2: Visits */}
            <motion.div 
              className="absolute -left-4 md:-left-8 top-1/2 z-20"
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="bg-[#0A1A17]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl w-44 md:w-52 transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white/60 text-xs font-bold">اوصل لجمهور اكتر</div>
                  <TrendingUp className="w-4 h-4 text-brand-accent" />
                </div>
                <div className="text-2xl font-black text-white mb-1">زود مبيعاتك</div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-brand-accent"
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Floating Card 3: New Order */}
            <motion.div 
              className="absolute right-4 md:right-10 bottom-1/4 z-20"
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full py-3 px-5 shadow-2xl flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-colors">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-brand-accent" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A1A17]"></span>
                </div>
                <span className="text-white text-sm font-bold">طلب جديد!</span>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
