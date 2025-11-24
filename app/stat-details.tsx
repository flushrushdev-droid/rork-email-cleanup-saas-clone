import React, { useMemo, useState, useCallback } from 'react';
import { Text, View, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Mail, Archive, HardDrive, Sparkles, ArrowLeft, AlertCircle, Trash2, XCircle } from 'lucide-react-native';
import { mockSenders, mockRecentEmails } from '@/mocks/emailData';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useEmailState } from '@/contexts/EmailStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { AutomationCoverageView } from '@/components/stats/AutomationCoverageView';
import { createStatDetailsStyles } from '@/styles/app/stat-details';

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

  const handleDelete = (emailId: string, subject: string) => {
    Alert.alert(
      'Move to Trash',
      `Move "${subject}" to trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Email deletion is handled in email-detail screen
            // This is just for UI consistency
          },
        },
      ]
    );
  };

  const handlePermanentDelete = (emailId: string, subject: string) => {
    Alert.alert(
      'Delete Permanently',
      `Permanently delete "${subject}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            // Email deletion is handled in email-detail screen
            // This is just for UI consistency
          },
        },
      ]
    );
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
          color: '#FF9500',
          count: '42%',
          description: 'Low-engagement emails that clutter your inbox. These senders have high volume but low interaction rates.',
        };
      case 'files':
        return {
          title: 'Large Files',
          icon: HardDrive,
          color: '#5856D6',
          count: 127,
          description: 'Emails with large attachments taking up storage space. Consider downloading important files and deleting old emails.',
        };
      case 'automated':
        return {
          title: 'Automated Coverage',
          icon: Sparkles,
          color: '#34C759',
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
    return (
      <TouchableOpacity
        key={email.id}
        testID={`unread-email-${email.id}`}
        style={[styles.emailCard, { backgroundColor: colors.surface }]}
        onPress={() => handleEmailPress(email.id)}
        activeOpacity={0.7}
      >
        <View style={styles.emailHeader}>
          <View style={[styles.emailIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Mail size={20} color={colors.primary} />
          </View>
          <View style={styles.emailContent}>
            <Text style={[styles.emailSubject, { color: colors.text }]} numberOfLines={1}>
              {email.subject}
            </Text>
            <Text style={[styles.emailFrom, { color: colors.textSecondary }]} numberOfLines={1}>
              {email.from}
            </Text>
            <Text style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
              {email.snippet}
            </Text>
            <Text style={[styles.emailDate, { color: colors.textSecondary }]}>
              {typeof email.date === 'string'
                ? new Date(email.date).toLocaleDateString()
                : email.date.toLocaleDateString()}
            </Text>
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
        style={[styles.senderCard, { backgroundColor: colors.surface }]}
        onPress={() => handleSenderPress(sender.email)}
        activeOpacity={0.7}
      >
        <View style={styles.senderInfo}>
          <View style={[styles.senderAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.senderInitial}>
              {sender.displayName?.[0] || sender.email[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.senderDetails}>
            <Text style={[styles.senderName, { color: colors.text }]} numberOfLines={1}>
              {sender.displayName || sender.email}
            </Text>
            <Text style={[styles.senderEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {sender.email}
            </Text>
            <Text style={[styles.senderStats, { color: colors.textSecondary }]}>
              {sender.totalEmails} emails • {sender.engagementRate}% engagement
            </Text>
          </View>
        </View>
        <View style={[styles.noiseBadge, { backgroundColor: sender.noiseScore >= 8 ? '#FFE5E5' : '#FFF4E5' }]}>
          <Text style={[styles.noiseScore, { color: sender.noiseScore >= 8 ? colors.danger : colors.warning }]}>
            {sender.noiseScore.toFixed(1)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [styles, colors, handleSenderPress]);

  const renderFileItem = useCallback((email: any) => {
    return (
      <TouchableOpacity
        key={email.id}
        testID={`file-email-${email.id}`}
        style={[styles.fileCard, { backgroundColor: colors.surface }]}
        onPress={() => handleEmailPress(email.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.fileIconContainer, { backgroundColor: '#5856D6' + '20' }]}>
          <HardDrive size={20} color="#5856D6" />
        </View>
        <View style={styles.fileContent}>
          <Text style={[styles.fileSubject, { color: colors.text }]} numberOfLines={1}>
            {email.subject}
          </Text>
          <Text style={[styles.fileFrom, { color: colors.textSecondary }]} numberOfLines={1}>
            {email.from}
          </Text>
          <View style={styles.fileMetadata}>
            <Text style={[styles.fileSize, { color: '#5856D6' }]}>
              {('size' in email
                ? (email.size / (1024 * 1024)).toFixed(2)
                : 'sizeBytes' in email
                ? (email.sizeBytes / (1024 * 1024)).toFixed(2)
                : '0')}{' '}
              MB
            </Text>
            <Text style={[styles.fileDot, { color: colors.textSecondary }]}>•</Text>
            <Text style={[styles.fileCount, { color: colors.textSecondary }]}>
              {'attachmentCount' in email ? email.attachmentCount : '?'} files
            </Text>
          </View>
        </View>
        <View style={styles.fileActions}>
          <TouchableOpacity
            testID={`delete-${email.id}`}
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
        <TouchableOpacity testID="back-button" onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.customHeaderTitle, { color: colors.text }]}>{statInfo.title}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {type === 'automated' ? (
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.headerCard, { backgroundColor: statInfo.color }]}>
            <View style={styles.headerIcon}>
              <IconComponent size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.headerCount}>{statInfo.count}</Text>
            <Text style={styles.headerDescription}>{statInfo.description}</Text>
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
                  <IconComponent size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.headerCount}>{statInfo.count}</Text>
                <Text style={styles.headerDescription}>{statInfo.description}</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {type === 'unread' && `Unread Messages (${unreadEmails.length})`}
                  {type === 'noise' && `High Noise Senders (${noisySenders.length})`}
                  {type === 'files' && `Large Attachments (${emailsWithFiles.length})`}
                </Text>
                {type === 'noise' && (
                  <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
                    <Text style={[styles.infoText, { color: colors.text }]}>
                      These senders have high email volume but low engagement. Consider unsubscribing or muting them.
                    </Text>
                  </View>
                )}
                {type === 'files' && (
                  <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
                    <Text style={[styles.infoText, { color: colors.text }]}>
                      Total storage used by large attachments. Download important files and delete old emails to free up space.
                    </Text>
                  </View>
                )}
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.section}>
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {type === 'unread' && 'No unread messages! 🎉'}
                  {type === 'noise' && 'No noisy senders found'}
                  {type === 'files' && 'No large files found'}
                </Text>
              </View>
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

