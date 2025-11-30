/**
 * React hook for iOS Siri Shortcuts integration
 * iOS-specific implementation
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { createScopedLogger } from '@/utils/logger';

const shortcutsLogger = createScopedLogger('useIOSShortcuts');

/**
 * Hook to handle iOS shortcuts when app is opened via shortcut
 */
export function useIOSShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    shortcutsLogger.info('iOS shortcuts hook initialized');
  }, [router, pathname]);
}



