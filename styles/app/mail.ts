import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createMailStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 2,
    },

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 0,
    },

    filterButtonsContainer: {
      marginBottom: 16,
    },
    filterButtonsScroll: {
      paddingHorizontal: 16,
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    smartFoldersSection: {
      marginTop: 12,
      marginBottom: 16,
    },
    smartFoldersTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    smartFoldersScroll: {
      paddingHorizontal: 16,
      gap: 12,
    },
    smartFolderCard: {
      alignItems: 'center',
      gap: 6,
      width: 100,
    },
    smartFolderIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    smartFolderName: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
      textAlign: 'center',
    },
    smartFolderBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 24,
      alignItems: 'center',
    },
    smartFolderCount: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    createFolderIcon: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    createFolderText: {
      color: colors.primary,
    },

    emailList: {
      flex: 1,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    demoBadge: {
      backgroundColor: '#FFF4E5',
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#FFE0B2',
    },
    demoText: {
      fontSize: 14,
      color: '#FF9500',
      textAlign: 'center',
      fontWeight: '600',
    },
    emailTags: {
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
      marginTop: 6,
    },
    emailTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    emailTagText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    emailCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    emailCardUnread: {
      backgroundColor: '#FFFFFF',
    },
    emailCardContent: {
      flex: 1,
    },
    emailCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    emailFrom: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    emailFromUnread: {
      fontWeight: '700',
    },
    emailMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    emailDate: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    starButton: {
      padding: 2,
    },
    emailSubject: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 4,
    },
    emailSubjectUnread: {
      fontWeight: '600',
    },
    emailSnippet: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    attachmentBadge: {
      marginTop: 6,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginLeft: 8,
    },
    backButton: {
      padding: 4,
    },
    createFolderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    createFolderButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    modalDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    helperText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 8,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    createButtonModal: {
      backgroundColor: colors.primary,
    },
    createButtonModalText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    createMeetingButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      marginTop: 8,
    },
    createMeetingButtonDisabled: {
      backgroundColor: '#CCCCCC',
      shadowOpacity: 0,
      elevation: 0,
    },
    createMeetingButtonText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    draftCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    draftCardContent: {
      flex: 1,
    },
    draftCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    draftBadge: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    draftDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 'auto',
    },
    draftTo: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
      fontWeight: '500',
    },
    draftSubject: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    draftBody: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    deleteDraftButton: {
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

