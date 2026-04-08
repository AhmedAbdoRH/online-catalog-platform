'use client';

import { getCategories } from '@/app/actions/categories';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CategoryForm } from '@/components/dashboard/CategoryForm';
import { CategoriesTable } from '@/components/dashboard/CategoriesTable';
import { useState } from 'react';
import React from 'react';
import type { CategoryWithSubcategories } from '@/lib/types';

async function getCatalogAndCategories() {
    const result = await getCategories();
    if (!result.catalog) {
        redirect('/login');
    }
    
    if (result.error) {
        console.error("Error fetching categories:", result.error);
        return { catalog: result.catalog, categories: [] };
    }

    return { catalog: result.catalog, categories: result.categories || [] };
}

export default function CategoriesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
    const [catalog, setCatalog] = useState<{id: number} | null>(null);

    // Fetch data on component mount
    React.useEffect(() => {
        async function fetchData() {
            const result = await getCatalogAndCategories();
            setCatalog(result.catalog?.id ? { id: result.catalog.id } : null);
            setCategories(result.categories);
        }
        fetchData();
    }, []);

    // Calculate stats
    const totalCategories = categories.length;
    const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);

    const handleCategorySuccess = () => {
        setIsDialogOpen(false);
        // Refetch categories
        async function fetchData() {
            const result = await getCatalogAndCategories();
            setCatalog(result.catalog?.id ? { id: result.catalog.id } : null);
            setCategories(result.categories);
        }
        fetchData();
    };

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight truncate">التصنيفات</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        إدارة هيكلية المتجر وتنظيم الأصناف في مجموعات.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-lg bg-amber-500 hover:bg-amber-600 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-white dark:text-amber-300 border-none font-black text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 rounded-xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                            <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3px]" />
                            <span>إضافة تصنيف جديد</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
                            <DialogDescription>
                                قم بإنشاء تصنيف رئيسي جديد لتنظيم منتجاتك.
                            </DialogDescription>
                        </DialogHeader>
                        <CategoryForm 
                            catalogId={catalog?.id || 0} 
                            categories={categories} 
                            hideParentSelection 
                            onSuccess={handleCategorySuccess}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-none border-border/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs sm:text-sm">إجمالي التصنيفات الرئيسية</CardDescription>
                        <CardTitle className="text-2xl sm:text-3xl">{totalCategories}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-none border-border/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs sm:text-sm">إجمالي التصنيفات الفرعية</CardDescription>
                        <CardTitle className="text-2xl sm:text-3xl">{totalSubcategories}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-none shadow-none bg-transparent w-full max-w-full overflow-hidden">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg">هيكل القائمة</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        يمكنك سحب وإفلات التصنيفات لإعادة ترتيبها (قريباً).
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 w-full max-w-full overflow-hidden">
                    {catalog && (
                        <div className="w-full max-w-full overflow-x-hidden pb-4">
                            <CategoriesTable 
                                categories={categories} 
                                catalogId={catalog.id} 
                                onSuccess={handleCategorySuccess}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="h-24" /> {/* مسافة إضافية في نهاية الصفحة لتجنب التداخل مع شريط التنقل السفلي */}
        </div>
    );
}
