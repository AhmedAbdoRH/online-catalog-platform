"use client";

import { useEffect, useMemo, useState } from 'react';
import { Truck, MapPinned, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateShippingRates } from '@/app/actions/catalog';
import { useToast } from '@/hooks/use-toast';
import {
  EGYPT_GOVERNORATES,
  type EgyptGovernorateKey,
  type ShippingRates,
} from '@/lib/shipping';

type DraftRates = Record<EgyptGovernorateKey, string>;

function emptyDraftRates(): DraftRates {
  return EGYPT_GOVERNORATES.reduce((draft, governorate) => {
    draft[governorate.key] = '';
    return draft;
  }, {} as DraftRates);
}

function ratesToDraft(rates: ShippingRates | null | undefined): DraftRates {
  const draft = emptyDraftRates();

  for (const governorate of EGYPT_GOVERNORATES) {
    const rate = rates?.[governorate.key];
    draft[governorate.key] = typeof rate === 'number' ? String(rate) : '';
  }

  return draft;
}

function normalizeRateInput(value: string) {
  const converted = value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const digits = '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹';
    const index = digits.indexOf(digit);
    return index >= 0 ? String(index % 10) : digit;
  });
  const cleaned = converted.replace(/[^\d.]/g, '');
  const [integer, ...rest] = cleaned.split('.');

  return rest.length > 0 ? `${integer}.${rest.join('')}` : integer;
}

export function ShippingRatesDialog({
  catalogId,
  shippingRates,
  disabled = false,
}: {
  catalogId: number;
  shippingRates: ShippingRates | null | undefined;
  disabled?: boolean;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftRates, setDraftRates] = useState<DraftRates>(() => ratesToDraft(shippingRates));

  useEffect(() => {
    if (open) {
      setDraftRates(ratesToDraft(shippingRates));
    }
  }, [open, shippingRates]);

  const configuredCount = useMemo(() => (
    EGYPT_GOVERNORATES.filter((governorate) => {
      const rate = shippingRates?.[governorate.key];
      return typeof rate === 'number' && Number.isFinite(rate) && rate >= 0;
    }).length
  ), [shippingRates]);

  const handleSave = async () => {
    const payload: Partial<Record<EgyptGovernorateKey, number>> = {};

    for (const governorate of EGYPT_GOVERNORATES) {
      const rawValue = draftRates[governorate.key].trim();
      if (!rawValue) continue;

      const value = Number(rawValue);
      if (!Number.isFinite(value) || value < 0) {
        toast({
          title: 'سعر غير صالح',
          description: `راجع سعر محافظة ${governorate.name}`,
          variant: 'destructive',
        });
        return;
      }

      payload[governorate.key] = Math.round(value * 100) / 100;
    }

    setIsSaving(true);
    try {
      const result = await updateShippingRates(catalogId, payload);
      if (!result.success) {
        toast({
          title: 'تعذر الحفظ',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'تم الحفظ',
        description: result.message,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error saving shipping rates:', error);
      toast({
        title: 'حدث خطأ',
        description: 'فشل حفظ أسعار الشحن',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-6 border-t">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col">
          <Label className="text-base font-semibold">أسعار الشحن حسب المحافظة</Label>
          <p className="text-[11px] leading-tight text-muted-foreground">
            حدد سعر الشحن لكل محافظة مصرية. الخانة الفارغة تعني أن الشحن غير متاح لهذه المحافظة.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className="gap-2"
        >
          <Truck className="h-4 w-4" />
          إدارة الأسعار
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <MapPinned className="h-4 w-4 text-brand-primary" />
        <span>{configuredCount} من {EGYPT_GOVERNORATES.length} محافظة لها سعر شحن محدد.</span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl p-0">
          <DialogHeader className="px-5 pt-5 text-right">
            <DialogTitle className="flex items-center justify-end gap-2">
              أسعار الشحن للمحافظات
              <Truck className="h-5 w-5 text-brand-primary" />
            </DialogTitle>
            <DialogDescription>
              اكتب رقم السعر بالجنيه. استخدم 0 للشحن المجاني، واترك الخانة فارغة إذا لم تكن المحافظة متاحة.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {EGYPT_GOVERNORATES.map((governorate) => (
                <div key={governorate.key} className="rounded-lg border bg-background/60 p-3">
                  <Label htmlFor={`shipping-${governorate.key}`} className="text-sm font-bold">
                    {governorate.name}
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      id={`shipping-${governorate.key}`}
                      inputMode="decimal"
                      dir="ltr"
                      value={draftRates[governorate.key]}
                      onChange={(event) => {
                        const value = normalizeRateInput(event.target.value);
                        setDraftRates((current) => ({
                          ...current,
                          [governorate.key]: value,
                        }));
                      }}
                      placeholder="0"
                      disabled={isSaving}
                      className="h-10 text-left font-mono"
                    />
                    <span className="shrink-0 text-xs font-bold text-muted-foreground">ج.م</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t px-5 py-4">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ أسعار الشحن
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
