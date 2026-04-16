import { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import ClientCatalogPage from "./ClientCatalogPage";

type Props = {
  params: Promise<{ slug: string }>;
};

// Simplified and robust metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = 'https://online-catalog.net';
  
  if (!slug || slug === '_') {
    return { title: 'أونلاين كاتلوج' };
  }

  try {
    const supabase = createPublicClient();
    // Using .maybeSingle() instead of .single() to avoid throwing on 0 results
    const { data: catalog } = await supabase
      .from("catalogs")
      .select("display_name, name, slogan, logo_url")
      .eq("name", slug)
      .maybeSingle();

    if (!catalog) {
      return { title: 'المتجر غير موجود' };
    }

    const storeName = catalog.display_name || catalog.name;
    const description = catalog.slogan || `تصفح المنتجات والخدمات في متجر ${storeName}. اطلب الآن عبر الواتساب.`;
    
    const logoUrl = catalog.logo_url || `${baseUrl}/logo.png`;
    const absoluteLogoUrl = logoUrl.startsWith('http') ? logoUrl : `${baseUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;

    return {
      title: catalog.slogan ? `${storeName} | ${catalog.slogan}` : `${storeName} | أونلاين كاتلوج`,
      description,
      openGraph: {
        title: storeName,
        description,
        url: `${baseUrl}/${slug}`,
        images: [{ url: absoluteLogoUrl }],
        locale: 'ar_SA',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: storeName,
        description,
        images: [absoluteLogoUrl],
      },
      icons: {
        icon: absoluteLogoUrl,
      }
    };
  } catch (error) {
    console.error("Metadata error:", error);
    return { title: 'أونلاين كاتلوج' };
  }
}

export async function generateStaticParams() {
  return [{ slug: '_' }];
}

export default async function CatalogPage({ params }: Props) {
  // We await params just to be safe but it's handled in ClientCatalogPage via useParams
  await params;
  return <ClientCatalogPage />;
}
