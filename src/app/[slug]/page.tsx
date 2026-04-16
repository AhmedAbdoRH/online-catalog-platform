import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ClientCatalogPage from "./ClientCatalogPage";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  if (!slug || slug === '_') {
    return {
      title: 'اونلاين كاتلوج',
    };
  }

  const supabase = await createClient();
  const { data: catalog } = await supabase
    .from("catalogs")
    .select("display_name, name, slogan, logo_url")
    .eq("name", slug)
    .single();

  if (!catalog) {
    return {
      title: 'الكتالوج غير موجود | اونلاين كاتلوج',
    };
  }

  const storeName = catalog.display_name || catalog.name;
  const description = catalog.slogan || `تصفح المنتجات والخدمات في متجر ${storeName}. يمكنك الطلب مباشرة عبر الواتساب.`;
  const logoUrl = catalog.logo_url || 'https://online-catalog.net/logo.png'; // Fallback to platform logo

  return {
    title: {
        absolute: catalog.slogan ? `${storeName} | ${catalog.slogan}` : `${storeName} | اونلاين كاتلوج`,
    },
    description: description,
    openGraph: {
      title: storeName,
      description: description,
      url: `https://online-catalog.net/${slug}`,
      siteName: 'اونلاين كاتلوج',
      images: [
        {
          url: logoUrl,
          width: 800,
          height: 800,
          alt: storeName,
        },
      ],
      locale: 'ar_SA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description: description,
      images: [logoUrl],
    },
    icons: {
        icon: logoUrl,
        apple: logoUrl,
    }
  };
}

export async function generateStaticParams() {
  return [{ slug: '_' }];
}

export default function CatalogPage() {
  return <ClientCatalogPage />;
}
