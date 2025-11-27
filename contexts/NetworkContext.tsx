import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { createScopedLogger } from '@/utils/logger';

const networkLogger = createScopedLogger('Network');

export type NetworkState = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
};

/**
 * NetworkContext - Provides network connectivity state
 * 
 * Tracks network connectivity and provides hooks for components to react to network changes
 */
export const [NetworkProvider, useNetwork] = createContextHook(() => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true, // Assume connected by default
    isInternetReachable: true,
    type: null,
  });

  useEffect(() => {
    // For web, use navigator.onLine
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        networkLogger.debug('Network online');
        setNetworkState({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
        });
      };

      const handleOffline = () => {
        networkLogger.debug('Network offline');
        setNetworkState({
          isConnected: false,
          isInternetReachable: false,
          type: null,
        });
      };

      // Check if navigator is available (web only)
      if (typeof navigator !== 'undefined') {
        // Set initial state
        setNetworkState({
          isConnected: navigator.onLine,
          isInternetReachable: navigator.onLine,
          type: navigator.onLine ? 'wifi' : null,
        });

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    } else {
      // For native platforms, use NetInfo
      const unsubscribe = NetInfo.addEventListener((state) => {
        networkLogger.debug('Network state changed', undefined, { state });
        setNetworkState({
          isConnected: state.isConnected ?? true,
          isInternetReachable: state.isInternetReachable ?? true,
          type: state.type ?? null,
        });
      });

      // Get initial state
      NetInfo.fetch().then((state) => {
        networkLogger.debug('Initial network state', undefined, { state });
        setNetworkState({
          isConnected: state.isConnected ?? true,
          isInternetReachable: state.isInternetReachable ?? true,
          type: state.type ?? null,
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  return {
    ...networkState,
    isOffline: !networkState.isConnected || networkState.isInternetReachable === false,
  };
});

