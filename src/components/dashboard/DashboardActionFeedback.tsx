'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const MIN_VISIBLE_MS = 550;
const MAX_VISIBLE_MS = 4200;
const CLICK_VISIBLE_MS = 1200;

function getActionTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  const action = target.closest('button, a, [role="button"], input[type="submit"]');
  if (!action || !(action instanceof HTMLElement)) return null;

  if (action.hasAttribute('disabled') || action.getAttribute('aria-disabled') === 'true') {
    return null;
  }

  if (action instanceof HTMLAnchorElement) {
    const href = action.getAttribute('href') || '';
    const targetAttr = action.getAttribute('target');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || targetAttr === '_blank') {
      return null;
    }
  }

  return action;
}

export function DashboardActionFeedback() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const startedAtRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    hideTimerRef.current = null;
    maxTimerRef.current = null;
  };

  const hide = () => {
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      hideTimerRef.current = null;
    }, remaining);
  };

  const show = (autoHideAfter?: number) => {
    clearTimers();
    startedAtRef.current = Date.now();
    setVisible(true);
    maxTimerRef.current = setTimeout(() => {
      setVisible(false);
      maxTimerRef.current = null;
    }, MAX_VISIBLE_MS);

    if (autoHideAfter) {
      hideTimerRef.current = setTimeout(() => {
        hide();
      }, autoHideAfter);
    }
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;

      const action = getActionTarget(event.target);
      if (!action) return;

      show(action instanceof HTMLAnchorElement ? undefined : CLICK_VISIBLE_MS);
    };

    const handleSubmit = (event: SubmitEvent) => {
      if (event.defaultPrevented) return;
      show();
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleSubmit, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (visible) hide();
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-[80]"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          role="status"
          aria-live="polite"
        >
          <div className="relative h-2 overflow-hidden bg-[#03110f]/95 shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
            <div className="dashboard-action-bar absolute inset-y-0 right-0 w-[70%]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-70 animate-progress-indeterminate" />
          </div>

          <div className="mr-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-brand-accent/35 bg-[#041412]/90 px-4 py-2 text-xs font-black text-white shadow-[0_16px_45px_rgba(0,0,0,0.35),0_0_24px_rgba(255,215,0,0.16)] backdrop-blur-xl">
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-brand-accent/25 animate-ping" />
              <Sparkles className="relative h-3.5 w-3.5 text-brand-accent" />
            </span>
            جاري تنفيذ طلبك...
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
