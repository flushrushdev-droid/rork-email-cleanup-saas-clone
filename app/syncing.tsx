import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Mail, Sparkles } from 'lucide-react-native';
import { createScopedLogger } from '@/utils/logger';

const syncingLogger = createScopedLogger('SyncingScreen');

export default function SyncingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isAuthenticated, isDemoMode, isLoading: authLoading } = useAuth();
  const { syncMailbox, isSyncing, syncProgress, messages, lastSyncedAt } = useGmailSync();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      syncingLogger.debug('Not authenticated, redirecting to login');
      router.replace('/login');
      return;
    }

    // Redirect if in demo mode
    if (isDemoMode) {
      syncingLogger.debug('Demo mode, redirecting to overview');
      router.replace('/(tabs)');
      return;
    }

    // Redirect if already synced and has messages
    if (lastSyncedAt && messages.length > 0 && !isSyncing) {
      syncingLogger.debug('Already synced, redirecting to overview');
      router.replace('/(tabs)');
      return;
    }

    // Start sync if authenticated and not already syncing
    if (isAuthenticated && !isSyncing && messages.length === 0 && !lastSyncedAt) {
      syncingLogger.debug('Starting initial sync');
      syncMailbox().catch((error) => {
        syncingLogger.error('Sync failed', error);
        // On error, redirect to overview anyway (user can retry)
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      });
    }
  }, [isAuthenticated, isDemoMode, authLoading, isSyncing, messages.length, lastSyncedAt, router, syncMailbox]);

  // Redirect to overview once sync completes
  useEffect(() => {
    if (isAuthenticated && !isDemoMode && !isSyncing && messages.length > 0) {
      syncingLogger.debug('Sync complete, redirecting to overview');
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000); // Small delay to show completion
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isDemoMode, isSyncing, messages.length, router]);

  const progressText = syncProgress.current > 0 && syncProgress.total > 0
    ? `${syncProgress.current} / ${syncProgress.total} messages`
    : 'Connecting to Gmail...';

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    }}>
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Icon */}
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primary + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Mail size={40} color={colors.primary} />
        </View>

        {/* Title */}
        <Text style={{
          fontSize: 28,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 12,
          textAlign: 'center',
        }}>
          Syncing Your Inbox
        </Text>

        {/* Description */}
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 24,
        }}>
          We're fetching your emails from Gmail. This may take a few moments depending on your inbox size.
        </Text>

        {/* Progress Indicator */}
        <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />

        {/* Progress Text */}
        <Text style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: 8,
        }}>
          {progressText}
        </Text>

        {/* Sparkles decoration */}
        <View style={{
          position: 'absolute',
          top: -20,
          right: -20,
          opacity: 0.3,
        }}>
          <Sparkles size={24} color={colors.primary} />
        </View>
        <View style={{
          position: 'absolute',
          bottom: -20,
          left: -20,
          opacity: 0.3,
        }}>
          <Sparkles size={20} color={colors.primary} />
        </View>
      </View>
    </View>
  );
}

