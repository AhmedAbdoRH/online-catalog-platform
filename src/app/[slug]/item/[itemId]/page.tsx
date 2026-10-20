import type { Metadata } from "next";
import { getStorefrontMetadata } from "@/lib/storefront-metadata";
import ClientProductPage from "./ClientProductPage";

type Props = {
    params: Promise<{ slug: string; itemId: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tagr-online.com";

// Product pages use incremental static revalidation.
// Newly created store/product URLs are rendered dynamically on demand via dynamicParams = true.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { storeName, logoUrl } = await getStorefrontMetadata(slug);

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
