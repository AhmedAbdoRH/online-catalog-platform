'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Download, Smartphone, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

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

const MAX_VISITS_BEFORE_HIDE = 2; // يظهر في أول وثاني زيارة فقط
const SHOW_DELAY_MS = 2500;
const STORAGE_PREFIX = 'pwa-prompt:';

interface VisitState {
  visits: number;
  dismissed: boolean;
  installed: boolean;
  permanentlyDismissed: boolean;
}

function readState(slug: string): VisitState {
  if (typeof window === 'undefined') {
    return { visits: 0, dismissed: false, installed: false, permanentlyDismissed: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + slug);
    if (!raw) {
      return { visits: 0, dismissed: false, installed: false, permanentlyDismissed: false };
    }
    const parsed = JSON.parse(raw) as Partial<VisitState>;
    return {
      visits: typeof parsed.visits === 'number' ? parsed.visits : 0,
      dismissed: !!parsed.dismissed,
      installed: !!parsed.installed,
      permanentlyDismissed: !!parsed.permanentlyDismissed,
    };
  } catch {
    return { visits: 0, dismissed: false, installed: false, permanentlyDismissed: false };
  }
}

function writeState(slug: string, state: VisitState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(state));
  } catch {
    // localStorage may be full or disabled — silently ignore
  }
}

function detectInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://');
  return isStandalone;
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !('MSStream' in window);
}

export function InstallPrompt({
  slug = 'default',
  storeName,
  storeLogo,
  themeColor = '#00D1C9',
}: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<VisitState>({
    visits: 0,
    dismissed: false,
    installed: false,
    permanentlyDismissed: false,
  });
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const initial = readState(slug);
    const installed = detectInstalled();
    const next: VisitState = { ...initial, installed };
    setState(next);
    if (installed) writeState(slug, next);
    setHydrated(true);
  }, [slug]);

  // Increment visit counter once per mount (per page-load)
  useEffect(() => {
    if (!hydrated) return;
    if (state.installed) return;
    if (state.permanentlyDismissed) return;

    const visits = state.visits + 1;
    const next: VisitState = { ...state, visits };
    setState(next);
    writeState(slug, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Listen for beforeinstallprompt and show on the 1st or 2nd visit
  useEffect(() => {
    if (!hydrated) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      const next: VisitState = { ...state, installed: true, dismissed: true };
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

  // Decide whether to open the sheet
  useEffect(() => {
    if (!hydrated) return;
    if (state.installed) return;
    if (state.permanentlyDismissed) return;
    if (state.visits < 1 || state.visits > MAX_VISITS_BEFORE_HIDE) return;

    // Need either a real beforeinstallprompt OR we are on iOS (manual install)
    const hasRealPrompt = !!deferredPrompt;
    const iosDevice = isIOS();
    if (!hasRealPrompt && !iosDevice) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      setShowIOSHint(iosDevice && !hasRealPrompt);
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [hydrated, state, deferredPrompt]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        const next: VisitState = { ...state, installed: true, dismissed: true, permanentlyDismissed: true };
        setState(next);
        writeState(slug, next);
      } else {
        // User dismissed the native prompt — count this against our 2-visit budget
        const next: VisitState = { ...state, visits: MAX_VISITS_BEFORE_HIDE, dismissed: true };
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
    // Bump visits so the next reload is the last allowed showing
    const visits = Math.max(state.visits, MAX_VISITS_BEFORE_HIDE);
    const next: VisitState = { ...state, visits, dismissed: true };
    setState(next);
    writeState(slug, next);
    setOpen(false);
  }, [state, slug]);

  const handleNever = useCallback(() => {
    const next: VisitState = { ...state, dismissed: true, permanentlyDismissed: true };
    setState(next);
    writeState(slug, next);
    setOpen(false);
  }, [state, slug]);

  const displayName = useMemo(() => storeName || 'المتجر', [storeName]);

  // Don't render until hydrated (avoid SSR mismatch) and when not open
  if (!hydrated || !open) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        className="rtl:text-right ltr:text-left rounded-t-2xl border-t-0 p-0 sm:max-w-md sm:right-4 sm:bottom-4 sm:left-auto sm:rounded-2xl"
        style={{ borderTopColor: themeColor }}
      >
        <div
          className="h-1 w-12 mx-auto mt-3 rounded-full sm:hidden"
          style={{ backgroundColor: themeColor, opacity: 0.4 }}
        />

        <div className="px-5 pt-5 pb-6 sm:p-6">
          <SheetHeader className="space-y-3 text-right">
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                {storeLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={storeLogo}
                    alt={displayName}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                ) : (
                  <Smartphone className="h-7 w-7" style={{ color: themeColor }} />
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleNever}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground -mt-1 -ml-1"
                aria-label="عدم إظهار هذا مجدداً"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1.5">
              <SheetTitle className="text-lg font-bold leading-snug">
                ثبّت {displayName} على جهازك
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
                أضف المتجر إلى شاشتك الرئيسية لتصفح أسرع وتجربة تشبه التطبيقات الأصلية.
              </SheetDescription>
            </div>
          </SheetHeader>

          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
              وصول سريع من الشاشة الرئيسية
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
              يعمل بسلاسة حتى مع بطء الإنترنت
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
              تجربة كاملة بملء الشاشة بدون متصفح
            </li>
          </ul>

          {showIOSHint ? (
            <div className="mt-4 rounded-lg border border-dashed bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <Share2 className="h-4 w-4" />
                طريقة التثبيت على iPhone
              </p>
              <p className="mt-1.5">
                اضغط على زر{' '}
                <span className="inline-flex items-center rounded bg-foreground/10 px-1.5 py-0.5 text-xs font-semibold">
                  مشاركة
                </span>{' '}
                ثم اختر{' '}
                <span className="font-semibold text-foreground">"إضافة إلى الشاشة الرئيسية"</span>.
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleLater}
              className="text-muted-foreground hover:text-foreground"
            >
              لاحقاً
            </Button>
            <Button
              type="button"
              onClick={handleInstall}
              className="gap-2 font-semibold text-white shadow-md"
              style={{ backgroundColor: themeColor }}
              disabled={!deferredPrompt && !showIOSHint}
            >
              <Download className="h-4 w-4" />
              {showIOSHint ? 'فهمت' : 'تثبيت التطبيق'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
