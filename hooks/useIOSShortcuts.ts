/**
 * React hook for iOS Siri Shortcuts integration
 * Base file - platform-specific implementations are in .ios.ts, .android.ts, .web.ts
 * 
 * This file exists to ensure proper module resolution in all bundlers (including Rork).
 * The actual implementation is in the platform-specific files.
 */

import { Platform } from 'react-native';

// Platform-specific imports will be resolved by Metro/Rork bundler
// On web: uses .web.ts (no-op)
// On iOS: uses .ios.ts (full implementation)
// On Android: uses .android.ts (no-op)

// Re-export the hook from platform-specific file
// This ensures the import path works in all environments
let useIOSShortcuts: () => void;

if (Platform.OS === 'ios') {
  // @ts-ignore - Platform-specific file resolution
  const iosModule = require('./useIOSShortcuts.ios');
  useIOSShortcuts = iosModule.useIOSShortcuts;
} else if (Platform.OS === 'android') {
  // @ts-ignore - Platform-specific file resolution
  const androidModule = require('./useIOSShortcuts.android');
  useIOSShortcuts = androidModule.useIOSShortcuts;
} else {
  // @ts-ignore - Platform-specific file resolution
  const webModule = require('./useIOSShortcuts.web');
  useIOSShortcuts = webModule.useIOSShortcuts;
}

export { useIOSShortcuts };

