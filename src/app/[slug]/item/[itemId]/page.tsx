import { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import ClientProductPage from "./ClientProductPage";
import {
  FREE_PLAN_MAX_CATEGORIES,
  FREE_PLAN_MAX_PRODUCTS,
  getPlanEntitlement,
  isProPlan,
} from "@/lib/plans";
import type { Catalog } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tagr-online.com";
const DEFAULT_OG_IMAGE = "/logo.png";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string; itemId: string }>;
};

function absoluteUrl(value: string | null | undefined, baseUrl = SITE_URL) {
  if (!value) return undefined;

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, itemId } = await params;

  try {
    const supabase = createPublicClient();

    const { data: product } = await supabase
      .from("menu_items")
      .select("id, name, description, image_url, catalog_id, category_id, created_at")
      .eq("id", itemId)
      .single();

    if (!product) {
      return { title: "المنتج غير موجود" };
    }

    const { data: catalog } = await supabase
      .from("catalogs")
      .select("id, display_name, name, logo_url, plan, plan_expires_at")
      .eq("id", product.catalog_id)
      .eq("name", slug)
      .single();

    if (!catalog) {
      return { title: "المنتج غير موجود" };
    }

    if (!isProPlan(catalog as Catalog)) {
      const [{ data: categories }, { data: products }] = await Promise.all([
        supabase
          .from("categories")
          .select("id, created_at")
          .eq("catalog_id", catalog.id),
        supabase
          .from("menu_items")
          .select("id, category_id, created_at")
          .eq("catalog_id", catalog.id),
      ]);

      const categoryEntitlement = getPlanEntitlement(categories || [], FREE_PLAN_MAX_CATEGORIES, false);
      const productEntitlement = getPlanEntitlement(products || [], FREE_PLAN_MAX_PRODUCTS, false);

      if (!productEntitlement.isEntitled(product.id) || !categoryEntitlement.isEntitled(product.category_id)) {
        return {
          title: "المنتج غير متاح حاليًا",
          description: "هذا المنتج غير متاح للعرض حاليًا.",
        };
      }
    }

    const { data: productImages } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("menu_item_id", itemId)
      .order("id", { ascending: true })
      .limit(1);

    const storeName = catalog.display_name || catalog.name || slug;
    const title = `${product.name} | ${storeName}`;
    const description = product.description || `اطلب ${product.name} الآن من ${storeName}`;
    const productUrl = absoluteUrl(`/${slug}/item/${itemId}`);
    const primaryImage =
      product.image_url ||
      productImages?.[0]?.image_url ||
      catalog.logo_url ||
      DEFAULT_OG_IMAGE;
    const imageUrl = absoluteUrl(primaryImage);
    const images = imageUrl
      ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ]
      : [];

    return {
      metadataBase: new URL(SITE_URL),
      title,
      description,
      alternates: productUrl
        ? {
            canonical: productUrl,
          }
        : undefined,
      openGraph: {
        title,
        description,
        url: productUrl,
        images,
        siteName: storeName,
        locale: "ar_SA",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "المنتج",
    };
  }
}

export default async function ProductPage({ params }: Props) {
  await params;
  return <ClientProductPage />;
}
