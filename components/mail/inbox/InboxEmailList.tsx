import React from 'react';
import { View, Text, FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { Mail, Send, Trash2, FileEdit } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import type { Draft, FilterType } from './types';
import { emailListStyles } from './styles/emailListStyles';
import { SwipeableEmailItem } from './SwipeableEmailItem';
import { InboxDraftItem } from './InboxDraftItem';
import { EmailSkeleton } from '@/components/common/EmailSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { getOptimizedFlatListProps } from '@/utils/listConfig';

interface InboxEmailListProps {
  filteredEmails: EmailMessage[];
  activeFilter: FilterType;
  drafts: Draft[];
  selectionMode: boolean;
  selectedEmails: Set<string>;
  onEmailPress: (email: EmailMessage) => void;
  onStarEmail: (emailId: string) => void;
  onToggleSelection: (emailId: string) => void;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => void;
  onArchive?: (email: EmailMessage) => void;
  onDelete?: (email: EmailMessage) => void;
  insets: { top: number; bottom: number; left: number; right: number };
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

// Empty state components using EmptyState component
const DraftsEmptyState = React.memo<{ activeFilter: FilterType; colors: import('@/constants/colors').ThemeColors }>(({ activeFilter, colors }) => (
  <EmptyState
    icon={FileEdit}
    title={activeFilter === 'drafts-ai' ? 'No AI drafts' : 'No drafts'}
    description={activeFilter === 'drafts-ai' ? 'Use AI to generate email drafts' : 'Start composing to save drafts'}
    iconSize={48}
    style={emailListStyles.emptyState}
  />
));
DraftsEmptyState.displayName = 'DraftsEmptyState';

const SentEmptyState = React.memo<{ colors: import('@/constants/colors').ThemeColors }>(({ colors }) => (
  <EmptyState
    icon={Send}
    title="No sent emails"
    description="Your sent messages will appear here"
    iconSize={48}
    style={emailListStyles.emptyState}
  />
));
SentEmptyState.displayName = 'SentEmptyState';

const TrashEmptyState = React.memo<{ colors: import('@/constants/colors').ThemeColors }>(({ colors }) => (
  <EmptyState
    icon={Trash2}
    title="Trash is empty"
    description="Deleted emails will appear here"
    iconSize={48}
    style={emailListStyles.emptyState}
  />
));
TrashEmptyState.displayName = 'TrashEmptyState';

const NoEmailsEmptyState = React.memo<{ colors: import('@/constants/colors').ThemeColors }>(({ colors }) => (
  <EmptyState
    icon={Mail}
    title="No emails found"
    description=""
    iconSize={48}
    style={emailListStyles.emptyState}
  />
));
NoEmailsEmptyState.displayName = 'NoEmailsEmptyState';

export function InboxEmailList({
  filteredEmails,
  activeFilter,
  drafts,
  selectionMode,
  selectedEmails,
  onEmailPress,
  onStarEmail,
  onToggleSelection,
  onLoadDraft,
  onDeleteDraft,
  onArchive,
  onDelete,
  insets,
  onRefresh,
  isRefreshing = false,
  isLoading = false,
}: InboxEmailListProps) {
  const { colors } = useTheme();
  
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
      progressViewOffset={0}
    />
  ) : undefined;

  // Hooks must be at top level - prepare all render functions
  const renderDraftItem: ListRenderItem<Draft> = React.useCallback(({ item: draft }) => (
    <InboxDraftItem
      draft={draft}
      activeFilter={activeFilter}
      onPress={() => onLoadDraft(draft)}
      onDelete={() => onDeleteDraft(draft.id)}
    />
  ), [activeFilter, onLoadDraft, onDeleteDraft]);

  const renderEmailItem: ListRenderItem<EmailMessage> = React.useCallback(({ item: email }) => (
    <SwipeableEmailItem
      email={email}
      isSelected={selectedEmails.has(email.id)}
      selectionMode={selectionMode}
      onPress={() => {
        if (selectionMode) {
          onToggleSelection(email.id);
        } else {
          onEmailPress(email);
        }
      }}
      onStarPress={() => onStarEmail(email.id)}
      onToggleSelection={() => onToggleSelection(email.id)}
      onArchive={onArchive}
      onDelete={onDelete}
    />
  ), [selectionMode, selectedEmails, onEmailPress, onStarEmail, onToggleSelection, onArchive, onDelete]);

  const draftListEmptyComponent = React.useMemo(() => (
    <DraftsEmptyState activeFilter={activeFilter} colors={colors} />
  ), [activeFilter, colors]);

  const emailListEmptyComponent = React.useMemo(() => {
    if (activeFilter === 'trash') {
      return <TrashEmptyState colors={colors} />;
    }
    return <NoEmailsEmptyState colors={colors} />;
  }, [activeFilter, colors]);

  // Show skeleton loader during initial load
  if (isLoading && !isRefreshing) {
    if (activeFilter === 'drafts' || activeFilter === 'drafts-ai') {
      return <EmailSkeleton count={5} />;
    }
    if (activeFilter === 'sent') {
      return <EmailSkeleton count={5} />;
    }
    return <EmailSkeleton count={5} />;
  }

  // Render drafts with FlatList
  if (activeFilter === 'drafts' || activeFilter === 'drafts-ai') {
    return (
      <FlatList
        data={drafts}
        renderItem={renderDraftItem}
        keyExtractor={(item) => item.id}
        style={emailListStyles.emailList}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        ListEmptyComponent={draftListEmptyComponent}
        {...getOptimizedFlatListProps()}
      />
    );
  }

  // Render sent (empty state)
  if (activeFilter === 'sent') {
    return <SentEmptyState colors={colors} />;
  }

  return (
    <FlatList
      data={filteredEmails}
      renderItem={renderEmailItem}
      keyExtractor={(item) => item.id}
      style={emailListStyles.emailList}
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      ListEmptyComponent={emailListEmptyComponent}
      {...getOptimizedFlatListProps()}
    />
  );
}

