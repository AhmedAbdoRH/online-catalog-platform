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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'يجب أن يكون الاسم حرفين على الأقل.').max(50),
  parent_category_id: z.coerce.number().nullable().optional(),
  subcategories: z.array(z.string().min(2, 'اسم الفئة الفرعية قصير جداً.').max(50)).optional().default([]),
});

interface CategoryFormProps {
  catalogId: number;
  category?: Category;
  categories: Category[]; // Add categories prop for parent selection
  onSuccess?: () => void;
}

export function CategoryForm({ catalogId, category, categories, onSuccess }: CategoryFormProps) {
  const { toast } = useToast();
  const parentCandidates = categories
    .filter((cat) => !cat.parent_category_id && cat.id !== category?.id)
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [subInput, setSubInput] = useState('');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      parent_category_id: category?.parent_category_id ?? null,
      subcategories: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('catalog_id', String(catalogId));
    formData.append('name', values.name);
    formData.append(
      'parent_category_id',
      values.parent_category_id === null || values.parent_category_id === undefined
        ? ''
        : String(values.parent_category_id)
    );
    if (!category && subcategories.length) {
      formData.append('subcategories', JSON.stringify(subcategories));
    }

    let result;
    if (category) {
      formData.append('id', String(category.id));
      result = await updateCategory(null, formData);
    } else {
      result = await createCategory(null, formData);
    }

    if (result.message) {
      toast({
        title: result.message.includes('فشل') ? 'خطأ' : 'نجاح!',
        description: result.message,
        variant: result.message.includes('فشل') ? 'destructive' : 'default',
      });
      if (!result.message.includes('فشل')) {
        form.reset();
        onSuccess?.();
        setSubcategories([]);
        setSubInput('');
      }
    }
  };

  const handleAddSubcategory = () => {
    const trimmed = subInput.trim();
    if (!trimmed || trimmed.length < 2) {
      toast({
        title: 'تنبيه',
        description: 'أدخل اسمًا صالحًا للفئة الفرعية (حرفان على الأقل).',
      });
      return;
    }
    if (subcategories.includes(trimmed)) {
      toast({ title: 'تنبيه', description: 'تمت إضافة هذه الفئة الفرعية بالفعل.' });
      return;
    }
    setSubcategories((prev) => [...prev, trimmed]);
    setSubInput('');
  };

  const handleRemoveSubcategory = (name: string) => {
    setSubcategories((prev) => prev.filter((sub) => sub !== name));
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
        {!category ? (
          <FormItem>
            <FormLabel>الفئات الفرعية (اختياري)</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="أدخل اسم الفئة الفرعية ثم اضغط إضافة"
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubcategory();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddSubcategory}>
                إضافة
              </Button>
            </div>
            {subcategories.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {subcategories.map((sub) => (
                  <Badge key={sub} variant="secondary" className="flex items-center gap-1">
                    {sub}
                    <button type="button" onClick={() => handleRemoveSubcategory(sub)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                يمكنك إضافة فئات فرعية ستنشأ تلقائيًا تحت هذه الفئة.
              </p>
            )}
          </FormItem>
        ) : (
          <FormField
            control={form.control}
            name="parent_category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الفئة الأم (اختياري)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? null : Number(value))}
                  value={field.value === null || field.value === undefined ? 'none' : String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة أم" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">لا يوجد فئة أم</SelectItem>
                    {parentCandidates.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
