import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nextcatalog.app',
  appName: 'NextCatalogApp',
  webDir: 'out',
  server: {
    url: 'http://10.0.2.2:9004',
    cleartext: true
  },
  plugins: {
      GoogleAuth: {
        scopes: ['profile', 'email'],
        serverClientId: '471992011728-n051jite6n017emj40qm5nht9a999jn6.apps.googleusercontent.com',
        androidClientId: '471992011728-1n4quq623he5rpvd09hebe3lsbtbvmrt.apps.googleusercontent.com',
        forceCodeForRefreshToken: false,
      },
  },
};

export default config;

