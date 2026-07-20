"use client";

import { useEffect, type ReactNode } from "react";
import { versionedAsset } from "@/lib/static-assets";

function getCurrentSlug(): string | null {
  if (typeof window === "undefined") return null;
  const parts = window.location.pathname.split("/").filter(Boolean);
  // /[slug] or /[slug]/... → first segment is the merchant slug
  return parts.length > 0 ? parts[0] : null;
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register(versionedAsset("/sw.js"))
          .then((registration) => {
            console.log("SW registered: ", registration);

            const slug = getCurrentSlug();
            const sendSlug = () => {
              if (!slug) return;
              if (registration.active) {
                registration.active.postMessage({ type: "SET_SLUG", slug });
              } else {
                // Wait for the worker to become active, then send.
                registration.addEventListener("updatefound", () => {
                  const installing = registration.installing;
                  installing?.addEventListener("statechange", () => {
                    if (registration.active) {
                      registration.active.postMessage({ type: "SET_SLUG", slug });
                    }
                  });
                });
              }
            };

            sendSlug();

            // Keep the SW informed if the user navigates to another merchant.
            const onRouteChange = () => {
              const newSlug = getCurrentSlug();
              if (newSlug && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                  type: "SET_SLUG",
                  slug: newSlug,
                });
              }
            };
            window.addEventListener("popstate", onRouteChange);
            // Next.js client-side navigation fires this on soft navigations.
            window.addEventListener("pushstate", onRouteChange);
            window.addEventListener("replaceState", onRouteChange);
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError);
          });
      });
    }
  }, []);

  return <>{children}</>;
}
