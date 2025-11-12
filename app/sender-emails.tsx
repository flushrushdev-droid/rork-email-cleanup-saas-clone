import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Mail, Calendar, Paperclip, Star, Archive, Trash2, MoreHorizontal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';
import { mockRecentEmails, mockSenders, formatBytes, generateMockEmailsForSender } from '@/mocks/emailData';
import { EmailMessage } from '@/constants/types';

export default function SenderEmailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ senderId?: string; senderEmail?: string; senderName?: string }>();
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const sender = params.senderId 
    ? mockSenders.find(s => s.id === params.senderId)
    : params.senderEmail
      ? mockSenders.find(s => s.email === params.senderEmail) || {
          id: 'temp',
          email: params.senderEmail,
          displayName: params.senderName || params.senderEmail.split('@')[0],
          domain: params.senderEmail.split('@')[1],
          totalEmails: 9,
          totalSize: 4500000,
          avgSize: 500000,
          frequency: 3,
          firstSeen: new Date('2024-01-01'),
          lastSeen: new Date(),
          noiseScore: 7.5,
          engagementRate: 15,
          isMarketing: true,
          hasUnsubscribe: true,
          isMuted: false,
          isTrusted: false,
          isBlocked: false,
          category: 'promotions' as const,
        }
      : undefined;
  
  let senderEmails: EmailMessage[] = sender 
    ? mockRecentEmails.filter(email => email.from === sender.email)
    : [];

  if (sender && senderEmails.length === 0) {
    senderEmails = generateMockEmailsForSender(sender.email, 9);
  }

  if (!sender) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Sender Emails', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sender not found</Text>
        </View>
      </View>
    );
  }

  const toggleEmail = (emailId: string) => {
    setSelectedEmails(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Emails',
      `Delete ${selectedEmails.length} email(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', `${selectedEmails.length} email(s) deleted`);
            setSelectedEmails([]);
          },
        },
      ]
    );
  };

  const handleBulkArchive = () => {
    Alert.alert('Success', `${selectedEmails.length} email(s) archived`);
    setSelectedEmails([]);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: sender?.displayName || sender?.email || 'Sender Emails',
          headerShown: true 
        }} 
      />

      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF']}
        style={styles.senderHeader}
      >
        <View style={styles.senderInfo}>
          <View style={[styles.senderAvatar, { backgroundColor: sender.isTrusted ? Colors.light.success : Colors.light.primary }]}>
            <Text style={styles.senderInitial}>
              {sender.displayName?.[0] || sender.email[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.senderDetails}>
            <Text style={styles.senderName}>{sender.displayName || sender.email}</Text>
            <Text style={styles.senderEmail}>{sender.email}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sender.totalEmails}</Text>
            <Text style={styles.statLabel}>Total Emails</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatBytes(sender.totalSize)}</Text>
            <Text style={styles.statLabel}>Storage</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sender.noiseScore.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Noise Score</Text>
          </View>
        </View>
      </LinearGradient>

      {selectedEmails.length > 0 && (
        <View style={styles.bulkActions}>
          <Text style={styles.bulkText}>{selectedEmails.length} selected</Text>
          <View style={styles.bulkButtons}>
            <TouchableOpacity 
              style={styles.bulkButton} 
              onPress={handleBulkArchive}
            >
              <Archive size={18} color="#FFFFFF" />
              <Text style={styles.bulkButtonText}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkButton, styles.bulkButtonDanger]} 
              onPress={handleBulkDelete}
            >
              <Trash2 size={18} color="#FFFFFF" />
              <Text style={styles.bulkButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          Emails from this sender ({senderEmails.length})
        </Text>

        {senderEmails.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Mail size={48} color={Colors.light.textSecondary} />
            <Text style={styles.emptyText}>No emails to display</Text>
            <Text style={styles.emptySubtext}>
              This is a preview with limited mock data
            </Text>
          </View>
        ) : (
          senderEmails.map((email) => {
            const isSelected = selectedEmails.includes(email.id);
            
            return (
              <TouchableOpacity
                key={email.id}
                testID={`email-card-${email.id}`}
                style={[styles.emailCard, isSelected && styles.emailCardSelected]}
                onPress={() => toggleEmail(email.id)}
                activeOpacity={0.7}
              >
                <View style={styles.emailHeader}>
                  <View style={styles.emailMeta}>
                    <Calendar size={14} color={Colors.light.textSecondary} />
                    <Text style={styles.emailDate}>{formatDate(email.date)}</Text>
                    {email.hasAttachments && (
                      <>
                        <Paperclip size={14} color={Colors.light.textSecondary} />
                        <Text style={styles.emailAttachments}>
                          {email.attachmentCount}
                        </Text>
                      </>
                    )}
                  </View>
                  {email.isStarred && <Star size={16} color={Colors.light.warning} fill={Colors.light.warning} />}
                </View>

                <Text style={styles.emailSubject} numberOfLines={2}>
                  {email.subject}
                </Text>
                <Text style={styles.emailSnippet} numberOfLines={2}>
                  {email.snippet}
                </Text>

                <View style={styles.emailFooter}>
                  <View style={styles.emailTags}>
                    {email.tags?.slice(0, 2).map((tag, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.emailSize}>{formatBytes(email.size)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  senderHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  senderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  senderEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.primary,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  bulkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bulkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bulkButtonDanger: {
    backgroundColor: Colors.light.danger,
  },
  bulkButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: 'center',
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
  emailCardSelected: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emailDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  emailAttachments: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emailSnippet: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  emailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailTags: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.light.primary + '15',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  emailSize: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});
