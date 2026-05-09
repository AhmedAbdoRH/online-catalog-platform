import { Users, BookOpen, Briefcase, TrendingUp } from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';

const values = [
    {
        icon: Users,
        title: "مجتمع ودعم",
        description: "انضم لمجتمع نشط من التجار والخبراء للحصول على الدعم والإرشاد المستمر."
    },
    {
        icon: BookOpen,
        title: "تعلم وتطوير",
        description: "أكاديمية ومحتوى تدريبي يرفع من مهاراتك في التجارة الإلكترونية والبيع."
    },
    {
        icon: Briefcase,
        title: "أدوات وحلول",
        description: "أدوات ذكية وحلول متكاملة لإدارة متجرك، منتجاتك، وطلباتك بكل سهولة."
    },
    {
        icon: TrendingUp,
        title: "نمو وتوسع",
        description: "استراتيجيات وشركاء يساعدونك على النمو والتوسع في سوقك المحلي."
    }
];

export default function ValueProps() {
    return (
        <section id="ecosystem" className="py-20 sm:py-24 bg-[#041412] relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(85,249,230,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <ScrollAnimation animation="reveal-3d-up">
                        <h2 className="text-3xl md:text-5xl font-black text-white">نظام تاجر أون لاين - 4 ركائز لنجاحك</h2>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">أدوات، دعم، مجتمع وخبرات تدفع تجارتك للنمو</p>
                    </ScrollAnimation>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {values.map((item, index) => (
                        <ScrollAnimation 
                            key={index} 
                            animation="reveal-3d-up" 
                            delay={index * 0.1}
                            duration={0.8}
                        >
                            <div className="relative group h-full">
                                {/* Card Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-brand-accent/5 rounded-[2rem] blur-2xl opacity-0 transition-opacity duration-500 -z-10 group-hover:opacity-100" />

                                <div className="h-full flex flex-col items-center text-center p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 group-hover:border-brand-accent/30 transition-all duration-500 shadow-xl">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-accent/10 flex items-center justify-center text-brand-accent mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/5">
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-brand-accent transition-colors">{item.title}</h3>
                                    <p className="text-white/50 text-base leading-relaxed group-hover:text-white/80 transition-colors">{item.description}</p>
                                </div>
                            </div>
                        </ScrollAnimation>
                    ))}
                </div>
            </div>
        </section>
    );
}
