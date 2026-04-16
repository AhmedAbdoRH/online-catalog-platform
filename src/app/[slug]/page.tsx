import { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import ClientCatalogPage from "./ClientCatalogPage";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = 'https://online-catalog.net';
  
  if (!slug || slug === '_') {
    return {
      title: 'اونلاين كاتلوج',
    };
  }

  try {
    const supabase = createPublicClient();
    const { data: catalog, error } = await supabase
      .from("catalogs")
      .select("display_name, name, slogan, logo_url")
      .eq("name", slug)
      .single();

    if (error || !catalog) {
      return {
        title: 'أونلاين كاتلوج',
      };
    }

    const storeName = catalog.display_name || catalog.name;
    const description = catalog.slogan || `تصفح المنتجات والخدمات في متجر ${storeName}. اطلب الآن عبر الواتساب.`;
    
    // Ensure absolute URL for social preview
    let logoUrl = catalog.logo_url;
    if (!logoUrl) {
      logoUrl = `${baseUrl}/logo.png`;
    } else if (!logoUrl.startsWith('http')) {
      logoUrl = `${baseUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
    }

    return {
      title: {
        absolute: catalog.slogan ? `${storeName} | ${catalog.slogan}` : `${storeName} | اونلاين كاتلوج`,
      },
      description,
      openGraph: {
        title: storeName,
        description,
        url: `${baseUrl}/${slug}`,
        siteName: 'اونلاين كاتلوج',
        images: [
          {
            url: logoUrl,
            width: 600,
            height: 600,
            alt: storeName,
          },
        ],
        locale: 'ar_SA',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: storeName,
        description,
        images: [logoUrl],
      },
      icons: {
        icon: logoUrl,
        apple: logoUrl,
      }
    };
  } catch (err) {
    console.error("Metadata error:", err);
    return {
      title: 'أونلاين كاتلوج',
    };
  }
}

export async function generateStaticParams() {
  return [{ slug: '_' }];
}

export default function CatalogPage() {
  return <ClientCatalogPage />;
}
