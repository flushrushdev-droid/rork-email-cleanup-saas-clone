import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createFolderDetailsStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 16,
    },
    backButton: {
      marginBottom: 12,
    },
    headerContent: {
      gap: 4,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    headerSubtitle: {
      fontSize: 16,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    scrollView: {
      flex: 1,
    },
    emailList: {
      padding: 16,
      gap: 12,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    emptyStateText: {
      fontSize: 16,
      textAlign: 'center',
    },
    emailCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    emailHeader: {
      marginBottom: 8,
    },
    emailMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    emailFrom: {
      fontSize: 13,
      fontWeight: '500',
      flex: 1,
    },
    emailDate: {
      fontSize: 12,
    },
    emailSubject: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 6,
    },
    emailSnippet: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 10,
    },
    emailTags: {
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
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
  });
}

