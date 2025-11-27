import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createUnsubscribeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    searchContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    searchBox: {
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
    tabs: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
      backgroundColor: colors.info + '15',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colors.info,
      lineHeight: 20,
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
    marginBottom: 16,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  senderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
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
    senderStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    methodBadge: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
    },
    methodText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    unsubscribeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 12,
  },
  unsubscribeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
    historyCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    historyInfo: {
      flex: 1,
      paddingRight: 12,
    },
    historySender: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    historyEmail: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    historyMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    historyMethod: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    historyDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  successButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
    successCheckmark: {
      fontSize: 48,
      fontWeight: '700',
    },
  });
}

