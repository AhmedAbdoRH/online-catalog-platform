'use client';

import { useActionState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { SubmitButton } from '@/components/common/SubmitButton';
import { updateCatalog } from '@/app/actions/catalog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Catalog } from '@/lib/types';
import Image from 'next/image';
import { Switch } from '../ui/switch';

const formSchema = z.object({
  name: z.string()
    .min(3, 'يجب أن يكون اسم الكتالوج 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم الكتالوج 50 حرفًا على الأكثر')
    .regex(/^[a-z0-9-]+$/, 'يجب أن يحتوي اسم الكتالوج على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'),
  logo: z.instanceof(File).optional(),
  enable_subcategories: z.boolean().default(false),
});

const initialState = {
  message: '',
};

export function SettingsForm({ catalog }: { catalog: Catalog }) {
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useActionState(updateCatalog, initialState);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: catalog.name,
      logo: undefined,
      enable_subcategories: catalog.enable_subcategories,
    },
    mode: 'onBlur'
  });

  useEffect(() => {
    if (state?.message) {
        const isSuccess = state.message.includes('بنجاح');
        toast({
            title: isSuccess ? 'نجاح' : 'خطأ',
            description: state.message,
            variant: isSuccess ? 'default' : 'destructive'
        });
        if(isSuccess) {
            router.refresh();
        }
    }
  }, [state, toast, router]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
        <input type="hidden" name="catalogId" value={catalog.id} />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الكتالوج (باللغة الإنجليزية)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                سيتم استخدام هذا الاسم في رابط الكتالوج الخاص بك.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>الشعار الحالي</FormLabel>
            {catalog.logo_url && <Image src={catalog.logo_url} alt="شعار حالي" width={80} height={80} className="rounded-md" />}
        </FormItem>
        <FormField
          control={form.control}
          name="logo"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>شعار جديد (اختياري)</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
              </FormControl>
               <FormDescription>
                اختر ملفًا جديدًا فقط إذا كنت تريد تغيير الشعار الحالي.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <Controller
            control={form.control}
            name="enable_subcategories"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">تفعيل الفئات الفرعية</FormLabel>
                  <FormDescription>
                    السماح بإنشاء فئات داخل فئات أخرى.
                  </FormDescription>
                </div>
                <FormControl>
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        name={field.name}
                    />
                </FormControl>
              </FormItem>
            )}
          />
        <SubmitButton pendingText="جاري الحفظ..." className="w-full">
          حفظ التغييرات
        </SubmitButton>
      </form>
    </Form>
  );
}
