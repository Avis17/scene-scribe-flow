
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.scriptly',
  appName: 'Scriptly',
  webDir: 'dist',
  server: {
    url: 'https://a1664315-b2e6-480b-a445-43467c434ea0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true
    }
  },
  ios: {
    contentInset: "always"
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
