import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0621-\u064A\s-]/g, '') // Keep alphanumeric, Arabic, spaces and hyphens
    .replace(/[\s_-]+/g, '-')              // Replace spaces and underscores with -
    .replace(/^-+|-+$/g, '');              // Remove leading/trailing hyphens
}

export function convertArabicNumerals(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9');
}


export function formatPrice(price: number | string | null | undefined, countryCode?: string | null) {
  if (price === null || price === undefined) return "—";
  const numeric = typeof price === "number" ? price : Number(price);
  if (Number.isNaN(numeric)) return `${price}`;

  const currency = countryCode === '+966' ? 'ر.س' : 'ج.م';

  return `${numeric.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

