import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { TrendingUp, TrendingDown, Mail, Archive, Clock, HardDrive, Sparkles, AlertCircle, RefreshCw, ChevronRight, Trash2, FolderOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useGmailSync } from '@/contexts/GmailSyncContext';

import { mockInboxHealth, mockRecentEmails } from '@/mocks/emailData';
import { useTheme } from '@/contexts/ThemeContext';
import { useEmailState } from '@/contexts/EmailStateContext';
import { AccessibleButton } from '@/components/common/AccessibleButton';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { formatAccessibilityLabel } from '@/utils/accessibility';

export default function OverviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user, isLoading, isDemoMode } = useAuth();
  const { syncMailbox, isSyncing, messages, syncProgress, profile } = useGmailSync();
  const { colors } = useTheme();
  const { trashedEmails } = useEmailState();
  const { handleAsync, error, clearError } = useErrorHandler({ showAlert: false });
  
  const handleSync = useCallback(async () => {
    if (isDemoMode) {
      return;
    }
    clearError();
    await handleAsync(async () => {
      await syncMailbox();
    }, { showAlert: false });
  }, [isDemoMode, syncMailbox, handleAsync, clearError]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Redirecting to login - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !isDemoMode && messages.length === 0 && !isSyncing) {
      handleSync();
    }
  }, [isAuthenticated, isDemoMode, messages.length, isSyncing, handleSync]);

  const health = mockInboxHealth;

  const getHealthGrade = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text 
                style={[styles.title, { color: colors.text }]}
                accessible={true}
                accessibilityRole="header"
                accessibilityLabel="Inbox Health"
              >
                Inbox Health
              </Text>
              <Text 
                style={[styles.subtitle, { color: colors.textSecondary }]}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={user?.email || 'Your email management overview'}
              >
                {user?.email || 'Your email management overview'}
              </Text>
            </View>
            {!isDemoMode && (
              <AccessibleButton
                testID="sync-button"
                accessibilityLabel={isSyncing ? `Syncing mailbox, ${syncProgress.current} of ${syncProgress.total} messages` : 'Sync mailbox'}
                accessibilityHint="Synchronizes your Gmail inbox with the app"
                style={[styles.syncButton, { backgroundColor: colors.surface }]}
                onPress={handleSync}
                disabled={isSyncing}
                loading={isSyncing}
              >
                <RefreshCw size={20} color={colors.primary} />
              </AccessibleButton>
            )}
          </View>
          {isDemoMode && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoText}>Demo Mode - Sample Data</Text>
            </View>
          )}
          {!isDemoMode && isSyncing && (
            <View 
              style={[styles.syncProgress, { backgroundColor: colors.surface }]}
              accessible={true}
              accessibilityRole="progressbar"
              accessibilityLabel={formatAccessibilityLabel('Syncing mailbox, {current} of {total} messages', {
                current: syncProgress.current.toString(),
                total: syncProgress.total.toString(),
              })}
              accessibilityValue={{
                min: 0,
                max: syncProgress.total,
                now: syncProgress.current,
              }}
            >
              <Text style={[styles.syncText, { color: colors.textSecondary }]}>
                Syncing... {syncProgress.current}/{syncProgress.total} messages
              </Text>
            </View>
          )}
          {error && (
            <ErrorDisplay
              error={error}
              variant="alert"
              showRetry={true}
              onRetry={handleSync}
              onDismiss={clearError}
            />
          )}
          {profile && (
            <View style={styles.profileInfo}>
              <Text style={[styles.profileText, { color: colors.textSecondary }]}>
                {profile.messagesTotal.toLocaleString()} total messages • {profile.threadsTotal.toLocaleString()} threads
              </Text>
            </View>
          )}
        </View>

        <LinearGradient
          colors={['#007AFF', '#5856D6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.healthCard}
        >
          <View style={styles.healthHeader}>
            <View>
              <Text 
                style={styles.healthLabel}
                accessible={true}
                accessibilityRole="text"
              >
                Overall Score
              </Text>
              <Text 
                style={styles.healthGrade}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={formatAccessibilityLabel('Overall health grade: {grade}', { grade: getHealthGrade(health.score) })}
              >
                {getHealthGrade(health.score)}
              </Text>
            </View>
            <View style={styles.healthScoreContainer}>
              <Text 
                style={styles.healthScore}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={formatAccessibilityLabel('Inbox health score: {score} percent', { score: health.score.toString() })}
              >
                {health.score}
              </Text>
              <View 
                style={styles.trendBadge}
                accessible={true}
                accessibilityRole="image"
                accessibilityLabel={health.trend === 'up' ? 'Trending up' : 'Trending down'}
              >
                {health.trend === 'up' ? (
                  <TrendingUp size={16} color="#34C759" />
                ) : (
                  <TrendingDown size={16} color="#FF3B30" />
                )}
              </View>
            </View>
          </View>
          
          <View 
            style={styles.progressBar}
            accessible={true}
            accessibilityRole="progressbar"
            accessibilityLabel={formatAccessibilityLabel('Inbox health progress: {score} percent', { score: health.score.toString() })}
            accessibilityValue={{
              min: 0,
              max: 100,
              now: health.score,
            }}
          >
            <View style={[styles.progressFill, { width: `${health.score}%` }]} />
          </View>

          <View style={styles.statsGrid}>
            <AccessibleButton
              testID="stat-unread"
              accessibilityLabel={formatAccessibilityLabel('Unread messages: {count}', { count: health.unreadCount.toLocaleString() })}
              accessibilityHint="Opens detailed view of unread messages"
              style={styles.statItem}
              onPress={() => router.push({ pathname: '/stat-details', params: { type: 'unread' } })}
            >
              <Mail size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{health.unreadCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </AccessibleButton>
            <AccessibleButton
              testID="stat-noise"
              accessibilityLabel={formatAccessibilityLabel('Noise sources: {percentage} percent', { percentage: health.noisePercentage.toString() })}
              accessibilityHint="Opens detailed view of noise sources"
              style={styles.statItem}
              onPress={() => router.push({ pathname: '/stat-details', params: { type: 'noise' } })}
            >
              <Archive size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{health.noisePercentage}%</Text>
              <Text style={styles.statLabel}>Noise</Text>
            </AccessibleButton>
            <AccessibleButton
              testID="stat-files"
              accessibilityLabel={formatAccessibilityLabel('Large files: {count}', { count: health.largeAttachmentsCount.toString() })}
              accessibilityHint="Opens detailed view of large file attachments"
              style={styles.statItem}
              onPress={() => router.push({ pathname: '/stat-details', params: { type: 'files' } })}
            >
              <HardDrive size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{health.largeAttachmentsCount}</Text>
              <Text style={styles.statLabel}>Large Files</Text>
            </AccessibleButton>
            <AccessibleButton
              testID="stat-automated"
              accessibilityLabel={formatAccessibilityLabel('Automation coverage: {percentage} percent', { percentage: health.automationCoverage.toString() })}
              accessibilityHint="Opens detailed view of automation coverage"
              style={styles.statItem}
              onPress={() => router.push({ pathname: '/stat-details', params: { type: 'automated' } })}
            >
              <Sparkles size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{health.automationCoverage}%</Text>
              <Text style={styles.statLabel}>Automated</Text>
            </AccessibleButton>
          </View>
        </LinearGradient>

        <View style={styles.savingsContainer}>
          <View 
            style={[styles.savingCard, { backgroundColor: colors.surface }]}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={formatAccessibilityLabel('Time saved monthly: {minutes} minutes', {
              minutes: health.projectedTimeSaved.toString(),
            })}
          >
            <View style={[styles.savingIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Clock size={24} color={colors.primary} />
            </View>
            <View style={styles.savingContent}>
              <Text style={[styles.savingValue, { color: colors.text }]}>{health.projectedTimeSaved} min</Text>
              <Text style={[styles.savingLabel, { color: colors.textSecondary }]}>Time Saved Monthly</Text>
            </View>
          </View>
          <View 
            style={[styles.savingCard, { backgroundColor: colors.surface }]}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={formatAccessibilityLabel('Space saved: {megabytes} megabytes', {
              megabytes: health.projectedSpaceSaved.toString(),
            })}
          >
            <View style={[styles.savingIconContainer, { backgroundColor: colors.secondary + '20' }]}>
              <HardDrive size={24} color={colors.secondary} />
            </View>
            <View style={styles.savingContent}>
              <Text style={[styles.savingValue, { color: colors.text }]}>{health.projectedSpaceSaved} MB</Text>
              <Text style={[styles.savingLabel, { color: colors.textSecondary }]}>Space Saved</Text>
            </View>
          </View>
        </View>

        <AccessibleButton
          testID="suggestions-card"
          accessibilityLabel="Suggestions: 3 smart recommendations"
          accessibilityHint="Opens suggestions page with smart recommendations for your inbox"
          style={[styles.suggestionsCard, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/suggestions')}
        >
          <View style={styles.suggestionsHeader}>
            <View style={styles.suggestionsHeaderLeft}>
              <View style={styles.suggestionsIconContainer}>
                <Sparkles size={24} color="#FFA500" />
              </View>
              <View>
                <Text style={[styles.suggestionsTitle, { color: colors.text }]}>Suggestions</Text>
                <Text style={[styles.suggestionsSubtitle, { color: colors.textSecondary }]}>3 smart recommendations</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>
          
          <View style={styles.suggestionsList}>
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIconSmall, { backgroundColor: colors.primary + '20' }]}>
                <Archive size={14} color={colors.primary} />
              </View>
              <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>Archive 45 promotional emails</Text>
            </View>
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIconSmall, { backgroundColor: colors.danger + '20' }]}>
                <Trash2 size={14} color={colors.danger} />
              </View>
              <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>Delete 23 old newsletters</Text>
            </View>
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIconSmall, { backgroundColor: colors.secondary + '20' }]}>
                <FolderOpen size={14} color={colors.secondary} />
              </View>
              <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>Move 67 social notifications</Text>
            </View>
          </View>
        </AccessibleButton>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Action Required</Text>
            <AccessibleButton
              testID="action-view-all"
              accessibilityLabel="View all action required emails"
              accessibilityHint="Opens folder with all action required emails"
              onPress={() => router.push({ pathname: '/folder-details', params: { folderName: 'Action Required', folderColor: colors.danger } })}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>View All</Text>
            </AccessibleButton>
          </View>
            {(messages.length > 0 ? messages.filter((email) => email.priority === 'action') : mockRecentEmails.filter((email) => email.priority === 'action'))
            .filter((email) => !trashedEmails.has(email.id))
            .map((email) => (
              <AccessibleButton
                key={email.id}
                accessibilityLabel={formatAccessibilityLabel('Action required email: {subject} from {from}', {
                  subject: email.subject,
                  from: email.from,
                })}
                accessibilityHint="Opens email detail view"
                style={[styles.emailCard, { backgroundColor: colors.surface, borderLeftColor: colors.danger }]}
                onPress={() => router.push({ pathname: '/email-detail', params: { emailId: email.id } })}
              >
                <View style={styles.emailHeader}>
                  <View style={styles.emailIconContainer}>
                    <AlertCircle size={20} color={colors.danger} />
                  </View>
                  <View style={styles.emailContent}>
                    <Text style={[styles.emailSubject, { color: colors.text }]} numberOfLines={1}>{email.subject}</Text>
                    <Text style={[styles.emailFrom, { color: colors.textSecondary }]} numberOfLines={1}>{email.from}</Text>
                    <Text style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>{email.snippet}</Text>
                  </View>
                </View>
              </AccessibleButton>
            ))}
        </View>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
