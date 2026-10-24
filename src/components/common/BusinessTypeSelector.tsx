'use client';

import { Store, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessType } from '@/lib/types';

interface BusinessTypeSelectorProps {
  value: BusinessType;
  onChange: (value: BusinessType) => void;
  /** Accent colour of the surrounding screen (#2eb872 on /home & /go, #4ade80 on the popup) */
  accentColor?: string;
  size?: 'md' | 'sm';
  /** When true (e.g. the dedicated restaurant app), the choice is fixed and the other option is hidden */
  locked?: boolean;
  className?: string;
}

const OPTIONS: { key: BusinessType; label: string; Icon: typeof Store }[] = [
  // First item renders on the RIGHT in RTL → متجر (default) on the right, مطعم on the left
  { key: 'store', label: 'متجر', Icon: Store },
  { key: 'restaurant', label: 'مطعم', Icon: UtensilsCrossed },
];

export function BusinessTypeSelector({
  value,
  onChange,
  accentColor = '#2eb872',
  size = 'md',
  locked = false,
  className,
}: BusinessTypeSelectorProps) {
  const options = locked ? OPTIONS.filter((o) => o.key === value) : OPTIONS;
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-right text-sm text-gray-400">
        {locked ? 'نشاطك التجاري' : 'نوع نشاطك التجاري'}
      </p>
      <div className="grid grid-cols-2 gap-3" dir="rtl">
        {options.map(({ key, label, Icon }) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => !locked && onChange(key)}
              aria-pressed={selected}
              style={
                selected
                  ? {
                      borderColor: accentColor,
                      color: accentColor,
                      backgroundColor: `${accentColor}1a`,
                    }
                  : undefined
              }
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border-2 font-bold transition-all duration-200 active:scale-95',
                size === 'md' ? 'h-14 text-lg' : 'h-11 text-sm',
                locked && 'cursor-default col-span-2',
                !selected && 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-600'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
              {locked && key === 'restaurant' && ' / كافيه'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
