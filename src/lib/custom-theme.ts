export type CustomThemeMode = 'light' | 'dark';

export type CustomThemeInput = { color: string; mode?: CustomThemeMode };

export type CustomThemeTokens = Record<string, string>;

export class InvalidCustomThemeColorError extends Error {
  constructor(message = 'Custom theme color does not meet contrast requirements') {
    super(message);
    this.name = 'InvalidCustomThemeColorError';
  }
}

export const isCustomThemeColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);

const hexToRgb = (hex: string) => {
  if (!isCustomThemeColor(hex)) throw new InvalidCustomThemeColorError();
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
};

// Explicit implementation keeps the utility dependency-free and deterministic.
const relativeLuminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const mix = (hex: string, target: string, amount: number) => {
  const source = hexToRgb(hex).map((channel) => Math.round(channel * 255));
  const destination = hexToRgb(target).map((channel) => Math.round(channel * 255));
  return `#${source.map((value, index) => Math.round(value + (destination[index] - value) * amount).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
};

const hexToHslValue = (hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
};

export function getAccessibleButtonForeground(hex: string): '#000000' | '#FFFFFF' {
  if (!isCustomThemeColor(hex)) throw new InvalidCustomThemeColorError();
  const dark = contrast(hex, '#000000');
  const light = contrast(hex, '#FFFFFF');
  // For every opaque sRGB color, at least one of pure black or pure white
  // provides an accessible label; choose the stronger one instead of throwing.
  return dark >= light ? '#000000' : '#FFFFFF';
}

export function detectCustomThemeMode(color: string): CustomThemeMode {
  if (!isCustomThemeColor(color)) throw new InvalidCustomThemeColorError();
  return contrast(color, '#000000') >= contrast(color, '#FFFFFF') ? 'light' : 'dark';
}

export function buildCustomThemeTokens({ color }: CustomThemeInput): CustomThemeTokens {
  if (!isCustomThemeColor(color)) throw new InvalidCustomThemeColorError();
  const mode = detectCustomThemeMode(color);
  const preferredForeground = mode === 'light' ? '#111827' : '#F9FAFB';
  const fallbackForeground = mode === 'light' ? '#000000' : '#FFFFFF';
  const foreground = contrast(color, preferredForeground) >= 4.5 ? preferredForeground : fallbackForeground;
  let brand = mix(color, mode === 'light' ? '#111827' : '#F9FAFB', 0.55);
  if (contrast(brand, color) < 3) brand = mix(color, mode === 'light' ? '#000000' : '#FFFFFF', 0.8);
  const brandForeground = getAccessibleButtonForeground(brand);
  const surface = mode === 'light' ? '#FFFFFF' : '#111827';
  const surfaceStrong = mode === 'light' ? '#F3F4F6' : '#1F2937';
  const mutedForeground = mode === 'light' ? '#4B5563' : '#D1D5DB';
  const border = mode === 'light' ? '#D1D5DB' : '#374151';
  return {
    '--store-background': color,
    '--store-surface': surface,
    '--store-surface-strong': surfaceStrong,
    '--store-foreground': foreground,
    '--store-muted-foreground': mutedForeground,
    '--store-border': border,
    '--store-brand': brand,
    '--store-brand-foreground': brandForeground,
    '--store-ring': brand,
    // Tailwind/Shadcn consume these as hsl(var(--token)); scoping them makes
    // existing components readable without changing every component manually.
    '--background': hexToHslValue(color),
    '--foreground': hexToHslValue(foreground),
    '--card': hexToHslValue(surface),
    '--card-foreground': hexToHslValue(foreground),
    '--popover': hexToHslValue(surface),
    '--popover-foreground': hexToHslValue(foreground),
    '--primary': hexToHslValue(brand),
    '--primary-foreground': hexToHslValue(brandForeground),
    '--secondary': hexToHslValue(surfaceStrong),
    '--secondary-foreground': hexToHslValue(foreground),
    '--muted': hexToHslValue(surfaceStrong),
    '--muted-foreground': hexToHslValue(mutedForeground),
    '--accent': hexToHslValue(brand),
    '--accent-foreground': hexToHslValue(brandForeground),
    '--border': hexToHslValue(border),
    '--input': hexToHslValue(border),
    '--ring': hexToHslValue(brand),
  };
}
