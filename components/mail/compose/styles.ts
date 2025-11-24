import { StyleSheet } from 'react-native';

/**
 * Creates compose styles based on theme colors
 */
export function createComposeStyles(colors: any) {
  return StyleSheet.create({
    // Container
    container: {
      flex: 1,
    },
    // Header styles
    composeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    composeTitle: {
      fontSize: 17,
      fontWeight: '600',
    },
    composeHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    headerActionButton: {
      padding: 4,
    },
    // Form styles
    composeForm: {
      flex: 1,
    },
    composeField: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    composeBodyField: {
      flex: 1,
      minHeight: 200,
    },
    composeLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    composeInput: {
      fontSize: 16,
      paddingVertical: 0,
    },
    composeBodyInput: {
      flex: 1,
      paddingTop: 0,
    },
    composeDivider: {
      height: 1,
      marginHorizontal: 16,
    },
    // Attachment styles
    attachButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'dashed',
    },
    attachButtonText: {
      fontSize: 15,
      fontWeight: '500',
    },
    attachmentsContainer: {
      marginHorizontal: 16,
      marginTop: 8,
      gap: 8,
    },
    attachmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    attachmentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    attachmentDetails: {
      flex: 1,
      gap: 2,
    },
    attachmentName: {
      fontSize: 14,
      fontWeight: '500',
    },
    attachmentSize: {
      fontSize: 12,
    },
    removeAttachmentButton: {
      padding: 4,
      marginLeft: 8,
    },
    // AI button styles
    aiButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'dashed',
    },
    aiButtonText: {
      fontSize: 15,
      fontWeight: '500',
    },
  });
}


