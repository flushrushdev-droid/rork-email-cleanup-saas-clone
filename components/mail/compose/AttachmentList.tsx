import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Paperclip, Trash2 } from 'lucide-react-native';
import { formatFileSize } from '@/utils/fileUtils';
import { createComposeStyles } from './styles';

interface Attachment {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number | null;
}

interface AttachmentListProps {
  attachments: Attachment[];
  onRemove: (index: number) => void;
  colors: any;
}

export function AttachmentList({ attachments, onRemove, colors }: AttachmentListProps) {
  const styles = createComposeStyles(colors);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={styles.attachmentsContainer}>
      {attachments.map((attachment, index) => (
        <View 
          key={index} 
          style={[styles.attachmentItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.attachmentInfo}>
            <Paperclip size={16} color={colors.primary} />
            <View style={styles.attachmentDetails}>
              <Text 
                style={[styles.attachmentName, { color: colors.text }]} 
                numberOfLines={1}
              >
                {attachment.name}
              </Text>
              <Text style={[styles.attachmentSize, { color: colors.textSecondary }]}>
                {formatFileSize(attachment.size)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onRemove(index)}
            style={styles.removeAttachmentButton}
          >
            <Trash2 size={16} color={colors.error || '#EF4444'} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}


