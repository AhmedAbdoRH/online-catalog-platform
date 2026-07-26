'use client';

import type { ReactNode } from 'react';
import { buildCustomThemeTokens, detectCustomThemeMode } from '@/lib/custom-theme';

export function StoreTheme({ theme, color, children }: { theme?: string | null; color?: string | null; children: ReactNode }) {
  if (theme !== 'custom' || !color) return <>{children}</>;
  try {
    const detectedMode = detectCustomThemeMode(color);
    const tokens = buildCustomThemeTokens({ color });
    return <div data-theme="custom" data-theme-mode={detectedMode} data-testid="store-theme" style={tokens}>{children}</div>;
  } catch {
    return <>{children}</>;
  }
}
