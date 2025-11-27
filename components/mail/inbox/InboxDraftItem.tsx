import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { FileEdit, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { Draft, FilterType } from './types';
import { formatDate } from '@/utils/dateFormat';
import { draftStyles } from './styles/draftStyles';
import { emailListStyles } from './styles/emailListStyles';
import { getInitial } from './utils/avatarUtils';

interface InboxDraftItemProps {
  draft: Draft;
  activeFilter: FilterType;
  onPress: () => void;
  onDelete: () => void;
}

export const InboxDraftItem = React.memo<InboxDraftItemProps>(({
  draft,
  activeFilter,
  onPress,
  onDelete,
}) => {
  const { colors } = useTheme();
  
  const recipientName = draft.to?.split('<')[0].trim() || draft.to || '?';
  const recipientInitial = getInitial(recipientName);

  return (
    <TouchableOpacity
      key={draft.id}
      testID={`draft-${draft.id}`}
      style={[
        draftStyles.draftCard,
        { backgroundColor: colors.surface, borderLeftColor: colors.primary }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[emailListStyles.senderAvatar, { backgroundColor: colors.primary }]}>
        <AppText style={emailListStyles.senderInitial} dynamicTypeStyle="body">{recipientInitial}</AppText>
      </View>
      <View style={draftStyles.draftCardContent}>
        <View style={draftStyles.draftCardHeader}>
          <FileEdit size={16} color={colors.primary} />
          <AppText style={[draftStyles.draftBadge, { color: colors.primary }]} dynamicTypeStyle="caption">
            {activeFilter === 'drafts-ai' ? 'AI Draft' : 'Draft'}
          </AppText>
          <AppText style={[draftStyles.draftDate, { color: colors.textSecondary }]} dynamicTypeStyle="caption">
            {formatDate(draft.date)}
          </AppText>
        </View>
        <AppText style={[draftStyles.draftTo, { color: colors.text }]} numberOfLines={1} dynamicTypeStyle="body">
          To: {draft.to || '(no recipient)'}
        </AppText>
        <AppText style={[draftStyles.draftSubject, { color: colors.text }]} numberOfLines={1} dynamicTypeStyle="body">
          {draft.subject || '(no subject)'}
        </AppText>
        {draft.body && (
          <AppText style={[draftStyles.draftBody, { color: colors.textSecondary }]} numberOfLines={2} dynamicTypeStyle="caption">
            {draft.body}
          </AppText>
        )}
      </View>
      <TouchableOpacity
        testID={`delete-draft-${draft.id}`}
        onPress={(e) => {
          e?.stopPropagation?.();
          onDelete();
        }}
        style={draftStyles.deleteDraftButton}
      >
        <Trash2 size={18} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

InboxDraftItem.displayName = 'InboxDraftItem';

