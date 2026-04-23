'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { updateCatalog } from '@/app/actions/catalog';
import { exportCustomersToCSV } from '@/app/actions/customer';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Catalog } from '@/lib/types';
import NextImage from 'next/image';
import { Capacitor } from '@capacitor/core';
import { Loader2, Lock, Check, Crown, Palette, Sparkles, EyeOff, Camera, Upload, X, ChevronDown, ChevronUp, Download, Facebook, Instagram, Twitter, Music2, Share2 } from 'lucide-react';
import { ProUpgradeButton } from './ProUpgradeButton';
import { Switch } from '../ui/switch';
import { compressImage } from '@/lib/image-utils';
import { convertArabicNumerals } from '@/lib/utils';
import { UpgradeAlert } from './UpgradeAlert';

const countries = [
  { code: '+20', name: 'مصر', flag: '🇪🇬' },
  { code: '+966', name: 'السعودية', flag: '🇸🇦' },
  { code: '+971', name: 'الإمارات', flag: '🇦🇪' },
  { code: '+212', name: 'المغرب', flag: '🇲🇦' },
];

const THEME_OPTIONS = [
  { id: 'default', name: 'الافتراضي', gradient: 'bg-gradient-default' },
  { id: 'gradient-1', name: 'بنفسجي', gradient: 'bg-gradient-1' },
  { id: 'gradient-2', name: 'أحمر داكن', gradient: 'bg-gradient-2' },
  { id: 'gradient-3', name: 'برتقالي', gradient: 'bg-gradient-3' },
  { id: 'gradient-4', name: 'أخضر', gradient: 'bg-gradient-4' },
  { id: 'gradient-5', name: 'أزرق', gradient: 'bg-gradient-5' },
  { id: 'gradient-6', name: 'وردي', gradient: 'bg-gradient-6' },
  { id: 'gradient-7', name: 'ذهبي', gradient: 'bg-gradient-7' },
  { id: 'gradient-8', name: 'تركوازي', gradient: 'bg-gradient-8' },
  { id: 'gradient-9', name: 'رمادي', gradient: 'bg-gradient-9' },
];

const formSchema = z.object({
  name: z.string()
    .min(3, 'يجب أن يكون اسم الكتالوج 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم الكتالوج 50 حرفًا على الأكثر')
    .regex(/^[a-zA-Z0-9-]+$/, 'يجب أن يكون الرابط باللغة الإنجليزية فقط (أحرف، أرقام، وشرطات)'),
  display_name: z.string()
    .min(3, 'يجب أن يكون اسم العرض 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم العرض 50 حرفًا على الأكثر'),
  slogan: z.string().optional(),
  logo: z.any().optional(),
  cover: z.any().optional(),
  whatsapp_number: z.string().optional().refine(
    (val) => !val || /^\+?[0-9]{6,15}$/.test(val),
    "رقم الواتساب غير صالح"
  ),
  theme: z.string().optional(),
  country_code: z.string().optional(),
  facebook_url: z.string().url('رابط فيس بوك غير صالح').optional().or(z.literal('')),
  instagram_url: z.string().url('رابط إنستجرام غير صالح').optional().or(z.literal('')),
  tiktok_url: z.string().url('رابط تيك توك غير صالح').optional().or(z.literal('')),
  snapchat_url: z.string().url('رابط سناب شات غير صالح').optional().or(z.literal('')),
  twitter_url: z.string().url('رابط تويتر غير صالح').optional().or(z.literal('')),
});

export function SettingsForm({ catalog, userPhone }: { catalog: Catalog, userPhone?: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTooltips, setShowTooltips] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // File states for previews and actual files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(catalog.logo_url || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(catalog.cover_url || null);

  const [selectedTheme, setSelectedTheme] = useState(catalog.theme || 'default');
  const [hideFooter, setHideFooter] = useState(catalog.hide_footer || false);
  const [directOrderEnabled, setDirectOrderEnabled] = useState(catalog.direct_order_enabled ?? true);
  const [showAllThemes, setShowAllThemes] = useState(false);

  // Auto-save direct_order_enabled when toggled
  useEffect(() => {
    const autoSaveDirectOrderEnabled = async () => {
      if (directOrderEnabled !== catalog.direct_order_enabled) {
        try {
          const formData = new FormData();
          formData.append('catalogId', catalog.id.toString());
          formData.append('name', catalog.name);
          formData.append('display_name', catalog.display_name || catalog.name);
          formData.append('direct_order_enabled', directOrderEnabled.toString());

          const result = await updateCatalog(null, formData);
          if (result.message && result.message.includes('خطأ')) {
            console.error('Error auto-saving direct_order_enabled:', result.message);
            toast({
              title: 'فشل الحفظ التلقائي',
              description: result.message,
              variant: 'destructive',
            });
            // Revert on error
            setDirectOrderEnabled(catalog.direct_order_enabled ?? true);
          } else if (result.message && result.message.includes('بنجاح')) {
            toast({
              title: 'تم الحفظ',
              description: result.message,
            });
          }
        } catch (error) {
          console.error('Error auto-saving direct_order_enabled:', error);
        }
      }
    };

    // Debounce to avoid too many calls
    const timeoutId = setTimeout(() => {
      autoSaveDirectOrderEnabled();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [directOrderEnabled, catalog.direct_order_enabled]);

  const handleDownloadCSV = async () => {
    try {
      const result = await exportCustomersToCSV(catalog.id);

      if (result.success && result.data) {
        // Create a blob from the CSV data
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `customers_${catalog.name}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: 'تم التحميل بنجاح',
          description: 'تم تحميل ملف بيانات العملاء',
        });
      } else {
        toast({
          title: 'فشل التحميل',
          description: result.error || 'لا يوجد عملاء للتصدير',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast({
        title: 'حدث خطأ',
        description: 'فشل تحميل ملف CSV',
        variant: 'destructive',
      });
    }
  };

  const requestPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        console.log('Requesting permissions on native platform...');
        if ((Capacitor as any).Plugins?.Permissions) {
          await (Capacitor as any).Plugins.Permissions.request({ name: 'photos' });
        }
      } catch (err) {
        console.warn('Permission request failed or not supported:', err);
      }
    }
  };

  useEffect(() => {
    // Show tooltips only if BOTH are missing
    // Hide if EITHER exists
    const hasLogo = catalog.logo_url || logoFile;
    const hasCover = catalog.cover_url || coverFile;

    if (!hasLogo && !hasCover) {
      const timer = setTimeout(() => {
        setShowTooltips(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowTooltips(false);
    }
  }, [catalog.logo_url, catalog.cover_url, logoFile, coverFile]);

  // Sync previews with server data when catalog prop updates (after router.refresh())
  useEffect(() => {
    setLogoPreview(catalog.logo_url || null);
    setCoverPreview(catalog.cover_url || null);
  }, [catalog.logo_url, catalog.cover_url]);

  const dismissTooltips = () => {
    setShowTooltips(false);
  };

  const isPro = catalog.plan === 'pro' || catalog.plan === 'business';

  const handleLockedSectionKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    onOpen: () => void
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  // Calculate initial values for phone and country code
  const getInitialPhoneValues = () => {
    let countryCode = catalog.country_code || '+20';
    let rawPhone = catalog.whatsapp_number?.replace(countryCode, '') || '';
    
    // Cleanup: if the phone number in DB contains non-numeric characters (like an email), strip them
    let phone = rawPhone.replace(/[^\d]/g, '');

    // If no phone in catalog, try to use user's registration phone
    // Make sure it contains only digits (with optional +), NOT an email address
    if (!phone && userPhone && /^[\+0-9]+$/.test(userPhone)) {
      for (const country of countries) {
        if (userPhone.startsWith(country.code)) {
          countryCode = country.code;
          phone = userPhone.replace(country.code, '').replace(/[^\d]/g, '');
          break;
        }
      }
      // If it's a phone but didn't match our country prefixes, just use it as the phone
      if (!phone) phone = userPhone.replace(/[^\d]/g, '');
    }
    
    return { countryCode, phone };
  };

  const { countryCode: initialCC, phone: initialPhone } = getInitialPhoneValues();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: catalog.name,
      display_name: catalog.display_name || catalog.name,
      slogan: catalog.slogan || '',
      whatsapp_number: initialPhone,
      theme: catalog.theme || 'default',
      country_code: initialCC,
      facebook_url: catalog.facebook_url || '',
      instagram_url: catalog.instagram_url || '',
      tiktok_url: catalog.tiktok_url || '',
      snapchat_url: catalog.snapchat_url || '',
      twitter_url: catalog.twitter_url || '',
    },
  });

  // Upload image directly WITHOUT form validation - completely decoupled from WhatsApp field
  const uploadImageDirectly = async (imageType: 'logo' | 'cover', file: File) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('catalogId', catalog.id.toString());
      // Use current form values or fall back to catalog values for required fields
      formData.append('name', (form.getValues('name') || catalog.name).toLowerCase());
      formData.append('display_name', form.getValues('display_name') || catalog.display_name || catalog.name);
      formData.append('slogan', form.getValues('slogan') || catalog.slogan || '');
      // Use existing WhatsApp DIRECTLY from catalog - no validation, no form field
      formData.append('whatsapp_number', catalog.whatsapp_number || '');
      formData.append('country_code', catalog.country_code || '+20');
      formData.append('theme', selectedTheme);
      formData.append('hide_footer', hideFooter.toString());
      formData.append('direct_order_enabled', directOrderEnabled.toString());
      formData.append(imageType, file, file.name || 'image.webp');

      const result = await updateCatalog(null, formData);

      if (result.message.includes('بنجاح')) {
        toast({ title: 'تم رفع الصورة', description: result.message });
        router.refresh();
      } else {
        toast({ title: 'خطأ', description: result.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ في رفع الصورة', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('SettingsForm: handleLogoChange called', e?.target?.files);
    const rawFile = e.target.files?.[0];
    if (rawFile) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(rawFile);

      try {
        const compressed = await compressImage(rawFile, 'logo');
        setLogoFile(compressed);
        await uploadImageDirectly('logo', compressed);
      } catch {
        setLogoFile(rawFile);
        await uploadImageDirectly('logo', rawFile);
      }
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('SettingsForm: handleCoverChange called', e?.target?.files);
    const rawFile = e.target.files?.[0];
    if (rawFile) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(rawFile);

      try {
        const compressed = await compressImage(rawFile, 'cover');
        setCoverFile(compressed);
        await uploadImageDirectly('cover', compressed);
      } catch {
        setCoverFile(rawFile);
        await uploadImageDirectly('cover', rawFile);
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>, event?: any, manualLogo?: File | null, manualCover?: File | null) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('catalogId', catalog.id.toString());
      formData.append('name', values.name.toLowerCase());
      formData.append('display_name', values.display_name);
      formData.append('slogan', values.slogan || '');

      const phoneValue = values.whatsapp_number?.trim();
      const fullPhone = phoneValue ? (values.country_code || '+20') + phoneValue : '';
      formData.append('whatsapp_number', fullPhone);
      formData.append('country_code', values.country_code || '+20');

      formData.append('theme', selectedTheme);
      formData.append('hide_footer', hideFooter.toString());
      formData.append('direct_order_enabled', directOrderEnabled.toString());

      formData.append('facebook_url', values.facebook_url || '');
      formData.append('instagram_url', values.instagram_url || '');
      formData.append('tiktok_url', values.tiktok_url || '');
      formData.append('snapchat_url', values.snapchat_url || '');
      formData.append('twitter_url', values.twitter_url || '');

      // Use manually passed file or state file
      const finalLogo = manualLogo !== undefined ? manualLogo : logoFile;
      const finalCover = manualCover !== undefined ? manualCover : coverFile;

      if (finalLogo) {
        formData.append('logo', finalLogo);
      }

      if (finalCover) {
        formData.append('cover', finalCover);
      }

      const result = await updateCatalog(null, formData);

      if (result.message.includes('بنجاح')) {
        toast({
          title: 'نجاح',
          description: result.message,
        });
        router.refresh();
      } else {
        toast({
          title: 'خطأ',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Visual Header Preview/Upload Section */}
        <div className="relative mb-14 pt-4">
          <div className="flex flex-col gap-2 mb-4">
            <FormLabel className="text-lg font-bold">هوية المتجر البصرية</FormLabel>
            <FormDescription>اضبط الغلاف والشعار لتمييز علامتك التجارية.</FormDescription>
          </div>

          {/* Cover Upload Area */}
          <div className="relative h-44 sm:h-56 w-full rounded-2xl overflow-hidden bg-muted group cursor-pointer border-2 border-dashed border-brand-primary/20 hover:border-brand-primary/40 transition-all shadow-inner">
            {coverPreview ? (
              <NextImage
                src={coverPreview}
                alt="Store Cover"
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                <Upload className="h-10 w-10 mb-2 opacity-20" />
                <span className="text-sm font-medium">اضغط لرفع غلاف المتجر</span>
                <span className="text-[10px] mt-1">(مقاس مستطيل)</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] pointer-events-none group-hover:pointer-events-auto z-10">
              <div className="flex flex-col items-center gap-2 text-white">
                <Camera className="h-8 w-8" />
                <span className="text-xs font-bold">تغيير صورة الغلاف</span>
              </div>
            </div>

            <Input
              type="file"
              name="cover"
              accept="image/*"
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-20 pointer-events-auto p-0 border-0 rounded-none"
              onClick={async (e) => {
                console.log('SettingsForm: cover input clicked');
                await requestPermissions();
              }}
              onChange={handleCoverChange}
            />
          </div>

          {/* Logo Upload Area */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-30">
            <AnimatePresence>
              {showTooltips && (
                  <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10, translateX: "-50%" }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    translateX: "-50%"
                  }}
                  exit={{ opacity: 0, scale: 0.8, y: 10, translateX: "-50%" }}
                  transition={{
                    duration: 0.3
                  }}
                  className="absolute left-1/2 bottom-full mb-6 z-[35] pointer-events-none w-max max-w-[85vw] sm:max-w-[280px]"
                >
                  <div className="bg-brand-primary text-white p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2 border border-white/20 pointer-events-auto text-center relative mx-auto">
                    <div className="flex items-center gap-2 justify-center">
                      <Camera className="h-5 w-5 shrink-0" />
                      <p className="text-sm font-black leading-tight">أضف شعار / غلاف لمتجرك</p>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); dismissTooltips(); }}
                      className="absolute -top-2 -right-2 bg-red-500 border border-white/40 p-1.5 hover:bg-red-600 rounded-full transition-colors shadow-lg pointer-events-auto"
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>

                    {/* Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-primary rotate-45 border-r border-b border-white/20" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-background bg-card shadow-2xl overflow-hidden group cursor-pointer border-dashed border-brand-primary/30 hover:border-brand-primary/50 transition-all ring-4 ring-black/5">
              {logoPreview ? (
                <NextImage
                  src={logoPreview}
                  alt="Store Logo"
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 text-center bg-muted/30">
                  <Camera className="h-8 w-8 mb-1 opacity-20" />
                  <span className="text-[10px] font-bold">شعار المتجر</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] pointer-events-none group-hover:pointer-events-auto z-10">
                <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>

              <Input
                type="file"
                name="logo"
                accept="image/*"
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-[35] pointer-events-auto p-0 border-0 rounded-full"
                onClick={async (e) => {
                  console.log('SettingsForm: logo input clicked');
                  await requestPermissions();
                }}
                onChange={handleLogoChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-6">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المتجر المعروض</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} className="bg-white text-[#1e3a5f] text-lg" />
                </FormControl>
                <FormDescription>
                  سيظهر هذا الاسم في واجهة المتجر الخاصة بك.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الواتساب</FormLabel>
                <div className="flex gap-2 w-full max-w-full" dir="ltr">
                  <div className="relative">
                    <select
                      value={form.watch('country_code')}
                      onChange={(e) => form.setValue('country_code', e.target.value)}
                      className="h-12 bg-white border-2 border-slate-200 rounded-xl px-4 appearance-none focus:outline-none focus:border-brand-primary font-bold text-slate-700 min-w-[100px] text-center"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        const converted = convertArabicNumerals(e.target.value);
                        const cleaned = converted.replace(/[^\d]/g, '');
                        field.onChange(cleaned);
                      }}
                      disabled={isSubmitting}
                      placeholder="رقم الواتساب بدون كود الدولة"
                      className="bg-white text-[#1e3a5f] text-lg flex-1 h-12"
                    />
                  </FormControl>
                </div>
                <FormDescription>
                  سيتم توجيه طلبات العملاء إلى هذا الرقم. العملة ستتغير تلقائياً حسب كود الدولة المختار.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slogan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>شعار نصي (سلوغان)</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} placeholder="شعار متجرك أو جملة ترويجية" className="bg-white text-[#1e3a5f] text-lg" />
                </FormControl>
                <FormDescription>
                  سيظهر هذا النص بخط صغير تحت اسم المتجر.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />




          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>تخصيص رابط المتجر</FormLabel>
                  {!isPro && (
                  <button
                    type="button"
                    onClick={() => setIsUpgradeOpen(true)}
                    className="flex items-center gap-0.5 text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full hover:bg-amber-500/20 transition-colors cursor-pointer"
                  >
                    <Lock className="h-2.5 w-2.5" />
                    باقة البرو
                  </button>
                )}
                </div>
                <FormControl>
                  <div
                    className={`relative ${!isPro ? 'cursor-pointer' : ''}`}
                    role={!isPro ? 'button' : undefined}
                    tabIndex={!isPro ? 0 : undefined}
                    onClick={!isPro ? () => setIsUpgradeOpen(true) : undefined}
                    onKeyDown={!isPro ? (event) => handleLockedSectionKeyDown(event, () => setIsUpgradeOpen(true)) : undefined}
                  >
                    <Input
                      {...field}
                      disabled={isSubmitting || !isPro}
                      className={`bg-white text-[#1e3a5f] text-lg ${!isPro ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                    />
                    {!isPro && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  {isPro
                    ? 'يمكنك تغيير رابط المتجر الخاص بك.'
                    : 'احصل على رابط احترافي مخصص (مثل: online-catalog.com/brand) بدلاً من رقم الهاتف.'
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* قسم تخصيص مظهر المتجر */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <FormLabel className="text-lg font-semibold">تخصيص خلفية المتجر</FormLabel>
            {!isPro && (
              <button
                type="button"
                onClick={() => setIsUpgradeOpen(true)}
                className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <Lock className="h-3 w-3" />
                باقة البرو
              </button>
            )}
          </div>
          <FormDescription>
            اختر نمط الخلفية لمتجرك
          </FormDescription>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
            {(showAllThemes ? THEME_OPTIONS : THEME_OPTIONS.slice(0, 5)).map((theme, index) => {
              const isDefault = theme.id === 'default';
              const isLocked = !isPro && !isDefault;

              return (
                <div key={theme.id} className={`flex flex-col items-center gap-1 ${isLocked ? 'opacity-60' : ''}`}>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    aria-disabled={isLocked}
                    onClick={() => (isLocked ? setIsUpgradeOpen(true) : setSelectedTheme(theme.id))}
                    className={`relative h-16 w-full rounded-lg ${theme.gradient} border-2 transition-all ${selectedTheme === theme.id
                      ? 'border-brand-primary ring-2 ring-brand-primary/50'
                      : 'border-transparent hover:border-white/30'
                      } cursor-pointer`}
                    title={theme.name}
                  >
                    {selectedTheme === theme.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white drop-shadow-lg" />
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                        <Lock className="h-4 w-4 text-white/70" />
                      </div>
                    )}
                    {isDefault && (
                      <span className="absolute -top-2 right-1 text-[9px] bg-brand-primary text-white px-1.5 py-0.5 rounded-full">
                        افتراضي
                      </span>
                    )}
                  </button>
                  <span className="text-[10px] text-muted-foreground">{theme.name}</span>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAllThemes(!showAllThemes)}
            className="w-full mt-2 text-xs text-brand-primary hover:bg-brand-primary/5 gap-1 h-8"
          >
            {showAllThemes ? (
              <>
                عرض أقل
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                عرض المزيد من الأنماط
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>

        {/* قسم الطلب المباشر */}
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <FormLabel className="text-base cursor-pointer" onClick={() => setDirectOrderEnabled(!directOrderEnabled)}>
                جمع بيانات العميل قبل الطلب
              </FormLabel>
              <FormDescription className="text-[11px] leading-tight">
                جمع بيانات العميل (الاسم، الهاتف، العنوان) قبل الطلب
              </FormDescription>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={directOrderEnabled}
                onCheckedChange={setDirectOrderEnabled}
                disabled={isSubmitting}
              />
            </div>
          </div>
          {directOrderEnabled && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isPro ? handleDownloadCSV : () => setIsUpgradeOpen(true)}
                disabled={isSubmitting}
                className="gap-2 flex-1"
              >
                <Download className="h-4 w-4" />
                تحميل بيانات العملاء كملف CSV
              </Button>
              {!isPro && (
                <button
                  type="button"
                  onClick={() => setIsUpgradeOpen(true)}
                  className="flex items-center gap-0.5 text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <Lock className="h-2.5 w-2.5" />
                  باقة البرو
                </button>
              )}
            </div>
          )}
        </div>

        {/* قسم إخفاء الفوتر */}
        <div className="pt-6 border-t relative">
          {!isPro && (
            <div className="absolute top-1 left-0">
              <button
                type="button"
                onClick={() => setIsUpgradeOpen(true)}
                className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <Lock className="h-2.5 w-2.5" />
                باقة البرو
              </button>
            </div>
          )}
          <div
            className={`flex items-center justify-between ${!isPro ? 'cursor-pointer rounded-md' : ''}`}
            role={!isPro ? 'button' : undefined}
            tabIndex={!isPro ? 0 : undefined}
            onClick={!isPro ? () => setIsUpgradeOpen(true) : undefined}
            onKeyDown={!isPro ? (event) => handleLockedSectionKeyDown(event, () => setIsUpgradeOpen(true)) : undefined}
          >
            <div className="flex flex-col">
              <FormLabel className="text-base cursor-pointer" onClick={() => isPro && setHideFooter(!hideFooter)}>
                إخفاء فوتر "أونلاين كتالوج"
              </FormLabel>
              <FormDescription className="text-[11px] leading-tight">
                إزالة شعار المنصة من أسفل صفحة المتجر
              </FormDescription>
            </div>
            <div className={`flex items-center gap-3 ${!isPro ? 'pointer-events-none' : ''}`}>
              <Switch
                checked={hideFooter}
                onCheckedChange={setHideFooter}
                disabled={!isPro || isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* روابط التواصل الاجتماعي */}
        <div className="pt-6 border-t">
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 shadow-sm space-y-4">
            <div className="flex flex-col">
              <FormLabel className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-brand-primary" />
                روابط التواصل الاجتماعي
              </FormLabel>
              <FormDescription className="text-[11px]">أضف روابط حساباتك لتظهر في واجهة المتجر</FormDescription>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              <FormField
                control={form.control}
                name="facebook_url"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] flex items-center gap-1 font-semibold text-slate-600">
                      <Facebook className="h-3 w-3 text-blue-600" />
                      فيس بوك
                    </FormLabel>
                    <div className="flex gap-1.5">
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} dir="ltr" placeholder="https://facebook.com/..." className="bg-white h-9 text-xs border-slate-200 focus:border-blue-400" />
                      </FormControl>
                      <Button type="submit" size="sm" disabled={isSubmitting} className="shrink-0 h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold">حفظ</Button>
                    </div>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram_url"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] flex items-center gap-1 font-semibold text-slate-600">
                      <Instagram className="h-3 w-3 text-pink-600" />
                      إنستجرام
                    </FormLabel>
                    <div className="flex gap-1.5">
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} dir="ltr" placeholder="https://instagram.com/..." className="bg-white h-9 text-xs border-slate-200 focus:border-pink-400" />
                      </FormControl>
                      <Button type="submit" size="sm" disabled={isSubmitting} className="shrink-0 h-9 px-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 hover:opacity-90 text-white text-[10px] font-bold">حفظ</Button>
                    </div>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktok_url"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] flex items-center gap-1 font-semibold text-slate-600">
                      <Music2 className="h-3 w-3 text-black" />
                      تيك توك
                    </FormLabel>
                    <div className="flex gap-1.5">
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} dir="ltr" placeholder="https://tiktok.com/@..." className="bg-white h-9 text-xs border-slate-200 focus:border-black" />
                      </FormControl>
                      <Button type="submit" size="sm" disabled={isSubmitting} className="shrink-0 h-9 px-3 bg-black hover:bg-gray-900 text-white text-[10px] font-bold">حفظ</Button>
                    </div>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="snapchat_url"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] flex items-center gap-1 font-semibold text-slate-600">
                      <svg className="h-3 w-3 fill-yellow-500" viewBox="0 0 24 24"><path d="M12 2.992c-5.116 0-7.228 3.518-7.228 6.556 0 1.341.488 2.378 1.157 3.167-.179.083-.348.192-.477.34-.351.401-.421 1.01-.174 1.483.251.481.821.72 1.365.612.062.277.202.528.421.724 1.132.969 2.502.535 3.167.311.231.781.851 1.403 1.769 1.403s1.538-.622 1.769-1.403c.665.224 2.035.658 3.167-.311.219-.196.359-.447.421-.724.544.108 1.114-.131 1.365-.612.247-.473.177-1.082-.174-1.483-.129-.148-.298-.257-.477-.34.669-.789 1.157-1.826 1.157-3.167 0-3.038-2.112-6.556-7.228-6.556z"/></svg>
                      سناب شات
                    </FormLabel>
                    <div className="flex gap-1.5">
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} dir="ltr" placeholder="https://snapchat.com/add/..." className="bg-white h-9 text-xs border-slate-200 focus:border-yellow-400" />
                      </FormControl>
                      <Button type="submit" size="sm" disabled={isSubmitting} className="shrink-0 h-9 px-3 bg-[#FFFC00] hover:bg-[#E6E300] text-black text-[10px] font-bold">حفظ</Button>
                    </div>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter_url"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] flex items-center gap-1 font-semibold text-slate-600">
                      <Twitter className="h-3 w-3 text-slate-900" />
                      تويتر / X
                    </FormLabel>
                    <div className="flex gap-1.5">
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} dir="ltr" placeholder="https://x.com/..." className="bg-white h-9 text-xs border-slate-200 focus:border-slate-400" />
                      </FormControl>
                      <Button type="submit" size="sm" disabled={isSubmitting} className="shrink-0 h-9 px-3 bg-gray-800 hover:bg-gray-900 text-white text-[10px] font-bold">حفظ</Button>
                    </div>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>

        <UpgradeAlert open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen} catalogId={catalog.id} />
      </form>
    </Form>
  );
}
