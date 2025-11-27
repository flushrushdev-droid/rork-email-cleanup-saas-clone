import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createNotesStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 22,
    },
    noteCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    noteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    noteTitle: {
      fontSize: 18,
      fontWeight: '600',
      flex: 1,
      marginRight: 12,
    },
    noteContent: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 12,
    },
    noteFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    noteDate: {
      fontSize: 13,
    },
    linkedEmail: {
      fontSize: 12,
      fontWeight: '500',
      flex: 1,
      textAlign: 'right',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    modalBody: {
      flex: 1,
    },
    modalBodyContent: {
      padding: 20,
      paddingBottom: 100,
    },
    titleInput: {
      fontSize: 18,
      fontWeight: '600',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    contentInput: {
      fontSize: 16,
      padding: 16,
      borderRadius: 12,
      minHeight: 150,
      maxHeight: 250,
    },
    modalFooter: {
      flexDirection: 'row',
      padding: 20,
      paddingTop: 16,
      gap: 12,
      borderTopWidth: 1,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {},
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    saveButton: {},
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    dueDateSection: {
      marginTop: 12,
    },
    dueDateLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    dueDateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    dueDateButtonText: {
      fontSize: 15,
      fontWeight: '500',
    },
    addNoteButton: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 20,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    addNoteText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });
}


