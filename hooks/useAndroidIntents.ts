/**
 * React hook for Android Intent handling
 * Handles share intents and app shortcuts
 */

import { useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { handleSharedContent, parseIntentExtras, type SharedContent } from '@/utils/android/shareIntents';
import { handleShortcutAction, ShortcutAction } from '@/utils/android/shortcuts';
import { createScopedLogger } from '@/utils/logger';
import { isValidShortcutAction, sanitizeSearchQuery } from '@/utils/security';

const intentsLogger = createScopedLogger('useAndroidIntents');

/**
 * Hook to handle Android intents when app is opened via share or shortcut
 */
export function useAndroidIntents() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    // Handle initial URL (when app is opened via intent)
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          intentsLogger.info('App opened via intent', { url: initialUrl });
          handleIntentFromURL(initialUrl);
        }
      } catch (error) {
        intentsLogger.error('Error getting initial URL', error);
      }
    };

    // Handle URL changes (when app is already open)
    const handleURLChange = (event: { url: string }) => {
      intentsLogger.info('URL changed via intent', { url: event.url });
      handleIntentFromURL(event.url);
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
 * Parse URL and handle intent action
 */
function handleIntentFromURL(url: string): void {
  try {
    // Check if this is a share intent or shortcut
    if (url.startsWith('rork-app://')) {
      // Handle as shortcut/deep link
      handleShortcutFromURL(url);
    } else if (url.startsWith('content://') || url.startsWith('file://')) {
      // Handle as shared content
      // Note: Full share intent handling requires native code to get intent extras
      intentsLogger.info('Received shared content URI', { url });
      // TODO: Extract intent extras from native module
    }
  } catch (error) {
    intentsLogger.error('Error parsing intent URL', error);
  }
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
      } else if (action === 'sync') {
        handleShortcutAction({
          action: ShortcutAction.SYNC_EMAILS,
        });
      } else if (search) {
        // Sanitize search query
        const sanitizedSearch = sanitizeSearchQuery(search);
        if (sanitizedSearch) {
          handleShortcutAction({
            action: ShortcutAction.SEARCH_EMAILS,
            query: sanitizedSearch,
          });
        }
      } else {
        handleShortcutAction({
          action: ShortcutAction.SHOW_INBOX,
        });
      }
    } else if (path.includes('/compose')) {
      const body = params.get('body');
      const url = params.get('url');
      const image = params.get('image');
      const file = params.get('file');

      // Handle compose with shared content
      if (body || url || image || file) {
        const sharedContent: SharedContent = {
          type: body ? 'text/plain' as any : url ? 'text/uri-list' as any : image ? 'image/*' as any : '*/*' as any,
          text: body || url,
          uri: image || file,
        };
        handleSharedContent(sharedContent);
      } else {
        handleShortcutAction({
          action: ShortcutAction.COMPOSE_EMAIL,
        });
      }
    }
  } catch (error) {
    intentsLogger.error('Error parsing shortcut URL', error);
  }
}

