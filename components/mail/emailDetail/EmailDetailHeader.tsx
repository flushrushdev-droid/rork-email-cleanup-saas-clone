import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Archive, Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import type { EmailMessage } from '@/constants/types';
import { createEmailDetailStyles } from './styles';
import { triggerButtonHaptic, triggerActionHaptic, triggerDestructiveHaptic } from '@/utils/haptics';

interface EmailDetailHeaderProps {
  selectedEmail: EmailMessage;
  onBack: () => void;
  onStar: (emailId: string) => void;
  onArchive: (email: EmailMessage) => void;
  onDelete: (email: EmailMessage) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  currentIndex?: number;
  totalCount?: number;
  insets: EdgeInsets;
  colors: import('@/constants/colors').ThemeColors;
}

export function EmailDetailHeader({
  selectedEmail,
  onBack,
  onStar,
  onArchive,
  onDelete,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  currentIndex,
  totalCount,
  insets,
  colors,
}: EmailDetailHeaderProps) {
  const styles = createEmailDetailStyles(colors);

  return (
    <View style={[styles.detailHeader, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          testID="back-to-inbox"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back to inbox"
          accessibilityHint="Double tap to return to email list"
          style={styles.backButton}
          onPress={onBack}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        {currentIndex !== undefined && totalCount !== undefined && (
          <AppText 
            style={[styles.emailCounter, { color: colors.textSecondary }]}
            accessibilityRole="text"
            accessibilityLabel={`Email ${currentIndex + 1} of ${totalCount}`}
            dynamicTypeStyle="caption"
          >
            {currentIndex + 1} of {totalCount}
          </AppText>
        )}
      </View>
      <View style={styles.detailActions}>
        {hasPrev && onPrev && (
          <TouchableOpacity
            testID="prev-email"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous email"
            accessibilityHint="Double tap to view the previous email"
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={async () => {
              await triggerButtonHaptic();
              onPrev();
            }}
          >
            <ChevronLeft size={20} color={colors.text} />
          </TouchableOpacity>
        )}
        {hasNext && onNext && (
          <TouchableOpacity
            testID="next-email"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Next email"
            accessibilityHint="Double tap to view the next email"
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={async () => {
              await triggerButtonHaptic();
              onNext();
            }}
          >
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          testID="star-email"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={selectedEmail.isStarred ? 'Unstar email' : 'Star email'}
          accessibilityHint={selectedEmail.isStarred ? 'Double tap to remove star' : 'Double tap to mark as important'}
          accessibilityState={{ checked: selectedEmail.isStarred }}
          style={styles.actionButton}
          onPress={async () => {
            await triggerButtonHaptic();
            onStar(selectedEmail.id);
          }}
        >
          <Star
            size={20}
            color={selectedEmail.isStarred ? colors.warning : colors.text}
            fill={selectedEmail.isStarred ? colors.warning : 'none'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          testID="archive-email"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Archive email"
          accessibilityHint="Double tap to move this email to archive"
          style={styles.actionButton}
          onPress={async () => {
            await triggerActionHaptic();
            onArchive(selectedEmail);
          }}
        >
          <Archive size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          testID="delete-email"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Delete email"
          accessibilityHint="Double tap to move this email to trash"
          style={styles.actionButton}
          onPress={async () => {
            await triggerDestructiveHaptic();
            onDelete(selectedEmail);
          }}
        >
          <Trash2 size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}


