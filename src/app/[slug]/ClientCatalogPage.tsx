'use client';

import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Catalog, CategoryWithSubcategories } from "@/lib/types";
import { StorefrontView } from "@/components/menu/StorefrontView";
import { Head } from "@/components/common/Head";
import { InstallPrompt } from "@/components/common/InstallPrompt";
import { PageLoader } from "@/components/common/PageLoader";
import {
    FREE_PLAN_MAX_CATEGORIES,
    FREE_PLAN_MAX_PRODUCTS,
    getEffectiveCatalogSettings,
    getPlanEntitlement,
    isUnlimitedPlan,
    checkSubscriptionStatus,
} from "@/lib/plans";

type CatalogPageData = Catalog & {
    categories: CategoryWithSubcategories[];
};

function categoryHasVisibleItems(category: CategoryWithSubcategories): boolean {
    return (
        category.menu_items.length > 0 ||
        category.subcategories.some((subcategory) => categoryHasVisibleItems(subcategory))
    );
}

function pruneEmptyCategories(categories: CategoryWithSubcategories[]): CategoryWithSubcategories[] {
    return categories
        .map((category) => ({
            ...category,
            subcategories: pruneEmptyCategories(category.subcategories || []),
        }))
        .filter(categoryHasVisibleItems);
}

export default function ClientCatalogPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [data, setData] = useState<CatalogPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [storeClosed, setStoreClosed] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // Fast initial logo before fetching
    useState(() => {
        if (typeof window !== 'undefined') {
            const cachedLogo = sessionStorage.getItem(`store_logo_${slug}`);
            if (cachedLogo) {
                setLogoUrl(cachedLogo);
            }
        }
    });

    useEffect(() => {
        async function fetchData() {
            if (!slug) return;
            try {
                const supabase = createClient();
                const { data: catalog, error: catalogError } = await supabase
                    .from("catalogs")
                    .select("*")
                    .eq("name", slug)
                    .single();

                if (catalogError || !catalog) {
                    console.error(`Error fetching catalog '${slug}':`, catalogError);
                    setError(true);
                    setLoading(false);
                    return;
                }

                const status = checkSubscriptionStatus(catalog as Catalog);
                if (!status.isActive) {
                    setStoreClosed(true);
                    setLoading(false);
                    return;
                }

                if (catalog.logo_url) {
                    sessionStorage.setItem(`store_logo_${slug}`, catalog.logo_url);
                    setLogoUrl(catalog.logo_url);
                }

                const { data: categories, error: categoriesError } = await supabase
                    .from("categories")
                    .select(`*, menu_items ( * )`)
                    .eq("catalog_id", catalog.id)
                    .order("parent_category_id", { ascending: true })
                    .order("name", { ascending: true });

                if (categoriesError) {
                    console.error("Error fetching categories:", categoriesError);
                    setData({ ...catalog, categories: [] });
                    setLoading(false);
                    return;
                }

                const isUnlimited = isUnlimitedPlan(catalog as Catalog);
                const allCategories = categories || [];
                const allItems = allCategories.flatMap((category: any) => category.menu_items || []);
                const categoryEntitlement = getPlanEntitlement(allCategories, FREE_PLAN_MAX_CATEGORIES, isUnlimited);
                const itemEntitlement = getPlanEntitlement(allItems, FREE_PLAN_MAX_PRODUCTS, isUnlimited);

                const categoriesMap = new Map<number, CategoryWithSubcategories>();
                const rootCategories: CategoryWithSubcategories[] = [];

                allCategories.forEach((category: any) => {
                    if (!categoryEntitlement.isEntitled(category.id)) return;

                    const sortedItems = (category.menu_items || []).sort((a: any, b: any) => {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }).filter((item: any) => itemEntitlement.isEntitled(item.id) && !item.is_hidden);

                    categoriesMap.set(category.id, {
                        ...category,
                        subcategories: [],
                        menu_items: sortedItems,
                    });
                });

                allCategories.forEach((category: any) => {
                    const categoryNode = categoriesMap.get(category.id);
                    if (!categoryNode) return;

                    if (category.parent_category_id && categoriesMap.has(category.parent_category_id)) {
                        categoriesMap.get(category.parent_category_id)!.subcategories.push(categoryNode);
                    } else {
                        rootCategories.push(categoryNode);
                    }
                });

                setData({ ...getEffectiveCatalogSettings(catalog as Catalog), categories: pruneEmptyCategories(rootCategories) });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(true);
                setLoading(false);
            }
        }

        fetchData();
    }, [slug]);

    if (loading) return <PageLoader logoUrl={logoUrl} />;
    if (storeClosed) {
        return (
            <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-[#03110f] text-white">
                <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center gap-6 shadow-2xl backdrop-blur-md">
                    {logoUrl ? (
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/10 p-1 flex items-center justify-center">
                            <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain rounded-xl" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-4xl">🏪</div>
                    )}
                    <div className="space-y-2">
                        <h1 className="text-xl sm:text-2xl font-black">المتجر مغلق مؤقتاً 🏪</h1>
                        <p className="text-sm text-white/60 leading-relaxed">
                            عذراً، هذا المتجر الإلكتروني غير متاح حالياً. يرجى المحاولة مرة أخرى لاحقاً أو التواصل مع صاحب المتجر.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    if (error || !data) return <div className="min-h-screen flex items-center justify-center">Store not found</div>;

    const storeName = data.display_name || data.name;
    const titleWithSlogan = data.slogan ? `${storeName} | ${data.slogan}` : storeName;

    return (
        <>
            <Head
                faviconUrl={data.logo_url || undefined}
                storeName={titleWithSlogan}
            />
            <InstallPrompt
                storeName={data.display_name || data.name}
                storeLogo={data.logo_url || undefined}
            />
            <StorefrontView catalog={data} categories={data.categories} />
        </>
    );
}
