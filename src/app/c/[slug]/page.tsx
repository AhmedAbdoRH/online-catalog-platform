import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";
import { ShareButtons } from "@/components/menu/ShareButtons";
import { CatalogData } from "@/lib/types";

type Props = {
  params: { slug: string };
};

async function getCatalogData(slug: string): Promise<CatalogData | null> {
    const supabase = createClient();
    const { data: catalog, error: catalogError } = await supabase
        .from('catalogs')
        .select('*')
        .eq('name', slug)
        .single();
    
    if (catalogError || !catalog) {
        return null;
    }

    const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select(`
            *,
            menu_items ( * )
        `)
        .eq('catalog_id', catalog.id);

    if (categoriesError) {
        console.error("Error fetching categories and items:", categoriesError);
        return { ...catalog, categories: [] };
    }

    return { ...catalog, categories: categories || [] };
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getCatalogData(params.slug);
  if (!data) {
    return {
      title: 'الكتالوج غير موجود',
    };
  }
  return {
    title: `قائمة طعام ${data.name}`,
    description: `تصفح قائمة الطعام الخاصة بـ ${data.name}`,
    openGraph: {
        title: `قائمة طعام ${data.name}`,
        description: `تصفح قائمة الطعام الخاصة بـ ${data.name}`,
        images: [
            {
                url: data.logo_url || '',
                width: 800,
                height: 600,
                alt: `شعار ${data.name}`,
            },
        ],
    },
  };
}

export default async function CatalogPage({ params }: Props) {
  const data = await getCatalogData(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="container mx-auto py-8 text-center">
        {data.logo_url && (
            <Image 
                src={data.logo_url} 
                alt={`شعار ${data.name}`} 
                width={120} 
                height={120}
                className="mx-auto rounded-full object-cover mb-4 shadow-lg border-4 border-white"
            />
        )}
        <h1 className="text-4xl font-bold font-headline text-primary">{data.name}</h1>
        <p className="text-muted-foreground mt-2">مرحباً بك في قائمة طعامنا الرقمية</p>
        <div className="mt-4">
            <ShareButtons catalogName={data.name} />
        </div>
      </header>
      
      <main className="container mx-auto px-4 pb-12">
        {data.categories.length === 0 ? (
            <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">قائمة الطعام فارغة حالياً. يرجى التحقق مرة أخرى قريباً!</p>
            </div>
        ) : (
            data.categories.map((category) => (
                <section key={category.id} id={`category-${category.id}`} className="mb-12">
                    <h2 className="text-3xl font-bold font-headline mb-6 text-secondary-dark">{category.name}</h2>
                    <Separator className="mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {category.menu_items.map((item) => (
                            <Card key={item.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                                {item.image_url && (
                                    <div className="relative h-56 w-full">
                                        <Image src={item.image_url} alt={item.name} layout="fill" objectFit="cover" />
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-xl">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{item.description}</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <p className="text-lg font-bold text-primary">{item.price} ر.س</p>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>
            ))
        )}
      </main>
      <footer className="text-center py-6 border-t">
        <p className="text-sm text-muted-foreground">
            مدعوم بواسطة <a href="/" className="text-primary hover:underline">قائمة طعامي</a>
        </p>
      </footer>
    </div>
  );
}
