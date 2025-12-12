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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">إنشاء حساب</CardTitle>
          <CardDescription>
            أنشئ حسابك الجديد للبدء
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm message={message || ""} />
        </CardContent>
      </Card>
    </div>
  )
}