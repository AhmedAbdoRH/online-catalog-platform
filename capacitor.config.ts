import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nextcatalog.app',
  appName: 'اونلاين كاتلوج',
  webDir: 'out',
  server: {
    url: 'https://online-catalog.net',
    cleartext: true
  },
  plugins: {
      SplashScreen: {
        launchShowDuration: 1000,
        launchAutoHide: true,
        backgroundColor: "#05110d",
        androidScaleType: "CENTER_CROP",
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

