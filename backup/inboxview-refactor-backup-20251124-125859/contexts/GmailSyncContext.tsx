import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import type { GmailMessage, GmailProfile, Email, Sender } from '@/constants/types';
import { APIError, AuthError, NetworkError, normalizeError } from '@/utils/errorHandling';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export const [GmailSyncProvider, useGmailSync] = createContextHook(() => {
  const { getValidAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });

  const makeGmailRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        throw new AuthError('No valid access token. Please sign in again.');
      }

      const response = await fetch(`${GMAIL_API_BASE}${endpoint}`, {
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
    queryKey: ['gmail', 'profile'],
    queryFn: async (): Promise<GmailProfile> => {
      return makeGmailRequest('/profile');
    },
    enabled: false,
  });

  const messagesQuery = useQuery({
    queryKey: ['gmail', 'messages'],
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
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting Gmail sync...');
      
      const profile = await queryClient.fetchQuery({
        queryKey: ['gmail', 'profile'],
        queryFn: async (): Promise<GmailProfile> => {
          return makeGmailRequest('/profile');
        },
      });

      console.log('Profile fetched:', profile.emailAddress);

      const messages = await queryClient.fetchQuery({
        queryKey: ['gmail', 'messages'],
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

      console.log(`Synced ${messages.length} messages`);

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

      queryClient.setQueryData(['gmail', 'senders'], senders);

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
    queryKey: ['gmail', 'senders'],
    queryFn: async () => {
      return [];
    },
    enabled: false,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail', 'messages'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail', 'messages'] });
    },
  });

  const syncMailbox = async () => {
    return syncMutation.mutateAsync();
  };

  return {
    profile: profileQuery.data,
    messages: messagesQuery.data || [],
    senders: sendersQuery.data || [],
    isSyncing: syncMutation.isPending,
    syncProgress,
    syncError: syncMutation.error?.message,
    syncMailbox,
    markAsRead: markAsReadMutation.mutateAsync,
    archiveMessage: archiveMessageMutation.mutateAsync,
  };
});
