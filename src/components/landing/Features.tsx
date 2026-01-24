
import {
    Palette,
    LayoutDashboard,
    MessageCircle,
    Link as LinkIcon,
    Smartphone,
    Tags,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
    {
        icon: Palette,
        title: "تخصيص الشعار والكفر",
        description: "حافظ على هوية علامتك التجارية مع خيارات تخصيص مرنة."
    },
    {
        icon: LayoutDashboard,
        title: "لوحة تحكم بسيطة",
        description: "إدارة المنتجات، الطلبات، والإحصاءات من مكان واحد."
    },
    {
        icon: MessageCircle,
        title: "تكامل واتساب",
        description: "زر تواصل مباشر للطلبات يسهل عملية البيع."
    },
    {
        icon: LinkIcon,
        title: "روابط وقابلة للمشاركة",
        description: "رابط ثابت + QR Code جاهز للطباعة والنشر."
    },
    {
        icon: Smartphone,
        title: "دعم متعدد الأجهزة",
        description: "تصميم مُحسّن يعمل بكفاءة على الموبايل والكمبيوتر."
    },
    {
        icon: Tags,
        title: "تحكم بالأسعار والتخفيضات",
        description: "إنشاء عروض وخصومات وتعديل الأسعار بسهولة."
    }
];

export default function Features() {
    return (
        <section id="features" className="py-24 sm:py-32 bg-secondary/5 relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 sm:mb-20 space-y-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline tracking-tight text-foreground">
                        ميزات <span className="text-brand-primary">متكاملة</span> لنمو تجارتك
                    </h2>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                        كل الأدوات التي تحتاجها لإدارة متجرك باحترافية وسهولة تامة
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="relative group">
                            {/* Card Glow Effect - Softer */}
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/15 to-brand-accent/10 rounded-[2.5rem] blur-3xl opacity-60 -z-10 transition-opacity duration-500 group-hover:opacity-100" />
                            
                            <div className="h-full flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-white/[0.15] dark:bg-white/[0.1] backdrop-blur-2xl border border-white/20 group-hover:border-brand-primary/40 transition-all duration-500 shadow-xl shadow-black/5 ring-1 ring-white/10">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-primary/25 to-brand-accent/20 flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md border border-white/10">
                                    <feature.icon className="w-10 h-10 opacity-90" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-brand-accent transition-colors tracking-tight">{feature.title}</h3>
                                <p className="text-white/70 text-lg leading-relaxed group-hover:text-white transition-colors">{feature.description}</p>
                                
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
