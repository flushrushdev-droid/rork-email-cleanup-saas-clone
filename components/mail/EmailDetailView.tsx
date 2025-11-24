import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Paperclip } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import { EmailDetailHeader } from './emailDetail/EmailDetailHeader';
import { EmailAttachmentList } from './emailDetail/EmailAttachmentList';
import { EmailActionButtons } from './emailDetail/EmailActionButtons';
import { createEmailDetailStyles } from './emailDetail/styles';

interface EmailDetailViewProps {
  selectedEmail: EmailMessage;
  insets: EdgeInsets;
  onBack: () => void;
  onStar: (emailId: string) => void;
  onArchive: (email: EmailMessage) => void;
  onDelete: (email: EmailMessage) => void;
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
  onDelete,
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
  const hasMultipleRecipients = selectedEmail.to.length > 1;
  const styles = createEmailDetailStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <EmailDetailHeader
        selectedEmail={selectedEmail}
        onBack={onBack}
        onStar={onStar}
        onArchive={onArchive}
        onDelete={onDelete}
        onNext={onNext}
        onPrev={onPrev}
        hasNext={hasNext}
        hasPrev={hasPrev}
        currentIndex={currentIndex}
        totalCount={totalCount}
        insets={insets}
        colors={colors}
      />

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
          <EmailAttachmentList
            attachments={[{ name: 'attachment.pdf', size: '234 KB' }]}
            colors={colors}
          />
        )}

        <View style={styles.detailBody}>
          <Text style={[styles.detailBodyText, { color: colors.text }]}>{selectedEmail.snippet}</Text>
          <Text style={[styles.detailBodyText, { color: colors.text }]}>
            {'\n\n'}Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            {'\n\n'}Best regards,{'\n'}{selectedEmail.from.split('<')[0].trim()}
          </Text>
        </View>
      </ScrollView>

      <EmailActionButtons
        email={selectedEmail}
        hasMultipleRecipients={hasMultipleRecipients}
        onReply={onReply}
        onReplyAll={onReplyAll}
        onForward={onForward}
        insets={insets}
        colors={colors}
      />
    </View>
  );
}

// Styles are now in components/mail/emailDetail/styles.ts
