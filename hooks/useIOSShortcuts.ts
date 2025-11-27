/**
 * React hook for iOS Siri Shortcuts integration
 */

import { useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { handleShortcutAction, ShortcutAction, type ShortcutParams } from '@/utils/ios/shortcuts';
import { createScopedLogger } from '@/utils/logger';
import { isValidShortcutAction, sanitizeSearchQuery } from '@/utils/security';

const shortcutsLogger = createScopedLogger('useIOSShortcuts');

/**
 * Hook to handle iOS shortcuts when app is opened via shortcut
 */
export function useIOSShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    // Handle initial URL (when app is opened via shortcut)
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && initialUrl.startsWith('rork-app://')) {
          shortcutsLogger.info('App opened via shortcut', { url: initialUrl });
          handleShortcutFromURL(initialUrl);
        }
      } catch (error) {
        shortcutsLogger.error('Error getting initial URL', error);
      }
    };

    // Handle URL changes (when app is already open)
    const handleURLChange = (event: { url: string }) => {
      if (event.url.startsWith('rork-app://')) {
        shortcutsLogger.info('URL changed via shortcut', { url: event.url });
        handleShortcutFromURL(event.url);
      }
    };

    // Set up listeners
    handleInitialURL();
    const subscription = Linking.addEventListener('url', handleURLChange);

    return () => {
      subscription.remove();
    };
  }, [router, pathname]);
}

/**
 * Parse URL and handle shortcut action
 */
function handleShortcutFromURL(url: string): void {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const params = new URLSearchParams(urlObj.search);

    // Parse action from URL
    if (path.includes('/mail')) {
      const filter = params.get('filter');
      const action = params.get('action');
      const search = params.get('search');

      if (filter === 'unread') {
        handleShortcutAction({
          action: ShortcutAction.SHOW_UNREAD,
        });
        // Navigate to mail with unread filter
        // router.push('/mail?filter=unread');
      } else if (action === 'sync') {
        handleShortcutAction({
          action: ShortcutAction.SYNC_EMAILS,
        });
        // Trigger sync
        // syncMailbox();
      } else if (search) {
        // Sanitize search query
        const sanitizedSearch = sanitizeSearchQuery(search);
        if (sanitizedSearch) {
          handleShortcutAction({
            action: ShortcutAction.SEARCH_EMAILS,
            query: sanitizedSearch,
          });
          // Navigate to mail with search
          // router.push(`/mail?search=${encodeURIComponent(sanitizedSearch)}`);
        }
      } else {
        handleShortcutAction({
          action: ShortcutAction.SHOW_INBOX,
        });
        // Navigate to mail
        // router.push('/mail');
      }
    }
  } catch (error) {
    shortcutsLogger.error('Error parsing shortcut URL', error);
  }
}

