import Link from "next/link"
import { LoginForm } from "./components/LoginForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function LoginPage(props: {
  searchParams: Promise<{ message: string }>
}) {
  const searchParams = await props.searchParams;
  const message = searchParams.message;

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
        <CardDescription>
          أدخل البريد الإلكتروني وكلمة المرور للدخول إلى حسابك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm message={message || ""} />
        
        <div className="mt-4 text-center text-sm">
          ليس لديك حساب؟{" "}
          <Link href="/signup" className="underline">
            إنشاء حساب
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}