import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ClientProductPage from "./ClientProductPage";

type Props = {
  params: Promise<{ slug: string; itemId: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tagr-online.com";

// Product data is loaded by ClientProductPage from Supabase in the browser.
// Keep the server shell cacheable and avoid three Supabase reads per product request.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: catalog } = await supabase
    .from("catalogs")
    .select("name, display_name, logo_url")
    .eq("name", slug)
    .maybeSingle();

  const storeName = catalog?.display_name || catalog?.name || slug;
  const logoUrl = catalog?.logo_url
    ? new URL(catalog.logo_url).toString()
    : new URL("/logo.png", SITE_URL).toString();

  return {
    title: `${storeName} | المنتج`,
    description: "تصفح المنتجات والخدمات واطلب الآن.",
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: `${SITE_URL}/${slug}`,
      title: `${storeName} | المنتج`,
      description: "تصفح المنتجات والخدمات واطلب الآن.",
      siteName: "تاجر أونلاين",
      images: [{
        url: logoUrl,
        width: 512,
        height: 512,
        alt: `${storeName} - المنتج`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${storeName} | المنتج`,
      description: "تصفح المنتجات والخدمات واطلب الآن.",
      images: [logoUrl],
    },
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function ProductPage({ params }: Props) {
  // The client component reads slug and itemId through useParams.
  await params;
  return <ClientProductPage />;
}
