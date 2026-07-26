'use client';

import { buildCustomThemeTokens, isCustomThemeColor } from '@/lib/custom-theme';

type Props = {
  color: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
};

export function CustomThemeControls({ color, onColorChange, disabled }: Props) {
  const valid = isCustomThemeColor(color);
  const tokens = valid ? buildCustomThemeTokens({ color }) : {};

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-brand-primary/15 bg-background/60 p-3" dir="rtl">
      <p className="text-xs text-muted-foreground">اختَر أي لون؛ النظام يضبط النصوص والأزرار تلقائياً لضمان وضوحها.</p>
      <div className="flex items-center gap-2">
        <input aria-label="لون مخصص" type="color" value={valid ? color : '#2563EB'} disabled={disabled} onChange={(e) => onColorChange(e.target.value.toUpperCase())} className="h-10 w-14 cursor-pointer rounded-md border-0 p-0" />
        <span className="text-xs text-muted-foreground">لون الثيم المخصص</span>
      </div>
      <input aria-label="كود اللون" value={color} disabled={disabled} onChange={(e) => onColorChange(e.target.value.toUpperCase())} placeholder="#2563EB" className="h-9 w-full rounded-md border bg-background px-3 text-sm" dir="ltr" />
      {!valid && color && <p className="text-xs text-destructive">اكتب لوناً بصيغة HEX مثل #2563EB.</p>}
      {valid && <p className="text-xs text-muted-foreground">سيتم ضبط التباين تلقائياً لهذا اللون.</p>}
      {valid && <div className="rounded-lg p-3 text-sm font-bold" style={tokens as React.CSSProperties}>معاينة الثيم المخصص</div>}
    </div>
  );
}
