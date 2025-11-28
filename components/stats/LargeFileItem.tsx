/**
 * Large File Item Component
 * 
 * Displays a single email with large attachments in the stat details list.
 */

import React from 'react';
import { View, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { HardDrive, Trash2, XCircle } from 'lucide-react-native';
import { extractSizeBytes } from '@/utils/emailNormalization';
import type { Email } from '@/constants/types';
import type { ThemeColors } from '@/constants/colors';

export interface LargeFileItemProps {
  email: Email;
  onPress: (emailId: string) => void;
  onDelete: (emailId: string, subject: string) => void;
  onPermanentDelete: (emailId: string, subject: string) => void;
  colors: ThemeColors;
}

function createStyles() {
  return StyleSheet.create({
    fileCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    fileIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileContent: {
      flex: 1,
    },
    fileSubject: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    },
    fileFrom: {
      fontSize: 13,
      marginBottom: 6,
    },
    fileMetadata: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    fileSize: {
      fontSize: 13,
      fontWeight: '600',
    },
    fileDot: {
      fontSize: 12,
    },
    fileCount: {
      fontSize: 13,
    },
    fileActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    deleteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    permanentDeleteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export function LargeFileItem({
  email,
  onPress,
  onDelete,
  onPermanentDelete,
  colors,
}: LargeFileItemProps) {
  const styles = React.useMemo(() => createStyles(), []);
  
  const sizeBytes = extractSizeBytes(email);
  const fileSize = (sizeBytes / (1024 * 1024)).toFixed(2);
  const attachmentCount = 'attachmentCount' in email && typeof email.attachmentCount === 'number'
    ? email.attachmentCount
    : 'attachmentCount' in email && typeof email.attachmentCount === 'string'
    ? email.attachmentCount
    : '?';

  return (
    <View style={[styles.fileCard, { backgroundColor: colors.surface }]}>
      <Pressable
        testID={`file-email-${email.id}`}
        accessible={true}
        accessibilityLabel={`Email from ${email.from}, subject: ${email.subject || 'No subject'}, ${fileSize} MB, ${attachmentCount} files`}
        accessibilityHint="Double tap to view this email"
        style={{ flex: 1 }}
        onPress={() => onPress(email.id)}
      >
        <View style={[styles.fileIconContainer, { backgroundColor: colors.secondary + '20' }]}>
          <HardDrive size={20} color={colors.secondary} />
        </View>
        <View style={styles.fileContent}>
          <AppText style={[styles.fileSubject, { color: colors.text }]} numberOfLines={1} dynamicTypeStyle="body">
            {email.subject}
          </AppText>
          <AppText style={[styles.fileFrom, { color: colors.textSecondary }]} numberOfLines={1} dynamicTypeStyle="caption1">
            {email.from}
          </AppText>
          <View style={styles.fileMetadata}>
            <AppText style={[styles.fileSize, { color: colors.secondary }]} dynamicTypeStyle="caption1">
              {(extractSizeBytes(email) / (1024 * 1024)).toFixed(2)}{' '}
              MB
            </AppText>
            <AppText style={[styles.fileDot, { color: colors.textSecondary }]} dynamicTypeStyle="caption1">•</AppText>
            <AppText style={[styles.fileCount, { color: colors.textSecondary }]} dynamicTypeStyle="caption1">
              {typeof attachmentCount === 'number' ? attachmentCount : attachmentCount} files
            </AppText>
          </View>
        </View>
      </Pressable>
      <View style={styles.fileActions}>
        <TouchableOpacity
          testID={`delete-${email.id}`}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Move to trash"
          accessibilityHint="Double tap to move this email to trash"
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
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Delete permanently"
          accessibilityHint="Double tap to permanently delete this email"
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
    </View>
  );
}

