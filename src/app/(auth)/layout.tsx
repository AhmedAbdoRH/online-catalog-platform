import Header from "@/components/common/Header";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  
  return (
    <>
    <Header user={data.user} />
    <main className="flex items-center justify-center py-12 px-4">
      {children}
    </main>
    </>
  );
}
