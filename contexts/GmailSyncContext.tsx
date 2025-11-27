import createContextHook from '@nkzw/create-context-hook';
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import type { GmailMessage, GmailProfile, Email, Sender } from '@/constants/types';
import { APIError, AuthError, NetworkError, normalizeError } from '@/utils/errorHandling';
import { createScopedLogger } from '@/utils/logger';
import { AppConfig, validateSecureUrl } from '@/config/env';
import { getStaleTime, getCacheTTL, CACHE_KEYS } from '@/lib/queryCache';

// Validate Gmail API base URL is HTTPS in production
const GMAIL_API_BASE = validateSecureUrl(AppConfig.gmail.apiBase);
const gmailLogger = createScopedLogger('GmailSync');

export const [GmailSyncProvider, useGmailSync] = createContextHook(() => {
  const { getValidAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const makeGmailRequest = async (endpoint: string, options: RequestInit = {}) => {
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
          throw new AuthError('Authentication failed. Please sign in again.', new Error(errorMessage));
        }
        
        if (statusCode === 429) {
          throw new APIError('Too many requests. Please wait a moment and try again.', statusCode, true);
        }
        
        if (statusCode >= 500) {
          throw new APIError('Gmail service is temporarily unavailable. Please try again later.', statusCode, true);
        }
        
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
      setSyncProgress({ current: 0, total: messageIds.length });

      const messages: Email[] = [];

      for (let i = 0; i < Math.min(messageIds.length, 50); i++) {
        const message: GmailMessage = await makeGmailRequest(
          `/messages/${messageIds[i].id}?format=full`
        );
        
        setSyncProgress({ current: i + 1, total: messageIds.length });

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

      gmailLogger.debug('Profile fetched', undefined, { emailAddress: profile.emailAddress });

      const messages = await queryClient.fetchQuery({
        queryKey: CACHE_KEYS.GMAIL.MESSAGES,
        queryFn: async (): Promise<Email[]> => {
          const listResponse = await makeGmailRequest(
            '/messages?maxResults=100&q=in:inbox'
          );

          const messageIds = listResponse.messages || [];
          setSyncProgress({ current: 0, total: messageIds.length });

          const msgs: Email[] = [];

          for (let i = 0; i < Math.min(messageIds.length, 50); i++) {
            const message: GmailMessage = await makeGmailRequest(
              `/messages/${messageIds[i].id}?format=full`
            );
            
            setSyncProgress({ current: i + 1, total: messageIds.length });

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

            msgs.push(email);
          }

          return msgs;
        },
      });

      gmailLogger.info(`Synced ${messages.length} messages`);

      const senderMap = new Map<string, Sender>();
      
      messages.forEach((email: Email) => {
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
        noiseScore: calculateNoiseScore(sender, messages),
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
