import type { Metadata } from "next";
import ClientProductPage from "./ClientProductPage";

type Props = {
  params: Promise<{ slug: string; itemId: string }>;
};

// Product data is loaded by ClientProductPage from Supabase in the browser.
// Keep the server shell cacheable and avoid three Supabase reads per product request.
export const metadata: Metadata = {
  title: "تاجر أونلاين",
  description: "تصفح المنتجات والخدمات واطلب الآن.",
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function ProductPage({ params }: Props) {
  // The client component reads slug and itemId through useParams.
  await params;
  return <ClientProductPage />;
}
