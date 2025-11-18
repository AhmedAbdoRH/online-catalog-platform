import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";
import { ShareButtons } from "@/components/menu/ShareButtons";
import type { Catalog, Category, MenuItem, CategoryWithSubcategories } from "@/lib/types";

type Props = {
  params: { slug: string };
};

type CatalogPageData = Catalog & {
  categories: CategoryWithSubcategories[];
};

async function getCatalogData(slug: string): Promise<CatalogPageData | null> {
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

    const categoriesMap = new Map<number, CategoryWithSubcategories>();
    const rootCategories: CategoryWithSubcategories[] = [];

    categories?.forEach(category => {
        categoriesMap.set(category.id, { ...category, subcategories: [], menu_items: category.menu_items || [] });
    });

    categories?.forEach(category => {
        const categoryNode = categoriesMap.get(category.id)!;
        if (category.parent_id && categoriesMap.has(category.parent_id)) {
            categoriesMap.get(category.parent_id)!.subcategories.push(categoryNode);
        } else {
            rootCategories.push(categoryNode);
        }
    });

    return { ...catalog, categories: rootCategories };
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

function MenuItemCard({ item }: { item: MenuItem }) {
    return (
        <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
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
    );
}

function CategorySection({ category, isSubcategory = false }: { category: CategoryWithSubcategories, isSubcategory?: boolean }) {
    const hasItems = category.menu_items.length > 0;
    const hasSubcategories = category.subcategories.length > 0;

    if (!hasItems && !hasSubcategories) return null;

    return (
        <section id={`category-${category.id}`} className={isSubcategory ? "mb-8 mt-8" : "mb-12"}>
            <h2 className={isSubcategory ? "text-2xl font-semibold mb-4" : "text-3xl font-bold font-headline mb-6"}>
                {category.name}
            </h2>
            {isSubcategory && <Separator className="mb-6" />}
            
            {hasItems && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.menu_items.map((item) => <MenuItemCard key={item.id} item={item} />)}
                </div>
            )}

            {hasSubcategories && (
                <div className={hasItems ? "mt-12" : ""}>
                    {category.subcategories.map(subCategory => (
                        <CategorySection key={subCategory.id} category={subCategory} isSubcategory={true} />
                    ))}
                </div>
            )}

        </section>
    );
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
                <div key={category.id}>
                    <CategorySection category={category} />
                    <Separator className="my-12" />
                </div>
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
