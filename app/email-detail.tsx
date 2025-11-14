import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { mockRecentEmails } from '@/mocks/emailData';
import { EmailDetailView } from '@/components/mail/EmailDetailView';
import { categorizeEmail } from '@/utils/emailCategories';
import type { EmailMessage, Email, EmailCategory } from '@/constants/types';

export default function EmailDetailScreen() {
  const params = useLocalSearchParams<{ 
    emailId: string; 
    returnTo?: string; 
    statType?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isDemoMode } = useAuth();
  const { messages, markAsRead, archiveMessage } = useGmailSync();
  const [starredEmails, setStarredEmails] = useState<Set<string>>(new Set());
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track mounted state to prevent callbacks after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clean up any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const allEmails: EmailMessage[] = useMemo(() => {
    const emails = isDemoMode || messages.length === 0 
      ? mockRecentEmails.map(email => ({
          ...email,
          isStarred: starredEmails.has(email.id),
          category: categorizeEmail(email),
        }))
      : messages.map((msg: Email): EmailMessage => {
          const email = {
            id: msg.id,
            threadId: msg.threadId || msg.id,
            from: msg.from,
            to: msg.to,
            subject: msg.subject,
            snippet: msg.snippet,
            date: new Date(msg.date),
            size: msg.sizeBytes || 0,
            labels: msg.labels,
            tags: [],
            hasAttachments: msg.hasAttachments || false,
            attachmentCount: 0,
            isRead: msg.isRead,
            isStarred: starredEmails.has(msg.id),
            priority: undefined,
            confidence: 1,
            category: undefined as EmailCategory | undefined,
          };
          email.category = categorizeEmail(email);
          return email;
        });
    return emails;
  }, [isDemoMode, messages, starredEmails]);

  const selectedEmail = useMemo(() => {
    return allEmails.find(e => e.id === params.emailId) || null;
  }, [params.emailId, allEmails]);

  const handleBack = () => {
    try {
      // Try to go back, with fallback to mail tab
      router.back();
    } catch (error) {
      console.error('Error navigating back:', error);
      // Fallback to mail tab on error
      try {
        router.replace('/(tabs)/mail');
      } catch (replaceError) {
        console.error('Error with fallback navigation:', replaceError);
      }
    }
  };

  const handleStar = async (emailId: string) => {
    setStarredEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const handleArchive = async (email: EmailMessage) => {
    try {
      await archiveMessage(email.id);
      // Use setTimeout to ensure state updates complete before navigation
      // This prevents crashes when component unmounts during async operations
      timeoutRef.current = setTimeout(() => {
        // Only navigate if component is still mounted
        if (!isMountedRef.current) {
          return;
        }
        try {
          router.back();
        } catch (navError) {
          console.error('Error navigating after archive:', navError);
          // Fallback to mail tab only if still mounted
          if (isMountedRef.current) {
            try {
              router.replace('/(tabs)/mail');
            } catch (replaceError) {
              console.error('Error with fallback navigation:', replaceError);
            }
          }
        }
      }, 100);
    } catch (error) {
      console.error('Failed to archive email:', error);
    }
  };

  const handleReply = (email: EmailMessage) => {
    try {
      // Navigate back to mail tab with compose mode
      router.push({
        pathname: '/(tabs)/mail',
        params: {
          compose: 'reply',
          emailId: email.id,
        }
      });
    } catch (error) {
      console.error('Error navigating to reply:', error);
    }
  };

  const handleReplyAll = (email: EmailMessage) => {
    try {
      // Navigate back to mail tab with compose mode
      router.push({
        pathname: '/(tabs)/mail',
        params: {
          compose: 'replyAll',
          emailId: email.id,
        }
      });
    } catch (error) {
      console.error('Error navigating to reply all:', error);
    }
  };

  const handleForward = (email: EmailMessage) => {
    try {
      // Navigate back to mail tab with compose mode
      router.push({
        pathname: '/(tabs)/mail',
        params: {
          compose: 'forward',
          emailId: email.id,
        }
      });
    } catch (error) {
      console.error('Error navigating to forward:', error);
    }
  };

  if (!selectedEmail) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          gestureEnabled: false, // Disable native swipe-to-go-back to prevent conflict with email navigation gesture
          animation: 'slide_from_right', // Keep animation but disable gesture
        }} 
      />
      <EmailDetailView
        selectedEmail={selectedEmail}
        insets={insets}
        onBack={handleBack}
        onStar={handleStar}
        onArchive={handleArchive}
        onReply={handleReply}
        onReplyAll={handleReplyAll}
        onForward={handleForward}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

