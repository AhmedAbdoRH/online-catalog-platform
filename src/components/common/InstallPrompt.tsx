'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

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

const MAX_VISITS_BEFORE_HIDE = 2;
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

/**
 * يفتّح أو يغمّق لون Hex بنسبة معيّنة، عشان نبني تدرج (gradient) وظل ملوّن
 * من نفس لون هوية المتجر (themeColor) بدل ما نستورد ألوان غريبة عن الهوية.
 * لو اللون مش Hex صالح، بيرجّع اللون زي ما هو من غير ما يكسر التصميم.
 */
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

export function InstallPrompt({
  slug = 'default',
  storeName,
  storeLogo,
  themeColor = '#1e3a8a',
}: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
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
      setOpen(false);
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
    if (state.visits < 1 || state.visits > MAX_VISITS_BEFORE_HIDE) return;
    if (!deferredPrompt) return;

    const timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, state, deferredPrompt]);

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
      setOpen(false);
    }
  }, [deferredPrompt, state, slug]);

  const handleLater = useCallback(() => {
    const next: VisitState = { ...state, visits: MAX_VISITS_BEFORE_HIDE };
    setState(next);
    writeState(slug, next);
    setOpen(false);
  }, [state, slug]);

  const handleClose = useCallback(() => {
    handleLater();
  }, [handleLater]);

  const displayName = useMemo(() => storeName || 'المتجر', [storeName]);

  // تدرّج وظل الزرار متولّدين من نفس لون هوية المتجر، مش من ألوان تعسفية
  const gradientFrom = useMemo(() => shadeColor(themeColor, 16), [themeColor]);
  const gradientTo = useMemo(() => shadeColor(themeColor, -14), [themeColor]);

  if (!hydrated) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
        setOpen(next);
      }}
    >
      <DialogContent
        dir="rtl"
        className="w-[calc(100%-2rem)] max-w-xl gap-0 overflow-hidden rounded-3xl border border-white/40 bg-white/55 p-0 text-foreground shadow-[0_25px_70px_-20px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.6)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/35"
        style={{ '--primary': themeColor } as React.CSSProperties}
      >
        {/* توهّج زجاجي خفيف بلون هوية المتجر، يدي البطاقة عمق بدل الأبيض الفاضي */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${themeColor}2b 0%, transparent 55%)`,
          }}
        />

        <DialogClose
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/50 text-foreground/70 backdrop-blur-md transition-colors hover:bg-white/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="إغلاق"
        >
          <span className="text-lg leading-none">×</span>
        </DialogClose>

        <div className="relative z-10 flex flex-col items-center px-6 pb-7 pt-9 sm:px-8 sm:pb-9 sm:pt-11">
          <DialogHeader className="mb-6 w-full items-center space-y-4 text-center sm:text-center">
            {/* شعار المتجر */}
            <div
              className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/50 shadow-lg ring-1 ring-black/5 backdrop-blur-sm"
              style={{
                background: `linear-gradient(145deg, ${themeColor}29, ${themeColor}0d)`,
              }}
            >
              {storeLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={storeLogo}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold" style={{ color: themeColor }}>
                  {displayName.charAt(0)}
                </span>
              )}
            </div>

            <DialogTitle
              className="text-3xl font-bold leading-snug text-foreground"
              style={{ color: themeColor }}
            >
              ثبّت تطبيق {displayName}
            </DialogTitle>

            <DialogDescription className="text-center text-base leading-relaxed text-muted-foreground">
              أضف المتجر إلى شاشتك لتجربة أسرع وأسهل.
              <br />
              التطبيق مجاني وخفيف.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex w-full flex-col-reverse gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex h-16 flex-1 items-center justify-center gap-2 rounded-2xl px-6 text-lg font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                boxShadow: `0 14px 30px -10px ${themeColor}80`,
              }}
              disabled={!deferredPrompt}
            >
              <Download className="h-6 w-6" />
              تثبيت التطبيق
            </button>
            <button
              type="button"
              onClick={handleLater}
              className="inline-flex h-16 flex-1 items-center justify-center rounded-2xl border border-white/50 bg-white/40 px-6 text-base font-semibold text-foreground/80 backdrop-blur-md transition-colors hover:bg-white/65 hover:text-foreground"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
