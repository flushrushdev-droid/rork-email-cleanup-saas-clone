import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
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
import { createEmailDetailStyles } from '@/styles/app/email-detail';
import { createScopedLogger } from '@/utils/logger';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { isValidEmailId } from '@/utils/security';

const emailDetailLogger = createScopedLogger('EmailDetail');

export default function EmailDetailScreen() {
  const params = useLocalSearchParams<{ 
    emailId: string; 
    returnTo?: string; 
    statType?: string;
    showDeleteToast?: string; // ID of email that was just deleted (to show toast)
  }>();
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createEmailDetailStyles(colors), [colors]);
  const { isDemoMode } = useAuth();
  const { messages, markAsRead, archiveMessage } = useGmailSync();
  const { handleAsync } = useErrorHandler({ showAlert: true });
  const { showError: showErrorToast } = useEnhancedToast();
  const [pendingArchive, setPendingArchive] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Set<string>>(new Set());
  const [archivedEmails, setArchivedEmails] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void } | null>(null);
  const [toastTimer, setToastTimer] = useState(5);
  const archiveTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const deleteTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isMountedRef = useRef(true);
  
  // Use shared email state context for starred and trashed emails
  const { 
    starredEmails, 
    toggleStarredEmail,
    trashedEmails,
    addTrashedEmail,
    removeTrashedEmail,
  } = useEmailState();

  // Validate emailId parameter early - but after all hooks are called
  React.useEffect(() => {
    if (!params.emailId || !isValidEmailId(params.emailId)) {
      router.replace('/');
    }
  }, [params.emailId, router]);

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
    // Filter out trashed emails (but keep pendingDelete emails so we can navigate to next)
    return emails.filter(email => !trashedEmails.has(email.id) || pendingDelete.has(email.id));
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
    
    // Use push to maintain navigation stack
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
    
    // Use push to maintain navigation stack
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
    // Rely on the navigation stack:
    // Overview -> Stat-details -> Email-detail
    // Back from Email-detail -> Stat-details, back again -> Overview
    router.back();
  };

  const handleStar = async (emailId: string) => {
    toggleStarredEmail(emailId);
  };

  // Track mount status to avoid state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Show toast if we navigated here after deleting previous email
  useEffect(() => {
    if (params.showDeleteToast && params.showDeleteToast !== params.emailId) {
      // Track this email as pending delete for undo purposes
      setPendingDelete(prev => new Set(prev).add(params.showDeleteToast!));
      
      // Show toast with undo option
      setToast({
        message: 'Email moved to Trash',
        onUndo: () => {
          // Clear the timeout from the original screen
          const timeout = deleteTimeoutRef.current.get(params.showDeleteToast!);
          if (timeout) {
            clearTimeout(timeout);
            deleteTimeoutRef.current.delete(params.showDeleteToast!);
          }
          // Remove from pending and from trash (email reappears in lists)
          setPendingDelete(prev => {
            const newSet = new Set(prev);
            newSet.delete(params.showDeleteToast!);
            return newSet;
          });
          // Remove from trash so email reappears in lists
          removeTrashedEmail(params.showDeleteToast!);
          setToast(null);
        },
      });
      setToastTimer(5);
      
      // Auto-hide toast after 5 seconds
      const timeout = setTimeout(() => {
        if (isMountedRef.current) {
          setToast(null);
        }
        deleteTimeoutRef.current.delete(params.showDeleteToast!);
      }, 5000);
      
      deleteTimeoutRef.current.set(params.showDeleteToast!, timeout);
      
      // Cleanup on unmount
      return () => {
        const timeout = deleteTimeoutRef.current.get(params.showDeleteToast!);
        if (timeout) {
          clearTimeout(timeout);
          deleteTimeoutRef.current.delete(params.showDeleteToast!);
        }
      };
    }
  }, [params.showDeleteToast, params.emailId]);

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
        let shouldArchive = false;
        setPendingArchive(prev => {
          if (prev.has(email.id)) {
            shouldArchive = true;
            const newSet = new Set(prev);
            newSet.delete(email.id);
            return newSet;
          }
          return prev;
        });

        if (shouldArchive) {
          setArchivedEmails(archived => new Set(archived).add(email.id));
          if (isMountedRef.current) {
            setToast(null);
            router.back();
          }
        }

        archiveTimeoutRef.current.delete(email.id);
      }, 5000);
      
      archiveTimeoutRef.current.set(email.id, timeout);
      return;
    }

    await handleAsync(async () => {
      await archiveMessage(email.id);
      // Use router.back() to properly pop from navigation stack
      router.back();
    }, {
      showAlert: true,
      onError: (error) => {
        showErrorToast('Failed to archive email. Please try again.');
      },
    });
  };

  const handleDelete = async (email: EmailMessage) => {
    emailDetailLogger.debug('handleDelete called', undefined, { emailId: email.id, subject: email.subject });
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
      
      emailDetailLogger.debug('Delete clicked', undefined, {
        emailIndex,
        totalEmails: allEmails.length,
        hasNext: hasNextEmail,
        nextEmailId: nextEmail?.id,
        nextEmailSubject: nextEmail?.subject,
      });
      
      // Immediately add to trash so it disappears from lists
      addTrashedEmail(email.id);
      
      // Track as pending delete for undo functionality
      setPendingDelete(prev => new Set(prev).add(email.id));
      
      // Navigate to next email immediately (or go back if no next)
      // Don't show toast here - it will show on the next screen via showDeleteToast param
      if (nextEmail) {
        emailDetailLogger.debug('Navigating to next email', undefined, { nextEmailId: nextEmail.id, nextEmailSubject: nextEmail.subject });
        // Use replace to replace current screen (not add to stack)
        // This ensures: Overview -> Stat-details -> Email-detail (next, replaces deleted)
        router.replace({ 
          pathname: '/email-detail', 
          params: { 
            emailId: nextEmail.id,
            returnTo: params.returnTo,
            statType: params.statType,
            showDeleteToast: email.id, // Pass deleted email ID to show toast on next screen
          } 
        });
      } else {
        emailDetailLogger.debug('No next email, going back');
        // Navigate back to stat-details if that's where we came from
        if (params.returnTo === 'stat-details' && params.statType) {
          router.push({
            pathname: '/stat-details',
            params: { type: params.statType }
          });
        } else {
          router.back();
        }
      }
      
      // After 5 seconds, if not undone, just remove from pendingDelete
      // (email is already in trashedEmails, so it stays deleted)
      const timeout = setTimeout(() => {
        setPendingDelete(prev => {
          if (prev.has(email.id)) {
            return new Set([...prev].filter(id => id !== email.id));
          }
          return prev;
        });
        deleteTimeoutRef.current.delete(email.id);
      }, 5000);
      
      deleteTimeoutRef.current.set(email.id, timeout);
      return;
    }

    await handleAsync(async () => {
      // In production, call delete API
      // await deleteMessage(email.id);
      router.back();
    }, {
      showAlert: true,
      onError: (error) => {
        showErrorToast('Failed to delete email. Please try again.');
      },
    });
  };

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all archive timeouts
      archiveTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      archiveTimeoutRef.current.clear();
      
      // Clear all delete timeouts
      deleteTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      deleteTimeoutRef.current.clear();
    };
  }, []);

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

  // If email not found (was deleted), navigate back to avoid black screen
  // Use replace to remove this screen from the stack
  useEffect(() => {
    if (!selectedEmail && params.emailId && !params.showDeleteToast) {
      // Navigate back to stat-details if that's where we came from
      // Use replace to remove the deleted email screen from the stack
      if (params.returnTo === 'stat-details' && params.statType) {
        router.replace({
          pathname: '/stat-details',
          params: { type: params.statType }
        });
      } else {
        router.back();
      }
    }
  }, [selectedEmail, params.emailId, params.showDeleteToast, params.returnTo, params.statType, router]);

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
            borderColor: colors.success + '55',
            shadowColor: colors.success,
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
                backgroundColor: colors.success + '22',
                borderWidth: 1,
                borderColor: colors.success + '55',
              }}
            >
              <Check size={18} color={colors.success} strokeWidth={3} />
            </View>
            <AppText style={{ color: colors.text, flex: 1 }} dynamicTypeStyle="body">{toast.message}</AppText>
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
                    stroke={colors.success + '33'}
                    strokeWidth={2}
                    fill="none"
                  />
                  <Circle
                    cx={10}
                    cy={10}
                    r={8}
                    stroke={colors.success}
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
                <AppText style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }} dynamicTypeStyle="caption">Undo</AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}


