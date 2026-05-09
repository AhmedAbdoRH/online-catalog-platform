import { Search, UserPlus, Store, Users, ShoppingCart, Rocket } from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';

const steps = [
    {
        icon: Search,
        title: "اكتشف",
        description: "اكتشف المنصة وتعرف على المزايا والفوائد.",
        step: "01",
        color: "from-blue-500/20 to-blue-500/5"
    },
    {
        icon: UserPlus,
        title: "سجّل",
        description: "أنشئ حسابك بسهولة وسرعة.",
        step: "02",
        color: "from-purple-500/20 to-purple-500/5"
    },
    {
        icon: Store,
        title: "فعّل المتجر",
        description: "أكمل إعداد متجرك واتصل ببوابات الدفع والشحن.",
        step: "03",
        color: "from-emerald-500/20 to-emerald-500/5"
    },
    {
        icon: Users,
        title: "انضم للمجتمع",
        description: "تواصل وتعلم من مجتمع التجار والخبراء.",
        step: "04",
        color: "from-orange-500/20 to-orange-500/5"
    },
    {
        icon: ShoppingCart,
        title: "ابدأ البيع",
        description: "أضف منتجاتك وابدأ في استقبال الطلبات.",
        step: "05",
        color: "from-brand-accent/20 to-brand-accent/5"
    },
    {
        icon: Rocket,
        title: "طوّر للبرو",
        description: "ارتقِ لباقة برو وفك إمكانيات أكبر للنمو.",
        step: "06",
        color: "from-brand-primary/20 to-brand-primary/5"
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-[#041412] relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20 space-y-4">
                    <ScrollAnimation animation="reveal-3d-up">
                        <h2 className="text-3xl md:text-5xl font-black text-white">رحلة المستخدم (الانضمام والنمو)</h2>
                        <p className="text-xl text-white/60">خطوات بسيطة توضح رحلة نجاحك مع تاجر أون لاين</p>
                    </ScrollAnimation>
                </div>

                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden xl:block absolute top-[40px] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-white/5 via-brand-accent/20 to-white/5 -z-0" />

                    {steps.map((item, index) => (
                        <ScrollAnimation 
                            key={index} 
                            animation="reveal-3d-up" 
                            delay={index * 0.1}
                        >
                            <div className="flex flex-col items-center text-center group relative z-10">
                                <div className="relative mb-6">
                                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} border border-white/10 shadow-2xl flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                        <item.icon className="w-8 h-8 text-white group-hover:text-brand-accent transition-colors" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-accent text-[#043832] flex items-center justify-center font-black text-sm shadow-lg z-20">
                                        {item.step}
                                    </div>
                                    
                                    {/* Pulse effect for the current step (e.g., first one) */}
                                    {index === 0 && (
                                        <div className="absolute inset-0 rounded-3xl bg-brand-accent/20 animate-ping -z-10" />
                                    )}
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-brand-accent transition-colors">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed max-w-[160px] group-hover:text-white/80 transition-colors">{item.description}</p>
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
                
                {/* Bottom Support Text */}
                <div className="mt-20 text-center">
                    <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-bold">
                        <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                        دعم مستمر - محتوى تعليمي - مجتمع نشط - شراكات وحلول متكاملة
                    </div>
                </div>
            </div>
        </section>
    );
}
