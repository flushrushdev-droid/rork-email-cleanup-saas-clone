import { StyleSheet } from 'react-native';

export function createSuggestionsStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
    },
    headerIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: '90%',
    },
    scrollContent: {
      padding: 16,
    },
    suggestionCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    cardTouchable: {
      marginBottom: 12,
    },
    suggestionHeader: {
      flexDirection: 'row',
      gap: 12,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    suggestionContent: {
      flex: 1,
    },
    suggestionTitle: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 4,
    },
    suggestionDescription: {
      fontSize: 14,
      marginBottom: 8,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    reason: {
      fontSize: 12,
      fontStyle: 'italic' as const,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 10,
      gap: 6,
    },
    dismissButton: {
      borderWidth: 1,
    },
    dismissButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    applyButton: {
      flex: 1.2,
    },
    applyButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginTop: 24,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
  });
}


