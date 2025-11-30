import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createOverviewStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
    },
    header: {
      marginBottom: 20,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    syncButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    syncProgress: {
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    syncText: {
      fontSize: 14,
      textAlign: 'center',
    },
    demoBadge: {
      backgroundColor: '#FFF4E5',
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      borderWidth: 1,
      borderColor: '#FFE0B2',
    },
    demoText: {
      fontSize: 14,
      color: '#FF9500',
      textAlign: 'center',
      fontWeight: '600',
    },
    profileInfo: {
      marginTop: 8,
    },
    profileText: {
      fontSize: 13,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
    },
    healthCard: {
      borderRadius: 20,
      padding: 24,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    healthHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    healthLabel: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 4,
    },
    healthGrade: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    healthScoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    healthScore: {
      fontSize: 48,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    trendBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 12,
      padding: 6,
    },
    progressBar: {
      height: 8,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 24,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      gap: 8,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    statLabel: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.8)',
    },
    savingsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    savingCard: {
      flex: 1,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    savingIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    savingContent: {
      flex: 1,
    },
    savingValue: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 2,
    },
    savingLabel: {
      fontSize: 12,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    seeAll: {
      fontSize: 14,
      fontWeight: '600',
    },
    emailCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderLeftWidth: 3,
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
      backgroundColor: '#FFE5E5',
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
    },
    suggestionsCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    suggestionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    suggestionsHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    suggestionsIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: '#FFA50020',
      alignItems: 'center',
      justifyContent: 'center',
    },
    suggestionsTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 2,
    },
    suggestionsSubtitle: {
      fontSize: 13,
    },
    suggestionsList: {
      gap: 10,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    suggestionIconSmall: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    suggestionText: {
      flex: 1,
      fontSize: 14,
    },
    loadingContainer: {
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      textAlign: 'center',
    },
  });
}


