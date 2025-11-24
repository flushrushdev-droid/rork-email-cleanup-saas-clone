import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mail, Users, Send } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import type { EmailMessage } from '@/constants/types';
import { createEmailDetailStyles } from './styles';

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
        style={[styles.emailActionButton, { backgroundColor: colors.primary }]}
        onPress={() => onReply(email)}
      >
        <Mail size={18} color="#FFFFFF" />
        <Text style={styles.emailActionButtonText}>Reply</Text>
      </TouchableOpacity>
      {hasMultipleRecipients && (
        <TouchableOpacity
          testID="reply-all-button"
          style={[styles.emailActionButton, { backgroundColor: colors.primary }]}
          onPress={() => onReplyAll(email)}
        >
          <Users size={18} color="#FFFFFF" />
          <Text style={styles.emailActionButtonText}>Reply All</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        testID="forward-button"
        style={[styles.emailActionButton, { backgroundColor: colors.primary }]}
        onPress={() => onForward(email)}
      >
        <Send size={18} color="#FFFFFF" />
        <Text style={styles.emailActionButtonText}>Forward</Text>
      </TouchableOpacity>
    </View>
  );
}


