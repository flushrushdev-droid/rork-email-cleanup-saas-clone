import React, { useMemo } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Mail, Archive, HardDrive, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react-native';
import { mockSenders, mockRecentEmails } from '@/mocks/emailData';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useEmailState } from '@/contexts/EmailStateContext';
import { UnreadEmailsView } from '@/components/stats/UnreadEmailsView';
import { NoiseSendersView } from '@/components/stats/NoiseSendersView';
import { LargeFilesView } from '@/components/stats/LargeFilesView';
import { AutomationCoverageView } from '@/components/stats/AutomationCoverageView';
import { createStatDetailsStyles } from '@/styles/app/stat-details';

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

  const renderContent = () => {
    switch (type) {
      case 'unread':
        return (
          <UnreadEmailsView
            emails={unreadEmails}
            onEmailPress={handleEmailPress}
            colors={colors}
          />
        );

      case 'noise':
        return (
          <NoiseSendersView
            senders={noisySenders}
            onSenderPress={handleSenderPress}
            colors={colors}
          />
        );

      case 'files':
        return (
          <LargeFilesView
            emails={emailsWithFiles}
            onEmailPress={handleEmailPress}
            onDelete={handleDelete}
            onPermanentDelete={handlePermanentDelete}
            colors={colors}
          />
        );

      case 'automated':
        return (
          <AutomationCoverageView
            onCreateRule={() => router.push('/create-rule')}
            colors={colors}
          />
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

