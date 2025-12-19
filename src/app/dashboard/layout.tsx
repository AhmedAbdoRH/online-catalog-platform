import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Toaster } from "@/components/ui/toaster";
import { SupportButton } from "@/components/dashboard/SupportButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background relative">
      <DashboardNav user={user} catalog={catalog} />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pr-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
      <SupportButton />
    </div>
  );
}
