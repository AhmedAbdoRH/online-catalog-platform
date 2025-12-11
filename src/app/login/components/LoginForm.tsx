'use client'

import { useState } from "react"
import Link from "next/link"
import { login } from "@/app/actions/auth"
import { SubmitButton } from "@/components/common/SubmitButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/PasswordInput"

export function LoginForm({ message }: { message: string }) {
  const [showPhoneLogin, setShowPhoneLogin] = useState(false)

  return (
    <>
      <form action={login} className="grid gap-4">
        <input type="hidden" name="loginMethod" value="email" />
        
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
        
        <div className="grid gap-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <PasswordInput />
        </div>
        
        <SubmitButton pendingText="جاري تسجيل الدخول..." className="w-full">
          تسجيل الدخول
        </SubmitButton>
        
        {message && (
          <div className="bg-destructive/15 p-3 text-sm text-destructive rounded-md text-center">
            {message}
          </div>
        )}
      </form>
      
      <div className="mt-4 text-center text-sm">
        ليس لديك حساب؟{" "}
        <Link href="/signup" className="underline">
          إنشاء حساب
        </Link>
      </div>
      
      <div className="mt-2 text-center text-sm">
        <Link href="/forgot-password" className="underline text-muted-foreground">
          نسيت كلمة المرور؟
        </Link>
      </div>
      
      {!showPhoneLogin ? (
        <div className="mt-2 text-center text-xs text-muted-foreground">
          <button 
            onClick={() => setShowPhoneLogin(true)}
            className="underline"
          >
            تسجيل الدخول برقم الهاتف
          </button>
        </div>
      ) : (
        <form action={login} className="grid gap-4 mt-4 pt-4 border-t">
          <input type="hidden" name="loginMethod" value="phone" />
          <h3 className="text-lg font-medium">تسجيل الدخول برقم الهاتف</h3>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <div className="flex gap-2">
              <select 
                id="countryCode" 
                name="countryCode" 
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                defaultValue="+20"
              >
                <option value="+20">🇪🇬 +20</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+212">🇲🇦 +212</option>
              </select>
              <Input
                id="phone"
                type="tel"
                name="phone"
                placeholder="01xxxxxxxxx"
                required
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phonePassword">كلمة المرور</Label>
            <Input
              id="phonePassword"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>
          
          <SubmitButton pendingText="جاري تسجيل الدخول..." className="w-full">
            تسجيل الدخول
          </SubmitButton>
        </form>
      )}
    </>
  )
}