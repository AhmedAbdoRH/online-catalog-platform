import { Tajawal } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import ClientProviders from '@/components/common/ClientProviders';
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from 'nextjs-toploader';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tagr-online.com';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'تاجر أونلاين | Tajer Online',
    template: '%s | تاجر أونلاين'
  },
    description: 'منصة تاجر أونلاين: منصة إنشاء المتجر الرقمي للمحال والمتاجر. سجل مجاناً وأنشئ متجرك خلال دقائق.',
  icons: {},
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://tagr-online.com',
    title: 'تاجر أونلاين | Tajer Online',
    description: 'أنشئ متجرك الرقمي والكاتلوج الخاص بك في دقائق. منصة متكاملة تدعم واتساب، بدون الحاجة لمبرمج.',
    siteName: 'تاجر أونلاين',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'تاجر أونلاين - واجهة المعاينة',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تاجر أونلاين | Tajer Online',
    description: 'أنشئ متجرك الرقمي والكاتلوج الخاص بك في دقائق.',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0E343C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={tajawal.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: 'window.__name = window.__name || function(fn) { return fn; };',
          }}
        />
        <link
          href="https://fonts.cdnfonts.com/css/satoshi"
          rel="stylesheet"
        />
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
            fbq('init', '735822915711863');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=735822915711863&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body
        className={cn(
          "font-tajawal antialiased min-h-[100dvh] bg-background text-foreground w-full",
          "selection:bg-brand-accent/20 selection:text-brand-accent"
        )}
      >
        <NextTopLoader
          color="#FFD700"
          initialPosition={0.08}
          crawlSpeed={120}
          height={5}
          crawl={true}
          showSpinner={false}
          easing="cubic-bezier(0.65, 0, 0.35, 1)"
          speed={260}
          shadow="0 0 18px rgba(255,215,0,0.85),0 0 28px rgba(85,249,230,0.55)"
          template='<div class="bar top-loader-glow" role="bar"><div class="peg"></div></div>'
        />
        <ClientProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
