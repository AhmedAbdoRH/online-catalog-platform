/**
 * خدمة Google Play Billing لتطبيق Android
 * للاشتراك في باقة البرو عبر التطبيق
 */

import { Capacitor } from '@capacitor/core';

// معرف المنتج في Google Play Console - قم بتعديله بعد إنشاء الاشتراك
export const PRO_SUBSCRIPTION_ID = 'pro_yearly';
export const PRO_BASE_PLAN_ID = 'yearly-plan'; 

export const PRO_MONTHLY_ID = 'pro_monthly';
export const PRO_MONTHLY_BASE_PLAN_ID = 'monthly-plan'; 

export type SubscriptionType = 'monthly' | 'yearly';

function getSubscriptionProductIdentifier(type: SubscriptionType): string {
  return type === 'yearly' ? PRO_SUBSCRIPTION_ID : PRO_MONTHLY_ID;
}

function getSubscriptionBasePlanIdentifier(type: SubscriptionType): string {
  return type === 'yearly' ? PRO_BASE_PLAN_ID : PRO_MONTHLY_BASE_PLAN_ID;
}

export function isNativeAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  const urlParams = window.location.search;
  if (urlParams.includes('native_android=1')) {
    try { sessionStorage.setItem('native_android', '1'); } catch { /* ignore */ }
    return true;
  }
  if (sessionStorage.getItem('native_android') === '1') return true;
  try {
    return Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

async function getNativePurchases() {
  const { NativePurchases, PURCHASE_TYPE } = await import('@capgo/native-purchases');
  return { NativePurchases, PURCHASE_TYPE };
}

export async function isBillingSupported(): Promise<boolean> {
  if (!isNativeAndroid()) return false;
  try {
    const { NativePurchases } = await getNativePurchases();
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    return isBillingSupported;
  } catch {
    return false;
  }
}

export async function getProProduct(type: SubscriptionType = 'monthly') {
  if (!isNativeAndroid()) return null;
  try {
    const { NativePurchases, PURCHASE_TYPE } = await getNativePurchases();
    const { products } = await NativePurchases.getProducts({
      productIdentifiers: [getSubscriptionProductIdentifier(type)],
      productType: PURCHASE_TYPE.SUBS,
    });
    return products?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function purchaseProSubscription(type: SubscriptionType = 'monthly'): Promise<{
  success: boolean;
  purchaseToken?: string;
  error?: string;
}> {
  if (!isNativeAndroid()) {
    return { success: false, error: 'Billing متاح فقط في تطبيق Android' };
  }
  try {
    const { NativePurchases, PURCHASE_TYPE } = await getNativePurchases();
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) {
      return { success: false, error: 'الدفع غير متاح على هذا الجهاز' };
    }

    const productId = getSubscriptionProductIdentifier(type);
    const planId = getSubscriptionBasePlanIdentifier(type);

    const transaction = await NativePurchases.purchaseProduct({
      productIdentifier: productId,
      planIdentifier: planId,
      productType: PURCHASE_TYPE.SUBS,
      quantity: 1,
    });

    const purchaseToken =
      (transaction as { purchaseToken?: string })?.purchaseToken ?? undefined;
    return { success: true, purchaseToken };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('cancelled') || msg.includes('canceled') || msg.includes('USER_CANCELED')) {
      return { success: false, error: 'تم إلغاء الشراء' };
    }
    return { success: false, error: msg || 'حدث خطأ أثناء الشراء' };
  }
}

export async function restorePurchases(): Promise<{ hasPro: boolean }> {
  if (!isNativeAndroid()) return { hasPro: false };
  try {
    const { NativePurchases, PURCHASE_TYPE } = await getNativePurchases();
    await NativePurchases.restorePurchases();
    const { purchases } = await NativePurchases.getPurchases({
      productType: PURCHASE_TYPE.SUBS,
    });
    const activeProductIdentifiers = [PRO_SUBSCRIPTION_ID, PRO_MONTHLY_ID];
    const hasPro = purchases.some(
      (p) =>
        activeProductIdentifiers.includes(p.productIdentifier) &&
        (p.isActive || ['PURCHASED', '1'].includes(p.purchaseState ?? '')) &&
        p.isAcknowledged
    );
    return { hasPro };
  } catch {
    return { hasPro: false };
  }
}

export async function openManageSubscriptions(): Promise<void> {
  if (!isNativeAndroid()) return;
  try {
    const { NativePurchases } = await getNativePurchases();
    await NativePurchases.manageSubscriptions();
  } catch {
    // تجاهل
  }
}
