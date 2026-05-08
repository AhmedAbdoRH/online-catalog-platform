import { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import ClientProductPage from "./ClientProductPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tagr-online.com";
const DEFAULT_OG_IMAGE = "/logo.png";

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

export async function generateStaticParams() {
  return [{ slug: "_", itemId: "_" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, itemId } = await params;

  try {
    const supabase = createPublicClient();

    const { data: product } = await supabase
      .from("menu_items")
      .select("name, description, image_url, catalog_id")
      .eq("id", itemId)
      .single();

    if (!product) {
      return { title: "المنتج غير موجود" };
    }

    const [{ data: catalog }, { data: productImages }] = await Promise.all([
      supabase
        .from("catalogs")
        .select("display_name, name, logo_url")
        .eq("id", product.catalog_id)
        .single(),
      supabase
        .from("product_images")
        .select("image_url")
        .eq("menu_item_id", itemId)
        .order("id", { ascending: true })
        .limit(1),
    ]);

    const storeName = catalog?.display_name || catalog?.name || slug;
    const title = `${product.name} | ${storeName}`;
    const description = product.description || `اطلب ${product.name} الآن من ${storeName}`;
    const productUrl = absoluteUrl(`/${slug}/item/${itemId}`);
    const primaryImage =
      product.image_url ||
      productImages?.[0]?.image_url ||
      catalog?.logo_url ||
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
