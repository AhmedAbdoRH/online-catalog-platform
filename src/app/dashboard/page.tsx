import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/dashboard/OnboardingForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { APP_URL } from "@/lib/constants";
import { Clipboard, Eye, Settings } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: catalog, error } = await supabase
    .from("catalogs")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!catalog) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>مرحباً بك في قائمة طعامي!</CardTitle>
            <CardDescription>
              خطوتك الأولى هي إنشاء الكتالوج الخاص بك. الرجاء تعبئة المعلومات التالية للبدء.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  const catalogUrl = `${APP_URL}/c/${catalog.name}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <Button asChild>
          <Link href="/dashboard/settings">
            <Settings className="ml-2 h-4 w-4" />
            إعدادات الكتالوج
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>كتالوجك جاهز!</CardTitle>
          <CardDescription>هذا هو رابط الكتالوج الخاص بك. يمكنك مشاركته مع عملائك.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Link href={catalogUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-primary underline break-all">
            {catalogUrl}
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" asChild>
                <Link href={catalogUrl} target="_blank">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">عرض الكتالوج</span>
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>إدارة الفئات</CardTitle>
                <CardDescription>أضف أو عدّل أو احذف فئات الأصناف في قائمتك.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href="/dashboard/categories">الانتقال إلى الفئات</Link>
                </Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>إدارة المنتجات</CardTitle>
                <CardDescription>أضف أو عدّل أو احذف المنتجات في قائمتك.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href="/dashboard/items">الانتقال إلى المنتجات</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
