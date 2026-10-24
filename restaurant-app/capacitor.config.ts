import type { CapacitorConfig } from '@capacitor/cli';

// تطبيق "اونلاين كاتلوج للمطاعم" — نسخة مستقلة من تطبيق المتاجر
// نفس المصادقة (Supabase) وقاعدة البيانات، بس الافتتاح على صفحة اللوجين
// واختيار الشريحة مثبّت على "مطعم/كافيه" (segment=restaurant).
const config: CapacitorConfig = {
  appId: 'com.nextcatalog.restaurants',
  appName: 'اونلاين كاتلوج للمطاعم',
  webDir: 'www',
  server: {
    url: 'https://tagr-online.com/login?native_android=1&segment=restaurant',
    cleartext: true,
    allowNavigation: [
      'https://tagr-online.com/*',
      'https://*.tagr-online.com/*',
      'https://online-catalog.net/*',
      'https://*.online-catalog.net/*',
    ],
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: '#05110d',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '471992011728-n051jite6n017emj40qm5nht9a999jn6.apps.googleusercontent.com',
      androidClientId: '471992011728-o37eenopdmpm81s6npksqjv6j0ug9uhu.apps.googleusercontent.com',
      forceCodeForRefreshToken: false,
    },
  },
};

export default config;
