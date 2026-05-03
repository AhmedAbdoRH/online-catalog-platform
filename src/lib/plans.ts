import { Catalog } from "./types";

export type PlanBillingType = 'monthly' | 'yearly';

export const FREE_PLAN_MAX_PRODUCTS = 25;
export const FREE_PLAN_MAX_CATEGORIES = 5;

export function isProPlan(catalog: Catalog | null | undefined): boolean {
  if (!catalog || !catalog.plan) return false;
  
  const plan = catalog.plan.toLowerCase();
  const isPro = plan === 'pro' || plan === 'pro-trial' || plan === 'business';
  
  if (!isPro) return false;
  
  // If there's an expiration date, check it
  if (catalog.plan_expires_at) {
    const expiryDate = new Date(catalog.plan_expires_at);
    const now = new Date();
    return now < expiryDate;
  }
  
  // If no expiration date is set, assume it's active (manually set by admin or lifetime)
  return true;
}

export const PRO_MONTHLY_ORIGINAL_PRICE_EGP = 350;
export const PRO_MONTHLY_PRICE_EGP = 250;
export const PRO_YEARLY_ORIGINAL_PRICE_EGP = 3200;
export const PRO_YEARLY_PRICE_EGP = 3000;

export function formatPlanPrice(price: number): string {
  return `${price} ج.م`;
}

export function getProPlanPrice(type: PlanBillingType): number {
  return type === 'yearly' ? PRO_YEARLY_PRICE_EGP : PRO_MONTHLY_PRICE_EGP;
}

export function getProPlanLabel(type: PlanBillingType): string {
  return type === 'yearly' ? 'سنوياً' : 'شهرياً';
}

export function getProWhatsAppText(type: PlanBillingType): string {
  const price = formatPlanPrice(getProPlanPrice(type));
  const period = getProPlanLabel(type);

  return `مرحباً، أريد الاشتراك في باقة البرو (${price} ${period}) لمتجري`;
}
