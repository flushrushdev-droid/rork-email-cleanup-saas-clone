import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { TrendingUp, TrendingDown, Mail, Archive, Clock, HardDrive, Sparkles, AlertCircle, RefreshCw, ChevronRight, CheckCircle2, Trash2, FolderOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useGmailSync } from '@/contexts/GmailSyncContext';

import Colors from '@/constants/colors';
import { mockInboxHealth, mockRecentEmails } from '@/mocks/emailData';

export default function OverviewScreen() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, isDemoMode } = useAuth();
  const { syncMailbox, isSyncing, messages, syncProgress, profile } = useGmailSync();
  
  const handleSync = useCallback(async () => {
    if (isDemoMode) {
      console.log('Sync disabled in demo mode');
      Alert.alert('Demo mode', 'Sync is disabled in demo mode');
      return;
    }
    try {
      await syncMailbox();
    } catch (err) {
      console.error('Sync error:', err);
      Alert.alert('Sync failed', 'Please try again later');
    }
  }, [isDemoMode, syncMailbox]);

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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Inbox Health</Text>
              <Text style={styles.subtitle}>{user?.email || 'Your email management overview'}</Text>
            </View>
            {!isDemoMode && (
              <TouchableOpacity 
                testID="sync-button"
                style={styles.syncButton}
                onPress={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                ) : (
                  <RefreshCw size={20} color={Colors.light.primary} />
                )}
              </TouchableOpacity>
            )}
          </View>
          {isDemoMode && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoText}>Demo Mode - Sample Data</Text>
            </View>
          )}
          {!isDemoMode && isSyncing && (
            <View style={styles.syncProgress}>
              <Text style={styles.syncText}>
                Syncing... {syncProgress.current}/{syncProgress.total} messages
              </Text>
            </View>
          )}
          {profile && (
            <View style={styles.profileInfo}>
              <Text style={styles.profileText}>
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
              <Text style={styles.healthLabel}>Overall Score</Text>
              <Text style={styles.healthGrade}>{getHealthGrade(health.score)}</Text>
            </View>
            <View style={styles.healthScoreContainer}>
              <Text style={styles.healthScore}>{health.score}</Text>
              <View style={styles.trendBadge}>
                {health.trend === 'up' ? (
                  <TrendingUp size={16} color="#34C759" />
                ) : (
                  <TrendingDown size={16} color="#FF3B30" />
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${health.score}%` }]} />
          </View>

          <View style={styles.statsGrid}>
            <TouchableOpacity 
              testID="stat-unread"
              style={styles.statItem}
              onPress={() => router.push({ pathname: '/stat-details', params: { type: 'unread' } })}
              activeOpacity={0.7}
            >
              <Mail size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{health.unreadCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="stat-noise"
              style={styles.statItem}
              onPress={() => router.push({ pathname: '/stat-details', params: { type: 'noise' } })}
              activeOpacity={0.7}
            >
              <Archive size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{health.noisePercentage}%</Text>
              <Text style={styles.statLabel}>Noise</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="stat-files"
              style={styles.statItem}
              onPress={() => router.push({ pathname: '/stat-details', params: { type: 'files' } })}
              activeOpacity={0.7}
            >
              <HardDrive size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{health.largeAttachmentsCount}</Text>
              <Text style={styles.statLabel}>Large Files</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID="stat-automated"
              style={styles.statItem}
              onPress={() => router.push({ pathname: '/stat-details', params: { type: 'automated' } })}
              activeOpacity={0.7}
            >
              <Sparkles size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{health.automationCoverage}%</Text>
              <Text style={styles.statLabel}>Automated</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.savingsContainer}>
          <View style={styles.savingCard}>
            <View style={styles.savingIconContainer}>
              <Clock size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.savingContent}>
              <Text style={styles.savingValue}>{health.projectedTimeSaved} min</Text>
              <Text style={styles.savingLabel}>Time Saved Monthly</Text>
            </View>
          </View>
          <View style={styles.savingCard}>
            <View style={styles.savingIconContainer}>
              <HardDrive size={24} color={Colors.light.secondary} />
            </View>
            <View style={styles.savingContent}>
              <Text style={styles.savingValue}>{health.projectedSpaceSaved} MB</Text>
              <Text style={styles.savingLabel}>Space Saved</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          testID="suggestions-card"
          style={styles.suggestionsCard}
          onPress={() => router.push('/suggestions')}
          activeOpacity={0.7}
        >
          <View style={styles.suggestionsHeader}>
            <View style={styles.suggestionsHeaderLeft}>
              <View style={styles.suggestionsIconContainer}>
                <Sparkles size={24} color="#FFA500" />
              </View>
              <View>
                <Text style={styles.suggestionsTitle}>Suggestions</Text>
                <Text style={styles.suggestionsSubtitle}>3 smart recommendations</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.light.textSecondary} />
          </View>
          
          <View style={styles.suggestionsList}>
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIconSmall, { backgroundColor: Colors.light.primary + '20' }]}>
                <Archive size={14} color={Colors.light.primary} />
              </View>
              <Text style={styles.suggestionText} numberOfLines={1}>Archive 45 promotional emails</Text>
            </View>
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIconSmall, { backgroundColor: Colors.light.danger + '20' }]}>
                <Trash2 size={14} color={Colors.light.danger} />
              </View>
              <Text style={styles.suggestionText} numberOfLines={1}>Delete 23 old newsletters</Text>
            </View>
            <View style={styles.suggestionItem}>
              <View style={[styles.suggestionIconSmall, { backgroundColor: Colors.light.secondary + '20' }]}>
                <FolderOpen size={14} color={Colors.light.secondary} />
              </View>
              <Text style={styles.suggestionText} numberOfLines={1}>Move 67 social notifications</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Action Required</Text>
            <TouchableOpacity testID="action-view-all" onPress={() => router.push('/folders')}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {(messages.length > 0 ? messages.filter((email) => email.priority === 'action') : mockRecentEmails.filter((email) => email.priority === 'action'))
            .map((email) => (
              <TouchableOpacity key={email.id} style={styles.emailCard} onPress={() => Alert.alert('Email', email.subject)}>
                <View style={styles.emailHeader}>
                  <View style={styles.emailIconContainer}>
                    <AlertCircle size={20} color={Colors.light.danger} />
                  </View>
                  <View style={styles.emailContent}>
                    <Text style={styles.emailSubject} numberOfLines={1}>{email.subject}</Text>
                    <Text style={styles.emailFrom} numberOfLines={1}>{email.from}</Text>
                    <Text style={styles.emailSnippet} numberOfLines={2}>{email.snippet}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 16,
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
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  syncProgress: {
    backgroundColor: Colors.light.surface,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  syncText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
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
    color: Colors.light.textSecondary,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.surface,
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
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingContent: {
    flex: 1,
  },
  savingValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  savingLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
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
    color: Colors.light.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  senderCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
    backgroundColor: Colors.light.primary,
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
    color: Colors.light.text,
    marginBottom: 2,
  },
  senderEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  senderStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  noiseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  noiseScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  emailCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emailCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.danger,
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  emailFrom: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  emailSnippet: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  suggestionsCard: {
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
    marginBottom: 2,
  },
  suggestionsSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
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
    color: Colors.light.text,
  },
});
