import Link from "next/link"
import { signup } from "@/app/actions/auth"
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
          أدخل معلوماتك لإنشاء حساب جديد
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signup} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" type="password" name="password" required minLength={6} />
          </div>
          <SubmitButton pendingText="جاري إنشاء الحساب..." className="w-full">
            إنشاء حساب
          </SubmitButton>
          {message && (
            <div className="bg-destructive/15 p-3 text-sm text-destructive rounded-md text-center">
              {message}
            </div>
          )}
        </form>
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