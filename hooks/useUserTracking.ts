import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { createScopedLogger } from '@/utils/logger';
import Constants from 'expo-constants';

const trackingLogger = createScopedLogger('UserTracking');

/**
 * Hook for tracking user actions and analytics
 */
export function useUserTracking() {
  const { user, isDemoMode } = useAuth();
  const trackActionMutation = trpc.users.trackAction.useMutation();

  const trackAction = useCallback(async (
    actionType: string,
    options?: {
      category?: string;
      data?: Record<string, unknown>;
      screenName?: string;
    }
  ) => {
    // Skip tracking in demo mode
    if (isDemoMode || !user) {
      return;
    }

    try {
      const deviceType = Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'ios' : 'android';
      const appVersion = Constants.expoConfig?.version || 'unknown';

      await trackActionMutation.mutateAsync({
        user_id: user.id,
        action_type: actionType,
        action_category: options?.category || null,
        action_data: options?.data || {},
        screen_name: options?.screenName || null,
        device_type: deviceType,
        app_version: appVersion,
      });

      trackingLogger.debug('Action tracked', { actionType, category: options?.category });
    } catch (error) {
      trackingLogger.error('Failed to track action', error);
      // Don't throw - tracking failures shouldn't break the app
    }
  }, [user, isDemoMode, trackActionMutation]);

  // Convenience methods for common actions
  const trackLogin = useCallback(() => {
    return trackAction('login', { category: 'auth' });
  }, [trackAction]);

  const trackLogout = useCallback(() => {
    return trackAction('logout', { category: 'auth' });
  }, [trackAction]);

  const trackScreenView = useCallback((screenName: string) => {
    return trackAction('screen_view', { 
      category: 'navigation',
      screenName 
    });
  }, [trackAction]);

  const trackRuleCreated = useCallback((ruleId: string, ruleName: string) => {
    return trackAction('create_rule', {
      category: 'rules',
      data: { rule_id: ruleId, rule_name: ruleName },
    });
  }, [trackAction]);

  const trackRuleDeleted = useCallback((ruleId: string) => {
    return trackAction('delete_rule', {
      category: 'rules',
      data: { rule_id: ruleId },
    });
  }, [trackAction]);

  const trackFolderCreated = useCallback((folderId: string, folderName: string) => {
    return trackAction('create_folder', {
      category: 'folders',
      data: { folder_id: folderId, folder_name: folderName },
    });
  }, [trackAction]);

  const trackSyncStarted = useCallback((messageCount?: number) => {
    return trackAction('sync_started', {
      category: 'sync',
      data: { message_count: messageCount },
    });
  }, [trackAction]);

  const trackSyncCompleted = useCallback((messageCount: number, durationMs: number) => {
    return trackAction('sync_completed', {
      category: 'sync',
      data: { 
        message_count: messageCount,
        duration_ms: durationMs,
      },
    });
  }, [trackAction]);

  return {
    trackAction,
    trackLogin,
    trackLogout,
    trackScreenView,
    trackRuleCreated,
    trackRuleDeleted,
    trackFolderCreated,
    trackSyncStarted,
    trackSyncCompleted,
  };
}

