import { StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

/**
 * Creates email detail styles based on theme colors
 */
export function createEmailDetailStyles(colors: any) {
  return StyleSheet.create({
    // Container
    container: {
      flex: 1,
    },
    // Header styles
    detailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.light.border,
    },
    backButton: {
      padding: 4,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    emailCounter: {
      fontSize: 14,
      fontWeight: '500',
    },
    detailActions: {
      flexDirection: 'row',
      gap: 12,
    },
    navButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButton: {
      padding: 4,
    },

    // Content styles
    detailContent: {
      flex: 1,
    },
    detailSubject: {
      fontSize: 24,
      fontWeight: '700',
      color: Colors.light.text,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
    },
    detailFrom: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 12,
    },
    detailAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.light.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailAvatarText: {
      fontSize: 16,
      fontWeight: '700',
    },
    detailSenderInfo: {
      flex: 1,
    },
    detailSenderName: {
      fontSize: 15,
      fontWeight: '600',
      color: Colors.light.text,
      marginBottom: 2,
    },
    detailSenderEmail: {
      fontSize: 13,
      color: Colors.light.textSecondary,
    },
    detailDate: {
      fontSize: 13,
      color: Colors.light.textSecondary,
    },

    // Attachment styles
    attachmentsSection: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: Colors.light.border,
      backgroundColor: Colors.light.surface,
    },
    attachmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      backgroundColor: Colors.light.background,
      borderRadius: 8,
      marginBottom: 8,
    },
    attachmentName: {
      flex: 1,
      fontSize: 14,
      color: Colors.light.text,
      marginRight: 8,
    },
    attachmentSize: {
      fontSize: 12,
      color: Colors.light.textSecondary,
    },

    // Body styles
    detailBody: {
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    detailBodyText: {
      fontSize: 15,
      lineHeight: 22,
      color: Colors.light.text,
    },

    // Action buttons styles
    emailActionButtons: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
      backgroundColor: Colors.light.background,
      borderTopWidth: 1,
      borderTopColor: Colors.light.border,
    },
    emailActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: Colors.light.primary,
    },
    emailActionButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });
}

