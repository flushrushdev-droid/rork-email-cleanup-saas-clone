import React, { useEffect, useCallback, useMemo } from 'react';
import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
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
import { StatCard } from '@/components/common/StatCard';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { formatAccessibilityLabel } from '@/utils/accessibility';
import { createOverviewStyles } from '@/styles/app/index';
import { HealthCard } from '@/components/stats/HealthCard';
import { SavingsCards } from '@/components/stats/SavingsCards';
import { SuggestionsCard } from '@/components/stats/SuggestionsCard';
import { ActionRequiredSection } from '@/components/stats/ActionRequiredSection';
import { createScopedLogger } from '@/utils/logger';
import { CardSkeleton } from '@/components/common/CardSkeleton';
import { LastSyncedIndicator } from '@/components/common/LastSyncedIndicator';

const overviewLogger = createScopedLogger('Overview');

export default function OverviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user, isLoading, isDemoMode } = useAuth();
  const { syncMailbox, isSyncing, messages, syncProgress, profile, lastSyncedAt } = useGmailSync();
  const { colors } = useTheme();
  const { trashedEmails } = useEmailState();
  const { handleAsync, error, clearError } = useErrorHandler({ showAlert: false });
  const styles = React.useMemo(() => createOverviewStyles(colors), [colors]);
  
  const handleSync = useCallback(async () => {
    if (isDemoMode) {
      return;
    }
    clearError();
    await handleAsync(async () => {
      await syncMailbox();
    }, { showAlert: false });
  }, [isDemoMode, syncMailbox, handleAsync, clearError]);

  const { refreshControl } = useRefreshControl({
    onRefresh: handleSync,
    additionalLoadingState: isSyncing,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      overviewLogger.debug('Redirecting to login', undefined, { isAuthenticated, isLoading });
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !isDemoMode && messages.length === 0 && !isSyncing) {
      handleSync();
    }
  }, [isAuthenticated, isDemoMode, messages.length, isSyncing, handleSync]);

  // Use mock data only in demo mode, otherwise calculate from real messages
  const health = isDemoMode ? mockInboxHealth : useMemo(() => {
    // TODO: Calculate real inbox health from messages
    // For now, return mock data structure but this should be calculated from actual messages
    return mockInboxHealth;
  }, [messages, isDemoMode]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {!isDemoMode && lastSyncedAt && (
          <LastSyncedIndicator
            lastSyncedAt={lastSyncedAt}
            onSyncPress={handleSync}
            isSyncing={isSyncing}
          />
        )}
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

        {isSyncing && messages.length === 0 ? (
          <>
            <CardSkeleton count={1} variant="default" style={{ marginBottom: 16 }} />
            <CardSkeleton count={3} variant="compact" style={{ marginBottom: 16 }} />
            <CardSkeleton count={1} variant="default" style={{ marginBottom: 16 }} />
          </>
        ) : (
          <>
            <HealthCard health={health} colors={colors} router={router} />

            <SavingsCards health={health} colors={colors} />

            <SuggestionsCard colors={colors} router={router} />
          </>
        )}

        {/* Show loading state during first sync instead of mock data */}
        {!isDemoMode && isSyncing && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Syncing your inbox... {syncProgress.current > 0 ? `${syncProgress.current}/${syncProgress.total} messages` : 'Please wait...'}
            </Text>
            <Text style={[styles.loadingText, { color: colors.textSecondary, fontSize: 14, marginTop: 8 }]}>
              This may take a few moments
            </Text>
          </View>
        ) : (
          /* Only show Action Required section if we have real data or are in demo mode */
          (isDemoMode || messages.length > 0) && (
            <ActionRequiredSection
              emails={isDemoMode
                ? mockRecentEmails.filter((email) => email.priority === 'action')
                : messages.filter((email) => email.priority === 'action')
                  .filter((email) => !trashedEmails.has(email.id))}
              colors={colors}
              router={router}
            />
          )
        )}


      </ScrollView>
    </View>
  );
}

