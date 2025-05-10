
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.scriptly.app',
  appName: 'Scriptly',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#4361EE",
      showSpinner: true,
      spinnerColor: "#FFFFFF"
    }
  }
};

export default config;
