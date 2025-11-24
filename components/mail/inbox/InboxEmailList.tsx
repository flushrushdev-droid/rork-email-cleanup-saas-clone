import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Mail, Send, Trash2, FileEdit } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import type { Draft, FilterType } from './types';
import { emailListStyles } from './styles/emailListStyles';
import { draftStyles } from './styles/draftStyles';
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
}

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
}: InboxEmailListProps) {
  const { colors } = useTheme();

  // Render drafts
  if (activeFilter === 'drafts' || activeFilter === 'drafts-ai') {
    if (drafts.length === 0) {
      return (
        <View style={emailListStyles.emptyState}>
          <FileEdit size={48} color={colors.textSecondary} />
          <Text style={[emailListStyles.emptyText, { color: colors.textSecondary }]}>
            {activeFilter === 'drafts-ai' ? 'No AI drafts' : 'No drafts'}
          </Text>
          <Text style={[emailListStyles.emptySubtext, { color: colors.textSecondary }]}>
            {activeFilter === 'drafts-ai' ? 'Use AI to generate email drafts' : 'Start composing to save drafts'}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={emailListStyles.emailList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {drafts.map((draft) => (
          <InboxDraftItem
            key={draft.id}
            draft={draft}
            activeFilter={activeFilter}
            onPress={() => onLoadDraft(draft)}
            onDelete={() => onDeleteDraft(draft.id)}
          />
        ))}
      </ScrollView>
    );
  }

  // Render sent (empty state)
  if (activeFilter === 'sent') {
    return (
      <View style={emailListStyles.emptyState}>
        <Send size={48} color={colors.textSecondary} />
        <Text style={[emailListStyles.emptyText, { color: colors.textSecondary }]}>No sent emails</Text>
        <Text style={[emailListStyles.emptySubtext, { color: colors.textSecondary }]}>Your sent messages will appear here</Text>
      </View>
    );
  }

  // Render empty state for trash or no emails
  if (filteredEmails.length === 0) {
    if (activeFilter === 'trash') {
      return (
        <View style={emailListStyles.emptyState}>
          <Trash2 size={48} color={colors.textSecondary} />
          <Text style={[emailListStyles.emptyText, { color: colors.textSecondary }]}>Trash is empty</Text>
          <Text style={[emailListStyles.emptySubtext, { color: colors.textSecondary }]}>Deleted emails will appear here</Text>
        </View>
      );
    }

    return (
      <View style={emailListStyles.emptyState}>
        <Mail size={48} color={colors.textSecondary} />
        <Text style={[emailListStyles.emptyText, { color: colors.textSecondary }]}>No emails found</Text>
      </View>
    );
  }

  // Render email list
  return (
    <ScrollView
      style={emailListStyles.emailList}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
    >
      {filteredEmails.map((email) => (
        <InboxEmailItem
          key={email.id}
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
      ))}
    </ScrollView>
  );
}

