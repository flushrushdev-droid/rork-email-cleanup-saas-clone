import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createStatDetailsStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    customHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
    },
    customHeaderTitle: {
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    scrollContent: {
      padding: 16,
      flexGrow: 1,
    },
    headerCard: {
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      width: '100%',
      alignSelf: 'stretch',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    headerIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    headerCount: {
      fontSize: 48,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    headerDescription: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
      lineHeight: 22,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
    },
    infoBox: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
    },
    infoText: {
      fontSize: 14,
      lineHeight: 20,
    },
    emptyState: {
      borderRadius: 12,
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
    },
    emailCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    emailHeader: {
      flexDirection: 'row',
      gap: 12,
    },
    emailIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emailContent: {
      flex: 1,
    },
    emailSubject: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    },
    emailFrom: {
      fontSize: 13,
      marginBottom: 6,
    },
    emailSnippet: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 4,
    },
    emailDate: {
      fontSize: 12,
    },
    senderCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    senderInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    senderAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    senderInitial: {
      fontSize: 18,
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
      marginBottom: 4,
    },
    senderStats: {
      fontSize: 12,
    },
    noiseBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    noiseScore: {
      fontSize: 16,
      fontWeight: '700',
    },
    fileCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    fileIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileContent: {
      flex: 1,
    },
    fileSubject: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    },
    fileFrom: {
      fontSize: 13,
      marginBottom: 6,
    },
    fileMetadata: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    fileSize: {
      fontSize: 13,
      fontWeight: '600',
    },
    fileDot: {
      fontSize: 12,
    },
    fileCount: {
      fontSize: 13,
    },
    fileActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    deleteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    permanentDeleteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    automationCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    automationTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
    },
    automationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 16,
    },
    automationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
    },
    automationInfo: {
      flex: 1,
    },
    automationName: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 2,
    },
    automationDesc: {
      fontSize: 13,
    },
    createRuleButton: {
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    createRuleText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

