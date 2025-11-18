'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/common/SubmitButton';
import { createCategory, updateCategory } from '@/app/actions/categories';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  name: z.string().min(2, 'يجب أن يكون الاسم حرفين على الأقل.').max(50),
  parent_id: z.string().optional(),
});

interface CategoryFormProps {
  catalogId: number;
  category?: Category;
  onSuccess?: () => void;
  mainCategories: Category[];
  enableSubcategories: boolean;
}

export function CategoryForm({ catalogId, category, onSuccess, mainCategories, enableSubcategories }: CategoryFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      parent_id: category?.parent_id?.toString() || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const parentId = values.parent_id ? parseInt(values.parent_id) : null;
    
    const result = category
      ? await updateCategory(category.id, values.name, parentId)
      : await createCategory(catalogId, values.name, parentId);

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
        {enableSubcategories && (
            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفئة الرئيسية (اختياري)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اجعلها فئة رئيسية" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="">-- اجعلها فئة رئيسية --</SelectItem>
                        {mainCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    إذا اخترت فئة رئيسية، ستصبح هذه الفئة فئة فرعية.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}
        <SubmitButton pendingText={category ? 'جاري التحديث...' : 'جاري الحفظ...'} className="w-full">
          {category ? 'حفظ التغييرات' : 'حفظ الفئة'}
        </SubmitButton>
      </form>
    </Form>
  );
}
