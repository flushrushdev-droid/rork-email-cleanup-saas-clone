import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Paperclip } from 'lucide-react-native';
import { createEmailDetailStyles } from './styles';

interface EmailAttachmentListProps {
  attachments?: Array<{ name: string; size: string }>;
  colors: any;
}

export function EmailAttachmentList({ attachments, colors }: EmailAttachmentListProps) {
  const styles = createEmailDetailStyles(colors);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <View style={[styles.attachmentsSection, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      {attachments.map((attachment, index) => (
        <View key={index} style={[styles.attachmentItem, { backgroundColor: colors.background }]}>
          <Paperclip size={16} color={colors.textSecondary} />
          <AppText style={[styles.attachmentName, { color: colors.text }]} dynamicTypeStyle="body">{attachment.name}</AppText>
          <AppText style={[styles.attachmentSize, { color: colors.textSecondary }]} dynamicTypeStyle="caption">{attachment.size}</AppText>
        </View>
      ))}
    </View>
  );
}


