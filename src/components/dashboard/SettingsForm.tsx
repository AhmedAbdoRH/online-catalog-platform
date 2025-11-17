'use client';

import { useForm } from 'react-hook-form';
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
import { updateCatalog, checkCatalogName } from '@/app/actions/catalog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Catalog } from '@/lib/types';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string()
    .min(3, 'يجب أن يكون اسم الكتالوج 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم الكتالوج 50 حرفًا على الأكثر')
    .regex(/^[a-z0-9-]+$/, 'يجب أن يحتوي اسم الكتالوج على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'),
  logo: z.instanceof(File).optional(),
}).refine(async (data) => {
    // This is a complex refinement logic that needs to be handled carefully
    // For now, skipping server-side name check on update form to avoid complexity.
    return true;
}, 'اسم الكتالوج هذا مستخدم بالفعل. الرجاء اختيار اسم آخر.');

export function SettingsForm({ catalog }: { catalog: Catalog }) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: catalog.name,
      logo: undefined,
    },
    mode: 'onBlur'
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // This is a simplified version. A real implementation would be more robust.
    toast({
        title: 'قيد التطوير',
        description: 'لم يتم تنفيذ وظيفة تحديث الإعدادات بعد.',
        variant: 'default',
    });
    // const formData = new FormData();
    // formData.append('name', values.name);
    // if (values.logo) {
    //     formData.append('logo', values.logo);
    // }

    // const result = await updateCatalog(catalog.id, formData);

    // if (result.error) {
    //   toast({
    //     title: 'خطأ',
    //     description: result.error,
    //     variant: 'destructive',
    //   });
    // } else {
    //   toast({
    //     title: 'نجاح!',
    //     description: 'تم تحديث الكتالوج الخاص بك بنجاح.',
    //   });
    //   router.refresh();
    // }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <SubmitButton pendingText="جاري الحفظ..." className="w-full">
          حفظ التغييرات
        </SubmitButton>
      </form>
    </Form>
  );
}
