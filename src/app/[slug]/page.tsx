import type { Metadata } from "next";
import { getStorefrontMetadata } from "@/lib/storefront-metadata";
import ClientCatalogPage from "./ClientCatalogPage";

type Props = {
    params: Promise<{ slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tagr-online.com";

// Storefront pages use incremental static revalidation.
// Newly created store URLs are rendered dynamically on demand via dynamicParams = true.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { storeName, slogan, logoUrl } = await getStorefrontMetadata(slug);

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
