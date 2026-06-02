import { Catalog } from "./types";

export type PlanBillingType = 'monthly' | 'yearly';
export type PlanHiddenReason = 'plan_limit';

type PlanLimitedEntity = {
  id: number;
  created_at?: string | null;
};

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

function getPlanEntityTime(entity: PlanLimitedEntity): number {
  if (!entity.created_at) return 0;

  const time = new Date(entity.created_at).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function sortByPlanEntitlement<T extends PlanLimitedEntity>(entities: T[]): T[] {
  return [...entities].sort((a, b) => {
    const timeDiff = getPlanEntityTime(a) - getPlanEntityTime(b);
    if (timeDiff !== 0) return timeDiff;
    return a.id - b.id;
  });
}

export function getPlanEntitlement<T extends PlanLimitedEntity>(
  entities: T[],
  maxFreeItems: number,
  isPro: boolean
) {
  const sorted = sortByPlanEntitlement(entities);
  const entitled = isPro ? sorted : sorted.slice(0, maxFreeItems);
  const entitledIds = new Set(entitled.map((entity) => entity.id));
  const hiddenIds = new Set(sorted.filter((entity) => !entitledIds.has(entity.id)).map((entity) => entity.id));

  return {
    entitledIds,
    hiddenIds,
    isEntitled: (id: number) => entitledIds.has(id),
    hiddenReason: (id: number): PlanHiddenReason | null => (hiddenIds.has(id) ? 'plan_limit' : null),
  };
}

export function getEffectiveCatalogSettings<T extends Catalog>(catalog: T): T {
  if (isProPlan(catalog)) return catalog;

  return {
    ...catalog,
    theme: 'default',
    hide_footer: false,
    direct_order_enabled: false,
  };
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
