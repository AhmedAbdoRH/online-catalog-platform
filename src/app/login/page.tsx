'use client'

import Link from "next/link"
import Image from "next/image"
import { LoginForm } from "./components/LoginForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || ''
  const [showEmailForm, setShowEmailForm] = useState(false)

  const handleLogoDoubleClick = () => {
    setShowEmailForm(!showEmailForm)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <Card className="mx-auto max-w-md w-full shadow-lg border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div 
              className="relative h-16 w-16 cursor-pointer select-none"
              onDoubleClick={handleLogoDoubleClick}
            >
              <Image
                src="/mainlogo.png"
                alt="Online Catalog"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">مرحباً بعودتك</CardTitle>
            <CardDescription className="mt-2">
              سجل دخولك للوصول إلى لوحة التحكم
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <LoginForm 
            message={message} 
            showEmailForm={showEmailForm}
          />
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              إنشاء حساب جديد
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
