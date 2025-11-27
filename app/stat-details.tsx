import React, { useMemo, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Pressable, RefreshControl, ScrollView } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Mail, Archive, HardDrive, Sparkles, ArrowLeft, AlertCircle, Trash2, XCircle } from 'lucide-react-native';
import { mockSenders, mockRecentEmails } from '@/mocks/emailData';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useEmailState } from '@/contexts/EmailStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { AutomationCoverageView } from '@/components/stats/AutomationCoverageView';
import { EmptyState } from '@/components/common/EmptyState';
import { createStatDetailsStyles } from '@/styles/app/stat-details';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import type { Email, Sender } from '@/constants/types';
import { isValidStatType } from '@/utils/security';

type StatType = 'unread' | 'noise' | 'files' | 'automated';

export default function StatDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { messages, senders, syncMailbox, isSyncing } = useGmailSync();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { trashedEmails } = useEmailState();
  const { isDemoMode } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Memoize filtered data to prevent blocking during transitions
  const unreadEmails = useMemo(() => {
    if (type !== 'unread') return [];
    const emails = messages.length > 0 
      ? messages.filter(m => !m.isRead) 
      : mockRecentEmails.filter(m => !m.isRead);
    // Filter out trashed emails and ensure they have size information (sizeBytes or size)
    return emails
      .filter(m => {
        if (trashedEmails.has(m.id)) return false;
        // Check if email has size information (either sizeBytes or size property)
        return 'sizeBytes' in m || 'size' in m;
      })
      .map(m => {
        // Normalize to Email type with sizeBytes
        const sizeBytes = 'sizeBytes' in m ? (m as any).sizeBytes : ('size' in m ? (m as any).size : 0);
        const dateStr = m.date instanceof Date ? m.date.toISOString() : typeof m.date === 'string' ? m.date : new Date().toISOString();
        return {
          id: m.id,
          threadId: m.threadId,
          from: m.from,
          to: m.to,
          subject: m.subject,
          snippet: m.snippet,
          date: dateStr,
          isRead: m.isRead,
          hasAttachments: m.hasAttachments,
          labels: m.labels,
          priority: 'priority' in m ? m.priority : undefined,
          sizeBytes,
        } as Email;
      });
  }, [type, messages, trashedEmails]);

  const noisySenders = useMemo(() => {
    if (type !== 'noise') return [];
    return (senders.length > 0 ? senders : mockSenders)
      .filter((s): s is Sender => 'noiseScore' in s && typeof s.noiseScore === 'number')
      .filter(s => s.noiseScore >= 6)
      .sort((a, b) => b.noiseScore - a.noiseScore);
  }, [type, senders]);

  const emailsWithFiles = useMemo(() => {
    if (type !== 'files') return [];
    return (messages.length > 0 ? messages : mockRecentEmails)
      .filter(m => {
        // Filter out trashed emails
        if (trashedEmails.has(m.id)) return false;
        // Check if email has attachments
        const hasAttachments = m.hasAttachments;
        const attachmentCount = 'attachmentCount' in m && typeof m.attachmentCount === 'number' ? m.attachmentCount : 0;
        return hasAttachments && attachmentCount > 0;
      })
      .map(m => {
        // Normalize to Email type with sizeBytes
        const sizeBytes = 'sizeBytes' in m ? (m as any).sizeBytes : ('size' in m ? (m as any).size : 0);
        const dateStr = m.date instanceof Date ? m.date.toISOString() : typeof m.date === 'string' ? m.date : new Date().toISOString();
        return {
          id: m.id,
          threadId: m.threadId,
          from: m.from,
          to: m.to,
          subject: m.subject,
          snippet: m.snippet,
          date: dateStr,
          isRead: m.isRead,
          hasAttachments: m.hasAttachments,
          labels: m.labels,
          priority: 'priority' in m ? m.priority : undefined,
          sizeBytes,
        } as Email;
      })
      .filter((m): m is Email => m.sizeBytes !== undefined)
      .sort((a, b) => {
        const aSize = a.sizeBytes || 0;
        const bSize = b.sizeBytes || 0;
        return bSize - aSize;
      });
  }, [type, messages, trashedEmails]);

  // Calculate counts from filtered data to ensure consistency
  const unreadCount = useMemo(() => unreadEmails.length, [unreadEmails]);
  const filesCount = useMemo(() => emailsWithFiles.length, [emailsWithFiles]);

  const statInfo = useMemo(() => {
    switch (type) {
      case 'unread':
        return {
          title: 'Unread Messages',
          icon: Mail,
          color: colors.primary,
          count: unreadCount,
          description: 'These are all your unread messages. Consider reading or archiving them to keep your inbox clean.',
        };
      case 'noise':
        return {
          title: 'Noise Sources',
          icon: Archive,
          color: colors.warning,
          count: '42%',
          description: 'Low-engagement emails that clutter your inbox. These senders have high volume but low interaction rates.',
        };
      case 'files':
        return {
          title: 'Large Files',
          icon: HardDrive,
          color: colors.secondary,
          count: filesCount,
          description: 'Emails with large attachments taking up storage space. Consider downloading important files and deleting old emails.',
        };
      case 'automated':
        return {
          title: 'Automated Coverage',
          icon: Sparkles,
          color: colors.success,
          count: '56%',
          description: 'Percentage of emails automatically organized by rules and filters. Higher is better!',
        };
      default:
        return {
          title: 'Details',
          icon: AlertCircle,
          color: colors.primary,
          count: 0,
          description: '',
        };
    }
  }, [type, colors.primary, colors.secondary, colors.success, colors.warning, unreadCount, filesCount]);

  const IconComponent = statInfo.icon;

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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (!isDemoMode && syncMailbox) {
      await syncMailbox();
    }
    setIsRefreshing(false);
  }, [isDemoMode, syncMailbox]);

  const renderEmailItem = useCallback((email: Email) => {
    const emailDate = typeof email.date === 'string'
      ? new Date(email.date).toLocaleDateString()
      : '';
    
    return (
      <TouchableOpacity
        key={email.id}
        testID={`unread-email-${email.id}`}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Unread email from ${email.from}, subject: ${email.subject || 'No subject'}, ${emailDate}`}
        accessibilityHint="Double tap to view this email"
        style={[styles.emailCard, { backgroundColor: colors.surface }]}
        onPress={() => handleEmailPress(email.id)}
        activeOpacity={0.7}
      >
        <View style={styles.emailHeader}>
          <View style={[styles.emailIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Mail size={20} color={colors.primary} />
          </View>
          <View style={styles.emailContent}>
            <AppText style={[styles.emailSubject, { color: colors.text }]} numberOfLines={1} dynamicTypeStyle="body">
              {email.subject}
            </AppText>
            <AppText style={[styles.emailFrom, { color: colors.textSecondary }]} numberOfLines={1} dynamicTypeStyle="caption1">
              {email.from}
            </AppText>
            <AppText style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2} dynamicTypeStyle="caption1">
              {email.snippet}
            </AppText>
            <AppText style={[styles.emailDate, { color: colors.textSecondary }]} dynamicTypeStyle="caption1">
              {emailDate}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [styles, colors, handleEmailPress]);

  const renderSenderItem = useCallback((sender: Sender) => {
    return (
      <TouchableOpacity
        key={sender.id}
        testID={`sender-${sender.id}`}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${sender.displayName || sender.email}, ${sender.totalEmails} emails, ${sender.engagementRate}% engagement, noise score ${sender.noiseScore.toFixed(1)}`}
        accessibilityHint="Double tap to view emails from this sender"
        style={[styles.senderCard, { backgroundColor: colors.surface }]}
        onPress={() => handleSenderPress(sender.email)}
        activeOpacity={0.7}
      >
        <View style={styles.senderInfo}>
          <View style={[styles.senderAvatar, { backgroundColor: colors.primary }]}>
            <AppText style={styles.senderInitial} dynamicTypeStyle="body">
              {sender.displayName?.[0] || sender.email[0].toUpperCase()}
            </AppText>
          </View>
          <View style={styles.senderDetails}>
            <AppText style={[styles.senderName, { color: colors.text }]} numberOfLines={1} dynamicTypeStyle="body">
              {sender.displayName || sender.email}
            </AppText>
            <AppText style={[styles.senderEmail, { color: colors.textSecondary }]} numberOfLines={1} dynamicTypeStyle="caption1">
              {sender.email}
            </AppText>
            <AppText style={[styles.senderStats, { color: colors.textSecondary }]} dynamicTypeStyle="caption1">
              {sender.totalEmails} emails • {sender.engagementRate}% engagement
            </AppText>
          </View>
        </View>
        <View style={[styles.noiseBadge, { backgroundColor: sender.noiseScore >= 8 ? colors.danger + '20' : colors.warning + '20' }]}>
          <AppText style={[styles.noiseScore, { color: sender.noiseScore >= 8 ? colors.danger : colors.warning }]} dynamicTypeStyle="body">
            {sender.noiseScore.toFixed(1)}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  }, [styles, colors, handleSenderPress]);

  const renderFileItem = useCallback((email: Email) => {
    const fileSize = ('size' in email && typeof email.size === 'number'
      ? (email.size / (1024 * 1024)).toFixed(2)
      : 'sizeBytes' in email && typeof email.sizeBytes === 'number'
      ? (email.sizeBytes / (1024 * 1024)).toFixed(2)
      : '0');
    const attachmentCount = 'attachmentCount' in email && typeof email.attachmentCount === 'number'
      ? email.attachmentCount
      : 'attachmentCount' in email && typeof email.attachmentCount === 'string'
      ? email.attachmentCount
      : '?';
    
    return (
      <View
        key={email.id}
        style={[styles.fileCard, { backgroundColor: colors.surface }]}
      >
        <Pressable
          testID={`file-email-${email.id}`}
          accessible={true}
          accessibilityLabel={`Email from ${email.from}, subject: ${email.subject || 'No subject'}, ${fileSize} MB, ${attachmentCount} files`}
          accessibilityHint="Double tap to view this email"
          style={{ flex: 1 }}
          onPress={() => handleEmailPress(email.id)}
        >
        <View style={[styles.fileIconContainer, { backgroundColor: colors.secondary + '20' }]}>
          <HardDrive size={20} color={colors.secondary} />
        </View>
        <View style={styles.fileContent}>
          <AppText style={[styles.fileSubject, { color: colors.text }]} numberOfLines={1} dynamicTypeStyle="body">
            {email.subject}
          </AppText>
          <AppText style={[styles.fileFrom, { color: colors.textSecondary }]} numberOfLines={1} dynamicTypeStyle="caption1">
            {email.from}
          </AppText>
          <View style={styles.fileMetadata}>
            <AppText style={[styles.fileSize, { color: colors.secondary }]} dynamicTypeStyle="caption1">
              {('size' in email && typeof email.size === 'number'
                ? (email.size / (1024 * 1024)).toFixed(2)
                : 'sizeBytes' in email && typeof email.sizeBytes === 'number'
                ? (email.sizeBytes / (1024 * 1024)).toFixed(2)
                : '0')}{' '}
              MB
            </AppText>
            <AppText style={[styles.fileDot, { color: colors.textSecondary }]} dynamicTypeStyle="caption1">•</AppText>
            <AppText style={[styles.fileCount, { color: colors.textSecondary }]} dynamicTypeStyle="caption1">
              {typeof attachmentCount === 'number' ? attachmentCount : attachmentCount} files
            </AppText>
          </View>
        </View>
        </Pressable>
        <View style={styles.fileActions}>
          <TouchableOpacity
            testID={`delete-${email.id}`}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Move to trash"
            accessibilityHint="Double tap to move this email to trash"
            onPress={(e) => {
              e?.stopPropagation?.();
              handleDelete(email.id, email.subject);
            }}
            style={[styles.deleteButton, { backgroundColor: colors.danger + '20' }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={20} color={colors.danger} />
          </TouchableOpacity>
          <TouchableOpacity
            testID={`permanent-delete-${email.id}`}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete permanently"
            accessibilityHint="Double tap to permanently delete this email"
            onPress={(e) => {
              e?.stopPropagation?.();
              handlePermanentDelete(email.id, email.subject);
            }}
            style={[styles.permanentDeleteButton, { backgroundColor: colors.danger + '30' }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <XCircle size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [styles, colors, handleEmailPress, handleDelete, handlePermanentDelete]);

  const renderContent = () => {
    if (type === 'automated') {
      return (
        <AutomationCoverageView
          onCreateRule={() => router.push('/create-rule')}
          colors={colors}
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Custom header like email-detail for smooth transitions */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          testID="back-button"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Double tap to go back"
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <AppText 
          style={[styles.customHeaderTitle, { color: colors.text }]}
          accessibilityRole="header"
          accessibilityLabel={statInfo.title}
          dynamicTypeStyle="title2"
        >
          {statInfo.title}
        </AppText>
        <View style={{ width: 24 }} />
      </View>
      
      {type === 'automated' ? (
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.headerCard, { backgroundColor: statInfo.color }]}>
            <View style={styles.headerIcon}>
              <IconComponent size={32} color={colors.surface} />
            </View>
            <AppText style={styles.headerCount} dynamicTypeStyle="title1">{statInfo.count}</AppText>
            <AppText style={styles.headerDescription} dynamicTypeStyle="body">{statInfo.description}</AppText>
          </View>
          {renderContent()}
        </ScrollView>
      ) : type === 'unread' ? (
        <FlatList<Email>
          data={unreadEmails}
          renderItem={({ item }) => renderEmailItem(item)}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <View style={[styles.headerCard, { backgroundColor: statInfo.color }]}>
                <View style={styles.headerIcon}>
                  <IconComponent size={32} color={colors.surface} />
                </View>
                <AppText style={styles.headerCount} dynamicTypeStyle="title1">{statInfo.count}</AppText>
                <AppText style={styles.headerDescription} dynamicTypeStyle="body">{statInfo.description}</AppText>
              </View>
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing || isSyncing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          updateCellsBatchingPeriod={50}
        />
      ) : type === 'noise' ? (
        <FlatList<Sender>
          data={noisySenders}
          renderItem={({ item }) => renderSenderItem(item)}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <View style={[styles.headerCard, { backgroundColor: statInfo.color }]}>
                <View style={styles.headerIcon}>
                  <IconComponent size={32} color={colors.surface} />
                </View>
                <AppText style={styles.headerCount} dynamicTypeStyle="title1">{statInfo.count}</AppText>
                <AppText style={styles.headerDescription} dynamicTypeStyle="body">{statInfo.description}</AppText>
              </View>
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing || isSyncing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          updateCellsBatchingPeriod={50}
        />
      ) : type === 'files' ? (
        <FlatList<Email>
          data={emailsWithFiles}
          renderItem={({ item }) => renderFileItem(item)}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <View style={[styles.headerCard, { backgroundColor: statInfo.color }]}>
                <View style={styles.headerIcon}>
                  <IconComponent size={32} color={colors.surface} />
                </View>
                <AppText style={styles.headerCount} dynamicTypeStyle="title1">{statInfo.count}</AppText>
                <AppText style={styles.headerDescription} dynamicTypeStyle="body">{statInfo.description}</AppText>
              </View>
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing || isSyncing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          updateCellsBatchingPeriod={50}
        />
      ) : null}
    </View>
  );
}

