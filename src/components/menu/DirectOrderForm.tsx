"use client";

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, MapPin, Phone, Save, Truck, User, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice, convertArabicNumerals, cn } from '@/lib/utils';
import {
  detectGovernorateFromAddress,
  EGYPT_GOVERNORATES,
  getGovernorateByKey,
  getShippingRate,
  type EgyptGovernorateKey,
  type ShippingRates,
} from '@/lib/shipping';
import {
  hasConfiguredTableNumbers,
  isValidTableNumber,
  sortTableNumbers,
  type TableNumbers,
} from '@/lib/tables';

export interface DirectOrderFormData {
  name: string;
  phone: string;
  address: string;
  governorateKey?: EgyptGovernorateKey;
  governorateName?: string;
  shippingPrice?: number;
  orderTotal?: number;
  tableNumber?: string;
}

interface DirectOrderFormProps {
  onSubmit: (data: DirectOrderFormData) => void;
  onInquiry?: () => void;
  isLoading?: boolean;
  subtotal?: number;
  shippingRates?: ShippingRates | null;
  tableNumbers?: TableNumbers | null;
  restaurantMode?: boolean;
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
  tableNumbers,
  restaurantMode = false,
  countryCode,
}: DirectOrderFormProps) {
  const [formData, setFormData] = useState<CustomerFields>({
    name: '',
    phone: '',
    address: '',
  });
  const [selectedGovernorateKey, setSelectedGovernorateKey] = useState<EgyptGovernorateKey | ''>('');
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // In restaurant mode, fields become optional except table number
  const isRestaurantMode = restaurantMode && hasConfiguredTableNumbers(tableNumbers);
  const isShippingMode = !isRestaurantMode && typeof subtotal === 'number';

  // Make name/phone/address optional in restaurant mode when directOrder is disabled
  const fieldsRequired = !isRestaurantMode || (isRestaurantMode && onInquiry !== undefined);

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
    () => isShippingMode ? detectGovernorateFromAddress(formData.address) : null,
    [formData.address, isShippingMode]
  );
  const activeGovernorateKey = isShippingMode ? (detectedGovernorateKey || selectedGovernorateKey || null) : null;
  const activeGovernorate = getGovernorateByKey(activeGovernorateKey);
  const shippingPrice = isShippingMode ? getShippingRate(shippingRates, activeGovernorateKey) : null;
  const orderTotal = isShippingMode && shippingPrice !== null && typeof subtotal === 'number' 
    ? subtotal + shippingPrice 
    : null;

  const sortedTables = isRestaurantMode && tableNumbers ? sortTableNumbers(tableNumbers) : [];

  useEffect(() => {
    setSubmitError(null);
  }, [formData.address, selectedGovernorateKey, selectedTableNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate shipping mode
    if (isShippingMode) {
      if (!activeGovernorate) {
        setSubmitError('اختر محافظة التوصيل حتى يتم حساب سعر الشحن.');
        return;
      }

      if (shippingPrice === null) {
        setSubmitError(`سعر الشحن لمحافظة ${activeGovernorate.name} غير محدد حاليًا.`);
        return;
      }
    }

    // Validate restaurant mode
    if (isRestaurantMode) {
      if (!selectedTableNumber) {
        setSubmitError('يرجى اختيار رقم الطاولة.');
        return;
      }

      if (!isValidTableNumber(tableNumbers, selectedTableNumber)) {
        setSubmitError('رقم الطاولة المحدد غير صحيح.');
        return;
      }

      // If fields are required (directOrder enabled), validate them
      if (fieldsRequired) {
        if (!formData.name.trim()) {
          setSubmitError('يرجى إدخال الاسم.');
          return;
        }
        if (!formData.phone.trim()) {
          setSubmitError('يرجى إدخال رقم الهاتف.');
          return;
        }
      }
    }

    onSubmit({
      ...formData,
      governorateKey: activeGovernorate?.key,
      governorateName: activeGovernorate?.name,
      shippingPrice: shippingPrice ?? undefined,
      orderTotal: orderTotal ?? undefined,
      tableNumber: isRestaurantMode ? selectedTableNumber : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Show customer fields only if they are required (directOrder enabled) */}
      {fieldsRequired && (
        <>
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
              inputMode="numeric"
              placeholder="أدخل رقم هاتفك"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: convertArabicNumerals(e.target.value) })}
              className="text-right"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {isRestaurantMode ? 'ملاحظات إضافية (اختياري)' : 'العنوان'}
            </Label>
            <Textarea
              id="customer-address"
              placeholder={isRestaurantMode ? 'أي ملاحظات خاصة بالطلب' : 'أدخل عنوانك الكامل'}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="min-h-[80px] text-right"
              disabled={isLoading}
            />
          </div>
        </>
      )}

      {isRestaurantMode && (
        <div className="space-y-3">
          <Label htmlFor="table-number" className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="h-5 w-5" />
            اختر رقم الطاولة
          </Label>
          {/* Show as buttons grid when only table selection (pure restaurant mode) */}
          {!fieldsRequired ? (
            <div className="grid grid-cols-4 gap-2">
              {sortedTables.map((table) => (
                <button
                  key={table}
                  type="button"
                  onClick={() => setSelectedTableNumber(table)}
                  disabled={isLoading}
                  className={cn(
                    "h-14 rounded-lg border-2 text-lg font-bold transition-all",
                    selectedTableNumber === table
                      ? "border-green-500 bg-green-500 text-white shadow-lg scale-105"
                      : "border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10"
                  )}
                >
                  {table}
                </button>
              ))}
            </div>
          ) : (
            /* Show as dropdown when combined with customer fields */
            <select
              id="table-number"
              value={selectedTableNumber}
              onChange={(event) => setSelectedTableNumber(event.target.value)}
              disabled={isLoading}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-right text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">اختر رقم الطاولة</option>
              {sortedTables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {isShippingMode && selectedTableNumber && (
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="font-bold">طاولة رقم: {selectedTableNumber}</span>
          </div>
        </div>
      )}

      {isShippingMode && !detectedGovernorateKey && (
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

      {isShippingMode && activeGovernorate && shippingPrice !== null && orderTotal !== null && (
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

      {isShippingMode && activeGovernorate && shippingPrice === null && (
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

      {/* Show save message only when fields are required and shown */}
      {fieldsRequired && (
        <div className="flex items-center justify-end gap-1 text-right text-xs text-muted-foreground">
          <Save className="h-3 w-3" />
          ستحفظ بياناتك تلقائيًا للمرة القادمة
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          className={cn(
            "w-full",
            isRestaurantMode && !fieldsRequired 
              ? "h-14 text-lg bg-green-600 hover:bg-green-700 shadow-lg" 
              : "bg-green-600 hover:bg-green-700"
          )}
          disabled={isLoading}
        >
          {isLoading ? 'جاري الإرسال...' : (
            <span className="inline-flex items-center gap-2">
              {isRestaurantMode ? (
                <>
                  <UtensilsCrossed className={cn(
                    !fieldsRequired ? "h-5 w-5" : "h-4 w-4"
                  )} />
                  تأكيد الطلب
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  إتمام الطلب
                </>
              )}
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
