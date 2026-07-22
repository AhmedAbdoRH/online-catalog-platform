'use client';

import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProductActions } from "@/components/menu/ProductActions";
import { cn, formatPrice } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";
import RelatedProductImage from "@/components/RelatedProductImage";
import { ProductGallery } from "@/components/menu/ProductGallery";
import { useEffect, useState } from "react";
import { Catalog, MenuItem, ItemVariant } from "@/lib/types";
import { PageLoader } from "@/components/common/PageLoader";
import { Head } from "@/components/common/Head";
import { Button } from "@/components/ui/button";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartButton } from "@/components/cart/CartButton";
import {
    FREE_PLAN_MAX_CATEGORIES,
    FREE_PLAN_MAX_PRODUCTS,
    getEffectiveCatalogSettings,
    getPlanEntitlement,
    isUnlimitedPlan,
    checkSubscriptionStatus,
} from "@/lib/plans";

// Helper Functions
const getThemeClass = (theme: string) => {
    switch (theme) {
        case 'gradient-1': return 'bg-gradient-1';
        case 'gradient-2': return 'bg-gradient-2';
        case 'gradient-3': return 'bg-gradient-3';
        case 'gradient-4': return 'bg-gradient-4';
        case 'gradient-5': return 'bg-gradient-5';
        case 'gradient-6': return 'bg-gradient-6';
        case 'gradient-7': return 'bg-gradient-7';
        case 'gradient-8': return 'bg-gradient-8';
        case 'gradient-9': return 'bg-gradient-9';
        default: return 'bg-gradient-default';
    }
};

const getCardColors = (theme: string) => {
    switch (theme) {
        case 'gradient-1': return 'bg-purple-900/60';
        case 'gradient-2': return 'bg-red-900/60';
        case 'gradient-3': return 'bg-orange-900/60';
        case 'gradient-4': return 'bg-green-900/60';
        case 'gradient-5': return 'bg-blue-900/60';
        case 'gradient-6': return 'bg-pink-900/60';
        case 'gradient-7': return 'bg-amber-900/60';
        case 'gradient-8': return 'bg-teal-900/60';
        case 'gradient-9': return 'bg-gray-800/60';
        default: return 'bg-slate-900/60';
    }
};

type ProductPageData = {
    catalog: Catalog;
    product: MenuItem & { item_variants: ItemVariant[] };
    categoryName?: string;
    related: MenuItem[];
    images: string[];
};

export default function ClientProductPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const itemId = params?.itemId as string;
    const [data, setData] = useState<ProductPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [unavailable, setUnavailable] = useState(false);
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
            if (!slug || !itemId) return;

            setUnavailable(false);
            const supabase = createClient();

            // 1. Get Catalog
            const { data: catalog } = await supabase
                .from("catalogs")
                .select("*")
                .eq("name", slug)
                .single();

            if (!catalog) {
                setLoading(false);
                return;
            }

            if (catalog.logo_url) {
                sessionStorage.setItem(`store_logo_${slug}`, catalog.logo_url);
                setLogoUrl(catalog.logo_url);
            }

            const subscriptionStatus = checkSubscriptionStatus(catalog as Catalog);
            if (!subscriptionStatus.isActive) {
                setStoreClosed(true);
                setLoading(false);
                return;
            }

            const isUnlimited = isUnlimitedPlan(catalog as Catalog);
            let entitledProductIds: Set<number> | null = null;

            if (!isUnlimited) {
                const [{ data: categories }, { data: products }] = await Promise.all([
                    supabase
                        .from("categories")
                        .select("id, created_at")
                        .eq("catalog_id", catalog.id),
                    supabase
                        .from("menu_items")
                        .select("id, category_id, created_at, is_hidden")
                        .eq("catalog_id", catalog.id),
                ]);

                const categoryEntitlement = getPlanEntitlement(categories || [], FREE_PLAN_MAX_CATEGORIES, false);
                const productEntitlement = getPlanEntitlement(products || [], FREE_PLAN_MAX_PRODUCTS, false);
                const productSummary = (products || []).find((item: any) => String(item.id) === String(itemId));
                entitledProductIds = productEntitlement.entitledIds;

                if (
                    !productSummary ||
                    !productEntitlement.isEntitled(productSummary.id) ||
                    !categoryEntitlement.isEntitled(productSummary.category_id) ||
                    productSummary.is_hidden
                ) {
                    setUnavailable(true);
                    setLoading(false);
                    return;
                }
            }

            // 2. Get Product
            const { data: product } = await supabase
                .from("menu_items")
                .select("*")
                .eq("id", itemId)
                .eq("catalog_id", catalog.id)
                .single();

            if (!product) {
                setLoading(false);
                return;
            }

            // 3. Get Variants
            const { data: variants } = await supabase
                .from("item_variants")
                .select("*")
                .eq("menu_item_id", product.id)
                .order('price', { ascending: true });

            // 4. Get Images
            const { data: productImages } = await supabase
                .from("product_images")
                .select("image_url")
                .eq("menu_item_id", product.id)
                .order('created_at', { ascending: true });

            const dbImages = productImages ? productImages.map((i: { image_url: string }) => i.image_url) : [];
            let images: string[] = [];
            if (dbImages.length > 0) {
                if (product.image_url && !dbImages.includes(product.image_url)) {
                    images = [product.image_url, ...dbImages];
                } else {
                    images = dbImages;
                }
            } else {
                images = product.image_url ? [product.image_url] : [];
            }

            // 5. Get Category Name
            const { data: category } = await supabase
                .from("categories")
                .select("name")
                .eq("id", product.category_id)
                .maybeSingle();

            // 6. Get Related (filtered by entitlement for non-pro)
            const { data: related } = await supabase
                .from("menu_items")
                .select("*")
                .eq("catalog_id", catalog.id)
                .eq("category_id", product.category_id)
                .neq("id", product.id)
                .order('created_at', { ascending: false });

            const visibleRelated = entitledProductIds
                ? (related || []).filter((item: any) => entitledProductIds?.has(item.id)).slice(0, 4)
                : (related || []).slice(0, 4);

            setData({
                catalog: getEffectiveCatalogSettings(catalog as Catalog),
                product: { ...product, item_variants: variants || [] },
                categoryName: category?.name ?? undefined,
                related: visibleRelated,
                images,
            });
            setLoading(false);
        }
        fetchData();
    }, [slug, itemId]);

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
    if (unavailable) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-default px-4 text-center">
                <div className="max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                    <h1 className="text-2xl font-black text-foreground">المنتج غير متاح حاليًا</h1>
                    <p className="mt-3 text-sm text-foreground/70">
                        هذا المنتج غير معروض في المتجر الآن. يمكنك الرجوع للمتجر لرؤية المنتجات المتاحة.
                    </p>
                    <Button asChild className="mt-6 rounded-full">
                        <Link href={`/${slug}`}>
                            <ArrowRight className="h-4 w-4" />
                            العودة للمتجر
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }
    if (!data) return <div className="min-h-screen flex items-center justify-center">المنتج غير موجود</div>;

    const { catalog, product, categoryName, related, images } = data;
    const productUrl = `https://${catalog.name}.tagr-online.com/item/${product.id}`;

    const theme = (catalog as any).theme;
    const themeClass = getThemeClass(theme);
    const cardColors = getCardColors(theme);

    return (
        <CartProvider storageKey={`oc_cart_${catalog.name}`}>
            <div className={cn("relative min-h-screen pb-24", themeClass)}>
                <Head
                    faviconUrl={catalog.logo_url || undefined}
                    storeName={`${product.name} | ${catalog.display_name || catalog.name}`}
                />
                <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-10 md:px-6">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <Link
                            href={`/${catalog.name}`}
                            className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80"
                        >
                            <ArrowRight className="h-4 w-4" />
                            العودة للمتجر
                        </Link>
                    </div>

                    <section className="glass-surface grid gap-6 rounded-3xl bg-white/10 p-4 shadow-2xl backdrop-blur-2xl md:grid-cols-[1.15fr_0.85fr] md:p-6">
                        <div className={cn("relative aspect-square overflow-hidden rounded-[1.5rem] border border-white/30 bg-white/10 text-white shadow-[0_20px_55px_rgba(15,23,42,0.4)] md:aspect-auto md:h-[400px]", cardColors)}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent pointer-events-none z-10" />

                            <ProductGallery
                                images={images}
                                productName={product.name}
                                placeholder={
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center z-0">
                                        <Sparkles className="h-10 w-10 text-brand-primary" />
                                        <p className="text-sm">صورة المنتج ستظهر هنا بعد رفعها من لوحة التحكم</p>
                                        <p className="text-xs text-muted-foreground">رابط الصورة: {product.image_url || 'غير متوفر'}</p>
                                    </div>
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    {catalog.display_name}
                                </p>
                                <h1 className="font-headline text-3xl font-extrabold text-foreground md:text-4xl">
                                    {product.name}
                                </h1>
                                {categoryName && (
                                    <p className="text-sm text-foreground/70">
                                        ضمن قسم <span className="text-brand-primary font-semibold">{categoryName}</span>
                                    </p>
                                )}
                            </div>
                            <p className="text-base leading-relaxed text-foreground/80">
                                {product.description ?? "وصف المنتج سيتم إضافته قريبًا لإبراز القصة والنكهة الفريدة."}
                            </p>

                            <ProductActions
                                basePrice={product.price}
                                baseDiscountPrice={product.discount_price}
                                variants={product.item_variants || []}
                                productName={product.name}
                                catalogName={catalog.display_name || catalog.name}
                                catalogPhone={catalog.whatsapp_number}
                                productUrl={productUrl}
                                countryCode={catalog.country_code}
                                directOrderEnabled={catalog.direct_order_enabled ?? true}
                                catalogId={catalog.id}
                                productId={product.id}
                                productImage={product.image_url}
                                shippingRates={catalog.shipping_rates}
                            />
                        </div>
                    </section>

                    {related.length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-headline text-xl font-bold text-foreground">منتجات مقترحة</h2>
                                    <p className="text-sm text-muted-foreground">جرّب منتجات أخرى من نفس التصنيف</p>
                                </div>
                                <Link
                                    href={`/${catalog.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-brand-primary hover:text-brand-primary/80"
                                >
                                    استعرض المتجر كامل
                                </Link>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {related.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/${catalog.name}/item/${item.id}`}
                                        className={cn(
                                            "group flex flex-col rounded-2xl p-3 text-right border border-white/15 bg-white/10 backdrop-blur-md",
                                            "transition-all duration-200 hover:bg-white/15 hover:border-white/25"
                                        )}
                                    >
                                        <div className={cn("relative h-36 overflow-hidden rounded-xl bg-gradient-to-br", cardColors)}>
                                            {item.image_url && item.image_url.trim() !== '' ? (
                                                <RelatedProductImage
                                                    src={item.image_url}
                                                    alt={item.name}
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                                    صورة المنتج
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 space-y-1">
                                            <p className="text-sm font-semibold text-foreground">{item.name}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {item.description ?? "تفاصيل المنتج ستظهر هنا."}
                                            </p>
                                            {item.discount_price !== null && item.discount_price !== undefined && Number(item.discount_price) < Number(item.price) ? (
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <span className="text-[11px] font-bold text-muted-foreground line-through">{formatPrice(item.price, catalog.country_code)}</span>
                                                    <p className="text-base font-black text-brand-accent drop-shadow-sm">{formatPrice(item.discount_price, catalog.country_code)}</p>
                                                </div>
                                            ) : (
                                                <p className="text-base font-black text-brand-accent drop-shadow-sm">{formatPrice(item.price, catalog.country_code)}</p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
                <CartDrawer catalog={catalog} />
                <CartButton />
            </div>
        </CartProvider>
    );
}
