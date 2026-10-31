import { Tajawal } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import ClientProviders from '@/components/common/ClientProviders';
import { PlatformPixel } from '@/components/common/PlatformPixel';
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
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
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
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
      </head>
      <body
        className={cn(
          "font-tajawal antialiased min-h-[100dvh] bg-background text-foreground w-full",
          "selection:bg-brand-accent/20 selection:text-brand-accent"
        )}
      >
        <PlatformPixel />
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
