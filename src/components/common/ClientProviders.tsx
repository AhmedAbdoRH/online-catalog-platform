"use client";

import { useEffect, type ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Register PWA service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }

    // Initialise theme (light / dark) based on system + saved preference
    try {
      const root = document.documentElement;
      const stored = window.localStorage.getItem("om-theme");
      const systemPrefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      const nextTheme =
        stored === "light" || stored === "dark"
          ? stored
          : systemPrefersDark
          ? "dark"
          : "light";

      if (nextTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } catch (error) {
      console.warn("Theme init failed", error);
    }
  }, []);

  return <>{children}</>;
}
