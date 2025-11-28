/**
 * Reusable Refresh Control Hook
 * 
 * Standardizes pull-to-refresh behavior across all screens with:
 * - Automatic haptic feedback
 * - Loading state management
 * - Error handling
 * - Support for combining with other loading states
 */

import React, { useState, useCallback } from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { triggerRefreshHaptic } from '@/utils/haptics';

export interface UseRefreshControlOptions {
  /**
   * The refresh function to call when user pulls to refresh
   */
  onRefresh: () => Promise<void> | void;
  
  /**
   * Whether to enable haptic feedback (default: true)
   */
  enableHaptic?: boolean;
  
  /**
   * Additional loading state to combine with internal refreshing state
   * Useful when refresh is part of a larger sync operation
   */
  additionalLoadingState?: boolean;
  
  /**
   * Custom refresh control props to override defaults
   */
  refreshControlProps?: Partial<RefreshControlProps>;
}

export interface UseRefreshControlReturn {
  /**
   * Whether the refresh is currently in progress
   */
  isRefreshing: boolean;
  
  /**
   * RefreshControl component ready to use in FlatList/ScrollView
   */
  refreshControl: React.ReactElement<RefreshControlProps>;
  
  /**
   * Manual trigger function (useful for programmatic refresh)
   */
  triggerRefresh: () => Promise<void>;
}

/**
 * Hook for managing pull-to-refresh functionality
 * 
 * @example
 * ```tsx
 * const { refreshControl, isRefreshing } = useRefreshControl({
 *   onRefresh: async () => {
 *     await syncMailbox();
 *   },
 *   additionalLoadingState: isSyncing,
 * });
 * 
 * return (
 *   <FlatList
 *     data={emails}
 *     refreshControl={refreshControl}
 *     // ...
 *   />
 * );
 * ```
 */
export function useRefreshControl({
  onRefresh,
  enableHaptic = true,
  additionalLoadingState = false,
  refreshControlProps,
}: UseRefreshControlOptions): UseRefreshControlReturn {
  const { colors } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshing) {
      return;
    }

    try {
      // Trigger haptic feedback if enabled
      if (enableHaptic) {
        await triggerRefreshHaptic();
      }

      setIsRefreshing(true);

      // Call the refresh function
      await onRefresh();
    } catch (error) {
      // Error handling is left to the caller
      // The hook just ensures state is properly reset
      console.error('[useRefreshControl] Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, enableHaptic, isRefreshing]);

  // Combine internal refreshing state with additional loading state
  const combinedRefreshing = isRefreshing || additionalLoadingState;

  // Create RefreshControl component
  const refreshControl = (
    <RefreshControl
      refreshing={combinedRefreshing}
      onRefresh={triggerRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
      {...refreshControlProps}
    />
  );

  return {
    isRefreshing: combinedRefreshing,
    refreshControl,
    triggerRefresh,
  };
}

