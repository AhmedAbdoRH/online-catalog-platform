import Link from "next/link"
import { SignupForm } from "./components/SignupForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function SignupPage(props: {
  searchParams: Promise<{ message: string }>
}) {
  const searchParams = await props.searchParams;
  const message = searchParams.message;

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">إنشاء حساب</CardTitle>
        <CardDescription>
          أدخل البريد الإلكتروني وكلمة المرور لإنشاء حساب جديد
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm message={message || ""} />
        
        <div className="mt-4 text-center text-sm">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="underline">
            تسجيل الدخول
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}