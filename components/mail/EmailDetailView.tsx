import React, { useMemo } from 'react';
import { View, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Paperclip } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import { EmailDetailHeader } from './emailDetail/EmailDetailHeader';
import { EmailAttachmentList } from './emailDetail/EmailAttachmentList';
import { EmailActionButtons } from './emailDetail/EmailActionButtons';
import { createEmailDetailStyles } from './emailDetail/styles';
import RenderHTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';

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
  const { width } = useWindowDimensions();
  const hasMultipleRecipients = selectedEmail.to.length > 1;
  const styles = createEmailDetailStyles(colors);

  // Check if body is HTML (starts with < or contains HTML tags)
  const isHTML = useMemo(() => {
    if (!selectedEmail.body) return false;
    const trimmed = selectedEmail.body.trim();
    return trimmed.startsWith('<') || /<[a-z][\s\S]*>/i.test(trimmed);
  }, [selectedEmail.body]);

  // Check if HTML is complex (has style tags, inline styles, or complex structure)
  const isComplexHTML = useMemo(() => {
    if (!isHTML || !selectedEmail.body) return false;
    const body = selectedEmail.body.toLowerCase();
    // Check for complex HTML features that WebView handles better
    return (
      body.includes('<style') ||
      body.includes('style=') ||
      body.includes('class=') ||
      body.includes('@media') ||
      body.includes('background') ||
      body.includes('border-radius') ||
      body.includes('box-shadow') ||
      body.includes('flex') ||
      body.includes('grid')
    );
  }, [isHTML, selectedEmail.body]);

  // HTML renderer configuration
  const htmlRenderConfig = useMemo(() => ({
    contentWidth: width - 32, // Account for padding
    baseStyle: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    tagsStyles: {
      body: {
        color: colors.text,
        fontSize: 14,
        lineHeight: 20,
      },
      p: {
        color: colors.text,
        marginBottom: 12,
      },
      a: {
        color: colors.primary,
        textDecorationLine: 'underline',
      },
      h1: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
      h2: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 14 },
      h3: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
      h4: { color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
      h5: { color: colors.text, fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
      h6: { color: colors.text, fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
      ul: { marginBottom: 12 },
      ol: { marginBottom: 12 },
      li: { color: colors.text, marginBottom: 4 },
      table: { borderColor: colors.border },
      th: { backgroundColor: colors.surface, color: colors.text, padding: 8 },
      td: { borderColor: colors.border, color: colors.text, padding: 8 },
    },
    systemFonts: ['System'], // Use system fonts
  }), [colors, width]);

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
          {selectedEmail.body ? (
            isHTML ? (
              isComplexHTML ? (
                // Use WebView for complex HTML emails (better CSS support)
                <View style={{ width: '100%', height: 600, backgroundColor: colors.background }}>
                  <WebView
                    source={{ html: selectedEmail.body }}
                    style={{ backgroundColor: 'transparent', flex: 1 }}
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    showsHorizontalScrollIndicator={false}
                    // Inject CSS to match theme and ensure proper rendering
                    injectedCSS={`
                      body {
                        color: ${colors.text};
                        background-color: ${colors.background};
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        margin: 0;
                        padding: 16px;
                        width: 100%;
                        box-sizing: border-box;
                      }
                      * {
                        box-sizing: border-box;
                      }
                      a {
                        color: ${colors.primary};
                      }
                      img {
                        max-width: 100%;
                        height: auto;
                      }
                    `}
                    // Allow images and external resources
                    originWhitelist={['*']}
                    // Disable zoom
                    scalesPageToFit={false}
                    // Handle links - open in new window on web
                    onShouldStartLoadWithRequest={(request) => {
                      if (Platform.OS === 'web' && request.url.startsWith('http')) {
                        if (typeof window !== 'undefined') {
                          window.open(request.url, '_blank');
                        }
                        return false;
                      }
                      return true;
                    }}
                    // Set initial scale for proper rendering
                    startInLoadingState={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                  />
                </View>
              ) : (
                // Use RenderHTML for simple HTML
                <RenderHTML
                  contentWidth={htmlRenderConfig.contentWidth}
                  source={{ html: selectedEmail.body }}
                  baseStyle={htmlRenderConfig.baseStyle}
                  tagsStyles={htmlRenderConfig.tagsStyles}
                  systemFonts={htmlRenderConfig.systemFonts}
                  defaultTextProps={{
                    style: { color: colors.text },
                  }}
                  enableExperimentalMarginCollapsing={true}
                  renderersProps={{
                    img: {
                      enableExperimentalPercentWidth: true,
                    },
                  }}
                />
              )
            ) : (
              <AppText style={[styles.detailBodyText, { color: colors.text }]} dynamicTypeStyle="body">
                {selectedEmail.body}
              </AppText>
            )
          ) : (
            <AppText style={[styles.detailBodyText, { color: colors.text }]} dynamicTypeStyle="body">
              {selectedEmail.snippet}
            </AppText>
          )}
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
