'use client';

import Script from 'next/script';
import { isValidMetaPixelId } from '@/lib/merchant-pixel';

/**
 * Loads the merchant's own Meta Pixel on their storefront.
 *
 * Renders nothing when the merchant has not configured a valid pixel, so
 * storefronts without tracking stay byte-for-byte unchanged.
 *
 * The pixel ID is validated with a digits-only regex before being embedded,
 * so no merchant-supplied string is ever injected raw into the page.
 */
const BASE_SNIPPET = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');`;

export function MerchantPixel({ pixelId }: { pixelId?: string | null }) {
  if (!isValidMetaPixelId(pixelId)) return null;

  const id = pixelId.trim();

  return (
    <>
      <Script key={id} id="merchant-meta-pixel" strategy="afterInteractive">
        {`${BASE_SNIPPET}
fbq('init', '${id}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
