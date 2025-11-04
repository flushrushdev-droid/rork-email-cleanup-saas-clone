import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Mail, Archive, HardDrive, Sparkles, ArrowLeft, AlertCircle, Trash2, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { mockSenders, mockRecentEmails } from '@/mocks/emailData';
import { useGmailSync } from '@/contexts/GmailSyncContext';

type StatType = 'unread' | 'noise' | 'files' | 'automated';

export default function StatDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type as StatType;
  const { messages, senders } = useGmailSync();
  const insets = useSafeAreaInsets();
  const [deletedEmailIds, setDeletedEmailIds] = useState<Set<string>>(new Set());

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
            setDeletedEmailIds(prev => new Set(prev).add(emailId));
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
            setDeletedEmailIds(prev => new Set(prev).add(emailId));
          },
        },
      ]
    );
  };

  const getStatInfo = () => {
    switch (type) {
      case 'unread':
        return {
          title: 'Unread Messages',
          icon: Mail,
          color: Colors.light.primary,
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
          color: Colors.light.primary,
          count: 0,
          description: '',
        };
    }
  };

  const statInfo = getStatInfo();
  const IconComponent = statInfo.icon;

  const renderContent = () => {
    switch (type) {
      case 'unread':
        const unreadEmails = messages.length > 0 
          ? messages.filter(m => !m.isRead) 
          : mockRecentEmails.filter(m => !m.isRead);
        
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unread Messages ({unreadEmails.length})</Text>
            {unreadEmails.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No unread messages! 🎉</Text>
              </View>
            ) : (
              unreadEmails.map((email) => (
                <View key={email.id} style={styles.emailCard}>
                  <View style={styles.emailHeader}>
                    <View style={styles.emailIconContainer}>
                      <Mail size={20} color={Colors.light.primary} />
                    </View>
                    <View style={styles.emailContent}>
                      <Text style={styles.emailSubject} numberOfLines={1}>{email.subject}</Text>
                      <Text style={styles.emailFrom} numberOfLines={1}>{email.from}</Text>
                      <Text style={styles.emailSnippet} numberOfLines={2}>{email.snippet}</Text>
                      <Text style={styles.emailDate}>
                        {typeof email.date === 'string' 
                          ? new Date(email.date).toLocaleDateString()
                          : email.date.toLocaleDateString()
                        }
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'noise':
        const noisySenders = (senders.length > 0 ? senders : mockSenders)
          .filter(s => s.noiseScore >= 6)
          .sort((a, b) => b.noiseScore - a.noiseScore);
        
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>High Noise Senders ({noisySenders.length})</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                These senders have high email volume but low engagement. Consider unsubscribing or muting them.
              </Text>
            </View>
            {noisySenders.map((sender) => (
              <TouchableOpacity
                key={sender.id}
                style={styles.senderCard}
                onPress={() => router.push({ pathname: '/senders', params: { q: sender.email } })}
                activeOpacity={0.7}
              >
                <View style={styles.senderInfo}>
                  <View style={styles.senderAvatar}>
                    <Text style={styles.senderInitial}>
                      {sender.displayName?.[0] || sender.email[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.senderDetails}>
                    <Text style={styles.senderName} numberOfLines={1}>
                      {sender.displayName || sender.email}
                    </Text>
                    <Text style={styles.senderEmail} numberOfLines={1}>{sender.email}</Text>
                    <Text style={styles.senderStats}>
                      {sender.totalEmails} emails • {sender.engagementRate}% engagement
                    </Text>
                  </View>
                </View>
                <View style={[styles.noiseBadge, { backgroundColor: sender.noiseScore >= 8 ? '#FFE5E5' : '#FFF4E5' }]}>
                  <Text style={[styles.noiseScore, { color: sender.noiseScore >= 8 ? Colors.light.danger : Colors.light.warning }]}>
                    {sender.noiseScore.toFixed(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'files':
        const emailsWithFiles = (messages.length > 0 ? messages : mockRecentEmails)
          .filter(m => m.hasAttachments && ('attachmentCount' in m ? m.attachmentCount > 0 : true) && !deletedEmailIds.has(m.id))
          .sort((a, b) => {
            const aSize = 'size' in a ? a.size : ('sizeBytes' in a ? a.sizeBytes : 0);
            const bSize = 'size' in b ? b.size : ('sizeBytes' in b ? b.sizeBytes : 0);
            return bSize - aSize;
          });
        
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Large Attachments ({emailsWithFiles.length})</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Total storage used by large attachments. Download important files and delete old emails to free up space.
              </Text>
            </View>
            {emailsWithFiles.map((email) => (
              <View key={email.id} style={styles.fileCard}>
                <View style={styles.fileIconContainer}>
                  <HardDrive size={20} color="#5856D6" />
                </View>
                <View style={styles.fileContent}>
                  <Text style={styles.fileSubject} numberOfLines={1}>{email.subject}</Text>
                  <Text style={styles.fileFrom} numberOfLines={1}>{email.from}</Text>
                  <View style={styles.fileMetadata}>
                    <Text style={styles.fileSize}>
                    {('size' in email 
                      ? (email.size / (1024 * 1024)).toFixed(2) 
                      : ('sizeBytes' in email ? (email.sizeBytes / (1024 * 1024)).toFixed(2) : '0')
                    )} MB
                  </Text>
                    <Text style={styles.fileDot}>•</Text>
                    <Text style={styles.fileCount}>
                      {'attachmentCount' in email ? email.attachmentCount : '?'} files
                    </Text>
                  </View>
                </View>
                <View style={styles.fileActions}>
                  <TouchableOpacity
                    onPress={() => handleDelete(email.id, email.subject)}
                    style={styles.deleteButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={20} color={Colors.light.danger} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handlePermanentDelete(email.id, email.subject)}
                    style={styles.permanentDeleteButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <XCircle size={20} color={Colors.light.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'automated':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Automation Coverage</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                56% of your emails are automatically organized by rules and filters. This helps keep your inbox clean and organized.
              </Text>
            </View>
            
            <View style={styles.automationCard}>
              <Text style={styles.automationTitle}>Active Automations</Text>
              <View style={styles.automationItem}>
                <View style={styles.automationDot} />
                <View style={styles.automationInfo}>
                  <Text style={styles.automationName}>Auto-archive promotions</Text>
                  <Text style={styles.automationDesc}>Moved 847 emails last month</Text>
                </View>
              </View>
              <View style={styles.automationItem}>
                <View style={styles.automationDot} />
                <View style={styles.automationInfo}>
                  <Text style={styles.automationName}>Label receipts</Text>
                  <Text style={styles.automationDesc}>Organized 203 emails</Text>
                </View>
              </View>
              <View style={styles.automationItem}>
                <View style={styles.automationDot} />
                <View style={styles.automationInfo}>
                  <Text style={styles.automationName}>Mark newsletters as read</Text>
                  <Text style={styles.automationDesc}>Processed 634 emails</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.createRuleButton}
              onPress={() => router.push('/rules')}
            >
              <Text style={styles.createRuleText}>Create New Rule</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: statInfo.title,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
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
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  emailCard: {
    backgroundColor: Colors.light.surface,
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
    backgroundColor: '#E3F2FD',
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
    marginBottom: 4,
  },
  emailDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  senderCard: {
    backgroundColor: Colors.light.surface,
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
    marginBottom: 4,
  },
  senderStats: {
    fontSize: 12,
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.surface,
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
    backgroundColor: '#EDE7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileContent: {
    flex: 1,
  },
  fileSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  fileFrom: {
    fontSize: 13,
    color: Colors.light.textSecondary,
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
    color: '#5856D6',
  },
  fileDot: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  fileCount: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  automationCard: {
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
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
    backgroundColor: '#34C759',
    marginTop: 6,
  },
  automationInfo: {
    flex: 1,
  },
  automationName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  automationDesc: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  createRuleButton: {
    backgroundColor: Colors.light.primary,
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
    color: '#FFFFFF',
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
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permanentDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFCDD2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
