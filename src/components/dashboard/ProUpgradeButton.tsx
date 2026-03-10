"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { isNativeAndroid, purchaseProSubscription } from "@/lib/billing";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_UPGRADE_URL =
  "https://wa.me/201008116452?text=مرحباً، أريد الترقية إلى باقة البرو لمتجري";

interface ProUpgradeButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  children?: React.ReactNode;
}

export function ProUpgradeButton({
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
    setIsLoading(true);
    const { success, error } = await purchaseProSubscription();
    setIsLoading(false);
    if (success) {
      toast({
        title: "تم الاشتراك بنجاح",
        description: "تم تفعيل باقة البرو لمتجرك",
      });
      window.location.reload();
    } else if (error && !error.includes("تم إلغاء")) {
      toast({
        variant: "destructive",
        title: "فشل الشراء",
        description: error,
      });
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
