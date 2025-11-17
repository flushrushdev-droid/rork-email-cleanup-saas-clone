import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useEmailState } from '@/contexts/EmailStateContext';
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
  const [pendingArchive, setPendingArchive] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Set<string>>(new Set());
  const [archivedEmails, setArchivedEmails] = useState<Set<string>>(new Set());
  const [trashedEmails, setTrashedEmails] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void } | null>(null);
  const [toastTimer, setToastTimer] = useState(5);
  const archiveTimeoutRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());
  const deleteTimeoutRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Use shared email state context for starred only
  const { 
    starredEmails, 
    toggleStarredEmail,
  } = useEmailState();

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
    // Filter out trashed emails (unless viewing trash folder)
    return emails.filter(email => !trashedEmails.has(email.id));
  }, [isDemoMode, messages, starredEmails, trashedEmails]);

  const selectedEmail = useMemo(() => {
    return allEmails.find(e => e.id === params.emailId) || null;
  }, [params.emailId, allEmails]);

  const currentIndex = useMemo(() => {
    return allEmails.findIndex(e => e.id === params.emailId);
  }, [params.emailId, allEmails]);

  const hasNext = currentIndex >= 0 && currentIndex < allEmails.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (!hasNext || currentIndex < 0) return;
    const nextEmail = allEmails[currentIndex + 1];
    if (!nextEmail) return;
    
    // Use push instead of replace for Rork Expo Go compatibility
    router.push({ 
      pathname: '/email-detail', 
      params: { 
        emailId: nextEmail.id,
        returnTo: params.returnTo,
        statType: params.statType,
      } 
    });
  };

  const handlePrev = () => {
    if (!hasPrev || currentIndex < 0) return;
    const prevEmail = allEmails[currentIndex - 1];
    if (!prevEmail) return;
    
    // Use push instead of replace for Rork Expo Go compatibility
    router.push({ 
      pathname: '/email-detail', 
      params: { 
        emailId: prevEmail.id,
        returnTo: params.returnTo,
        statType: params.statType,
      } 
    });
  };

  const handleBack = () => {
    // Use router.back() to properly pop from navigation stack
    // This ensures correct navigation: email -> stat-details -> overview
    router.back();
  };

  const handleStar = async (emailId: string) => {
    toggleStarredEmail(emailId);
  };

  // Countdown timer for undo toasts
  useEffect(() => {
    if (!toast || !toast.onUndo) {
      setToastTimer(5);
      return;
    }

    setToastTimer(5);
    const interval = setInterval(() => {
      setToastTimer((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [toast]);

  const handleArchive = async (email: EmailMessage) => {
    if (isDemoMode) {
      // Clear any existing timeout for this email
      const existingTimeout = archiveTimeoutRef.current.get(email.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        archiveTimeoutRef.current.delete(email.id);
      }
      
      // Add to pending archive (will be archived after timeout)
      setPendingArchive(prev => new Set(prev).add(email.id));
      
      // Show toast with undo option
      setToast({
        message: 'Email archived',
        onUndo: () => {
          // Clear the timeout
          const timeout = archiveTimeoutRef.current.get(email.id);
          if (timeout) {
            clearTimeout(timeout);
            archiveTimeoutRef.current.delete(email.id);
          }
          // Remove from pending
          setPendingArchive(prev => {
            const newSet = new Set(prev);
            newSet.delete(email.id);
            return newSet;
          });
          setToast(null);
        },
      });
      
      // Archive after 5 seconds if not undone
      const timeout = setTimeout(() => {
        setPendingArchive(prev => {
          if (prev.has(email.id)) {
            setArchivedEmails(archived => new Set(archived).add(email.id));
            return new Set([...prev].filter(id => id !== email.id));
          }
          return prev;
        });
        archiveTimeoutRef.current.delete(email.id);
        setToast(null);
        router.back();
      }, 5000);
      
      archiveTimeoutRef.current.set(email.id, timeout);
      return;
    }

    try {
      await archiveMessage(email.id);
      // Use router.back() to properly pop from navigation stack
      router.back();
    } catch (error) {
      console.error('Failed to archive email:', error);
    }
  };

  const handleDelete = async (email: EmailMessage) => {
    // Use alert for debugging since console.log isn't showing
    if (__DEV__) {
      console.log('EMAIL-DETAIL handleDelete called with email:', email.id, email.subject);
    }
    if (isDemoMode) {
      // Clear any existing timeout for this email
      const existingTimeout = deleteTimeoutRef.current.get(email.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        deleteTimeoutRef.current.delete(email.id);
      }
      
      // Use allEmails (which already has the correct filtering) to find next email
      // allEmails excludes trashed emails but includes pendingDelete emails
      const emailIndex = allEmails.findIndex(e => e.id === email.id);
      const hasNextEmail = emailIndex >= 0 && emailIndex < allEmails.length - 1;
      const nextEmail = hasNextEmail ? allEmails[emailIndex + 1] : null;
      
      if (__DEV__) {
        console.log('Delete clicked. Email index:', emailIndex, 'Total emails:', allEmails.length, 'Has next:', hasNextEmail, 'Next email:', nextEmail?.id, nextEmail?.subject);
      }
      
      // Add to pending delete (will be deleted after timeout)
      setPendingDelete(prev => new Set(prev).add(email.id));
      
      // Show toast with undo option
      setToast({
        message: 'Email moved to Trash',
        onUndo: () => {
          // Clear the timeout
          const timeout = deleteTimeoutRef.current.get(email.id);
          if (timeout) {
            clearTimeout(timeout);
            deleteTimeoutRef.current.delete(email.id);
          }
          // Remove from pending
          setPendingDelete(prev => {
            const newSet = new Set(prev);
            newSet.delete(email.id);
            return newSet;
          });
          setToast(null);
        },
      });
      
      // Navigate to next email immediately (or go back if no next)
      // Do this synchronously to ensure it happens immediately
      if (nextEmail) {
        if (__DEV__) {
          console.log('Navigating to next email:', nextEmail.id, nextEmail.subject);
        }
        // Use push instead of replace to maintain navigation stack
        router.push({ 
          pathname: '/email-detail', 
          params: { 
            emailId: nextEmail.id,
            returnTo: params.returnTo,
            statType: params.statType,
          } 
        });
      } else {
        if (__DEV__) {
          console.log('No next email, going back to mail list');
        }
        router.back();
      }
      
      // Delete after 5 seconds if not undone
      const timeout = setTimeout(() => {
        setPendingDelete(prev => {
          if (prev.has(email.id)) {
            setTrashedEmails(trashed => new Set(trashed).add(email.id));
            return new Set([...prev].filter(id => id !== email.id));
          }
          return prev;
        });
        deleteTimeoutRef.current.delete(email.id);
        setToast(null);
      }, 5000);
      
      deleteTimeoutRef.current.set(email.id, timeout);
      return;
    }

    try {
      // In production, call delete API
      // await deleteMessage(email.id);
      router.back();
    } catch (error) {
      console.error('Failed to delete email:', error);
    }
  };

  const handleReply = (email: EmailMessage) => {
    // Navigate back to mail tab with compose mode
    router.push({
      pathname: '/(tabs)/mail',
      params: {
        compose: 'reply',
        emailId: email.id,
      }
    });
  };

  const handleReplyAll = (email: EmailMessage) => {
    // Navigate back to mail tab with compose mode
    router.push({
      pathname: '/(tabs)/mail',
      params: {
        compose: 'replyAll',
        emailId: email.id,
      }
    });
  };

  const handleForward = (email: EmailMessage) => {
    // Navigate back to mail tab with compose mode
    router.push({
      pathname: '/(tabs)/mail',
      params: {
        compose: 'forward',
        emailId: email.id,
      }
    });
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
      <Stack.Screen options={{ headerShown: false }} />
      <EmailDetailView
        selectedEmail={selectedEmail}
        insets={insets}
        onBack={handleBack}
        onStar={handleStar}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onReply={handleReply}
        onReplyAll={handleReplyAll}
        onForward={handleForward}
        onNext={hasNext ? handleNext : undefined}
        onPrev={hasPrev ? handlePrev : undefined}
        hasNext={hasNext}
        hasPrev={hasPrev}
        currentIndex={currentIndex >= 0 ? currentIndex : undefined}
        totalCount={allEmails.length > 0 ? allEmails.length : undefined}
      />
      {toast && (
        <View
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: insets.bottom + 8,
            backgroundColor: colors.surface,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: '#10B98155',
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#10B98122',
                borderWidth: 1,
                borderColor: '#10B98155',
              }}
            >
              <Check size={18} color="#10B981" strokeWidth={3} />
            </View>
            <Text style={{ color: colors.text, flex: 1 }}>{toast.message}</Text>
          </View>
          {toast.onUndo && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Circular Timer */}
              <View style={{ width: 20, height: 20 }}>
                <Svg width={20} height={20} style={{ transform: [{ rotate: '-90deg' }] }}>
                  <Circle
                    cx={10}
                    cy={10}
                    r={8}
                    stroke="#10B98133"
                    strokeWidth={2}
                    fill="none"
                  />
                  <Circle
                    cx={10}
                    cy={10}
                    r={8}
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 8}`}
                    strokeDashoffset={`${2 * Math.PI * 8 * (1 - toastTimer / 5)}`}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
              <TouchableOpacity
                onPress={toast.onUndo}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>Undo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

