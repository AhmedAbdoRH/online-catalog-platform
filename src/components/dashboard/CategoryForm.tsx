'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/common/SubmitButton';
import { createCategory, updateCategory } from '@/app/actions/categories';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, 'يجب أن يكون الاسم حرفين على الأقل.').max(50),
});

interface CategoryFormProps {
  catalogId: number;
  category?: Category;
  onSuccess?: () => void;
}

export function CategoryForm({ catalogId, category, onSuccess }: CategoryFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = category
      ? await updateCategory(category.id, values.name)
      : await createCategory(catalogId, values.name);

    if (result.error) {
      toast({
        title: 'خطأ',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'نجاح!',
        description: category ? 'تم تحديث الفئة بنجاح.' : 'تم إنشاء الفئة بنجاح.',
      });
      form.reset();
      onSuccess?.();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الفئة</FormLabel>
              <FormControl>
                <Input placeholder="مثال: مشروبات ساخنة" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton pendingText={category ? 'جاري التحديث...' : 'جاري الحفظ...'} className="w-full">
          {category ? 'حفظ التغييرات' : 'حفظ الفئة'}
        </SubmitButton>
      </form>
    </Form>
  );
}
