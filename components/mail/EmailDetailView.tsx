import React, { useMemo, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Archive, Trash2, Star, ChevronLeft, ChevronRight, Paperclip, Mail, Users, Send } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/colors';
import type { EmailMessage } from '@/constants/types';

interface EmailDetailViewProps {
  selectedEmail: EmailMessage;
  insets: EdgeInsets;
  onBack: () => void;
  onStar: (emailId: string) => void;
  onArchive: (email: EmailMessage) => void;
  onReply: (email: EmailMessage) => void;
  onReplyAll: (email: EmailMessage) => void;
  onForward: (email: EmailMessage) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

export function EmailDetailView({
  selectedEmail,
  insets,
  onBack,
  onStar,
  onArchive,
  onReply,
  onReplyAll,
  onForward,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  currentIndex,
  totalCount,
}: EmailDetailViewProps) {
  const { colors } = useTheme();
  const isMountedRef = useRef(true);
  
  // Track mounted state to prevent callbacks after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Calculate these before any early returns
  const hasMultipleRecipients = selectedEmail?.to?.length > 1;
  const isValidEmail = selectedEmail && selectedEmail.to && Array.isArray(selectedEmail.to);

  // Memoize swipe gesture with proper safety checks
  // Critical: Only create gesture if handlers are available, and check mounted state
  const swipeGesture = useMemo(() => {
    // If no handlers available, return a no-op gesture
    if (!onNext && !onPrev) {
      return Gesture.Pan(); // Empty gesture that does nothing
    }
    
    return Gesture.Pan()
      .onEnd((event) => {
        // Don't process gesture if component is unmounted
        if (!isMountedRef.current) {
          return;
        }
        
        try {
          const swipeThreshold = 50;
          
          // Swipe right = go to previous email
          if (event.translationX > swipeThreshold && hasPrev && onPrev) {
            // Use requestAnimationFrame to ensure gesture completes before navigation
            requestAnimationFrame(() => {
              // Triple check mounted state and handler existence before calling
              if (isMountedRef.current && typeof onPrev === 'function') {
                try {
                  onPrev();
                } catch (err) {
                  console.error('Error in onPrev:', err);
                }
              }
            });
          } 
          // Swipe left = go to next email
          else if (event.translationX < -swipeThreshold && hasNext && onNext) {
            // Use requestAnimationFrame to ensure gesture completes before navigation
            requestAnimationFrame(() => {
              // Triple check mounted state and handler existence before calling
              if (isMountedRef.current && typeof onNext === 'function') {
                try {
                  onNext();
                } catch (err) {
                  console.error('Error in onNext:', err);
                }
              }
            });
          }
        } catch (error) {
          console.error('Error handling swipe gesture:', error);
        }
      });
  }, [hasPrev, hasNext, onPrev, onNext]);

  // Safe back handler with error handling
  const handleBack = () => {
    try {
      onBack();
    } catch (error) {
      console.error('Error in onBack handler:', error);
    }
  };

  // Add null checks to prevent crashes - after all hooks
  if (!isValidEmail) {
    return null;
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.detailHeader, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              testID="back-to-inbox"
              style={styles.backButton}
              onPress={handleBack}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            {currentIndex !== undefined && totalCount !== undefined && (
              <Text style={[styles.emailCounter, { color: colors.textSecondary }]}>
                {currentIndex + 1} of {totalCount}
              </Text>
            )}
          </View>
          <View style={styles.detailActions}>
            {hasPrev && onPrev && (
              <TouchableOpacity
                testID="prev-email"
                style={[styles.navButton, { backgroundColor: colors.surface }]}
                onPress={onPrev}
              >
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
            )}
            {hasNext && onNext && (
              <TouchableOpacity
                testID="next-email"
                style={[styles.navButton, { backgroundColor: colors.surface }]}
                onPress={onNext}
              >
                <ChevronRight size={20} color={colors.text} />
              </TouchableOpacity>
            )}
          <TouchableOpacity
            testID="star-email"
            style={styles.actionButton}
            onPress={() => onStar(selectedEmail.id)}
          >
            <Star
              size={20}
              color={selectedEmail.isStarred ? colors.warning : colors.text}
              fill={selectedEmail.isStarred ? colors.warning : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            testID="archive-email"
            style={styles.actionButton}
            onPress={() => onArchive(selectedEmail)}
          >
            <Archive size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="delete-email"
            style={styles.actionButton}
            onPress={() => Alert.alert('Delete', 'Delete this email?')}
          >
            <Trash2 size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.detailContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={[styles.detailSubject, { color: colors.text }]}>{selectedEmail.subject}</Text>
        
        <View style={styles.detailFrom}>
          <View style={[styles.detailAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.detailAvatarText}>
              {selectedEmail.from[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailSenderInfo}>
            <Text style={[styles.detailSenderName, { color: colors.text }]}>
              {selectedEmail.from.split('<')[0].trim() || selectedEmail.from}
            </Text>
            <Text style={[styles.detailSenderEmail, { color: colors.textSecondary }]}>
              {selectedEmail.from.match(/<(.+?)>/) ?.[1] || selectedEmail.from}
            </Text>
          </View>
          <Text style={[styles.detailDate, { color: colors.textSecondary }]}>
            {selectedEmail.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {selectedEmail.hasAttachments && (
          <View style={[styles.attachmentsSection, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={[styles.attachmentItem, { backgroundColor: colors.background }]}>
              <Paperclip size={16} color={colors.textSecondary} />
              <Text style={[styles.attachmentName, { color: colors.text }]}>attachment.pdf</Text>
              <Text style={[styles.attachmentSize, { color: colors.textSecondary }]}>234 KB</Text>
            </View>
          </View>
        )}

        <View style={styles.detailBody}>
          <Text style={[styles.detailBodyText, { color: colors.text }]}>{selectedEmail.snippet}</Text>
          <Text style={[styles.detailBodyText, { color: colors.text }]}>
            {'\n\n'}Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            {'\n\n'}Best regards,{'\n'}{selectedEmail.from.split('<')[0].trim()}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.emailActionButtons, { paddingBottom: insets.bottom + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          testID="reply-button"
          style={[styles.emailActionButton, { backgroundColor: colors.primary }]}
          onPress={() => onReply(selectedEmail)}
        >
          <Mail size={18} color="#FFFFFF" />
          <Text style={styles.emailActionButtonText}>Reply</Text>
        </TouchableOpacity>
        {hasMultipleRecipients && (
          <TouchableOpacity
            testID="reply-all-button"
            style={[styles.emailActionButton, { backgroundColor: colors.primary }]}
            onPress={() => onReplyAll(selectedEmail)}
          >
            <Users size={18} color="#FFFFFF" />
            <Text style={styles.emailActionButtonText}>Reply All</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          testID="forward-button"
          style={[styles.emailActionButton, { backgroundColor: colors.primary }]}
          onPress={() => onForward(selectedEmail)}
        >
          <Send size={18} color="#FFFFFF" />
          <Text style={styles.emailActionButtonText}>Forward</Text>
        </TouchableOpacity>
      </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emailCounter: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    padding: 4,
  },
  detailContent: {
    flex: 1,
  },
  detailSubject: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  detailFrom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  detailAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  detailSenderInfo: {
    flex: 1,
  },
  detailSenderName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  detailSenderEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  detailDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  attachmentsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },
  attachmentSize: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  detailBody: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  detailBodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.text,
  },
  emailActionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  emailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
  },
  emailActionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
