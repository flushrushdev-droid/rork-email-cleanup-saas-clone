import createContextHook from '@nkzw/create-context-hook';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import { trpcClient } from '@/lib/trpc';
import type { GmailMessage, GmailProfile, Email, Sender } from '@/constants/types';
import { APIError, AuthError, NetworkError, normalizeError } from '@/utils/errorHandling';
import { createScopedLogger } from '@/utils/logger';
import { AppConfig, validateSecureUrl } from '@/config/env';
import { getStaleTime, getCacheTTL, CACHE_KEYS } from '@/lib/queryCache';
import { rateLimiter, retryWithBackoff, shouldRetryError, DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG } from '@/utils/rateLimiter';

// Validate Gmail API base URL is HTTPS in production
const GMAIL_API_BASE = validateSecureUrl(AppConfig.gmail.apiBase);
const gmailLogger = createScopedLogger('GmailSync');

export const [GmailSyncProvider, useGmailSync] = createContextHook(() => {
  const { getValidAccessToken, user, isAuthenticated: authIsAuthenticated, isDemoMode: authDemoMode } = useAuth();
  const queryClient = useQueryClient();
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const makeGmailRequest = async (endpoint: string, options: RequestInit = {}) => {
    // Use endpoint as rate limit key (allows different limits per endpoint if needed)
    const rateLimitKey = `gmail:${endpoint}`;
    
    // Check rate limit before making request
    if (!rateLimiter.canMakeRequest(rateLimitKey, DEFAULT_RATE_LIMIT)) {
      const waitTime = rateLimiter.getTimeUntilNextRequest(rateLimitKey, DEFAULT_RATE_LIMIT);
      gmailLogger.warn(`Rate limit exceeded for ${endpoint}. Waiting ${Math.ceil(waitTime / 1000)}s`);
      throw new APIError(
        `Too many requests. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`,
        429,
        true
      );
    }

    // Wrap the actual request with retry logic
    return retryWithBackoff(
      async () => {
        try {
          const accessToken = await getValidAccessToken();
          if (!accessToken) {
            throw new AuthError('No valid access token. Please sign in again.');
          }

          // Construct full URL and validate it's secure in production
          const fullUrl = `${GMAIL_API_BASE}${endpoint}`;
          const validatedUrl = validateSecureUrl(fullUrl);

          const response = await fetch(validatedUrl, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const statusCode = response.status;
            const errorMessage = errorData.error?.message || `Gmail API error: ${statusCode}`;
            
            // Handle specific error codes
            if (statusCode === 401 || statusCode === 403) {
              // Don't retry auth errors
              throw new AuthError('Authentication failed. Please sign in again.', new Error(errorMessage));
            }
            
            if (statusCode === 429) {
              // Rate limit error - will be retried if configured
              throw new APIError('Too many requests. Please wait a moment and try again.', statusCode, true);
            }
            
            if (statusCode >= 500) {
              // Server error - will be retried if configured
              throw new APIError('Gmail service is temporarily unavailable. Please try again later.', statusCode, true);
            }
            
            // Client errors (4xx) - don't retry
            throw new APIError(errorMessage, statusCode, false);
          }

          return response.json();
        } catch (error) {
          // Re-throw if already a known error type
          if (error instanceof APIError || error instanceof AuthError || error instanceof NetworkError) {
            throw error;
          }
          
          // Check for network errors
          const normalized = normalizeError(error);
          if (normalized.code === 'NETWORK_ERROR') {
            throw new NetworkError('Unable to connect to Gmail. Please check your internet connection.', error instanceof Error ? error : undefined);
          }
          
          // Re-throw as API error for unknown cases
          throw new APIError('An error occurred while communicating with Gmail.', undefined, false, error instanceof Error ? error : undefined);
        }
      },
      DEFAULT_RETRY_CONFIG,
      (error) => {
        // Don't retry auth errors (401, 403)
        if (error instanceof AuthError) {
          return false;
        }
        
        // Don't retry client errors (4xx) except 429
        if (error instanceof APIError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          return false;
        }
        
        // Retry network errors, 429, and 5xx errors
        return shouldRetryError(error, DEFAULT_RETRY_CONFIG);
      }
    );
  };

  const profileQuery = useQuery({
    queryKey: CACHE_KEYS.GMAIL.PROFILE,
    queryFn: async (): Promise<GmailProfile> => {
      return makeGmailRequest('/profile');
    },
    enabled: false,
    staleTime: getStaleTime(CACHE_KEYS.GMAIL.PROFILE),
    gcTime: getCacheTTL(CACHE_KEYS.GMAIL.PROFILE),
  });

  const messagesQuery = useQuery({
    queryKey: CACHE_KEYS.GMAIL.MESSAGES,
    queryFn: async (): Promise<Email[]> => {
      const listResponse = await makeGmailRequest(
        '/messages?maxResults=100&q=in:inbox'
      );

      const messageIds = listResponse.messages || [];
      const totalToSync = Math.min(messageIds.length, 100);
      setSyncProgress({ current: 0, total: totalToSync });

      const messages: Email[] = [];

      for (let i = 0; i < totalToSync; i++) {
        const message: GmailMessage = await makeGmailRequest(
          `/messages/${messageIds[i].id}?format=full`
        );
        
        setSyncProgress({ current: i + 1, total: totalToSync });

        const headers = message.payload?.headers || [];
        const getHeader = (name: string) => 
          headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        const email: Email = {
          id: message.id,
          threadId: message.threadId,
          from: getHeader('From'),
          to: getHeader('To').split(',').map(t => t.trim()),
          subject: getHeader('Subject'),
          snippet: message.snippet,
          date: message.internalDate 
            ? new Date(parseInt(message.internalDate)).toISOString()
            : new Date().toISOString(),
          isRead: !message.labelIds?.includes('UNREAD'),
          hasAttachments: message.payload?.parts?.some(p => p.mimeType.startsWith('image/') || p.mimeType.startsWith('application/')) || false,
          labels: message.labelIds || [],
          sizeBytes: message.sizeEstimate || 0,
        };

        messages.push(email);
      }

      return messages;
    },
    enabled: false,
    staleTime: getStaleTime(CACHE_KEYS.GMAIL.MESSAGES),
    gcTime: getCacheTTL(CACHE_KEYS.GMAIL.MESSAGES),
  });

  // Helper function to parse email from Gmail message
  const parseEmailFromMessage = (message: GmailMessage): Email => {
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => 
      headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    return {
      id: message.id,
      threadId: message.threadId,
      from: getHeader('From'),
      to: getHeader('To').split(',').map(t => t.trim()),
      subject: getHeader('Subject'),
      snippet: message.snippet,
      date: message.internalDate 
        ? new Date(parseInt(message.internalDate)).toISOString()
        : new Date().toISOString(),
      isRead: !message.labelIds?.includes('UNREAD'),
      hasAttachments: message.payload?.parts?.some(p => p.mimeType.startsWith('image/') || p.mimeType.startsWith('application/')) || false,
      labels: message.labelIds || [],
      sizeBytes: message.sizeEstimate || 0,
    };
  };

  // Full sync (first time or when historyId is too old)
  const performFullSync = async (profile: GmailProfile): Promise<Email[]> => {
    gmailLogger.info('Performing full sync');
    
    const listResponse = await makeGmailRequest(
      '/messages?maxResults=100&q=in:inbox'
    );

    const messageIds = listResponse.messages || [];
    const totalToSync = Math.min(messageIds.length, 100);
    setSyncProgress({ current: 0, total: totalToSync });

    const msgs: Email[] = [];

    for (let i = 0; i < totalToSync; i++) {
      const message: GmailMessage = await makeGmailRequest(
        `/messages/${messageIds[i].id}?format=full`
      );
      
      setSyncProgress({ current: i + 1, total: totalToSync });
      msgs.push(parseEmailFromMessage(message));
    }

    // Save the current historyId from profile
    if (profile.historyId && user?.id) {
      try {
        await trpcClient.users.update.mutate({
          id: user.id,
          gmail_history_id: profile.historyId,
          last_full_sync_at: new Date().toISOString(),
        });
        gmailLogger.debug('Saved historyId after full sync', { historyId: profile.historyId });
      } catch (err) {
        gmailLogger.error('Failed to save historyId', err);
        // Non-critical, continue
      }
    }

    // Update cache with full sync results
    queryClient.setQueryData<Email[]>(CACHE_KEYS.GMAIL.MESSAGES, msgs);

    return msgs;
  };

  // Incremental sync using Gmail History API
  const performIncrementalSync = async (
    profile: GmailProfile,
    lastHistoryId: string
  ): Promise<Email[]> => {
    gmailLogger.info('Performing incremental sync', { lastHistoryId });
    
    try {
      // Use Gmail History API to get changes since lastHistoryId
      // Gmail History API accepts historyTypes as comma-separated values or multiple params
      // We'll use multiple params for better compatibility
      // Note: History API doesn't support labelIds filter, so we filter inbox messages in processing
      const historyResponse = await makeGmailRequest(
        `/history?startHistoryId=${encodeURIComponent(lastHistoryId)}&historyTypes=messageAdded&historyTypes=messageDeleted&historyTypes=labelAdded&historyTypes=labelRemoved&maxResults=100`
      );
      
      gmailLogger.debug('History API response', {
        historyId: historyResponse.historyId,
        historyCount: historyResponse.history?.length || 0,
        hasHistory: !!historyResponse.history,
        firstRecord: historyResponse.history?.[0] ? Object.keys(historyResponse.history[0]) : [],
      });

      const historyRecords = historyResponse.history || [];
      const newMessageIds: string[] = [];
      const deletedMessageIds: string[] = [];
      const labelChangedMessageIds = new Set<string>();

      // Process history records
      for (const record of historyRecords) {
        // New messages - only include if they're in INBOX
        if (record.messagesAdded) {
          for (const msgAdded of record.messagesAdded) {
            const message = msgAdded.message;
            if (message?.id) {
              // Check if message is in INBOX (has INBOX label)
              const labelIds = message.labelIds || [];
              if (labelIds.includes('INBOX')) {
                newMessageIds.push(message.id);
              }
            }
          }
        }

        // Deleted messages - include all deletions (they were in inbox before deletion)
        if (record.messagesDeleted) {
          for (const msgDeleted of record.messagesDeleted) {
            if (msgDeleted.message?.id) {
              deletedMessageIds.push(msgDeleted.message.id);
            }
          }
        }

        // Label changes (read/unread, starred, etc.) - only for INBOX messages
        if (record.labelsAdded || record.labelsRemoved) {
          // Check labelsAdded for INBOX messages
          if (record.labelsAdded) {
            for (const labelAdded of record.labelsAdded) {
              const message = labelAdded.message;
              if (message?.id && message.labelIds?.includes('INBOX')) {
                labelChangedMessageIds.add(message.id);
              }
            }
          }
          // Check labelsRemoved for INBOX messages
          if (record.labelsRemoved) {
            for (const labelRemoved of record.labelsRemoved) {
              const message = labelRemoved.message;
              // Include if it still has INBOX or if INBOX was just removed (was in inbox)
              if (message?.id && (message.labelIds?.includes('INBOX') || labelRemoved.labelIds?.includes('INBOX'))) {
                labelChangedMessageIds.add(message.id);
              }
            }
          }
        }
      }

      gmailLogger.debug('History processed', {
        newMessages: newMessageIds.length,
        deletedMessages: deletedMessageIds.length,
        labelChanged: labelChangedMessageIds.size,
      });

      setSyncProgress({ current: 0, total: newMessageIds.length + labelChangedMessageIds.size });

      // Fetch new messages
      const newMessages: Email[] = [];
      for (let i = 0; i < newMessageIds.length; i++) {
        const message: GmailMessage = await makeGmailRequest(
          `/messages/${newMessageIds[i]}?format=full`
        );
        
        setSyncProgress({ current: i + 1, total: newMessageIds.length + labelChangedMessageIds.size });
        newMessages.push(parseEmailFromMessage(message));
      }

      // Update messages with label changes
      const updatedMessages: Email[] = [];
      let updateIndex = newMessageIds.length;
      for (const messageId of labelChangedMessageIds) {
        // Skip if we already fetched it as a new message
        if (newMessageIds.includes(messageId)) continue;
        
        try {
          const message: GmailMessage = await makeGmailRequest(
            `/messages/${messageId}?format=full`
          );
          setSyncProgress({ current: updateIndex + 1, total: newMessageIds.length + labelChangedMessageIds.size });
          updatedMessages.push(parseEmailFromMessage(message));
          updateIndex++;
        } catch (err) {
          gmailLogger.warn('Failed to fetch message for label update', { messageId, error: err });
        }
      }

      // Remove deleted messages from cache
      if (deletedMessageIds.length > 0) {
        queryClient.setQueryData<Email[]>(CACHE_KEYS.GMAIL.MESSAGES, (oldMessages = []) => {
          return oldMessages.filter(msg => !deletedMessageIds.includes(msg.id));
        });
        gmailLogger.debug('Removed deleted messages from cache', { count: deletedMessageIds.length });
      }

      // Update historyId
      const currentHistoryId = historyResponse.historyId || profile.historyId;
      if (currentHistoryId && user?.id) {
        try {
          await trpcClient.users.update.mutate({
            id: user.id,
            gmail_history_id: currentHistoryId,
          });
          gmailLogger.debug('Updated historyId after incremental sync', { historyId: currentHistoryId });
        } catch (err) {
          gmailLogger.error('Failed to update historyId', err);
          // Non-critical, continue
        }
      }

      // Merge new and updated messages with existing cache
      queryClient.setQueryData<Email[]>(CACHE_KEYS.GMAIL.MESSAGES, (oldMessages = []) => {
        const existingIds = new Set(oldMessages.map(m => m.id));
        const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
        
        // Update existing messages with label changes
        const updatedIds = new Set(updatedMessages.map(m => m.id));
        const messagesWithoutUpdated = oldMessages.filter(m => !updatedIds.has(m.id));
        
        // Combine: new messages + updated messages + existing messages (excluding updated ones)
        const combined = [...uniqueNewMessages, ...updatedMessages, ...messagesWithoutUpdated];
        
        // Sort by date (newest first) and keep latest 100
        return combined
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 100);
      });

      return [...newMessages, ...updatedMessages];
    } catch (error) {
      // If historyId is too old (Gmail only keeps ~30 days), fall back to full sync
      if (error instanceof APIError && error.statusCode === 404) {
        gmailLogger.warn('HistoryId too old or invalid, falling back to full sync', { lastHistoryId });
        return await performFullSync(profile);
      }
      throw error;
    }
  };

  const syncMutation = useMutation({
    mutationFn: async () => {
      gmailLogger.info('Starting Gmail sync');
      
      const profile = await queryClient.fetchQuery({
        queryKey: CACHE_KEYS.GMAIL.PROFILE,
        queryFn: async (): Promise<GmailProfile> => {
          return makeGmailRequest('/profile');
        },
        staleTime: getStaleTime(CACHE_KEYS.GMAIL.PROFILE),
        gcTime: getCacheTTL(CACHE_KEYS.GMAIL.PROFILE),
      });

      gmailLogger.debug('Profile fetched', undefined, { 
        emailAddress: profile.emailAddress,
        historyId: profile.historyId,
      });

      // Get user's stored historyId from Supabase
      let storedHistoryId: string | null = null;
      
      if (user?.id) {
        try {
          const userData = await trpcClient.users.getById.query({ id: user.id });
          // Log the full userData to debug field names
          gmailLogger.debug('Fetched user data', { 
            userId: user.id,
            userDataKeys: Object.keys(userData || {}),
            hasGmailHistoryId: !!(userData as any)?.gmail_history_id,
            gmailHistoryId: (userData as any)?.gmail_history_id,
          });
          storedHistoryId = (userData as any)?.gmail_history_id || null;
          gmailLogger.debug('Fetched user historyId', { 
            hasHistoryId: !!storedHistoryId,
            historyId: storedHistoryId,
          });
        } catch (err) {
          gmailLogger.warn('Failed to fetch user historyId, doing full sync', err);
        }
      }

      // If no historyId exists, do full sync
      let messages: Email[];
      if (!storedHistoryId) {
        gmailLogger.info('No historyId found, performing full sync');
        messages = await performFullSync(profile);
      } else {
        // Otherwise, do incremental sync
        gmailLogger.info('HistoryId found, performing incremental sync', { historyId: storedHistoryId });
        messages = await performIncrementalSync(profile, storedHistoryId);
      }

      gmailLogger.info(`Synced ${messages.length} messages`);

      // Get all messages from cache (including previously synced ones) for sender calculation
      const allCachedMessages = queryClient.getQueryData<Email[]>(CACHE_KEYS.GMAIL.MESSAGES) || messages;
      
      const senderMap = new Map<string, Sender>();
      
      allCachedMessages.forEach((email: Email) => {
        const fromMatch = email.from.match(/<(.+?)>/) || [null, email.from];
        const senderEmail = fromMatch[1] || email.from;
        const domain = senderEmail.split('@')[1] || '';
        const displayName = email.from.replace(/<.+>/, '').trim();

        if (!senderMap.has(senderEmail)) {
          senderMap.set(senderEmail, {
            id: senderEmail,
            email: senderEmail,
            displayName: displayName || undefined,
            domain,
            totalEmails: 0,
            frequency: 0,
            averageSize: 0,
            engagementRate: 0,
            noiseScore: 0,
            firstSeen: email.date,
            lastSeen: email.date,
            isMarketing: false,
            isNewsletter: false,
            canUnsubscribe: false,
          });
        }

        const sender = senderMap.get(senderEmail)!;
        sender.totalEmails++;
        sender.averageSize = (sender.averageSize * (sender.totalEmails - 1) + email.sizeBytes) / sender.totalEmails;
        sender.lastSeen = email.date > sender.lastSeen ? email.date : sender.lastSeen;
        sender.firstSeen = email.date < sender.firstSeen ? email.date : sender.firstSeen;
        sender.engagementRate = email.isRead ? (sender.engagementRate + 1) : sender.engagementRate;
      });

      const senders = Array.from(senderMap.values()).map((sender: Sender): Sender => ({
        ...sender,
        engagementRate: (sender.engagementRate / sender.totalEmails) * 100,
        noiseScore: calculateNoiseScore(sender, allCachedMessages),
        frequency: sender.totalEmails / 30,
        isMarketing: sender.email.includes('marketing') || sender.email.includes('promo'),
        isNewsletter: sender.email.includes('newsletter') || sender.email.includes('news'),
        canUnsubscribe: sender.isMarketing || sender.isNewsletter,
      }));

      queryClient.setQueryData(CACHE_KEYS.GMAIL.SENDERS, senders);

      // Update last synced time
      setLastSyncedAt(new Date());

      // Invalidate related caches to ensure fresh data
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.STATS.ALL });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.SUGGESTIONS.ALL });

      return { profile, messages, senders };
    },
  });

  const calculateNoiseScore = (sender: Sender, allMessages: Email[]): number => {
    const senderMessages = allMessages.filter(m => m.from.includes(sender.email));
    const unreadCount = senderMessages.filter(m => !m.isRead).length;
    const unreadRatio = unreadCount / senderMessages.length;
    const volumeScore = Math.min(sender.totalEmails / 10, 5);
    const engagementScore = (100 - sender.engagementRate) / 20;
    
    return Math.min(10, volumeScore + engagementScore + unreadRatio * 3);
  };

  const sendersQuery = useQuery<Sender[]>({
    queryKey: CACHE_KEYS.GMAIL.SENDERS,
    queryFn: async () => {
      return [];
    },
    enabled: false,
    staleTime: getStaleTime(CACHE_KEYS.GMAIL.SENDERS),
    gcTime: getCacheTTL(CACHE_KEYS.GMAIL.SENDERS),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return makeGmailRequest(`/messages/${messageId}/modify`, {
        method: 'POST',
        body: JSON.stringify({
          removeLabelIds: ['UNREAD'],
        }),
      });
    },
    onSuccess: (_, messageId) => {
      // Invalidate messages list and specific message cache
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.MESSAGES });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.MESSAGE(messageId) });
      // Also invalidate stats since unread count changed
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.STATS.ALL });
    },
  });

  const archiveMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return makeGmailRequest(`/messages/${messageId}/modify`, {
        method: 'POST',
        body: JSON.stringify({
          removeLabelIds: ['INBOX'],
        }),
      });
    },
    onSuccess: (_, messageId) => {
      // Invalidate messages list and specific message cache
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.MESSAGES });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.MESSAGE(messageId) });
      // Also invalidate stats since inbox count changed
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.STATS.ALL });
    },
  });

  const syncMailbox = useCallback(async () => {
    return syncMutation.mutateAsync();
  }, [syncMutation.mutateAsync]);

  // Auto-sync on app focus and periodic sync
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (!authIsAuthenticated || authDemoMode) {
      // Clear interval if logged out or in demo mode
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    // Sync when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const now = Date.now();
        // Only sync if it's been at least 1 minute since last sync
        if (now - lastSyncTimeRef.current > 60 * 1000) {
          gmailLogger.debug('App came to foreground, triggering incremental sync');
          syncMailbox().catch((err) => {
            gmailLogger.error('Auto-sync on app focus failed', err);
          });
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Periodic sync every 5 minutes
    syncIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastSyncTimeRef.current > SYNC_INTERVAL_MS) {
        gmailLogger.debug('Periodic sync triggered');
        syncMailbox().catch((err) => {
          gmailLogger.error('Periodic sync failed', err);
        });
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      subscription.remove();
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [authIsAuthenticated, authDemoMode, syncMailbox]);

  // Update lastSyncTimeRef when sync completes
  useEffect(() => {
    if (lastSyncedAt) {
      lastSyncTimeRef.current = lastSyncedAt.getTime();
    }
  }, [lastSyncedAt]);

  // Memoize stable values (data) separately from frequently changing values (sync state)
  const dataValue = useMemo(() => ({
    profile: profileQuery.data,
    messages: messagesQuery.data || [],
    senders: sendersQuery.data || [],
  }), [profileQuery.data, messagesQuery.data, sendersQuery.data]);

  // Memoize sync state (changes frequently during sync)
  const syncState = useMemo(() => ({
    isSyncing: syncMutation.isPending,
    syncProgress,
    syncError: syncMutation.error?.message,
    lastSyncedAt,
  }), [syncMutation.isPending, syncProgress, syncMutation.error?.message, lastSyncedAt]);

  // Memoize actions (stable references)
  const actions = useMemo(() => ({
    syncMailbox,
    markAsRead: markAsReadMutation.mutateAsync,
    archiveMessage: archiveMessageMutation.mutateAsync,
  }), [syncMailbox, markAsReadMutation.mutateAsync, archiveMessageMutation.mutateAsync]);

  // Combine into final context value with stable structure
  return useMemo(() => ({
    ...dataValue,
    ...syncState,
    ...actions,
  }), [dataValue, syncState, actions]);
});
