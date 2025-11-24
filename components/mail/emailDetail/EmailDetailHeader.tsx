import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Archive, Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import type { EmailMessage } from '@/constants/types';
import { createEmailDetailStyles } from './styles';

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
  colors: any;
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
          style={styles.backButton}
          onPress={onBack}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        {currentIndex !== undefined && totalCount !== undefined && (
          <Text style={[styles.emailCounter, { color: colors.textSecondary }]}>
            {currentIndex + 1} of {totalCount}
          </Text>
        )}
      </View>
      <View style={styles.detailActions}>
        {hasPrev && onPrev && (
          <TouchableOpacity
            testID="prev-email"
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={onPrev}
          >
            <ChevronLeft size={20} color={colors.text} />
          </TouchableOpacity>
        )}
        {hasNext && onNext && (
          <TouchableOpacity
            testID="next-email"
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={onNext}
          >
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          testID="star-email"
          style={styles.actionButton}
          onPress={() => onStar(selectedEmail.id)}
        >
          <Star
            size={20}
            color={selectedEmail.isStarred ? colors.warning : colors.text}
            fill={selectedEmail.isStarred ? colors.warning : 'none'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          testID="archive-email"
          style={styles.actionButton}
          onPress={() => onArchive(selectedEmail)}
        >
          <Archive size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          testID="delete-email"
          style={styles.actionButton}
          onPress={() => onDelete(selectedEmail)}
        >
          <Trash2 size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}


