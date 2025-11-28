import React, { useCallback } from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Mail, XCircle, HardDrive } from 'lucide-react-native';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useEmailState } from '@/contexts/EmailStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { AutomationCoverageView } from '@/components/stats/AutomationCoverageView';
import { EmptyState } from '@/components/common/EmptyState';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { StatHeaderCard } from '@/components/stats/StatHeaderCard';
import { UnreadEmailItem } from '@/components/stats/UnreadEmailItem';
import { NoiseSenderItem } from '@/components/stats/NoiseSenderItem';
import { LargeFileItem } from '@/components/stats/LargeFileItem';
import { createStatDetailsStyles } from '@/styles/app/stat-details';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { getOptimizedFlatListProps } from '@/utils/listConfig';
import { useStatData } from '@/hooks/useStatData';
import { getStatInfo, type StatType } from '@/utils/statInfo';
import { isValidStatType } from '@/utils/security';
import type { Email, Sender } from '@/constants/types';

export default function StatDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { messages, senders, syncMailbox, isSyncing } = useGmailSync();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { trashedEmails } = useEmailState();
  const { isDemoMode } = useAuth();
  const { showWarning, showError } = useEnhancedToast();
  
  // Validate stat type parameter (after hooks)
  const typeParam = params.type as string;
  const type: StatType = React.useMemo(() => {
    if (!typeParam || !isValidStatType(typeParam)) {
      // Invalid type - navigate back on next render
      setTimeout(() => router.back(), 0);
      return 'unread'; // Default fallback to prevent errors
    }
    return typeParam as StatType;
  }, [typeParam, router]);

  const handleDelete = useCallback((_emailId: string, subject: string) => {
    showWarning(`Move "${subject}" to trash?`, {
      action: {
        label: 'Delete',
        style: 'destructive',
        onPress: () => {
          // Email deletion is handled in email-detail screen
          // This is just for UI consistency
        },
      },
      duration: 0,
    });
  }, [showWarning]);

  const handlePermanentDelete = useCallback((_emailId: string, subject: string) => {
    showError(`Permanently delete "${subject}"? This action cannot be undone.`, {
      action: {
        label: 'Delete Forever',
        style: 'destructive',
        onPress: () => {
          // Email deletion is handled in email-detail screen
          // This is just for UI consistency
        },
      },
      duration: 0,
    });
  }, [showError]);

  const styles = React.useMemo(() => createStatDetailsStyles(colors), [colors]);

  // Get filtered and normalized data
  const { unreadEmails, noisySenders, emailsWithFiles, unreadCount, filesCount } = useStatData({
    type,
    messages,
    senders,
    trashedEmails,
  });

  // Get stat info
  const statInfo = React.useMemo(() => getStatInfo(type, colors, unreadCount, filesCount), [type, colors, unreadCount, filesCount]);

  const handleEmailPress = useCallback((emailId: string) => {
    router.push({
      pathname: '/email-detail',
      params: {
        emailId,
        returnTo: 'stat-details',
        statType: type,
      },
    });
  }, [router, type]);

  const handleSenderPress = useCallback((email: string) => {
    router.push({ pathname: '/senders', params: { q: email } });
  }, [router]);

  const { refreshControl } = useRefreshControl({
    onRefresh: async () => {
      if (!isDemoMode && syncMailbox) {
        await syncMailbox();
      }
    },
    additionalLoadingState: isSyncing,
  });

  const renderEmailItem = useCallback((email: Email) => (
    <UnreadEmailItem
      email={email}
      onPress={handleEmailPress}
      colors={colors}
    />
  ), [handleEmailPress, colors]);

  const renderSenderItem = useCallback((sender: Sender) => (
    <NoiseSenderItem
      sender={sender}
      onPress={handleSenderPress}
      colors={colors}
    />
  ), [handleSenderPress, colors]);

  const renderFileItem = useCallback((email: Email) => (
    <LargeFileItem
      email={email}
      onPress={handleEmailPress}
      onDelete={handleDelete}
      onPermanentDelete={handlePermanentDelete}
      colors={colors}
    />
  ), [handleEmailPress, handleDelete, handlePermanentDelete, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <ScreenHeader
        title={statInfo.title}
        onBack={() => router.back()}
        insets={insets}
        testID="stat-details-header"
      />
      
      {type === 'automated' ? (
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <StatHeaderCard
            icon={statInfo.icon}
            count={statInfo.count}
            description={statInfo.description}
            color={statInfo.color}
            colors={colors}
          />
          <AutomationCoverageView
            onCreateRule={() => router.push('/create-rule')}
            colors={colors}
          />
        </ScrollView>
      ) : type === 'unread' ? (
        <FlatList<Email>
          data={unreadEmails}
          renderItem={({ item }) => renderEmailItem(item)}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <StatHeaderCard
                icon={statInfo.icon}
                count={statInfo.count}
                description={statInfo.description}
                color={statInfo.color}
                colors={colors}
                styles={styles}
              />
              <View style={styles.section}>
                <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">
                  Unread Messages ({unreadEmails.length})
                </AppText>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.section}>
              <EmptyState
                icon={Mail}
                title="No unread messages! 🎉"
                description="All caught up! Your inbox is clean."
                iconSize={64}
                iconColor={colors.success}
                style={styles.emptyState}
              />
            </View>
          }
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          {...getOptimizedFlatListProps()}
        />
      ) : type === 'noise' ? (
        <FlatList<Sender>
          data={noisySenders}
          renderItem={({ item }) => renderSenderItem(item)}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <StatHeaderCard
                icon={statInfo.icon}
                count={statInfo.count}
                description={statInfo.description}
                color={statInfo.color}
                colors={colors}
                styles={styles}
              />
              <View style={styles.section}>
                <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">
                  High Noise Senders ({noisySenders.length})
                </AppText>
                <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
                  <AppText style={[styles.infoText, { color: colors.text }]} dynamicTypeStyle="body">
                    These senders have high email volume but low engagement. Consider unsubscribing or muting them.
                  </AppText>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.section}>
              <EmptyState
                icon={XCircle}
                title="No noisy senders found"
                description="All your senders are well-behaved!"
                iconSize={64}
                style={styles.emptyState}
              />
            </View>
          }
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          {...getOptimizedFlatListProps()}
        />
      ) : type === 'files' ? (
        <FlatList<Email>
          data={emailsWithFiles}
          renderItem={({ item }) => renderFileItem(item)}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <StatHeaderCard
                icon={statInfo.icon}
                count={statInfo.count}
                description={statInfo.description}
                color={statInfo.color}
                colors={colors}
                styles={styles}
              />
              <View style={styles.section}>
                <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">
                  Large Attachments ({emailsWithFiles.length})
                </AppText>
                <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
                  <AppText style={[styles.infoText, { color: colors.text }]} dynamicTypeStyle="body">
                    Total storage used by large attachments. Download important files and delete old emails to free up space.
                  </AppText>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.section}>
              <EmptyState
                icon={HardDrive}
                title="No large files found"
                description="All your attachments are reasonably sized."
                iconSize={64}
                style={styles.emptyState}
              />
            </View>
          }
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          {...getOptimizedFlatListProps()}
        />
      ) : null}
    </View>
  );
}
