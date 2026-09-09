import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import ClientCatalogPage from "./ClientCatalogPage";

type Props = {
    params: Promise<{ slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tagr-online.com";

// The catalog and its product data are loaded by the client component from
// Supabase. Generating the page on demand keeps it compatible with Cloudflare
// Workers / OpenNext where ISR and the cookies() helper inside `generateMetadata`
// are unreliable for fully dynamic merchant slugs.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    let storeName = slug;
    let slogan = "كتالوج إلكتروني";
    let logoUrl: string | null = null;

    // Use the public (cookie-less) Supabase client. The previous server client
    // called `cookies()` which can throw 500s on Cloudflare Workers when the
    // request comes in via the path-based fallback (tagr-online.com/[slug]).
    try {
        const supabase = createPublicClient();
        const { data: catalog } = await supabase
            .from("catalogs")
            .select("name, display_name, slogan, logo_url")
            .eq("name", slug)
            .maybeSingle();

        storeName = catalog?.display_name || catalog?.name || slug;
        slogan = catalog?.slogan || slogan;
        logoUrl = catalog?.logo_url || null;
    } catch (err) {
        // If the lookup fails we still want the page to render with safe defaults.
        console.error("generateMetadata slug lookup failed:", err);
    }

    const resolvedLogo = logoUrl
        ? new URL(logoUrl).toString()
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
                url: resolvedLogo,
                width: 512,
                height: 512,
                alt: `${storeName} - متجر`,
            }],
        },
        twitter: {
            card: "summary_large_image",
            title: storeName,
            description: slogan,
            images: [resolvedLogo],
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
