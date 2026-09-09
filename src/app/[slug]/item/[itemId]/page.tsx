import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import ClientProductPage from "./ClientProductPage";

type Props = {
    params: Promise<{ slug: string; itemId: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tagr-online.com";

// Product data is loaded by the client component from Supabase. Generating the
// page on demand keeps it compatible with Cloudflare Workers / OpenNext where
// ISR and the cookies() helper inside `generateMetadata` are unreliable for
// fully dynamic merchant slugs.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    let storeName = slug;
    let logoUrl: string | null = null;

    // Use the public (cookie-less) Supabase client to avoid the cookies() helper
    // that can throw 500s on Cloudflare Workers when requests come in via the
    // path-based fallback (tagr-online.com/[slug]/item/[itemId]).
    try {
        const supabase = createPublicClient();
        const { data: catalog } = await supabase
            .from("catalogs")
            .select("name, display_name, logo_url")
            .eq("name", slug)
            .maybeSingle();

        storeName = catalog?.display_name || catalog?.name || slug;
        logoUrl = catalog?.logo_url || null;
    } catch (err) {
        console.error("generateMetadata product lookup failed:", err);
    }

    const resolvedLogo = logoUrl
        ? new URL(logoUrl).toString()
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
                url: resolvedLogo,
                width: 512,
                height: 512,
                alt: `${storeName} - المنتج`,
            }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${storeName} | المنتج`,
            description: "تصفح المنتجات والخدمات واطلب الآن.",
            images: [resolvedLogo],
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
