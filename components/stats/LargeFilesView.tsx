import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HardDrive, Trash2, XCircle } from 'lucide-react-native';
import type { EmailMessage } from '@/constants/types';
import { createStatDetailsStyles } from '@/styles/app/stat-details';

interface LargeFilesViewProps {
  emails: EmailMessage[];
  onEmailPress: (emailId: string) => void;
  onDelete: (emailId: string, subject: string) => void;
  onPermanentDelete: (emailId: string, subject: string) => void;
  colors: any;
}

export function LargeFilesView({
  emails,
  onEmailPress,
  onDelete,
  onPermanentDelete,
  colors,
}: LargeFilesViewProps) {
  const styles = React.useMemo(() => createStatDetailsStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Large Attachments ({emails.length})</Text>
      <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          Total storage used by large attachments. Download important files and delete old emails to free up space.
        </Text>
      </View>
      {emails.map((email) => (
        <TouchableOpacity
          key={email.id}
          testID={`file-email-${email.id}`}
          style={[styles.fileCard, { backgroundColor: colors.surface }]}
          onPress={() => onEmailPress(email.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.fileIconContainer, { backgroundColor: '#5856D6' + '20' }]}>
            <HardDrive size={20} color="#5856D6" />
          </View>
          <View style={styles.fileContent}>
            <Text style={[styles.fileSubject, { color: colors.text }]} numberOfLines={1}>
              {email.subject}
            </Text>
            <Text style={[styles.fileFrom, { color: colors.textSecondary }]} numberOfLines={1}>
              {email.from}
            </Text>
            <View style={styles.fileMetadata}>
              <Text style={[styles.fileSize, { color: '#5856D6' }]}>
                {('size' in email
                  ? (email.size / (1024 * 1024)).toFixed(2)
                  : 'sizeBytes' in email
                  ? (email.sizeBytes / (1024 * 1024)).toFixed(2)
                  : '0')}{' '}
                MB
              </Text>
              <Text style={[styles.fileDot, { color: colors.textSecondary }]}>•</Text>
              <Text style={[styles.fileCount, { color: colors.textSecondary }]}>
                {'attachmentCount' in email ? email.attachmentCount : '?'} files
              </Text>
            </View>
          </View>
          <View style={styles.fileActions}>
            <TouchableOpacity
              testID={`delete-${email.id}`}
              onPress={(e) => {
                e?.stopPropagation?.();
                onDelete(email.id, email.subject);
              }}
              style={[styles.deleteButton, { backgroundColor: colors.danger + '20' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={20} color={colors.danger} />
            </TouchableOpacity>
            <TouchableOpacity
              testID={`permanent-delete-${email.id}`}
              onPress={(e) => {
                e?.stopPropagation?.();
                onPermanentDelete(email.id, email.subject);
              }}
              style={[styles.permanentDeleteButton, { backgroundColor: colors.danger + '30' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <XCircle size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

