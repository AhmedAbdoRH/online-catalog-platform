'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Smartphone, Store, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPromptProps {
  slug?: string;
  storeName?: string;
  storeLogo?: string;
  themeColor?: string;
}

const MAX_VISITS_BEFORE_HIDE = 10;
const SHOW_DELAY_MS = 2500;
const STORAGE_PREFIX = 'pwa-prompt:';

interface VisitState {
  visits: number;
  installed: boolean;
  permanentlyDismissed: boolean;
}

function readState(slug: string): VisitState {
  if (typeof window === 'undefined') {
    return { visits: 0, installed: false, permanentlyDismissed: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + slug);
    if (!raw) return { visits: 0, installed: false, permanentlyDismissed: false };
    const parsed = JSON.parse(raw) as Partial<VisitState>;
    return {
      visits: typeof parsed.visits === 'number' ? parsed.visits : 0,
      installed: !!parsed.installed,
      permanentlyDismissed: !!parsed.permanentlyDismissed,
    };
  } catch {
    return { visits: 0, installed: false, permanentlyDismissed: false };
  }
}

function writeState(slug: string, state: VisitState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function detectInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function shadeColor(hex: string, percent: number): string {
  const cleaned = hex.replace('#', '');
  const isValidHex = /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(cleaned);
  if (!isValidHex) return hex;

  const normalized =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;

  const num = parseInt(normalized, 16);
  const amt = Math.round(2.55 * percent);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));

  const R = clamp((num >> 16) + amt);
  const G = clamp(((num >> 8) & 0x00ff) + amt);
  const B = clamp((num & 0x0000ff) + amt);

  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function getOptimizedLogoUrl(logoUrl: string): string {
  const trimmed = logoUrl.trim();
  if (!trimmed) return '';
  const base = trimmed.split('?')[0];
  return `${base}?w=128&h=128&fit=crop&q=90`;
}

function StoreLogo({
  storeLogo,
  displayName,
  themeColor,
}: {
  storeLogo?: string;
  displayName: string;
  themeColor: string;
}) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const rawLogo = storeLogo?.trim() ?? '';

  useEffect(() => {
    setShowFallback(false);
    setLogoSrc(rawLogo ? getOptimizedLogoUrl(rawLogo) : null);
  }, [rawLogo]);

  const fallbackLetter = displayName.trim().charAt(0);

  if (!logoSrc || showFallback) {
    return (
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/90 text-lg font-black shadow-sm"
        style={{ color: themeColor }}
        aria-hidden
      >
        {fallbackLetter ? (
          fallbackLetter
        ) : (
          <Store className="h-5 w-5" style={{ color: themeColor }} />
        )}
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/30 bg-white shadow-sm ring-1 ring-black/5">
      <Image
        src={logoSrc}
        alt={displayName}
        fill
        sizes="48px"
        className="object-cover"
        onError={() => {
          const plainUrl = rawLogo.split('?')[0];
          if (logoSrc !== plainUrl) {
            setLogoSrc(plainUrl);
            return;
          }
          setShowFallback(true);
        }}
      />
    </div>
  );
}

export function InstallPrompt({
  slug = 'default',
  storeName,
  storeLogo,
  themeColor = '#1e3a8a',
}: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<VisitState>({
    visits: 0,
    installed: false,
    permanentlyDismissed: false,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = readState(slug);
    const installed = detectInstalled();
    const next: VisitState = { ...initial, installed };
    setState(next);
    if (installed) writeState(slug, next);
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    if (state.installed || state.permanentlyDismissed) return;

    const next: VisitState = { ...state, visits: state.visits + 1 };
    setState(next);
    writeState(slug, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      const next: VisitState = { ...state, installed: true };
      setState(next);
      writeState(slug, next);
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [hydrated, slug, state]);

  useEffect(() => {
    if (!hydrated) return;
    if (state.installed || state.permanentlyDismissed) return;
    // Always show for testing
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, state]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        const next: VisitState = { ...state, installed: true };
        setState(next);
        writeState(slug, next);
      } else {
        const next: VisitState = { ...state, visits: MAX_VISITS_BEFORE_HIDE };
        setState(next);
        writeState(slug, next);
      }
    } catch (err) {
      console.error('Install prompt error:', err);
    } finally {
      setDeferredPrompt(null);
      setVisible(false);
    }
  }, [deferredPrompt, state, slug]);

  const handleDismiss = useCallback(() => {
    const next: VisitState = { ...state, visits: MAX_VISITS_BEFORE_HIDE };
    setState(next);
    writeState(slug, next);
    setVisible(false);
  }, [state, slug]);

  const displayName = useMemo(() => storeName?.trim() || 'المتجر', [storeName]);
  const gradientFrom = useMemo(() => shadeColor(themeColor, 12), [themeColor]);
  const gradientTo = useMemo(() => shadeColor(themeColor, -10), [themeColor]);

  if (!hydrated) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          dir="rtl"
          role="dialog"
          aria-labelledby="install-prompt-title"
          aria-describedby="install-prompt-desc"
          initial={{ opacity: 0, y: 48, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 32, scale: 0.97 }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 32,
            mass: 0.85,
          }}
          className={cn(
            'pointer-events-auto fixed inset-x-3 z-[60] mx-auto max-w-md',
            'bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:bottom-5'
          )}
        >
          <div
            className="relative overflow-hidden rounded-2xl border border-white/25 bg-white/90 p-3 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/80"
            style={{
              boxShadow: `0 16px 48px -12px ${themeColor}40, 0 4px 16px -4px rgba(15,23,42,0.12)`,
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background: `linear-gradient(135deg, ${themeColor}18 0%, transparent 55%)`,
              }}
            />

            <button
              type="button"
              onClick={handleDismiss}
              className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-foreground/50 transition-colors hover:bg-black/10 hover:text-foreground/80"
              aria-label="إغلاق"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="relative flex items-center gap-3 pl-7">
              <StoreLogo
                storeLogo={storeLogo}
                displayName={displayName}
                themeColor={themeColor}
              />

              <div className="min-w-0 flex-1">
                <p
                  id="install-prompt-title"
                  className="truncate text-sm font-bold text-black"
                >
                  ثبّت تطبيق {displayName}
                </p>
                <p
                  id="install-prompt-desc"
                  className="mt-0.5 line-clamp-2 text-[11px] leading-snug font-medium text-black"
                >
                  وصول أسرع من الشاشة الرئيسية — مجاني وخفيف
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  type="button"
                  onClick={handleInstall}
                  disabled={!deferredPrompt}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold text-black transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                    boxShadow: `0 8px 20px -8px ${themeColor}90`,
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  تثبيت
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[10px] font-medium text-black transition-colors hover:text-black/80"
                >
                  لاحقاً
                </button>
              </div>
            </div>

            <div className="relative mt-2 flex items-center justify-center gap-1.5 border-t border-black/5 pt-2">
              <Smartphone className="h-3 w-3 text-muted-foreground/70" />
              <span className="text-[10px] font-medium text-black">
                يتم التثبيت من خلال المتصفح خلال ثوانٍي
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
