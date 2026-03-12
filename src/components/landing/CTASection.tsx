import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CTASection() {
    return (
        <section className="py-16 relative overflow-hidden">
            <div className="absolute -top-24 left-[-140px] w-[320px] h-[320px] landing-glow opacity-35" />
            <div className="container mx-auto px-4">
                <div className="relative landing-card landing-sheen rounded-2xl p-10 text-center border border-white/10">
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold mb-4">ابدأ رحلتك الآن</h3>
                        <p className="text-muted-foreground mb-6">
                            انضم إلى آلاف التجار الذين يستخدمون منصتنا لإدارة متاجرهم الرقمية بسهولة وفعالية
                        </p>
                        <div className="flex justify-center">
                            <Button asChild size="lg" className="gap-2 h-14 px-10 text-base font-bold bg-brand-accent text-[#043832] shadow-[0_18px_45px_rgba(85,249,230,0.35)] hover:shadow-[0_24px_55px_rgba(85,249,230,0.45)]">
                                <Link href="/home">
                                    ابدأ الآن
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
