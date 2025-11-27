/**
 * React hook for Android Intent handling
 * Handles share intents and app shortcuts
 * Android-specific implementation
 */

import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { handleSharedContent, parseIntentExtras, type SharedContent } from '@/utils/android/shareIntents';
import { handleShortcutAction, ShortcutAction } from '@/utils/android/shortcuts';
import { createScopedLogger } from '@/utils/logger';
import { isValidShortcutAction, sanitizeSearchQuery } from '@/utils/security';

const intentsLogger = createScopedLogger('useAndroidIntents');

/**
 * Hook to handle Android intents (share intents, shortcuts)
 */
export function useAndroidIntents() {
  const router = useRouter();

  useEffect(() => {
    // Handle initial URL (when app is opened via intent/shortcut)
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && initialUrl.startsWith('rork-app://')) {
          intentsLogger.info('App opened via intent/shortcut', { url: initialUrl });
          handleIntentFromURL(initialUrl);
        }
      } catch (error) {
        intentsLogger.error('Error getting initial URL', error);
      }
    };

    // Handle URL changes (when app is already open)
    const handleURLChange = (event: { url: string }) => {
      if (event.url.startsWith('rork-app://')) {
        intentsLogger.info('URL changed via intent/shortcut', { url: event.url });
        handleIntentFromURL(event.url);
      }
    };

    // Set up listeners
    handleInitialURL();
    const subscription = Linking.addEventListener('url', handleURLChange);

    return () => {
      subscription.remove();
    };
  }, [router]);
}

/**
 * Parse URL and handle intent/shortcut action
 */
function handleIntentFromURL(url: string): void {
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
        const shortcutAction = isValidShortcutAction('showUnread') ? 'showUnread' : ShortcutAction.SHOW_INBOX;
        handleShortcutAction({
          action: shortcutAction as ShortcutAction,
        });
      } else if (action === 'sync') {
        const shortcutAction = isValidShortcutAction('syncEmails') ? 'syncEmails' : ShortcutAction.SHOW_INBOX;
        handleShortcutAction({
          action: shortcutAction as ShortcutAction,
        });
      } else if (search) {
        const sanitizedSearch = sanitizeSearchQuery(search);
        if (sanitizedSearch) {
          const shortcutAction = isValidShortcutAction('searchEmails') ? 'searchEmails' : ShortcutAction.SHOW_INBOX;
          handleShortcutAction({
            action: shortcutAction as ShortcutAction,
            query: sanitizedSearch,
          });
        }
      } else {
        handleShortcutAction({
          action: ShortcutAction.SHOW_INBOX,
        });
      }
    } else if (path.includes('/share')) {
      // Handle share intent
      const sharedContent: SharedContent = parseIntentExtras(params);
      if (sharedContent) {
        handleSharedContent(sharedContent);
      }
    }
  } catch (error) {
    intentsLogger.error('Error parsing intent URL', error);
  }
}

