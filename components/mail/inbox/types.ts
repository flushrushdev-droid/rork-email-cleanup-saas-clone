import type { EmailMessage, EmailCategory } from '@/constants/types';

export type FilterType = 'all' | 'unread' | 'starred' | 'drafts' | 'drafts-ai' | 'trash' | 'sent' | 'archived';

export type Draft = {
  id: string;
  to: string;
  cc?: string;
  subject: string;
  body: string;
  date: Date;
};

export type SmartFolder = {
  id: string;
  name: string;
  count: number;
  color: string;
  icon: string;
  category?: EmailCategory;
};

export interface InboxViewProps {
  insets: { top: number; bottom: number; left: number; right: number };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  filteredEmails: EmailMessage[];
  drafts: Draft[];
  smartFolders: SmartFolder[];
  customFolders: Array<{ id: string; name: string; color: string; count: number }>;
  onEmailPress: (email: EmailMessage) => void;
  onStarEmail: (emailId: string) => void;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => void;
  onCreateFolder: () => void;
  selectionMode: boolean;
  selectedEmails: Set<string>;
  onToggleSelection: (emailId: string) => void;
  onSelectAll: () => void;
  onCancelSelection: () => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onBulkMarkRead: () => void;
  onBulkMove: () => void;
  onCompose: () => void;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

