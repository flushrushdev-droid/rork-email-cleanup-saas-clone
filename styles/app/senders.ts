import { StyleSheet } from 'react-native';

export function createSenderStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    searchContainerFull: {
      paddingHorizontal: 16,
      marginBottom: 16,
      marginTop: 8,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
      maxWidth: '86%',
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
    },
    filtersContainer: {
      paddingBottom: 12,
      paddingHorizontal: 16,
      zIndex: 10,
    },
    filtersWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: '600',
    },
    filterChipTextActive: {
      color: '#FFFFFF',
    },
    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
      gap: 12,
      zIndex: 9,
    },
    sortLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    sortScroll: {
      flex: 1,
      flexGrow: 0,
    },
    sortChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginRight: 8,
    },
    sortChipText: {
      fontSize: 13,
      fontWeight: '500',
    },
    sortChipTextActive: {
      color: '#FFFFFF',
    },
    bulkActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      marginBottom: 12,
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
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      paddingHorizontal: 16,
    },
    senderCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 2,
      borderColor: 'transparent',
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
      paddingRight: 50,
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
      marginBottom: 2,
    },
    senderEmail: {
      fontSize: 13,
    },
    noiseBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    noiseScore: {
      fontSize: 16,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 12,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    statBox: {
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      marginTop: 4,
    },
    statLabel: {
      fontSize: 12,
      marginTop: 2,
    },
    savingsBar: {
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    savingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    savingLabel: {
      fontSize: 13,
      fontWeight: '500',
    },
    savingValue: {
      fontSize: 14,
      fontWeight: '700',
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    actionButtonPrimaryText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    actionButtonDangerText: {
      fontSize: 13,
      fontWeight: '600',
    },
    bottomActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    blockButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    blockButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    autoRuleButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    autoRuleButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
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
    emailBadge: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    emailBadgeText: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    modalWarning: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 24,
      fontStyle: 'italic',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
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


