import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blueoceanguardians.app',
  appName: '블루오션 가디언스',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;