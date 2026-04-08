export type PlanBillingType = 'monthly' | 'yearly';

export const FREE_PLAN_MAX_PRODUCTS = 25;
export const FREE_PLAN_MAX_CATEGORIES = 5;

export const PRO_MONTHLY_PRICE_EGP = 350;
export const PRO_YEARLY_PRICE_EGP = 3200;

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
