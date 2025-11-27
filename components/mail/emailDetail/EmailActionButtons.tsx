import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Mail, Users, Send } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import type { EmailMessage } from '@/constants/types';
import { createEmailDetailStyles } from './styles';
import { triggerButtonHaptic } from '@/utils/haptics';

interface EmailActionButtonsProps {
  email: EmailMessage;
  hasMultipleRecipients: boolean;
  onReply: (email: EmailMessage) => void;
  onReplyAll: (email: EmailMessage) => void;
  onForward: (email: EmailMessage) => void;
  insets: EdgeInsets;
  colors: any;
}

export function EmailActionButtons({
  email,
  hasMultipleRecipients,
  onReply,
  onReplyAll,
  onForward,
  insets,
  colors,
}: EmailActionButtonsProps) {
  const styles = createEmailDetailStyles(colors);

  return (
    <View style={[styles.emailActionButtons, { paddingBottom: insets.bottom + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
      <TouchableOpacity
        testID="reply-button"
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Reply"
        accessibilityHint="Double tap to reply to this email"
        style={[styles.emailActionButton, { backgroundColor: colors.primary }]}
        onPress={async () => {
          await triggerButtonHaptic();
          onReply(email);
        }}
      >
        <Mail size={18} color={colors.surface} />
        <AppText style={[styles.emailActionButtonText, { color: colors.surface }]} dynamicTypeStyle="headline">Reply</AppText>
      </TouchableOpacity>
      {hasMultipleRecipients && (
        <TouchableOpacity
          testID="reply-all-button"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Reply All"
          accessibilityHint="Double tap to reply to all recipients"
          style={[styles.emailActionButton, { backgroundColor: colors.primary }]}
          onPress={async () => {
            await triggerButtonHaptic();
            onReplyAll(email);
          }}
        >
          <Users size={18} color={colors.surface} />
          <AppText style={[styles.emailActionButtonText, { color: colors.surface }]} dynamicTypeStyle="headline">Reply All</AppText>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        testID="forward-button"
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Forward"
        accessibilityHint="Double tap to forward this email"
        style={[styles.emailActionButton, { backgroundColor: colors.primary }]}
        onPress={async () => {
          await triggerButtonHaptic();
          onForward(email);
        }}
      >
        <Send size={18} color={colors.surface} />
        <AppText style={[styles.emailActionButtonText, { color: colors.surface }]} dynamicTypeStyle="headline">Forward</AppText>
      </TouchableOpacity>
    </View>
  );
}


