/**
 * React hook for Android Intent handling
 * Base file - platform-specific implementations are in .android.ts, .ios.ts, .web.ts
 * 
 * This file exists to ensure proper module resolution in all bundlers (including Rork).
 * The actual implementation is in the platform-specific files.
 */

import { Platform } from 'react-native';

// Platform-specific imports will be resolved by Metro/Rork bundler
// On web: uses .web.ts (no-op)
// On Android: uses .android.ts (full implementation)
// On iOS: uses .ios.ts (no-op)

// Re-export the hook from platform-specific file
// This ensures the import path works in all environments
let useAndroidIntents: () => void;

if (Platform.OS === 'android') {
  // @ts-ignore - Platform-specific file resolution
  const androidModule = require('./useAndroidIntents.android');
  useAndroidIntents = androidModule.useAndroidIntents;
} else if (Platform.OS === 'ios') {
  // @ts-ignore - Platform-specific file resolution
  const iosModule = require('./useAndroidIntents.ios');
  useAndroidIntents = iosModule.useAndroidIntents;
} else {
  // @ts-ignore - Platform-specific file resolution
  const webModule = require('./useAndroidIntents.web');
  useAndroidIntents = webModule.useAndroidIntents;
}

export { useAndroidIntents };

