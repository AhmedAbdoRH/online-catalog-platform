import type { BusinessType } from '@/lib/types';

/**
 * Public storefront domains by business segment.
 *
 * Store catalogs keep the historical host-based storefronts on tagr-online.com.
 * Restaurant / café catalogs use online-catalog.net instead.
 *
 * NOTE: a host-based storefront `{slug}.{domain}` only works when a wildcard
 * DNS record + Cloudflare route (wrangler.toml) exist for that domain.
 */
export const STORE_DOMAIN = 'tagr-online.com';
export const RESTAURANT_DOMAIN = 'online-catalog.net';

/** Backward-compatible alias — prefer STORE_DOMAIN / RESTAURANT_DOMAIN. */
export const CATALOG_DOMAIN = STORE_DOMAIN;

/** Root domains that serve storefront subdomains (checked by the middleware). */
export const ROOT_DOMAINS = [STORE_DOMAIN, RESTAURANT_DOMAIN] as const;

/** Hostnames that must never be treated as a store slug, on any root domain. */
export const RESERVED_SUBDOMAINS = ['www', 'app', 'admin', 'api'] as const;

/** Domain that hosts the catalog's public storefront. */
export function getDomainForBusinessType(
  businessType?: BusinessType | string | null,
): string {
  return businessType === 'restaurant' ? RESTAURANT_DOMAIN : STORE_DOMAIN;
}

/** Display label including the leading dot, e.g. ".online-catalog.net". */
export function getDomainLabel(
  businessType?: BusinessType | string | null,
): string {
  return `.${getDomainForBusinessType(businessType)}`;
}

/** Full public storefront URL, e.g. https://1012345678.online-catalog.net */
export function getStoreUrl(
  slug: string,
  businessType?: BusinessType | string | null,
): string {
  return `https://${slug}.${getDomainForBusinessType(businessType)}`;
}

/** Full public product URL, e.g. https://1012345678.online-catalog.net/item/42 */
export function getItemUrl(
  slug: string,
  itemId: string | number,
  businessType?: BusinessType | string | null,
): string {
  return `${getStoreUrl(slug, businessType)}/item/${itemId}`;
}
