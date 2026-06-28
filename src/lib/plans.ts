import { Catalog } from "./types";

export type PlanBillingType = 'monthly' | 'yearly';
export type PlanHiddenReason = 'plan_limit';

type PlanLimitedEntity = {
  id: number;
  created_at?: string | null;
};

export const FREE_PLAN_MAX_PRODUCTS = 25;
export const FREE_PLAN_MAX_CATEGORIES = 5;

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  trialStartedAt: string | null;
  planExpiresAt: string | null;
  isTrial: boolean;
  isGrace: boolean;
  isExpired: boolean;
  isNotStarted: boolean;
  isLegacyBasic: boolean;
  remainingDays: number;
}

export function checkSubscriptionStatus(catalog: Catalog | null | undefined): SubscriptionStatus {
  const defaultStatus: SubscriptionStatus = {
    isActive: false,
    plan: 'basic',
    trialStartedAt: null,
    planExpiresAt: null,
    isTrial: false,
    isGrace: false,
    isExpired: false,
    isNotStarted: true,
    isLegacyBasic: false,
    remainingDays: 0,
  };

  if (!catalog) return defaultStatus;

  const plan = (catalog.plan || 'basic').toLowerCase();
  const trialStartedAt = catalog.trial_started_at || null;
  const planExpiresAt = catalog.plan_expires_at || null;
  const isLegacyBasic = catalog.is_legacy_basic || false;


  // 1. If user is subscribed (legacy 'pro', 'business' or new 'subscribed')
  const isSubscribedPlan = plan === 'subscribed' || plan === 'pro' || plan === 'business';
  
  if (isSubscribedPlan) {
    if (planExpiresAt) {
      const expiryDate = new Date(planExpiresAt);
      const now = new Date();
      if (now < expiryDate) {
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          isActive: true,
          plan,
          trialStartedAt,
          planExpiresAt,
          isTrial: false,
          isGrace: false,
          isExpired: false,
          isNotStarted: false,
          isLegacyBasic: false,
          remainingDays: diffDays,
        };
      } else {
        return {
          isActive: false,
          plan,
          trialStartedAt,
          planExpiresAt,
          isTrial: false,
          isGrace: false,
          isExpired: true,
          isNotStarted: false,
          isLegacyBasic: false,
          remainingDays: 0,
        };
      }
    } else {
      // Admin manually set subscription to lifetime
      return {
        isActive: true,
        plan,
        trialStartedAt,
        planExpiresAt: null,
        isTrial: false,
        isGrace: false,
        isExpired: false,
        isNotStarted: false,
        isLegacyBasic: false,
        remainingDays: 9999,
      };
    }
  }

  // 2. If user is not subscribed (plan is 'basic' or anything else), check trial status
  if (!trialStartedAt) {
    // Legacy basic users are active with product limits
    if (isLegacyBasic) {
      return {
        isActive: true,
        plan,
        trialStartedAt: null,
        planExpiresAt,
        isTrial: false,
        isGrace: false,
        isExpired: false,
        isNotStarted: false,
        isLegacyBasic: true,
        remainingDays: 9999,
      };
    }
    
    // New users need to start trial
    return {
      isActive: false,
      plan,
      trialStartedAt: null,
      planExpiresAt,
      isTrial: false,
      isGrace: false,
      isExpired: false,
      isNotStarted: true,
      isLegacyBasic: false,
      remainingDays: 30,
    };
  }

  const startDate = new Date(trialStartedAt);
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays < 30) {
    const remaining = Math.ceil(30 - diffDays);
    return {
      isActive: true,
      plan,
      trialStartedAt,
      planExpiresAt,
      isTrial: true,
      isGrace: false,
      isExpired: false,
      isNotStarted: false,
      isLegacyBasic: false,
      remainingDays: remaining,
    };
  } else if (diffDays < 40) {
    const remaining = Math.ceil(40 - diffDays);
    return {
      isActive: true,
      plan,
      trialStartedAt,
      planExpiresAt,
      isTrial: false,
      isGrace: true,
      isExpired: false,
      isNotStarted: false,
      isLegacyBasic: false,
      remainingDays: remaining,
    };
  } else {
    return {
      isActive: false,
      plan,
      trialStartedAt,
      planExpiresAt,
      isTrial: false,
      isGrace: false,
      isExpired: true,
      isNotStarted: false,
      isLegacyBasic: false,
      remainingDays: 0,
    };
  }
}

export function isProPlan(catalog: Catalog | null | undefined): boolean {
  return checkSubscriptionStatus(catalog).isActive;
}

export function isUnlimitedPlan(catalog: Catalog | null | undefined): boolean {
  const status = checkSubscriptionStatus(catalog);
  // Unlimited if: subscribed, in trial, or in grace period
  // Legacy basic users have limits (25 products, 5 categories)
  return status.isActive && !status.isLegacyBasic;
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

  return `مرحباً، أريد تفعيل الاشتراك في أونلاين كتالوج (${price} ${period}) لمتجري`;
}
