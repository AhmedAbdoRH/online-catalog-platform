"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyAndActivatePro } from "@/app/actions/billing";
import { isNativeAndroid, purchaseProSubscription, type SubscriptionType } from "@/lib/billing";
import { useToast } from "@/hooks/use-toast";
import {
  formatPlanPrice,
  getProPlanLabel,
  getProPlanPrice,
  getProWhatsAppText,
} from "@/lib/plans";

function buildWhatsAppUpgradeUrl(planType: SubscriptionType): string {
  return `https://wa.me/201008116452?text=${encodeURIComponent(getProWhatsAppText(planType))}`;
}

interface ProUpgradeButtonProps {
  catalogId?: number;
  planType?: SubscriptionType;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  children?: React.ReactNode;
}

export function ProUpgradeButton({
  catalogId,
  planType = "monthly",
  className = "",
  size = "default",
  variant = "default",
  children,
}: ProUpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const useBilling = isNativeAndroid();
  const periodLabel = getProPlanLabel(planType);
  const priceLabel = formatPlanPrice(getProPlanPrice(planType));

  const defaultChildren = (
    <>
      <MessageCircle className="h-4 w-4 ml-2" />
      {`اطلب باقة البرو ${periodLabel}`}
    </>
  );

  const handleBillingPurchase = async () => {
    if (!catalogId) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "معرف الكتالوج مطلوب",
      });
      return;
    }

    setIsLoading(true);

    const { success, purchaseToken, error } = await purchaseProSubscription(planType);

    if (success && purchaseToken) {
      const result = await verifyAndActivatePro(purchaseToken, catalogId, planType);
      setIsLoading(false);

      if (result.ok) {
        toast({
          title: "تم الاشتراك بنجاح",
          description: `تم تفعيل باقة البرو ${periodLabel} بسعر ${priceLabel}`,
        });
        window.location.reload();
        return;
      }

      let errMsg = result.error || "حدث خطأ غير متوقع. تواصل مع الدعم.";

      if (errMsg === "[object Object]" || !errMsg || errMsg.includes("[object")) {
        errMsg = "حدث خطأ في التفعيل. يرجى المحاولة لاحقاً.";
      }

      toast({
        variant: "destructive",
        title: "فشل التفعيل",
        description: errMsg,
      });
      return;
    }

    setIsLoading(false);

    if (success) {
      toast({
        variant: "destructive",
        title: "تم الشراء",
        description: "لم يتوفر رمز التحقق، تواصل مع الدعم.",
      });
      return;
    }

    if (error && !error.includes("تم إلغاء")) {
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
        {isLoading ? "جاري المعالجة..." : `الاشتراك ${periodLabel} عبر Google`}
      </Button>
    );
  }

  return (
    <Button asChild className={className} size={size} variant={variant}>
      <Link href={buildWhatsAppUpgradeUrl(planType)} target="_blank" rel="noopener noreferrer">
        {children ?? defaultChildren}
      </Link>
    </Button>
  );
}
