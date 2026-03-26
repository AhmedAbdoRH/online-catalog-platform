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
  planType?: "monthly" | "yearly";
}

export function ProUpgradeButton({
  catalogId,
  className = "",
  size = "default",
  variant = "default",
  planType = "monthly",
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
    console.log(`🔄 بدء عملية الشراء (${planType})...`);
    const { success, purchaseToken, error } = await purchaseProSubscription(planType);
    console.log("📱 نتيجة الشراء:", { success, hasPurchaseToken: !!purchaseToken, error });
    if (success && purchaseToken) {
      console.log("🔄 جاري التحقق من الاشتراك...", { purchaseToken: purchaseToken.substring(0, 20) + "...", catalogId });
      const productId = planType === 'yearly' ? 'pro_yearly' : 'pro_monthly';
      const result = await verifyAndActivatePro(purchaseToken, catalogId, productId);
      setIsLoading(false);
      console.log("✅ نتيجة التحقق:", result);
      if (result.ok) {
        // Log Facebook Purchase event
        if (typeof window !== 'undefined' && (window as any).fbq) {
          let value = 0;
          let currency = 'SAR';
          
          if (planType === 'yearly') {
            if (result.country_code === '+20') {
              value = 2200;
              currency = 'EGP';
            } else if (result.country_code === '+971') {
              value = 399;
              currency = 'AED';
            } else {
              value = 399;
              currency = 'SAR';
            }
          } else {
            // Monthly
            if (result.country_code === '+20') {
              value = 350;
              currency = 'EGP';
            } else if (result.country_code === '+971') {
              value = 49;
              currency = 'AED';
            } else {
              value = 49;
              currency = 'SAR';
            }
          }
          
          (window as any).fbq('track', 'Purchase', {
            value: value,
            currency: currency,
            content_name: planType === 'yearly' ? 'Pro Yearly Subscription' : 'Pro Monthly Subscription',
            content_category: 'Subscription',
            content_ids: [planType === 'yearly' ? 'pro_yearly' : 'pro_monthly'],
          });
          console.log(`✅ تم تسجيل حدث الشراء في فيسبوك: ${value} ${currency} (${planType})`);
        }

        toast({
          title: "تم الاشتراك بنجاح",
          description: "تم تفعيل باقة البرو لمتجرك",
        });
        window.location.reload();
      } else {
        let errMsg = result.error || "حدث خطأ غير متوقع. تواصل مع الدعم.";
        
        toast({
          variant: "destructive",
          title: "فشل التفعيل",
          description: errMsg,
        });
      }
    } else if (success) {
      console.error("⚠️ تم الشراء لكن لا يوجد purchaseToken");
      toast({
        variant: "destructive",
        title: "تم الشراء",
        description: "لم يتوفر رمز التحقق، تواصل مع الدعم.",
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
      if (error && !error.includes("تم إلغاء")) {
        console.error("❌ خطأ في الشراء:", error);
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
        {isLoading ? "جاري المعالجة..." : `اشتراك ${planType === 'yearly' ? 'سنوي' : 'شهري'} عبر Google`}
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
