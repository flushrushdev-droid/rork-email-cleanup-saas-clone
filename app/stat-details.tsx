import React, { useMemo, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
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

type StatType = 'unread' | 'noise' | 'files' | 'automated';

export default function StatDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type as StatType;
  const { messages, senders, syncMailbox, isSyncing } = useGmailSync();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { trashedEmails } = useEmailState();
  const { isDemoMode } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showWarning, showError } = useEnhancedToast();

  const handleDelete = (emailId: string, subject: string) => {
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
  };

  const handlePermanentDelete = (emailId: string, subject: string) => {
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
  };

  const statInfo = useMemo(() => {
    switch (type) {
      case 'unread':
        return {
          title: 'Unread Messages',
          icon: Mail,
          color: colors.primary,
          count: (messages.length > 0 ? messages.filter(m => !m.isRead) : mockRecentEmails.filter(m => !m.isRead)).length,
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
          count: 127,
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
  }, [type, colors.primary, messages]);

  const IconComponent = statInfo.icon;
  const styles = React.useMemo(() => createStatDetailsStyles(colors), [colors]);

  // Memoize filtered data to prevent blocking during transitions
  const unreadEmails = useMemo(() => {
    if (type !== 'unread') return [];
    const emails = messages.length > 0 
      ? messages.filter(m => !m.isRead) 
      : mockRecentEmails.filter(m => !m.isRead);
    // Filter out trashed emails
    return emails.filter(m => !trashedEmails.has(m.id));
  }, [type, messages, trashedEmails]);

  const noisySenders = useMemo(() => {
    if (type !== 'noise') return [];
    return (senders.length > 0 ? senders : mockSenders)
      .filter(s => s.noiseScore >= 6)
      .sort((a, b) => b.noiseScore - a.noiseScore);
  }, [type, senders]);

  const emailsWithFiles = useMemo(() => {
    if (type !== 'files') return [];
    return (messages.length > 0 ? messages : mockRecentEmails)
      .filter(m => m.hasAttachments && ('attachmentCount' in m ? m.attachmentCount > 0 : true) && !trashedEmails.has(m.id))
      .sort((a, b) => {
        const aSize = 'size' in a ? a.size : ('sizeBytes' in a ? a.sizeBytes : 0);
        const bSize = 'size' in b ? b.size : ('sizeBytes' in b ? b.sizeBytes : 0);
        return bSize - aSize;
      });
  }, [type, messages, trashedEmails]);

  const handleEmailPress = (emailId: string) => {
    router.push({
      pathname: '/email-detail',
      params: {
        emailId,
        returnTo: 'stat-details',
        statType: type,
      },
    });
  };

  const handleSenderPress = (email: string) => {
    router.push({ pathname: '/senders', params: { q: email } });
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (!isDemoMode && syncMailbox) {
      await syncMailbox();
    }
    setIsRefreshing(false);
  }, [isDemoMode, syncMailbox]);

  const renderEmailItem = useCallback((email: any) => {
    const emailDate = typeof email.date === 'string'
      ? new Date(email.date).toLocaleDateString()
      : email.date.toLocaleDateString();
    
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
            <AppText style={[styles.emailFrom, { color: colors.textSecondary }]} numberOfLines={1} dynamicTypeStyle="caption">
              {email.from}
            </AppText>
            <AppText style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2} dynamicTypeStyle="caption">
              {email.snippet}
            </AppText>
            <AppText style={[styles.emailDate, { color: colors.textSecondary }]} dynamicTypeStyle="caption">
              {typeof email.date === 'string'
                ? new Date(email.date).toLocaleDateString()
                : email.date.toLocaleDateString()}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [styles, colors, handleEmailPress]);

  const renderSenderItem = useCallback((sender: any) => {
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
            <AppText style={[styles.senderEmail, { color: colors.textSecondary }]} numberOfLines={1} dynamicTypeStyle="caption">
              {sender.email}
            </AppText>
            <AppText style={[styles.senderStats, { color: colors.textSecondary }]} dynamicTypeStyle="caption">
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

  const renderFileItem = useCallback((email: any) => {
    const fileSize = ('size' in email
      ? (email.size / (1024 * 1024)).toFixed(2)
      : 'sizeBytes' in email
      ? (email.sizeBytes / (1024 * 1024)).toFixed(2)
      : '0');
    const attachmentCount = 'attachmentCount' in email ? email.attachmentCount : '?';
    
    return (
      <TouchableOpacity
        key={email.id}
        testID={`file-email-${email.id}`}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Email from ${email.from}, subject: ${email.subject || 'No subject'}, ${fileSize} MB, ${attachmentCount} files`}
        accessibilityHint="Double tap to view this email"
        style={[styles.fileCard, { backgroundColor: colors.surface }]}
        onPress={() => handleEmailPress(email.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.fileIconContainer, { backgroundColor: colors.secondary + '20' }]}>
          <HardDrive size={20} color={colors.secondary} />
        </View>
        <View style={styles.fileContent}>
          <AppText style={[styles.fileSubject, { color: colors.text }]} numberOfLines={1} dynamicTypeStyle="body">
            {email.subject}
          </AppText>
          <AppText style={[styles.fileFrom, { color: colors.textSecondary }]} numberOfLines={1} dynamicTypeStyle="caption">
            {email.from}
          </AppText>
          <View style={styles.fileMetadata}>
            <AppText style={[styles.fileSize, { color: colors.secondary }]} dynamicTypeStyle="caption">
              {('size' in email
                ? (email.size / (1024 * 1024)).toFixed(2)
                : 'sizeBytes' in email
                ? (email.sizeBytes / (1024 * 1024)).toFixed(2)
                : '0')}{' '}
              MB
            </AppText>
            <AppText style={[styles.fileDot, { color: colors.textSecondary }]} dynamicTypeStyle="caption">•</AppText>
            <AppText style={[styles.fileCount, { color: colors.textSecondary }]} dynamicTypeStyle="caption">
              {'attachmentCount' in email ? email.attachmentCount : '?'} files
            </AppText>
          </View>
        </View>
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
      </TouchableOpacity>
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
      ) : (
        <FlatList
          data={type === 'unread' ? unreadEmails : type === 'noise' ? noisySenders : type === 'files' ? emailsWithFiles : []}
          renderItem={({ item }) => {
            if (type === 'unread') return renderEmailItem(item);
            if (type === 'noise') return renderSenderItem(item);
            if (type === 'files') return renderFileItem(item);
            return null;
          }}
          keyExtractor={(item) => (item as any).id || `item-${item}`}
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
                  {type === 'unread' && `Unread Messages (${unreadEmails.length})`}
                  {type === 'noise' && `High Noise Senders (${noisySenders.length})`}
                  {type === 'files' && `Large Attachments (${emailsWithFiles.length})`}
                </AppText>
                {type === 'noise' && (
                  <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
                    <AppText style={[styles.infoText, { color: colors.text }]} dynamicTypeStyle="body">
                      These senders have high email volume but low engagement. Consider unsubscribing or muting them.
                    </AppText>
                  </View>
                )}
                {type === 'files' && (
                  <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
                    <AppText style={[styles.infoText, { color: colors.text }]} dynamicTypeStyle="body">
                      Total storage used by large attachments. Download important files and delete old emails to free up space.
                    </AppText>
                  </View>
                )}
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.section}>
              {type === 'unread' && (
                <EmptyState
                  icon={Mail}
                  title="No unread messages! 🎉"
                  description="All caught up! Your inbox is clean."
                  iconSize={64}
                  iconColor={colors.success}
                  style={styles.emptyState}
                />
              )}
              {type === 'noise' && (
                <EmptyState
                  icon={XCircle}
                  title="No noisy senders found"
                  description="All your senders are well-behaved!"
                  iconSize={64}
                  style={styles.emptyState}
                />
              )}
              {type === 'files' && (
                <EmptyState
                  icon={HardDrive}
                  title="No large files found"
                  description="All your attachments are reasonably sized."
                  iconSize={64}
                  style={styles.emptyState}
                />
              )}
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
      )}
    </View>
  );
}

