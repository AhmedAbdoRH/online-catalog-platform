import { getCategories } from '@/app/actions/categories';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CategoryForm } from '@/components/dashboard/CategoryForm';
import { CategoriesTable } from '@/components/dashboard/CategoriesTable';
import type { CategoryWithSubcategories } from '@/lib/types';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { FREE_PLAN_MAX_CATEGORIES, getPlanEntitlement, isUnlimitedPlan } from '@/lib/plans';
import { Catalog } from '@/lib/types';
import { CategoriesClient } from '@/app/dashboard/categories/CategoriesClient';

async function getCatalogAndCategories() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: catalog } = await supabase.from('catalogs').select('id, name, plan, plan_expires_at, trial_started_at, is_legacy_basic').eq('user_id', user.id).single();
    if (!catalog) notFound();

    const result = await getCategories(catalog.id);
    
    if (result.error) {
        console.error("Error fetching categories:", result.error);
        return { catalog: catalog as Catalog, categories: [], flatCategories: [] };
    }

    const isUnlimited = isUnlimitedPlan(catalog as Catalog);
    const flatCategories = result.categories.flatMap(cat => [cat, ...(cat.subcategories || [])]);
    const categoryEntitlement = getPlanEntitlement(flatCategories, FREE_PLAN_MAX_CATEGORIES, isUnlimited);

    // Add hiddenReason to all categories
    const addHiddenReason = (categories: CategoryWithSubcategories[]): CategoryWithSubcategories[] => {
        return categories.map(cat => ({
            ...cat,
            hiddenReason: categoryEntitlement.hiddenReason(cat.id),
            subcategories: addHiddenReason(cat.subcategories || []),
        }));
    };

    return { catalog: catalog as Catalog, categories: addHiddenReason(result.categories), flatCategories };
}

export default async function CategoriesPage() {
    const { catalog, categories, flatCategories } = await getCatalogAndCategories();

    // Calculate stats
    const totalCategories = categories.length;
    const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);
    const isUnlimited = isUnlimitedPlan(catalog);

    return (
        <CategoriesClient 
            catalog={catalog}
            categories={categories}
            flatCategories={flatCategories}
            totalCategories={totalCategories}
            totalSubcategories={totalSubcategories}
            isPro={isUnlimited}
        />
    );
}
