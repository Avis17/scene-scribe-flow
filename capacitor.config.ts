
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a1664315b2e6480ba44543467c434ea0',
  appName: 'Scriptly',
  webDir: 'dist',
  server: {
    url: 'https://a1664315-b2e6-480b-a445-43467c434ea0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
