'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  catalog_id: z.coerce.number(),
  name: z.string().min(2, 'يجب أن يكون الاسم حرفين على الأقل').max(50),
  parent_category_id: z.coerce.number().nullable().optional(),
  subcategories: z.array(z.string().min(2).max(50)).optional().default([]),
});

const updateCategorySchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(2, 'يجب أن يكون الاسم حرفين على الأقل').max(50),
  parent_category_id: z.coerce.number().nullable().optional(),
});

export async function createCategory(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'غير مصرح به' };
  }

  let parsedSubcategories: string[] = [];
  const subcategoriesRaw = formData.get('subcategories');
  if (typeof subcategoriesRaw === 'string' && subcategoriesRaw.trim()) {
    try {
      parsedSubcategories = JSON.parse(subcategoriesRaw);
    } catch (error) {
      console.error('Invalid subcategories payload', error);
    }
  }

  const validatedFields = categorySchema.safeParse({
    catalog_id: formData.get('catalog_id'),
    name: formData.get('name'),
    parent_category_id: formData.get('parent_category_id') || null,
    subcategories: parsedSubcategories,
  });

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'بيانات غير صالحة.';
    return { message: firstError };
  }

  const { catalog_id, name, parent_category_id, subcategories } = validatedFields.data;

  const { data: insertedParent, error } = await supabase
    .from('categories')
    .insert({
      catalog_id,
      name,
      parent_category_id,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return { message: 'فشل إنشاء الفئة.' };
  }

  if (subcategories.length && insertedParent?.id) {
    const subInsertPayload = subcategories.map((subName) => ({
      catalog_id,
      name: subName,
      parent_category_id: insertedParent.id,
    }));

    const { error: subError } = await supabase.from('categories').insert(subInsertPayload);
    if (subError) {
      console.error('Error creating subcategories:', subError);
      return { message: 'تم إنشاء الفئة الرئيسية لكن حدث خطأ أثناء إضافة الفئات الفرعية.' };
    }
  }

  revalidatePath('/dashboard/categories');
  return { message: 'تم إنشاء الفئة بنجاح.' };
}

export async function updateCategory(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'غير مصرح به' };
  }

  const validatedFields = updateCategorySchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    parent_category_id: formData.get('parent_category_id') || null,
  });

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'بيانات غير صالحة.';
    return { message: firstError };
  }

  const { id, name, parent_category_id } = validatedFields.data;

  const { error } = await supabase.from('categories').update({
    name,
    parent_category_id,
  }).eq('id', id);

  if (error) {
    console.error('Error updating category:', error);
    return { message: 'فشل تحديث الفئة.' };
  }

  revalidatePath('/dashboard/categories');
  return { message: 'تم تحديث الفئة بنجاح.' };
}

export async function deleteCategory(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'غير مصرح به' };
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return { error: 'فشل حذف الفئة.' };
  }

  revalidatePath('/dashboard/categories');
  return { error: null };
}

export async function getCategories(catalogId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { categories: [], error: 'غير مصرح به' };
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, parent_category_id, created_at')
    .eq('catalog_id', catalogId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return { categories: [], error: 'فشل جلب الفئات.' };
  }

  return { categories: data, error: null };
}
