import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createBlockedSendersStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 16,
      marginTop: 8,
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    scrollContent: {
      paddingHorizontal: 16,
    },
    countText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    senderCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    senderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    senderInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    senderAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    senderInitial: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    senderDetails: {
      flex: 1,
    },
    senderName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    senderEmail: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 12,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    statBox: {
      alignItems: 'center',
      gap: 6,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginTop: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    unblockButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    unblockButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
}

