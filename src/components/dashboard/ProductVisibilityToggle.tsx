'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toggleProductVisibility } from '@/app/actions/items';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProductVisibilityToggleProps {
  itemId: number;
  isHidden: boolean;
  productName: string;
}

/**
 * مفتاح تبديل احترافي لإخفاء/إظهار المنتج.
 *
 * الهندسة (مُتحقَّق منها بالبكسل):
 *   - الزر:   44 × 24 بكسل (`w-11 h-6`)
 *   - الحشوة: 2 بكسل من كل جانب عبر `top-0.5 left-0.5 bottom-0.5`
 *   - الـ thumb: 20 × 20 بكسل (`w-5 h-5`)
 *   - المساحة المتاحة للـ thumb: 44 − 2 − 20 − 2 = 20 بكسل
 *   - يبدأ عند `left-0.5` (يسار) وينتهي عند `left-[22px]` (يمين)
 *     لأن الأخير = 2px + 20px = 22px من حافة الزر اليسرى
 */
export function ProductVisibilityToggle({
  itemId,
  isHidden,
  productName,
}: ProductVisibilityToggleProps) {
  const [loading, setLoading] = useState(false);
  const [optimisticHidden, setOptimisticHidden] = useState(isHidden);

  const handleToggle = async () => {
    if (loading) return;

    const nextHidden = !optimisticHidden;
    setOptimisticHidden(nextHidden);
    setLoading(true);

    try {
      const result = await toggleProductVisibility(itemId, nextHidden);

      if (result.error) {
        setOptimisticHidden(!nextHidden);
        toast({
          variant: 'destructive',
          title: 'فشل تحديث الحالة',
          description: result.error,
        });
        return;
      }

      toast({
        title: nextHidden ? 'تم إخفاء المنتج' : 'تم إظهار المنتج',
        description: `تم ${nextHidden ? 'إخفاء' : 'إظهار'} "${productName}" بنجاح`,
      });
    } catch {
      setOptimisticHidden(!nextHidden);
      toast({
        variant: 'destructive',
        title: 'خطأ غير متوقع',
        description: 'حدث خطأ أثناء تحديث حالة المنتج',
      });
    } finally {
      setLoading(false);
    }
  };

  const isOn = !optimisticHidden;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-busy={loading}
      aria-label={
        loading
          ? 'جاري تحديث حالة الظهور...'
          : isOn
            ? `إخفاء ${productName}`
            : `إظهار ${productName}`
      }
      onClick={handleToggle}
      disabled={loading}
      title={isOn ? 'إخفاء المنتج' : 'إظهار المنتج'}
      className={cn(
        // بُنية الزر: 44×24 مع حواف مدورة كاملة
        'relative inline-block h-6 w-11 shrink-0 rounded-full',
        // لون المسار يتغير بسلاسة
        'transition-colors duration-300 ease-out',
        isOn
          ? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500'
          : 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500',
        // تركيز مناسب للحالة
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isOn ? 'focus-visible:ring-emerald-500/60' : 'focus-visible:ring-slate-400/60',
        'disabled:cursor-not-allowed disabled:opacity-60'
      )}
    >
      <span className="sr-only">{isOn ? 'ظاهر' : 'مخفي'}</span>

      {/* الـ thumb — تحديد موضع مطلق بفجوة 2px من كل جانب عندما يكون off */}
      <span
        aria-hidden="true"
        className={cn(
          // 20×20، متمركز عمودياً، على بُعد 2px من أعلى/أسفل/يسار/يمين
          'absolute top-0.5 bottom-0.5 left-0.5 flex w-5 items-center justify-center rounded-full',
          'bg-white shadow-sm ring-1 ring-black/5 dark:ring-white/10',
          // حركة 20px يساراً بـ يساوي 22px من اليسار (2 + 20)
          'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          isOn ? 'translate-x-5' : 'translate-x-0'
        )}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
        ) : (
          <span
            className={cn(
              'flex items-center justify-center transition-colors duration-200',
              isOn ? 'text-emerald-600' : 'text-slate-500'
            )}
          >
            {isOn ? (
              <Eye className="h-3 w-3" strokeWidth={2.5} />
            ) : (
              <EyeOff className="h-3 w-3" strokeWidth={2.5} />
            )}
          </span>
        )}
      </span>
    </button>
  );
}
