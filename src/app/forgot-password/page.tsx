import Link from "next/link"
import { resetPassword } from "@/app/actions/auth"
import { SubmitButton } from "@/components/common/SubmitButton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function ForgotPasswordPage(props: {
  searchParams: Promise<{ message: string }>
}) {
  const searchParams = await props.searchParams;
  const message = searchParams.message;

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">نسيت كلمة المرور</CardTitle>
        <CardDescription>
          أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={resetPassword} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="example@email.com"
              required
            />
          </div>
          
          <SubmitButton pendingText="جاري إرسال الرابط..." className="w-full">
            إرسال رابط إعادة تعيين كلمة المرور
          </SubmitButton>
          
          {message && (
            <div className={`p-3 text-sm rounded-md text-center ${
              message.includes("خطأ") 
                ? "bg-destructive/15 text-destructive" 
                : "bg-emerald-500/15 text-emerald-600"
            }`}>
              {message}
            </div>
          )}
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="underline">
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}