import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ClientCatalogPage from "./ClientCatalogPage";

type Props = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tagr-online.com";

// The storefront data is loaded by ClientCatalogPage from Supabase in the browser.
// Keep the server shell cacheable instead of querying Supabase for metadata on every request.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: catalog } = await supabase
    .from("catalogs")
    .select("name, display_name, slogan, logo_url")
    .eq("name", slug)
    .maybeSingle();

  const storeName = catalog?.display_name || catalog?.name || slug;
  const slogan = catalog?.slogan || "كتالوج إلكتروني";
  const logoUrl = catalog?.logo_url
    ? new URL(catalog.logo_url).toString()
    : new URL("/logo.png", SITE_URL).toString();

  return {
    title: storeName,
    description: slogan,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: `${SITE_URL}/${slug}`,
      title: storeName,
      description: slogan,
      siteName: "تاجر أونلاين",
      images: [{
        url: logoUrl,
        width: 512,
        height: 512,
        alt: `${storeName} - متجر`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: storeName,
      description: slogan,
      images: [logoUrl],
    },
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function CatalogPage({ params }: Props) {
  // The client component reads the slug through useParams. Awaiting params keeps
  // compatibility with the current App Router params contract.
  await params;
  return <ClientCatalogPage />;
}
