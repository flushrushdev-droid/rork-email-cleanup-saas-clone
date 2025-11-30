import React from 'react';
import { View, ScrollView } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Paperclip } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import { EmailDetailHeader } from './emailDetail/EmailDetailHeader';
import { EmailAttachmentList } from './emailDetail/EmailAttachmentList';
import { EmailActionButtons } from './emailDetail/EmailActionButtons';
import { createEmailDetailStyles } from './emailDetail/styles';

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

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
        <AppText style={[styles.detailSubject, { color: colors.text }]} dynamicTypeStyle="title2">{selectedEmail.subject}</AppText>
        
        <View style={styles.detailFrom}>
          <View style={[styles.detailAvatar, { backgroundColor: colors.primary }]}>
            <AppText style={[styles.detailAvatarText, { color: colors.surface }]} dynamicTypeStyle="body">
              {selectedEmail.from[0].toUpperCase()}
            </AppText>
          </View>
          <View style={styles.detailSenderInfo}>
            <AppText style={[styles.detailSenderName, { color: colors.text }]} dynamicTypeStyle="body">
              {selectedEmail.from.split('<')[0].trim() || selectedEmail.from}
            </AppText>
            <AppText style={[styles.detailSenderEmail, { color: colors.textSecondary }]} dynamicTypeStyle="caption">
              {selectedEmail.from.match(/<(.+?)>/) ?.[1] || selectedEmail.from}
            </AppText>
          </View>
          <AppText style={[styles.detailDate, { color: colors.textSecondary }]} dynamicTypeStyle="caption">
            {selectedEmail.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </AppText>
        </View>

        {selectedEmail.hasAttachments && selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
          <EmailAttachmentList
            attachments={selectedEmail.attachments.map(att => ({
              name: att.filename,
              size: formatFileSize(att.size),
              attachmentId: att.attachmentId,
            }))}
            emailId={selectedEmail.id}
            colors={colors}
          />
        )}

        <View style={styles.detailBody}>
          <AppText style={[styles.detailBodyText, { color: colors.text }]} dynamicTypeStyle="body">{selectedEmail.snippet}</AppText>
          <AppText style={[styles.detailBodyText, { color: colors.text }]} dynamicTypeStyle="body">
            {'\n\n'}Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            {'\n\n'}Best regards,{'\n'}{selectedEmail.from.split('<')[0].trim()}
          </AppText>
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
