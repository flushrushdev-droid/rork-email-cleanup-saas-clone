import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createHistoryStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    summarySection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    summaryCard: {
      flex: 1,
      minWidth: 150,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    summaryIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    summaryValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    filterSection: {
      marginBottom: 24,
    },
    filterScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },
    filterChip: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    filterChipTextActive: {
      color: '#FFFFFF',
    },
    historySection: {
      marginBottom: 24,
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyContent: {
      flex: 1,
      gap: 4,
    },
    historyLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    historyDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    countBadge: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
      marginTop: 2,
    },
    historyTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    clearHistoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 20,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.danger + '30',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    clearHistoryText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.danger,
    },
  });
}

