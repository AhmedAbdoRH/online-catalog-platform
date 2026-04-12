"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, MapPin, Save } from 'lucide-react';

interface DirectOrderFormData {
  name: string;
  phone: string;
  address: string;
}

interface DirectOrderFormProps {
  onSubmit: (data: DirectOrderFormData) => void;
  onInquiry?: () => void;
  isLoading?: boolean;
}

const STORAGE_KEY = 'direct_order_customer_data';

export function DirectOrderForm({ onSubmit, onInquiry, isLoading = false }: DirectOrderFormProps) {
  const [formData, setFormData] = useState<DirectOrderFormData>({
    name: '',
    phone: '',
    address: '',
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Error loading saved customer data:', e);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (formData.name || formData.phone || formData.address) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          className="text-right min-h-[80px]"
          disabled={isLoading}
        />
      </div>

      <div className="text-xs text-muted-foreground text-right flex items-center gap-1 justify-end">
        <Save className="h-3 w-3" />
        ستحفظ بياناتك تلقائيا للمرات القادمة
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? 'جاري الإرسال...' : 'إتمام الطلب'}
        </Button>
        {onInquiry && (
          <Button
            type="button"
            variant="outline"
            onClick={onInquiry}
            disabled={isLoading}
            className="w-full h-9 bg-transparent border border-white/30 hover:bg-white/5 hover:border-white/50 text-white/70"
          >
            أريد فقط التواصل مع البائع للاستفسار (تخطي)
          </Button>
        )}
      </div>
    </form>
  );
}
