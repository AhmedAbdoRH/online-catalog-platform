import ClientCatalogPage from "./ClientCatalogPage";

type Props = {
  params: Promise<{ slug: string }>;
};

// The storefront data is loaded by ClientCatalogPage from Supabase in the browser.
// Keep the server shell cacheable instead of querying Supabase for metadata on every request.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function CatalogPage({ params }: Props) {
  // The client component reads the slug through useParams. Awaiting params keeps
  // compatibility with the current App Router params contract.
  await params;
  return <ClientCatalogPage />;
}
