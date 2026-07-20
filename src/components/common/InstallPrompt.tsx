'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  themeColor = '#00D1C9',
}: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<VisitState>({
    visits: 0,
    installed: false,
    permanentlyDismissed: false,
  });
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

  // Increment visit counter once per mount
  useEffect(() => {
    if (!hydrated) return;
    if (state.installed || state.permanentlyDismissed) return;

    const next: VisitState = { ...state, visits: state.visits + 1 };
    setState(next);
    writeState(slug, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Listen for beforeinstallprompt + appinstalled
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

  // Decide whether to show
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

  const handleDismiss = useCallback(() => {
    const next: VisitState = { ...state, visits: MAX_VISITS_BEFORE_HIDE };
    setState(next);
    writeState(slug, next);
    setOpen(false);
  }, [state, slug]);

  const displayName = useMemo(() => storeName || 'المتجر', [storeName]);

  if (!hydrated || !open) return null;

  return (
    <div
      role="dialog"
      aria-label="تثبيت التطبيق"
      className="fixed inset-x-0 bottom-3 z-[60] mx-auto flex w-[calc(100%-1.5rem)] max-w-md items-center gap-3 rounded-full border border-border bg-background/95 py-1.5 pl-2 pr-2 shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-bottom duration-300 sm:bottom-5"
    >
      {storeLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={storeLogo}
          alt={displayName}
          className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: themeColor }}
        >
          {displayName.charAt(0)}
        </span>
      )}

      <p className="flex-1 truncate text-sm font-medium text-foreground">
        ثبّت {displayName} على جهازك
      </p>

      <Button
        type="button"
        onClick={handleInstall}
        size="sm"
        className="h-8 gap-1.5 rounded-full px-3 text-xs font-semibold text-white"
        style={{ backgroundColor: themeColor }}
      >
        <Download className="h-3.5 w-3.5" />
        تثبيت
      </Button>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="إغلاق"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
