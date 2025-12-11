'use client'

import { useState } from "react"
import Link from "next/link"
import { signup } from "@/app/actions/auth"
import { SubmitButton } from "@/components/common/SubmitButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/PasswordInput"

export function SignupForm({ message }: { message: string }) {
  const [showPhoneSignup, setShowPhoneSignup] = useState(false)

  return (
    <>
      <form action={signup} className="grid gap-4">
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
      
      {!showPhoneSignup ? (
        <div className="mt-2 text-center text-xs text-muted-foreground">
          <button 
            onClick={() => setShowPhoneSignup(true)}
            className="underline"
          >
            إنشاء حساب برقم الهاتف
          </button>
        </div>
      ) : (
        <form action={signup} method="POST" className="grid gap-4 mt-4 pt-4 border-t">
          <input type="hidden" name="loginMethod" value="phone" />
          <h3 className="text-lg font-medium">إنشاء حساب برقم الهاتف</h3>
          
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
          
          <SubmitButton pendingText="جاري إنشاء الحساب..." className="w-full">
            إنشاء حساب
          </SubmitButton>
        </form>
      )}
    </>
  )
}