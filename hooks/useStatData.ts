/**
 * Custom Hook for Stat Data
 * 
 * Provides filtered and normalized data for stat detail screens.
 */

import { useMemo } from 'react';
import { mockSenders, mockRecentEmails } from '@/mocks/emailData';
import { filterAndNormalizeEmails } from '@/utils/emailNormalization';
import type { Email, Sender } from '@/constants/types';
import type { StatType } from '@/utils/statInfo';

export interface UseStatDataParams {
  type: StatType;
  messages: Email[];
  senders: Sender[];
  trashedEmails: Set<string>;
}

export interface UseStatDataReturn {
  unreadEmails: Email[];
  noisySenders: Sender[];
  emailsWithFiles: Email[];
  unreadCount: number;
  filesCount: number;
}

/**
 * Hook for managing stat data filtering and normalization
 */
export function useStatData({
  type,
  messages,
  senders,
  trashedEmails,
}: UseStatDataParams): UseStatDataReturn {
  // Memoize filtered data to prevent blocking during transitions
  const unreadEmails = useMemo(() => {
    if (type !== 'unread') return [];
    const emails = messages.length > 0 
      ? messages.filter(m => !m.isRead) 
      : mockRecentEmails.filter(m => !m.isRead);
    // Filter out trashed emails and ensure they have size information
    return filterAndNormalizeEmails(emails, {
      trashedEmailIds: trashedEmails,
      requireSizeInfo: true,
    });
  }, [type, messages, trashedEmails]);

  const noisySenders = useMemo(() => {
    if (type !== 'noise') return [];
    return (senders.length > 0 ? senders : mockSenders)
      .filter((s): s is Sender => 'noiseScore' in s && typeof s.noiseScore === 'number')
      .filter(s => s.noiseScore >= 6)
      .sort((a, b) => b.noiseScore - a.noiseScore);
  }, [type, senders]);

  const emailsWithFiles = useMemo(() => {
    if (type !== 'files') return [];
    const emails = (messages.length > 0 ? messages : mockRecentEmails)
      .filter(m => {
        // Check if email has attachments
        const hasAttachments = m.hasAttachments;
        const attachmentCount = 'attachmentCount' in m && typeof m.attachmentCount === 'number' ? m.attachmentCount : 0;
        return hasAttachments && attachmentCount > 0;
      });
    
    // Filter out trashed emails and normalize
    const normalized = filterAndNormalizeEmails(emails, {
      trashedEmailIds: trashedEmails,
      requireSizeInfo: true,
    });
    
    // Sort by size (largest first)
    return normalized.sort((a, b) => {
      const aSize = a.sizeBytes || 0;
      const bSize = b.sizeBytes || 0;
      return bSize - aSize;
    });
  }, [type, messages, trashedEmails]);

  // Calculate counts from filtered data to ensure consistency
  const unreadCount = useMemo(() => unreadEmails.length, [unreadEmails]);
  const filesCount = useMemo(() => emailsWithFiles.length, [emailsWithFiles]);

  return {
    unreadEmails,
    noisySenders,
    emailsWithFiles,
    unreadCount,
    filesCount,
  };
}

