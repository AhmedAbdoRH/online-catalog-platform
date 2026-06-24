"use client";

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, MapPin, Phone, Save, Truck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/lib/utils';
import {
  detectGovernorateFromAddress,
  EGYPT_GOVERNORATES,
  getGovernorateByKey,
  getShippingRate,
  type EgyptGovernorateKey,
  type ShippingRates,
} from '@/lib/shipping';

export interface DirectOrderFormData {
  name: string;
  phone: string;
  address: string;
  governorateKey?: EgyptGovernorateKey;
  governorateName?: string;
  shippingPrice?: number;
  orderTotal?: number;
}

interface DirectOrderFormProps {
  onSubmit: (data: DirectOrderFormData) => void;
  onInquiry?: () => void;
  isLoading?: boolean;
  subtotal?: number;
  shippingRates?: ShippingRates | null;
  countryCode?: string | null;
}

type CustomerFields = Pick<DirectOrderFormData, 'name' | 'phone' | 'address'>;

const STORAGE_KEY = 'direct_order_customer_data';

export function DirectOrderForm({
  onSubmit,
  onInquiry,
  isLoading = false,
  subtotal,
  shippingRates,
  countryCode,
}: DirectOrderFormProps) {
  const [formData, setFormData] = useState<CustomerFields>({
    name: '',
    phone: '',
    address: '',
  });
  const [selectedGovernorateKey, setSelectedGovernorateKey] = useState<EgyptGovernorateKey | ''>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData({
          name: parsed.name || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
        });
      } catch (e) {
        console.error('Error loading saved customer data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.name || formData.phone || formData.address) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const detectedGovernorateKey = useMemo(
    () => detectGovernorateFromAddress(formData.address),
    [formData.address]
  );
  const activeGovernorateKey = detectedGovernorateKey || selectedGovernorateKey || null;
  const activeGovernorate = getGovernorateByKey(activeGovernorateKey);
  const shippingPrice = getShippingRate(shippingRates, activeGovernorateKey);
  const requiresShipping = typeof subtotal === 'number';
  const orderTotal = requiresShipping && shippingPrice !== null ? subtotal + shippingPrice : null;

  useEffect(() => {
    setSubmitError(null);
  }, [formData.address, selectedGovernorateKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (requiresShipping) {
      if (!activeGovernorate) {
        setSubmitError('اختر محافظة التوصيل حتى يتم حساب سعر الشحن.');
        return;
      }

      if (shippingPrice === null) {
        setSubmitError(`سعر الشحن لمحافظة ${activeGovernorate.name} غير محدد حاليًا.`);
        return;
      }
    }

    onSubmit({
      ...formData,
      governorateKey: activeGovernorate?.key,
      governorateName: activeGovernorate?.name,
      shippingPrice: shippingPrice ?? undefined,
      orderTotal: orderTotal ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer-name" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          الاسم
        </Label>
        <Input
          id="customer-name"
          placeholder="أدخل اسمك"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="text-right"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          رقم الهاتف
        </Label>
        <Input
          id="customer-phone"
          type="tel"
          placeholder="أدخل رقم هاتفك"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="text-right"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          العنوان
        </Label>
        <Textarea
          id="customer-address"
          placeholder="أدخل عنوانك الكامل"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="min-h-[80px] text-right"
          disabled={isLoading}
        />
      </div>

      {requiresShipping && !detectedGovernorateKey && (
        <div className="space-y-2">
          <Label htmlFor="customer-governorate" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            المحافظة
          </Label>
          <select
            id="customer-governorate"
            value={selectedGovernorateKey}
            onChange={(event) => setSelectedGovernorateKey(event.target.value as EgyptGovernorateKey | '')}
            disabled={isLoading}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-right text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">اختر المحافظة</option>
            {EGYPT_GOVERNORATES.map((governorate) => (
              <option key={governorate.key} value={governorate.key}>
                {governorate.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {requiresShipping && activeGovernorate && shippingPrice !== null && orderTotal !== null && (
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm">
          <div className="mb-2 flex items-center justify-between gap-2 text-emerald-700 dark:text-emerald-300">
            <span className="font-bold">{activeGovernorate.name}</span>
            <span className="inline-flex items-center gap-1 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              تم حساب الشحن
            </span>
          </div>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>قيمة المنتجات</span>
              <span>{formatPrice(subtotal, countryCode)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الشحن</span>
              <span>{formatPrice(shippingPrice, countryCode)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 font-black text-foreground">
              <span>الإجمالي</span>
              <span>{formatPrice(orderTotal, countryCode)}</span>
            </div>
          </div>
        </div>
      )}

      {requiresShipping && activeGovernorate && shippingPrice === null && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>سعر الشحن لمحافظة {activeGovernorate.name} غير محدد حاليًا.</span>
        </div>
      )}

      {submitError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-1 text-right text-xs text-muted-foreground">
        <Save className="h-3 w-3" />
        ستحفظ بياناتك تلقائيًا للمرة القادمة
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? 'جاري الإرسال...' : (
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4" />
              إتمام الطلب
            </span>
          )}
        </Button>
        {onInquiry && (
          <Button
            type="button"
            variant="outline"
            onClick={onInquiry}
            disabled={isLoading}
            className="h-9 w-full border border-white/30 bg-transparent text-white/70 hover:border-white/50 hover:bg-white/5"
          >
            أريد فقط التواصل مع البائع للاستفسار (تخطي)
          </Button>
        )}
      </div>
    </form>
  );
}
