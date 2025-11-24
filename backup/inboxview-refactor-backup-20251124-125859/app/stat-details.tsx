import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Mail, Archive, HardDrive, Sparkles, ArrowLeft, AlertCircle, Trash2, XCircle } from 'lucide-react-native';
import { mockSenders, mockRecentEmails } from '@/mocks/emailData';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useEmailState } from '@/contexts/EmailStateContext';

type StatType = 'unread' | 'noise' | 'files' | 'automated';

export default function StatDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type as StatType;
  const { messages, senders } = useGmailSync();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { trashedEmails } = useEmailState();

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

  const renderContent = () => {
    switch (type) {
      case 'unread':
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Unread Messages ({unreadEmails.length})</Text>
            {unreadEmails.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No unread messages! 🎉</Text>
              </View>
            ) : (
              unreadEmails.map((email) => (
              <TouchableOpacity 
                key={email.id}
                testID={`unread-email-${email.id}`}
                style={[styles.emailCard, { backgroundColor: colors.surface }]}
                onPress={() => {
                  router.push({ 
                    pathname: '/email-detail', 
                    params: { 
                      emailId: email.id, 
                      returnTo: 'stat-details',
                      statType: type,
                    } 
                  });
                }}
                activeOpacity={0.7}
              >
                  <View style={styles.emailHeader}>
                    <View style={[styles.emailIconContainer, { backgroundColor: colors.primary + '20' }]}>
                      <Mail size={20} color={colors.primary} />
                    </View>
                    <View style={styles.emailContent}>
                      <Text style={[styles.emailSubject, { color: colors.text }]} numberOfLines={1}>{email.subject}</Text>
                      <Text style={[styles.emailFrom, { color: colors.textSecondary }]} numberOfLines={1}>{email.from}</Text>
                      <Text style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>{email.snippet}</Text>
                      <Text style={[styles.emailDate, { color: colors.textSecondary }]}>
                        {typeof email.date === 'string' 
                          ? new Date(email.date).toLocaleDateString()
                          : email.date.toLocaleDateString()
                        }
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        );

      case 'noise':
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>High Noise Senders ({noisySenders.length})</Text>
            <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                These senders have high email volume but low engagement. Consider unsubscribing or muting them.
              </Text>
            </View>
            {noisySenders.map((sender) => (
              <TouchableOpacity
                key={sender.id}
                testID={`sender-${sender.id}`}
                style={[styles.senderCard, { backgroundColor: colors.surface }]}
                onPress={() => router.push({ pathname: '/senders', params: { q: sender.email } })}
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
                    <Text style={[styles.senderEmail, { color: colors.textSecondary }]} numberOfLines={1}>{sender.email}</Text>
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
            ))}
          </View>
        );

      case 'files':
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Large Attachments ({emailsWithFiles.length})</Text>
            <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                Total storage used by large attachments. Download important files and delete old emails to free up space.
              </Text>
            </View>
            {emailsWithFiles.map((email) => (
              <TouchableOpacity 
                key={email.id}
                testID={`file-email-${email.id}`}
                style={[styles.fileCard, { backgroundColor: colors.surface }]}
                onPress={() => {
                  router.push({ 
                    pathname: '/email-detail', 
                    params: { 
                      emailId: email.id,
                      returnTo: 'stat-details',
                      statType: type,
                    } 
                  });
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.fileIconContainer, { backgroundColor: '#5856D6' + '20' }]}>
                  <HardDrive size={20} color="#5856D6" />
                </View>
                <View style={styles.fileContent}>
                  <Text style={[styles.fileSubject, { color: colors.text }]} numberOfLines={1}>{email.subject}</Text>
                  <Text style={[styles.fileFrom, { color: colors.textSecondary }]} numberOfLines={1}>{email.from}</Text>
                  <View style={styles.fileMetadata}>
                    <Text style={[styles.fileSize, { color: '#5856D6' }]}>
                    {('size' in email 
                      ? (email.size / (1024 * 1024)).toFixed(2) 
                      : ('sizeBytes' in email ? (email.sizeBytes / (1024 * 1024)).toFixed(2) : '0')
                    )} MB
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
            ))}
          </View>
        );

      case 'automated':
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Automation Coverage</Text>
            <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                56% of your emails are automatically organized by rules and filters. This helps keep your inbox clean and organized.
              </Text>
            </View>
            
            <View style={[styles.automationCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.automationTitle, { color: colors.text }]}>Active Automations</Text>
              <View style={styles.automationItem}>
                <View style={[styles.automationDot, { backgroundColor: '#34C759' }]} />
                <View style={styles.automationInfo}>
                  <Text style={[styles.automationName, { color: colors.text }]}>Auto-archive promotions</Text>
                  <Text style={[styles.automationDesc, { color: colors.textSecondary }]}>Moved 847 emails last month</Text>
                </View>
              </View>
              <View style={styles.automationItem}>
                <View style={[styles.automationDot, { backgroundColor: '#34C759' }]} />
                <View style={styles.automationInfo}>
                  <Text style={[styles.automationName, { color: colors.text }]}>Label receipts</Text>
                  <Text style={[styles.automationDesc, { color: colors.textSecondary }]}>Organized 203 emails</Text>
                </View>
              </View>
              <View style={styles.automationItem}>
                <View style={[styles.automationDot, { backgroundColor: '#34C759' }]} />
                <View style={styles.automationInfo}>
                  <Text style={[styles.automationName, { color: colors.text }]}>Mark newsletters as read</Text>
                  <Text style={[styles.automationDesc, { color: colors.textSecondary }]}>Processed 634 emails</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              testID="create-rule-button"
              style={[styles.createRuleButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/create-rule')}
            >
              <Text style={[styles.createRuleText, { color: '#FFFFFF' }]}>Create New Rule</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
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
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
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
});
