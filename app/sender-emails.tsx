import React, { useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, Alert, ListRenderItem } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Mail, Calendar, Paperclip, Star, Archive, Trash2, MoreHorizontal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { mockRecentEmails, mockSenders, formatBytes, generateMockEmailsForSender } from '@/mocks/emailData';
import { EmailMessage } from '@/constants/types';
import { useTheme } from '@/contexts/ThemeContext';
import { createSenderEmailsStyles } from '@/styles/app/sender-emails';
import { formatShortRelativeDate } from '@/utils/relativeDateFormat';

export default function SenderEmailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ senderId?: string; senderEmail?: string; senderName?: string }>();
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const styles = React.useMemo(() => createSenderEmailsStyles(colors), [colors]);

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


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: sender?.displayName || sender?.email || 'Sender Emails',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }} 
      />

      <View style={[styles.senderHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.senderInfo}>
          <View style={[styles.senderAvatar, { backgroundColor: sender.isTrusted ? colors.success : colors.primary }]}>
            <Text style={styles.senderInitial}>
              {sender.displayName?.[0] || sender.email[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.senderDetails}>
            <Text style={[styles.senderName, { color: colors.text }]}>{sender.displayName || sender.email}</Text>
            <Text style={[styles.senderEmail, { color: colors.textSecondary }]}>{sender.email}</Text>
          </View>
        </View>

        <View style={[styles.statsGrid, { backgroundColor: colors.background }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{sender.totalEmails}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Emails</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatBytes(sender.totalSize)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Storage</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{sender.noiseScore.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Noise Score</Text>
          </View>
        </View>
      </View>

      {selectedEmails.length > 0 && (
        <View style={[styles.bulkActions, { backgroundColor: colors.primary }]}>
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
              style={[styles.bulkButton, { backgroundColor: colors.danger }]} 
              onPress={handleBulkDelete}
            >
              <Trash2 size={18} color="#FFFFFF" />
              <Text style={styles.bulkButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={senderEmails}
        renderItem={({ item: email }) => {
          const isSelected = selectedEmails.includes(email.id);
          
          return (
            <TouchableOpacity
              testID={`email-card-${email.id}`}
              style={[
                styles.emailCard,
                { backgroundColor: colors.surface },
                isSelected && { borderWidth: 2, borderColor: colors.primary }
              ]}
              onPress={() => toggleEmail(email.id)}
              activeOpacity={0.7}
            >
              <View style={styles.emailHeader}>
                <View style={styles.emailMeta}>
                  <Calendar size={14} color={colors.textSecondary} />
                  <Text style={[styles.emailDate, { color: colors.textSecondary }]}>{formatShortRelativeDate(email.date)}</Text>
                  {email.hasAttachments && (
                    <>
                      <Paperclip size={14} color={colors.textSecondary} />
                      <Text style={[styles.emailAttachments, { color: colors.textSecondary }]}>
                        {email.attachmentCount}
                      </Text>
                    </>
                  )}
                </View>
                {email.isStarred && <Star size={16} color={colors.warning} fill={colors.warning} />}
              </View>

              <Text style={[styles.emailSubject, { color: colors.text }]} numberOfLines={2}>
                {email.subject}
              </Text>
              <Text style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
                {email.snippet}
              </Text>

              <View style={styles.emailFooter}>
                <View style={styles.emailTags}>
                  {email.tags?.slice(0, 2).map((tag, idx) => (
                    <View key={idx} style={[styles.tag, { backgroundColor: colors.primary + '15' }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.emailSize, { color: colors.textSecondary }]}>{formatBytes(email.size)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Emails from this sender ({senderEmails.length})
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Mail size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No emails to display</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              This is a preview with limited mock data
            </Text>
          </View>
        }
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}

