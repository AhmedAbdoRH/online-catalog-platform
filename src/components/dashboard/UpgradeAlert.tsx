import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Crown, Sparkles, Palette, Infinity, Link as LinkIcon, Image as ImageIcon, EyeOff } from "lucide-react";
import { ProUpgradeButton } from "./ProUpgradeButton";
import { formatPlanPrice, PRO_MONTHLY_PRICE_EGP } from "@/lib/plans";

interface UpgradeAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resourceType?: 'product' | 'category' | 'general';
    catalogId: number;
}

export function UpgradeAlert({ open, onOpenChange, catalogId }: UpgradeAlertProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden p-0 flex flex-col border-0">
                <DialogHeader className="text-center p-6 pb-2 shrink-0">
                    <DialogTitle className="flex flex-col items-center justify-center gap-3 text-2xl font-black">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                            <Crown className="h-8 w-8 text-amber-500" />
                        </div>
                        ارتقِ لمتجرك مع باقة الـ PRO
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-2 space-y-5 custom-scrollbar">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30 px-4 py-2 text-center text-[11px] font-bold text-amber-900 dark:text-amber-400">
                        استمتع بكل المزايا بسعر يبدأ من {formatPlanPrice(PRO_MONTHLY_PRICE_EGP)} شهرياً فقط
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 items-stretch">
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 transition-all h-full">
                            <Infinity className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                                <p className="font-black text-sm sm:text-base text-amber-900 dark:text-amber-300 tracking-tight">منتجات لا محدودة</p>
                                <p className="text-[11px] font-medium text-amber-700/70 dark:text-amber-400/60 leading-tight">أضف عدد لا نهائي من المنتجات و التصنيفات لمتجرك</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 transition-all h-full">
                            <LinkIcon className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                                <p className="font-black text-sm sm:text-base text-blue-900 dark:text-blue-300 tracking-tight">رابط متجر مخصص</p>
                                <p className="text-[11px] font-medium text-blue-700/70 dark:text-blue-400/60 leading-tight">استخدم اسم علامتك التجارية بدلاً من رقم الهاتف</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 transition-all h-full">
                            <ImageIcon className="h-5 w-5 text-rose-600 mt-1 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                                <p className="font-black text-sm sm:text-base text-rose-900 dark:text-rose-300 tracking-tight">معرض صور للمنتج</p>
                                <p className="text-[11px] font-medium text-rose-700/70 dark:text-rose-400/60 leading-tight">إضافة وعرض عدد من الصور الإضافية لكل منتج</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 transition-all h-full">
                            <Palette className="h-5 w-5 text-emerald-600 mt-1 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                                <p className="font-black text-sm sm:text-base text-emerald-900 dark:text-emerald-300 tracking-tight">تخصيص المظهر بالكامل</p>
                                <p className="text-[11px] font-medium text-emerald-700/70 dark:text-emerald-400/60 leading-tight">اختر من بين 10 ألوان وأنماط احترافية لمتجرك</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 transition-all h-full">
                            <Sparkles className="h-5 w-5 text-purple-600 mt-1 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                                <p className="font-black text-sm sm:text-base text-purple-900 dark:text-purple-300 tracking-tight">أدوات الذكاء الاصطناعي</p>
                                <p className="text-[11px] font-medium text-purple-700/70 dark:text-purple-400/60 leading-tight">إزالة وتفريغ خلفية صور المنتجات بضغطة زر</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 transition-all h-full">
                            <EyeOff className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-1 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                                <p className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-300 tracking-tight">هوية متجرك فقط</p>
                                <p className="text-[11px] font-medium text-slate-700/70 dark:text-slate-400/60 leading-tight">إخفاء حقوق وشعار "أونلاين كتالوج" (الفوتر)</p>
                            </div>
                        </div>

                        <div className="sm:col-span-2 flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 transition-all">
                            <Crown className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                                <p className="font-black text-sm sm:text-base text-amber-900 dark:text-amber-300 tracking-tight">دعم فني وأولوية مميزة</p>
                                <p className="text-[11px] font-medium text-amber-700/70 dark:text-amber-400/60 leading-tight">أولوية في الرد والدعم الفني لضمان استمرار أعمالك دائماً</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-4 border-t bg-background shrink-0 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
                    <ProUpgradeButton 
                        catalogId={catalogId} 
                        planType="monthly"
                        className="w-full h-12 text-base font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xl shadow-amber-500/20 rounded-xl" 
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
