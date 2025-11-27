import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createSenderEmailsStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    senderHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  senderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    senderEmail: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    bulkActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  bulkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bulkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bulkButtonDanger: {
      backgroundColor: colors.danger,
    },
    bulkButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },
    emailCard: {
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
    emailCardSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    emailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    emailMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    emailDate: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    emailAttachments: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    emailSubject: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emailSnippet: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    emailFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    emailTags: {
      flexDirection: 'row',
      gap: 6,
      flex: 1,
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: colors.primary + '15',
    },
    tagText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
    },
    emailSize: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
}

