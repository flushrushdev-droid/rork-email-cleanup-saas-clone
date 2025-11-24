import type { HistoryEntry } from '@/constants/types';

export const sampleHistoryEntries: HistoryEntry[] = [
  {
    id: 'hist_1',
    type: 'newsletter_unsubscribed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    description: 'Unsubscribed from Marketing Weekly',
    metadata: {
      senderEmail: 'newsletter@marketing.com',
      senderName: 'Marketing Weekly',
    },
  },
  {
    id: 'hist_2',
    type: 'email_deleted',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    description: 'Deleted promotional email from "50% Off Sale"',
    metadata: {
      emailSubject: '50% Off Sale - Limited Time!',
      senderEmail: 'promo@shop.com',
    },
  },
  {
    id: 'hist_3',
    type: 'folder_created',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    description: 'Created custom folder "Important Invoices"',
    metadata: {
      folderName: 'Important Invoices',
    },
  },
  {
    id: 'hist_4',
    type: 'bulk_archive',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Archived 47 old promotional emails',
    metadata: {
      count: 47,
    },
  },
  {
    id: 'hist_5',
    type: 'email_marked_read',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Marked email from John as read',
    metadata: {
      emailSubject: 'Project Update - Q4 Review',
      senderEmail: 'john@company.com',
      senderName: 'John Smith',
    },
  },
  {
    id: 'hist_6',
    type: 'bulk_delete',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Deleted 23 spam emails',
    metadata: {
      count: 23,
    },
  },
  {
    id: 'hist_7',
    type: 'newsletter_unsubscribed',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Unsubscribed from Daily Tech Digest',
    metadata: {
      senderEmail: 'digest@techblog.com',
      senderName: 'Daily Tech Digest',
    },
  },
  {
    id: 'hist_8',
    type: 'rule_created',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Created automation rule "Archive old newsletters"',
    metadata: {
      ruleName: 'Archive old newsletters',
    },
  },
  {
    id: 'hist_9',
    type: 'email_archived',
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Archived meeting notes from Sarah',
    metadata: {
      emailSubject: 'Team Meeting Notes - Jan 15',
      senderEmail: 'sarah@company.com',
      senderName: 'Sarah Johnson',
    },
  },
  {
    id: 'hist_10',
    type: 'newsletter_unsubscribed',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Unsubscribed from Fashion Updates',
    metadata: {
      senderEmail: 'updates@fashion.com',
      senderName: 'Fashion Updates',
    },
  },
  {
    id: 'hist_11',
    type: 'bulk_delete',
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Deleted 156 old emails from last year',
    metadata: {
      count: 156,
    },
  },
  {
    id: 'hist_12',
    type: 'sender_blocked',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Blocked sender spam@unknown.com',
    metadata: {
      senderEmail: 'spam@unknown.com',
    },
  },
  {
    id: 'hist_13',
    type: 'email_deleted',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Deleted outdated calendar invite',
    metadata: {
      emailSubject: 'Cancelled: Team Sync',
      senderEmail: 'calendar@company.com',
    },
  },
  {
    id: 'hist_14',
    type: 'folder_created',
    timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Created custom folder "Travel Plans"',
    metadata: {
      folderName: 'Travel Plans',
    },
  },
  {
    id: 'hist_15',
    type: 'newsletter_unsubscribed',
    timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Unsubscribed from Fitness Tips Weekly',
    metadata: {
      senderEmail: 'tips@fitness.com',
      senderName: 'Fitness Tips Weekly',
    },
  },
];
