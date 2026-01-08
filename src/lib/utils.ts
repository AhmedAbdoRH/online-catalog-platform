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
  const arabicNumerals = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = text;
  for (let i = 0; i < 10; i++) {
    result = result.replace(arabicNumerals[i], englishNumerals[i]);
  }
  return result;
}
