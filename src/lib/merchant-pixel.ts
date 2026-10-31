/**
 * Per-merchant Meta (Facebook) Pixel helpers.
 *
 * Merchants can paste their own Pixel ID in the dashboard settings; the
 * storefront then loads that pixel so the merchant can measure their own ads.
 *
 * Everything here must be failure-tolerant: if the pixel script is blocked
 * (ad-blocker, network error, in-app browser restrictions) the storefront has
 * to keep working exactly as before.
 */

/** Meta Pixel IDs are 15 or 16 digits. */
export const META_PIXEL_RE = /^\d{15,16}$/;

export function isValidMetaPixelId(id?: string | null): id is string {
  if (!id) return false;
  return META_PIXEL_RE.test(id.trim());
}

export type PixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Contact';

type Fbq = (...args: unknown[]) => void;

/**
 * Fire a standard Meta event. No-ops silently when the pixel is absent.
 */
export function trackPixel(
  event: PixelEvent,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;

  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq !== 'function') return;

  try {
    if (params) {
      fbq('track', event, params);
    } else {
      fbq('track', event);
    }
  } catch {
    // Tracking must never break the storefront.
  }
}

/** ISO currency code matching the price formatting used across the app. */
export function pixelCurrency(countryCode?: string | null): string {
  return countryCode === '+966' ? 'SAR' : 'EGP';
}

/** Numeric price from a menu item, preferring the discounted price. */
export function pixelValue(
  price: number | string | null | undefined,
  discountPrice?: number | string | null,
): number | undefined {
  const raw = discountPrice ?? price;
  if (raw === null || raw === undefined || raw === '') return undefined;
  const numeric = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(numeric) ? numeric : undefined;
}
