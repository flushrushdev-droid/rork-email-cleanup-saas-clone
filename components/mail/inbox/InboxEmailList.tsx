import React from 'react';
import { View, Text, FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { Mail, Send, Trash2, FileEdit } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import type { Draft, FilterType } from './types';
import { emailListStyles } from './styles/emailListStyles';
import { InboxEmailItem } from './InboxEmailItem';
import { InboxDraftItem } from './InboxDraftItem';

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
  insets: { top: number; bottom: number; left: number; right: number };
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

// Empty state components
const DraftsEmptyState = React.memo<{ activeFilter: FilterType; colors: any }>(({ activeFilter, colors }) => (
  <View style={emailListStyles.emptyState}>
    <FileEdit size={48} color={colors.textSecondary} />
    <Text style={[emailListStyles.emptyText, { color: colors.textSecondary }]}>
      {activeFilter === 'drafts-ai' ? 'No AI drafts' : 'No drafts'}
    </Text>
    <Text style={[emailListStyles.emptySubtext, { color: colors.textSecondary }]}>
      {activeFilter === 'drafts-ai' ? 'Use AI to generate email drafts' : 'Start composing to save drafts'}
    </Text>
  </View>
));
DraftsEmptyState.displayName = 'DraftsEmptyState';

const SentEmptyState = React.memo<{ colors: any }>(({ colors }) => (
  <View style={emailListStyles.emptyState}>
    <Send size={48} color={colors.textSecondary} />
    <Text style={[emailListStyles.emptyText, { color: colors.textSecondary }]}>No sent emails</Text>
    <Text style={[emailListStyles.emptySubtext, { color: colors.textSecondary }]}>Your sent messages will appear here</Text>
  </View>
));
SentEmptyState.displayName = 'SentEmptyState';

const TrashEmptyState = React.memo<{ colors: any }>(({ colors }) => (
  <View style={emailListStyles.emptyState}>
    <Trash2 size={48} color={colors.textSecondary} />
    <Text style={[emailListStyles.emptyText, { color: colors.textSecondary }]}>Trash is empty</Text>
    <Text style={[emailListStyles.emptySubtext, { color: colors.textSecondary }]}>Deleted emails will appear here</Text>
  </View>
));
TrashEmptyState.displayName = 'TrashEmptyState';

const NoEmailsEmptyState = React.memo<{ colors: any }>(({ colors }) => (
  <View style={emailListStyles.emptyState}>
    <Mail size={48} color={colors.textSecondary} />
    <Text style={[emailListStyles.emptyText, { color: colors.textSecondary }]}>No emails found</Text>
  </View>
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
  insets,
  onRefresh,
  isRefreshing = false,
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
    <InboxEmailItem
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
    />
  ), [selectionMode, selectedEmails, onEmailPress, onStarEmail, onToggleSelection]);

  const draftListEmptyComponent = React.useMemo(() => (
    <DraftsEmptyState activeFilter={activeFilter} colors={colors} />
  ), [activeFilter, colors]);

  const emailListEmptyComponent = React.useMemo(() => {
    if (activeFilter === 'trash') {
      return <TrashEmptyState colors={colors} />;
    }
    return <NoEmailsEmptyState colors={colors} />;
  }, [activeFilter, colors]);

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
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={50}
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
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      updateCellsBatchingPeriod={50}
    />
  );
}

