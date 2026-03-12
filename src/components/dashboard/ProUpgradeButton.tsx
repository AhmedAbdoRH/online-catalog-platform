"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { isNativeAndroid, purchaseProSubscription } from "@/lib/billing";
import { useToast } from "@/hooks/use-toast";
import { verifyAndActivatePro } from "@/app/actions/billing";

const WHATSAPP_UPGRADE_URL =
  "https://wa.me/201008116452?text=مرحباً، أريد الترقية إلى باقة البرو لمتجري";

interface ProUpgradeButtonProps {
  catalogId?: number;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  children?: React.ReactNode;
}

export function ProUpgradeButton({
  catalogId,
  className = "",
  size = "default",
  variant = "default",
  children = (
    <>
      <MessageCircle className="h-4 w-4 ml-2" />
      طلب الترقية
    </>
  ),
}: ProUpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const useBilling = isNativeAndroid();

  const handleBillingPurchase = async () => {
    if (!catalogId) {
      toast({ variant: "destructive", title: "خطأ", description: "معرف الكتالوج مطلوب" });
      return;
    }
    setIsLoading(true);
    const { success, purchaseToken, error } = await purchaseProSubscription();
    if (success && purchaseToken) {
      const result = await verifyAndActivatePro(purchaseToken, catalogId);
      setIsLoading(false);
      if (result.ok) {
        toast({
          title: "تم الاشتراك بنجاح",
          description: "تم تفعيل باقة البرو لمتجرك",
        });
        window.location.reload();
      } else {
        // معالجة متقدمة لرسالة الخطأ
        let errMsg = "حدث خطأ غير متوقع. تواصل مع الدعم.";
        
        if (typeof result.error === "string" && result.error.length > 0) {
          errMsg = result.error;
        } else if (result.error && typeof result.error === "object") {
          if ("message" in result.error && typeof result.error.message === "string") {
            errMsg = result.error.message;
          } else if ("errorMessage" in result.error && typeof result.error.errorMessage === "string") {
            errMsg = result.error.errorMessage;
          } else {
            errMsg = JSON.stringify(result.error).substring(0, 200);
          }
        }
        
        // تجنب عرض [object Object]
        if (errMsg === "[object Object]" || !errMsg || errMsg.includes("[object")) {
          errMsg = "حدث خطأ في التفعيل. يرجى المحاولة لاحقاً.";
        }
        
        toast({
          variant: "destructive",
          title: "فشل التفعيل",
          description: errMsg,
        });
      }
    } else if (success) {
      toast({
        variant: "destructive",
        title: "تم الشراء",
        description: "لم يتوفر رمز التحقق، تواصل مع الدعم.",
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
      if (error && !error.includes("تم إلغاء")) {
        toast({
          variant: "destructive",
          title: "فشل الشراء",
          description: error,
        });
      }
    }
  };

  if (useBilling) {
    return (
      <Button
        onClick={handleBillingPurchase}
        disabled={isLoading}
        className={`bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 ${className}`}
        size={size}
        variant={variant}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4 ml-2" />
        )}
        {isLoading ? "جاري المعالجة..." : "الاشتراك عبر Google"}
      </Button>
    );
  }

  return (
    <Button asChild className={className} size={size} variant={variant}>
      <Link href={WHATSAPP_UPGRADE_URL} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    </Button>
  );
}
