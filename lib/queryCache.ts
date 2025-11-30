/**
 * React Query Cache Configuration
 * 
 * Optimized cache TTL and invalidation strategies for different data types.
 * Implements stale-while-revalidate pattern for better UX and offline support.
 * Includes persistence to disk for long-term cache retention.
 */

import type { QueryClientConfig } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Cache TTL (Time To Live) in milliseconds for different data types
 */
export const CACHE_TTL = {
  // User profile data - changes infrequently, can cache for longer
  PROFILE: 5 * 60 * 1000, // 5 minutes
  
  // Email messages - never garbage collect (persisted to disk)
  MESSAGES: Infinity, // Never garbage collect - persisted to disk
  MESSAGE_DETAIL: 5 * 60 * 1000, // 5 minutes (individual messages change less)
  
  // Senders - relatively stable, can cache longer
  SENDERS: 10 * 60 * 1000, // 10 minutes
  
  // Rules - user-defined, cache but invalidate on changes
  RULES: 5 * 60 * 1000, // 5 minutes
  
  // Folders - user-defined, cache but invalidate on changes
  FOLDERS: 5 * 60 * 1000, // 5 minutes
  
  // History - historical data, can cache longer
  HISTORY: 15 * 60 * 1000, // 15 minutes
  
  // Stats - calculated data, can cache but refresh periodically
  STATS: 3 * 60 * 1000, // 3 minutes
  
  // Calendar events - moderate freshness needed
  CALENDAR_EVENTS: 5 * 60 * 1000, // 5 minutes
  
  // Suggestions - can be slightly stale
  SUGGESTIONS: 5 * 60 * 1000, // 5 minutes
  
  // Default for unknown data types
  DEFAULT: 2 * 60 * 1000, // 2 minutes
} as const;

/**
 * Stale time - how long data is considered fresh before refetching in background
 * Using stale-while-revalidate pattern: show cached data immediately, refetch in background
 */
export const STALE_TIME = {
  // Very stable data - can be stale for longer
  PROFILE: 10 * 60 * 1000, // 10 minutes
  SENDERS: 15 * 60 * 1000, // 15 minutes
  HISTORY: 30 * 60 * 1000, // 30 minutes
  
  // Moderately changing data
  MESSAGES: 5 * 60 * 1000, // 5 minutes (increase stale time to reduce refetches)
  MESSAGE_DETAIL: 3 * 60 * 1000, // 3 minutes
  RULES: 5 * 60 * 1000, // 5 minutes
  FOLDERS: 5 * 60 * 1000, // 5 minutes
  STATS: 2 * 60 * 1000, // 2 minutes
  CALENDAR_EVENTS: 5 * 60 * 1000, // 5 minutes
  SUGGESTIONS: 3 * 60 * 1000, // 3 minutes
  
  // Default
  DEFAULT: 1 * 60 * 1000, // 1 minute
} as const;

/**
 * Cache invalidation patterns
 */
export const CACHE_KEYS = {
  GMAIL: {
    PROFILE: ['gmail', 'profile'] as const,
    MESSAGES: ['gmail', 'messages'] as const,
    MESSAGE: (id: string) => ['gmail', 'message', id] as const,
    SENDERS: ['gmail', 'senders'] as const,
  },
  RULES: {
    ALL: ['rules'] as const,
    RULE: (id: string) => ['rules', id] as const,
  },
  FOLDERS: {
    ALL: ['folders'] as const,
    FOLDER: (id: string) => ['folders', id] as const,
  },
  HISTORY: {
    ALL: ['history'] as const,
  },
  STATS: {
    INBOX_HEALTH: ['stats', 'inbox-health'] as const,
    ALL: ['stats'] as const,
  },
  CALENDAR: {
    EVENTS: ['calendar', 'events'] as const,
    EVENT: (id: string) => ['calendar', 'event', id] as const,
  },
  SUGGESTIONS: {
    ALL: ['suggestions'] as const,
  },
} as const;

/**
 * Get cache TTL for a query key
 * Returns Infinity for messages to prevent garbage collection (they're persisted to disk)
 */
export function getCacheTTL(queryKey: readonly unknown[]): number {
  const key = queryKey[0];
  const subKey = queryKey[1];
  
  if (key === 'gmail') {
    if (subKey === 'profile') return CACHE_TTL.PROFILE;
    if (subKey === 'messages') return CACHE_TTL.MESSAGES; // Infinity - never garbage collect
    if (subKey === 'message') return CACHE_TTL.MESSAGE_DETAIL;
    if (subKey === 'senders') return CACHE_TTL.SENDERS;
  }
  
  if (key === 'rules') return CACHE_TTL.RULES;
  if (key === 'folders') return CACHE_TTL.FOLDERS;
  if (key === 'history') return CACHE_TTL.HISTORY;
  if (key === 'stats') return CACHE_TTL.STATS;
  if (key === 'calendar') return CACHE_TTL.CALENDAR_EVENTS;
  if (key === 'suggestions') return CACHE_TTL.SUGGESTIONS;
  
  return CACHE_TTL.DEFAULT;
}

/**
 * Get stale time for a query key
 */
export function getStaleTime(queryKey: readonly unknown[]): number {
  const key = queryKey[0];
  const subKey = queryKey[1];
  
  if (key === 'gmail') {
    if (subKey === 'profile') return STALE_TIME.PROFILE;
    if (subKey === 'messages') return STALE_TIME.MESSAGES;
    if (subKey === 'message') return STALE_TIME.MESSAGE_DETAIL;
    if (subKey === 'senders') return STALE_TIME.SENDERS;
  }
  
  if (key === 'rules') return STALE_TIME.RULES;
  if (key === 'folders') return STALE_TIME.FOLDERS;
  if (key === 'history') return STALE_TIME.HISTORY;
  if (key === 'stats') return STALE_TIME.STATS;
  if (key === 'calendar') return STALE_TIME.CALENDAR_EVENTS;
  if (key === 'suggestions') return STALE_TIME.SUGGESTIONS;
  
  return STALE_TIME.DEFAULT;
}

/**
 * Create persister for React Query cache
 * Uses AsyncStorage on native, localStorage on web
 */
const createPersister = () => {
  if (Platform.OS === 'web') {
    // For web, create a localStorage persister that matches the async storage API
    const webStorage = {
      getItem: (key: string): Promise<string | null> => {
        return Promise.resolve(
          typeof window !== 'undefined' && window.localStorage
            ? window.localStorage.getItem(key)
            : null
        );
      },
      setItem: (key: string, value: string): Promise<void> => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string): Promise<void> => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
    
    return createAsyncStoragePersister({
      storage: webStorage,
      key: 'REACT_QUERY_OFFLINE_CACHE',
    });
  }
  
  // For native, use AsyncStorage persister
  return createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'REACT_QUERY_OFFLINE_CACHE',
  });
};

export const queryPersister = createPersister();

/**
 * React Query default configuration
 * Implements stale-while-revalidate pattern and offline support
 */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale-while-revalidate: data is considered fresh for staleTime, then refetched in background
      staleTime: STALE_TIME.DEFAULT,
      
      // Cache time (gcTime in v5) - how long unused data stays in cache
      // Messages use Infinity (never garbage collect) since they're persisted
      gcTime: 30 * 60 * 1000, // 30 minutes default (was cacheTime in v4)
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: true, // Refetch when app comes to foreground
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts (if stale)
      
      // Network mode - use cached data when offline
      networkMode: 'offlineFirst', // Try cache first, then network
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
      
      // Network mode for mutations
      networkMode: 'online', // Mutations require network
    },
  },
};

/**
 * Cache invalidation utilities
 */
export const cacheInvalidation = {
  /**
   * Invalidate all Gmail-related caches
   */
  invalidateGmail: (queryClient: { invalidateQueries: (options: { queryKey: readonly unknown[] }) => void }) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.PROFILE });
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.MESSAGES });
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.SENDERS });
  },
  
  /**
   * Invalidate all stats caches
   */
  invalidateStats: (queryClient: { invalidateQueries: (options: { queryKey: readonly unknown[] }) => void }) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.STATS.ALL });
  },
  
  /**
   * Invalidate all rules caches
   */
  invalidateRules: (queryClient: { invalidateQueries: (options: { queryKey: readonly unknown[] }) => void }) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.RULES.ALL });
  },
  
  /**
   * Invalidate all folders caches
   */
  invalidateFolders: (queryClient: { invalidateQueries: (options: { queryKey: readonly unknown[] }) => void }) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.FOLDERS.ALL });
  },
};

