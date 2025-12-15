import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemsTable } from '@/components/dashboard/ItemsTable';
import { AddItemButton } from '@/components/dashboard/AddItemButton';

async function getData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: catalog } = await supabase.from('catalogs').select('id, name, plan').eq('user_id', user.id).single();
    if (!catalog) notFound();

    const { data: categories } = await supabase.from('categories').select('*').eq('catalog_id', catalog.id);
    const { data: items } = await supabase.from('menu_items').select('*, categories(name), product_images(*)').eq('catalog_id', catalog.id).order('created_at');

    return { catalog, categories: categories || [], items: items || [] };
}

export default async function ItemsPage() {
    const { catalog, categories, items } = await getData();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>المنتجات</CardTitle>
                    <CardDescription>إدارة المنتجات في المتجر الخاص بك.</CardDescription>
                </div>
                <AddItemButton catalogId={catalog.id} catalogPlan={catalog.plan} categories={categories} />
            </CardHeader>
            <CardContent>
                {categories.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        يجب عليك <a href="/dashboard/categories" className="text-primary underline">إضافة تصنيف</a> أولاً قبل إضافة المنتجات.
                    </div>
                ) : (
                    <ItemsTable items={items as any} catalogId={catalog.id} catalogPlan={catalog.plan} categories={categories} />
                )}
            </CardContent>
        </Card>
    );
}
