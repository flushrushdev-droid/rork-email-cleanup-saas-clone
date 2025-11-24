import { StyleSheet } from 'react-native';

/**
 * Creates calendar screen styles based on theme colors
 * Styles are organized by section: container, header, events, modals, pickers
 */
export function createCalendarScreenStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    navButton: {
      padding: 8,
    },
    monthText: {
      fontSize: 20,
      fontWeight: '600',
    },
    eventsSection: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    eventsSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    eventsSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 16,
    },
    eventCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    eventContent: {
      flex: 1,
      flexDirection: 'row',
    },
    eventColorBar: {
      width: 4,
      borderRadius: 2,
      marginRight: 12,
    },
    eventDetails: {
      flex: 1,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    eventMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    eventTime: {
      marginLeft: 6,
      fontSize: 14,
    },
    eventLocation: {
      marginLeft: 6,
      fontSize: 14,
    },
    deleteButton: {
      padding: 8,
    },
    feedbackToast: {
      position: 'absolute',
      left: 20,
      right: 20,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    feedbackText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}


