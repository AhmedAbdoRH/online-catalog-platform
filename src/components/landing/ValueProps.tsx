
import { Zap, Layout, Share2 } from 'lucide-react';

const values = [
    {
        icon: Zap,
        title: "سهل وسريع",
        description: "سجّل وأطلق متجرك خلال دقائق."
    },
    {
        icon: Layout,
        title: "مظهر احترافي",
        description: "واجهات جاهزة تعرض منتجاتك بأفضل شكل."
    },
    {
        icon: Share2,
        title: "قابل للمشاركة",
        description: "رابط واحد، مشاركة على أي منصة أو QR."
    }
];

export default function ValueProps() {
    return (
        <section className="py-20 sm:py-24 bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--brand-primary),0.03)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    {values.map((item, index) => (
                        <div key={index} className="relative group">
                            {/* Card Glow Effect - Softer */}
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/15 to-brand-accent/10 rounded-[2.5rem] blur-3xl opacity-60 transition-opacity duration-500 -z-10 group-hover:opacity-100" />
                            
                            <div className="h-full flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-white/[0.15] dark:bg-white/[0.1] backdrop-blur-2xl border border-white/20 group-hover:border-brand-primary/40 transition-all duration-500 shadow-xl shadow-black/5 ring-1 ring-white/10">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-primary/25 to-brand-accent/20 flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md border border-white/10">
                                    <item.icon className="w-10 h-10 opacity-90" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-brand-accent transition-colors tracking-tight">{item.title}</h3>
                                <p className="text-white/70 text-lg leading-relaxed group-hover:text-white transition-colors">{item.description}</p>
                                
                                {/* Bottom Decoration Line */}
                                <div className="mt-8 w-12 h-1 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full opacity-40 group-hover:opacity-100 transition-all duration-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
