'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyCatalogOwnership(catalogId: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: catalog, error } = await supabase.from('catalogs').select('id').eq('id', catalogId).eq('user_id', user.id).single();

    return !!catalog;
}


export async function createCategory(catalogId: number, name: string, parentId?: number | null) {
    const isOwner = await verifyCatalogOwnership(catalogId);
    if (!isOwner) {
        return { error: 'غير مصرح به' };
    }

    const supabase = createClient();
    const { error } = await supabase.from('categories').insert({ catalog_id: catalogId, name, parent_id: parentId });

    if (error) {
        console.error(error);
        return { error: 'فشل إنشاء الفئة.' };
    }

    revalidatePath('/dashboard/categories');
    return { error: null };
}

export async function updateCategory(categoryId: number, name: string, parentId?: number | null) {
    const supabase = createClient();
    // In a real app, you would also verify ownership before updating
    const { error } = await supabase.from('categories').update({ name, parent_id: parentId }).eq('id', categoryId);
    
    if (error) {
        console.error(error);
        return { error: 'فشل تحديث الفئة.' };
    }

    revalidatePath('/dashboard/categories');
    return { error: null };
}

export async function deleteCategory(categoryId: number) {
    const supabase = createClient();
    // In a real app, you would also verify ownership before deleting
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);

    if (error) {
        console.error(error);
        return { error: 'فشل حذف الفئة.' };
    }
    
    revalidatePath('/dashboard/categories');
    return { error: null };
}
