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
  DialogTrigger,
} from '@/components/ui/dialog';
import { updateCatalog } from '@/app/actions/catalog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Catalog } from '@/lib/types';
import NextImage from 'next/image';
import { Capacitor } from '@capacitor/core';
import { Loader2, Lock, Check, Crown, Palette, Sparkles, MessageCircle, EyeOff, Camera, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from '../ui/switch';

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
});

export function SettingsForm({ catalog }: { catalog: Catalog }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTooltips, setShowTooltips] = useState(false);

  // File states for previews and actual files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(catalog.logo_url || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(catalog.cover_url || null);

  const [selectedTheme, setSelectedTheme] = useState(catalog.theme || 'default');
  const [hideFooter, setHideFooter] = useState(catalog.hide_footer || false);
  const [showAllThemes, setShowAllThemes] = useState(false);

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

  const dismissTooltips = () => {
    setShowTooltips(false);
  };

  const isPro = catalog.plan === 'pro' || catalog.plan === 'business';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: catalog.name,
      display_name: catalog.display_name || catalog.name,
      slogan: catalog.slogan || '',
      whatsapp_number: catalog.whatsapp_number?.replace(catalog.country_code || '+20', '') || '',
      theme: catalog.theme || 'default',
      country_code: catalog.country_code || '+20',
    },
  });

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('SettingsForm: handleLogoChange called', e?.target?.files);
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-submit after state updates
      setTimeout(() => {
        form.handleSubmit((values) => onSubmit(values, undefined, file, coverFile))();
      }, 100);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('SettingsForm: handleCoverChange called', e?.target?.files);
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-submit after state updates
      setTimeout(() => {
        form.handleSubmit((values) => onSubmit(values, undefined, logoFile, file))();
      }, 100);
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

      formData.append('whatsapp_number', (values.country_code || '+20') + values.whatsapp_number);
      formData.append('country_code', values.country_code || '+20');
      formData.append('theme', selectedTheme);
      formData.append('hide_footer', hideFooter.toString());

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

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] pointer-events-none group-hover:pointer-events-auto z-20">
              <div className="flex flex-col items-center gap-2 text-white">
                <Camera className="h-8 w-8" />
                <span className="text-xs font-bold">تغيير صورة الغلاف</span>
              </div>
            </div>

            <Input
              type="file"
              name="cover"
              accept="image/*"
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-50 pointer-events-auto p-0 border-0 rounded-none"
              onClick={async (e) => {
                console.log('SettingsForm: cover input clicked');
                await requestPermissions();
              }}
              onChange={handleCoverChange}
            />
          </div>

          {/* Logo Upload Area */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-[60]">
            <AnimatePresence>
              {showTooltips && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0
                  }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{
                    duration: 0.3
                  }}
                  className="absolute left-[-40%] -translate-x-full bottom-full mb-6 z-[70] pointer-events-none w-[240px] sm:w-[280px]"
                >
                  <div className="bg-brand-primary text-white p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2 border border-white/20 pointer-events-auto text-center relative">
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

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] pointer-events-none group-hover:pointer-events-auto z-20">
                <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>

              <Input
                type="file"
                name="logo"
                accept="image/*"
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-[70] pointer-events-auto p-0 border-0 rounded-full"
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
                <div className="flex gap-2" dir="ltr">
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full hover:bg-amber-500/20 transition-colors cursor-pointer">
                          <Lock className="h-3 w-3" />
                          باقة البرو
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader className="text-center">
                          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
                            <Crown className="h-7 w-7 text-amber-500" />
                            ترقية إلى باقة البرو
                          </DialogTitle>
                          <DialogDescription className="text-center text-base">
                            احصل على إمكانية تعديل رابط متجرك
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <Sparkles className="h-5 w-5 text-brand-primary mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">تعديل رابط المتجر</p>
                                <p className="text-xs text-muted-foreground">اختر رابطاً مخصصاً لمتجرك بدلاً من رقم الهاتف</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <Palette className="h-5 w-5 text-brand-primary mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">أنماط مظهر متعددة</p>
                                <p className="text-xs text-muted-foreground">اختر من بين 10 أنماط ألوان مختلفة لمتجرك</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <EyeOff className="h-5 w-5 text-brand-primary mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">إخفاء فوتر المنصة</p>
                                <p className="text-xs text-muted-foreground">إزالة شعار "أونلاين كتالوج" من متجرك</p>
                              </div>
                            </div>
                          </div>
                          <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                            <a
                              href="https://wa.me/201008116452?text=مرحباً، أريد الترقية إلى باقة البرو لمتجري"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-4 w-4 ml-2" />
                              طلب الترقية
                            </a>
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      disabled={isSubmitting || !isPro}
                      className={`bg-white text-[#1e3a5f] text-lg ${!isPro ? 'opacity-60 cursor-not-allowed' : ''}`}
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
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full hover:bg-amber-500/20 transition-colors cursor-pointer">
                    <Lock className="h-3 w-3" />
                    باقة البرو
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader className="text-center">
                    <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
                      <Crown className="h-7 w-7 text-amber-500" />
                      ترقية إلى باقة البرو
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                      احصل على مميزات حصرية لمتجرك
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Sparkles className="h-5 w-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">عدد غير محدود من المنتجات والتصنيفات</p>
                          <p className="text-xs text-muted-foreground">أضف عدد لا نهائي من المنتجات والتصنيفات</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Palette className="h-5 w-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">أنماط مظهر متعددة</p>
                          <p className="text-xs text-muted-foreground">اختر من بين 10 أنماط ألوان مختلفة لمتجرك</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Crown className="h-5 w-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">دعم فني مميز</p>
                          <p className="text-xs text-muted-foreground">أولوية في الرد والدعم الفني</p>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                      <a
                        href="https://wa.me/201008116452?text=مرحباً، أريد الترقية إلى باقة البرو لمتجري"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 ml-2" />
                        طلب الترقية
                      </a>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <FormDescription>
            اختر نمط الخلفية لمتجرك
          </FormDescription>

          <div className="grid grid-cols-5 gap-3">
            {(showAllThemes ? THEME_OPTIONS : THEME_OPTIONS.slice(0, 5)).map((theme, index) => {
              const isDefault = theme.id === 'default';
              const isLocked = !isPro && !isDefault;

              return (
                <div key={theme.id} className={`flex flex-col items-center gap-1 ${isLocked ? 'opacity-60' : ''}`}>
                  <button
                    type="button"
                    disabled={isLocked || isSubmitting}
                    onClick={() => !isLocked && setSelectedTheme(theme.id)}
                    className={`relative h-16 w-full rounded-lg ${theme.gradient} border-2 transition-all ${selectedTheme === theme.id
                      ? 'border-brand-primary ring-2 ring-brand-primary/50'
                      : 'border-transparent hover:border-white/30'
                      } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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

        {/* قسم إخفاء الفوتر */}
        <div className="pt-6 border-t relative">
          {!isPro && (
            <div className="absolute top-1 left-0">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full hover:bg-amber-500/20 transition-colors cursor-pointer">
                    <Lock className="h-2.5 w-2.5" />
                    باقة البرو
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader className="text-center">
                    <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
                      <Crown className="h-7 w-7 text-amber-500" />
                      ترقية إلى باقة البرو
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                      احصل على مميزات حصرية لمتجرك
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Sparkles className="h-5 w-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">عدد غير محدود من المنتجات والتصنيفات</p>
                          <p className="text-xs text-muted-foreground">أضف عدد لا نهائي من المنتجات والتصنيفات</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Palette className="h-5 w-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">أنماط مظهر متعددة</p>
                          <p className="text-xs text-muted-foreground">اختر من بين 10 أنماط ألوان مختلفة لمتجرك</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <EyeOff className="h-5 w-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">إخفاء فوتر المنصة</p>
                          <p className="text-xs text-muted-foreground">إزالة شعار "أونلاين كتالوج" من متجرك</p>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                      <a
                        href="https://wa.me/201008116452?text=مرحباً، أريد الترقية إلى باقة البرو لمتجري"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 ml-2" />
                        طلب الترقية
                      </a>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <FormLabel className="text-base cursor-pointer" onClick={() => isPro && setHideFooter(!hideFooter)}>
                إخفاء فوتر "أونلاين كتالوج"
              </FormLabel>
              <FormDescription className="text-[11px] leading-tight">
                إزالة شعار المنصة من أسفل صفحة المتجر
              </FormDescription>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={hideFooter}
                onCheckedChange={setHideFooter}
                disabled={!isPro || isSubmitting}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </Form>
  );
}
