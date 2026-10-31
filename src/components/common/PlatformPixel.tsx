'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

/**
 * The platform's own Meta Pixel.
 *
 * It must NOT run on merchant storefronts (`/[slug]` and `/[slug]/item/[id]`),
 * otherwise merchant traffic pollutes the platform's ad data — and it would
 * collide with the merchant's own pixel on the same page.
 *
 * Rendered on the client on purpose: reading headers() in the root layout would
 * make every route dynamic and kill the storefront ISR (`revalidate = 300`).
 */
const PLATFORM_PIXEL_ID = '735822915711863';

/** First path segments that belong to the platform itself. */
const PLATFORM_ROUTES = new Set([
  'login',
  'home',
  'go',
  'signup',
  'dashboard',
  'auth',
  'forgot-password',
  'reset-password',
  'verify-otp',
  'privacy',
  'health',
  'api',
]);

function isPlatformRoute(pathname: string | null | undefined): boolean {
  if (!pathname || pathname === '/') return true;
  const firstSegment = pathname.split('/')[1] || '';
  return PLATFORM_ROUTES.has(firstSegment);
}

export function PlatformPixel() {
  const pathname = usePathname();

  if (!isPlatformRoute(pathname)) return null;

  return (
    <>
      <Script id="fb-pixel" strategy="afterInteractive">
        {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PLATFORM_PIXEL_ID}');
        fbq('track', 'PageView');
      `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PLATFORM_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
