export interface InboxHealth {
  score: number;
  trend: 'up' | 'down';
  unreadCount: number;
  noisePercentage: number;
  largeAttachmentsCount: number;
  automationCoverage: number;
  projectedTimeSaved: number;
  projectedSpaceSaved: number;
}

export interface Sender {
  id: string;
  email: string;
  displayName?: string;
  domain: string;
  totalEmails: number;
  frequency: number;
  averageSize: number;
  engagementRate: number;
  noiseScore: number;
  firstSeen: string;
  lastSeen: string;
  isMarketing: boolean;
  isNewsletter: boolean;
  canUnsubscribe: boolean;
}

export interface Email {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  snippet: string;
  body?: string;
  date: string;
  isRead: boolean;
  hasAttachments: boolean;
  labels: string[];
  priority?: 'action' | 'later' | 'fyi' | 'low';
  sizeBytes: number;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  payload?: {
    headers?: Array<{
      name: string;
      value: string;
    }>;
    parts?: Array<{
      mimeType: string;
      body?: {
        size: number;
        data?: string;
      };
    }>;
    body?: {
      size: number;
      data?: string;
    };
  };
  sizeEstimate?: number;
  internalDate?: string;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  idToken?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  provider: 'google';
}

export type EmailProvider = 'gmail' | 'outlook' | 'imap';

export interface EmailAccount {
  id: string;
  email: string;
  provider: EmailProvider;
  displayName?: string;
  connected: boolean;
  lastSync?: Date;
}

export type EmailCategory =
  | 'invoices'
  | 'receipts'
  | 'travel'
  | 'hr'
  | 'legal'
  | 'personal'
  | 'promotions'
  | 'social'
  | 'system';

export interface SenderProfile {
  id: string;
  email: string;
  domain: string;
  displayName?: string;
  totalEmails: number;
  totalSize: number;
  avgSize: number;
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  noiseScore: number;
  engagementRate: number;
  isMarketing: boolean;
  hasUnsubscribe: boolean;
  isMuted: boolean;
  isTrusted: boolean;
  isBlocked: boolean;
  category?: EmailCategory;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  snippet: string;
  date: Date;
  size: number;
  labels: string[];
  tags?: string[];
  hasAttachments: boolean;
  attachmentCount: number;
  isRead: boolean;
  isStarred: boolean;
  priority?: 'action' | 'later' | 'fyi' | 'low';
  category?: EmailCategory;
  confidence?: number;
}

export type RuleConditionField = 'sender' | 'age' | 'semantic' | 'domain';
export type RuleConditionOperator = 'contains' | 'greaterThan' | 'matches' | 'equals';
export type RuleActionType = 'label' | 'tag' | 'archive' | 'delete';

export interface RuleCondition {
  field: RuleConditionField;
  operator: RuleConditionOperator;
  value: string | number;
}

export interface RuleAction {
  type: RuleActionType;
  value?: string;
}

export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  createdAt: Date;
  lastRun?: Date;
  matchCount?: number;
}

export type HistoryActionType = 
  | 'email_deleted'
  | 'email_archived'
  | 'email_marked_read'
  | 'newsletter_unsubscribed'
  | 'folder_created'
  | 'rule_created'
  | 'sender_blocked'
  | 'sender_muted'
  | 'bulk_delete'
  | 'bulk_archive';

export interface HistoryEntry {
  id: string;
  type: HistoryActionType;
  timestamp: string;
  description: string;
  metadata?: {
    emailId?: string;
    emailSubject?: string;
    senderEmail?: string;
    senderName?: string;
    count?: number;
    folderName?: string;
    ruleName?: string;
  };
}
