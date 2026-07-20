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
        className="w-[calc(100%-2rem)] max-w-sm gap-0 rounded-2xl border-0 bg-white p-0 text-foreground shadow-2xl sm:rounded-2xl"
        // إخفاء زرار الإغلاق الافتراضي في أعلى يمين — استبدلناه بمكان أنسب بصرياً
        style={{ '--primary': themeColor } as React.CSSProperties}
      >
        <DialogClose
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-foreground/60 transition-colors hover:bg-black/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="إغلاق"
        >
          <span className="text-lg leading-none">×</span>
        </DialogClose>

        <div className="flex flex-col items-center px-6 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
          <DialogHeader className="mb-3 w-full items-center space-y-3 text-center sm:text-center">
            {/* شعار المتجر */}
            <div
              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl ring-1 ring-black/5"
              style={{ backgroundColor: `${themeColor}12` }}
            >
              {storeLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={storeLogo}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="text-2xl font-extrabold"
                  style={{ color: themeColor }}
                >
                  {displayName.charAt(0)}
                </span>
              )}
            </div>

            <DialogTitle
              className="text-xl font-extrabold leading-snug text-foreground"
              style={{ color: themeColor }}
            >
              ثبّت تطبيق {displayName}
            </DialogTitle>

            <DialogDescription className="text-center text-sm leading-relaxed text-muted-foreground">
              أضف المتجر إلى شاشتك لتجربة أسرع وأسهل.
              <br />
              التطبيق مجاني وخفيف.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex w-full flex-col-reverse gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              style={{ backgroundColor: themeColor }}
              disabled={!deferredPrompt}
            >
              <Download className="h-4 w-4" />
              تثبيت التطبيق
            </button>
            <button
              type="button"
              onClick={handleLater}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-foreground/15 bg-white px-4 text-sm font-semibold text-foreground/80 transition-colors hover:bg-black/[0.03] hover:text-foreground"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
