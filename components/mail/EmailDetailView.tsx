import React, { useMemo, useState, useEffect, useRef } from 'react';
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

// Conditionally import WebView only for native platforms
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('WebView not available on this platform');
  }
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// WebView component with dynamic height for email content
interface EmailWebViewProps {
  html: string;
  colors: any;
  width: number;
}

const EmailWebView: React.FC<EmailWebViewProps> = ({ html, colors, width }) => {
  const [webViewHeight, setWebViewHeight] = useState(300); // Start with smaller default
  const [isMeasuring, setIsMeasuring] = useState(true);
  const htmlRef = useRef(html);

  // Reset height when HTML changes (new email)
  useEffect(() => {
    if (htmlRef.current !== html) {
      htmlRef.current = html;
      setWebViewHeight(300); // Reset to default
      setIsMeasuring(true);
    }
  }, [html]);

  if (!WebView) {
    return null;
  }

  return (
    <View style={{ width: '100%', backgroundColor: colors.background }}>
      <WebView
        key={html} // Force remount when HTML changes
        source={{ html }}
        style={{ 
          backgroundColor: 'transparent', 
          width: '100%',
          height: webViewHeight,
        }}
        scrollEnabled={false} // Disable WebView scrolling - let parent ScrollView handle it
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // Inject CSS to match theme and ensure proper rendering
        injectedCSS={`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: auto;
            overflow: hidden;
          }
          body {
            color: ${colors.text};
            background-color: ${colors.background};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 16px;
            width: 100%;
            height: auto;
            min-height: auto;
            box-sizing: border-box;
            overflow: hidden;
          }
          a {
            color: ${colors.primary};
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
          }
          /* Remove any extra whitespace from common email elements */
          table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
            max-width: 100%;
          }
          p:last-child, div:last-child {
            margin-bottom: 0;
          }
          /* Remove extra spacing from email footers and unsubscribe links */
          a[href*="unsubscribe"], a[href*="preferences"] {
            display: inline;
          }
          /* Ensure images don't add extra height */
          img[width="1"][height="1"] {
            display: none !important;
          }
        `}
        // Allow images and external resources
        originWhitelist={['*']}
        // Disable zoom
        scalesPageToFit={false}
        // Set initial scale for proper rendering
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // Get content height and update WebView height
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'contentHeight' && data.height) {
              // Use the actual content height with minimal padding (just 2px for safety)
              // Don't add too much extra space
              const newHeight = Math.max(data.height + 2, 100);
              // Always update if we're still measuring, or if significantly different
              if (isMeasuring || Math.abs(newHeight - webViewHeight) > 5) {
                setWebViewHeight(newHeight);
                setIsMeasuring(false);
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        }}
        // Inject script to measure content height more accurately
        injectedJavaScript={`
          (function() {
            let lastReportedHeight = 0;
            
            function getActualContentHeight() {
              const body = document.body;
              const html = document.documentElement;
              
              // Wait for images to load before measuring
              const images = body.querySelectorAll('img');
              let imagesLoaded = true;
              images.forEach(img => {
                if (!img.complete || img.naturalHeight === 0) {
                  imagesLoaded = false;
                }
              });
              
              // Method 1: Use scrollHeight (most reliable for content height)
              // Force a reflow to ensure accurate measurement
              body.style.display = 'none';
              body.offsetHeight; // Trigger reflow
              body.style.display = '';
              
              let scrollHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.scrollHeight,
                html.offsetHeight
              );
              
              // Method 2: Find the actual last visible element's position
              let maxBottom = 0;
              const allElements = body.querySelectorAll('*');
              allElements.forEach(el => {
                // Skip hidden elements and tracking pixels
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') return;
                
                // Skip 1x1 tracking images
                if (el.tagName === 'IMG') {
                  const img = el;
                  if (img.width <= 1 && img.height <= 1) return;
                }
                
                const rect = el.getBoundingClientRect();
                // Only count elements that are actually visible
                if (rect.width > 0 && rect.height > 0) {
                  const bottom = rect.bottom + window.scrollY;
                  if (bottom > maxBottom && bottom < 100000) { // Sanity check
                    maxBottom = bottom;
                  }
                }
              });
              
              // Method 3: Check last visible element
              let lastVisibleBottom = 0;
              let current = body.lastElementChild;
              while (current) {
                const style = window.getComputedStyle(current);
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                  const rect = current.getBoundingClientRect();
                  if (rect.width > 0 && rect.height > 0) {
                    lastVisibleBottom = rect.bottom + window.scrollY;
                    break;
                  }
                }
                current = current.previousElementSibling;
              }
              
              // Use the maximum of all methods
              const height = Math.max(
                scrollHeight,
                maxBottom,
                lastVisibleBottom
              );
              
              // Get body padding
              const computedStyle = window.getComputedStyle(body);
              const paddingTop = parseInt(computedStyle.paddingTop) || 16;
              const paddingBottom = parseInt(computedStyle.paddingBottom) || 16;
              
              // Calculate final height: content height minus bottom padding
              // Add a small buffer (5px) to account for any rounding issues
              const finalHeight = Math.max(
                height - paddingBottom + 5,
                scrollHeight - paddingBottom + 5,
                100
              );
              
              return Math.ceil(finalHeight);
            }
            
            function updateHeight() {
              const height = getActualContentHeight();
              
              // Only send if height is reasonable and different from last reported
              if (height > 0 && height < 50000 && Math.abs(height - lastReportedHeight) > 2) {
                lastReportedHeight = height;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'contentHeight',
                  height: height
                }));
              }
            }
            
            // Measure immediately
            updateHeight();
            
            // Measure after DOM is ready
            if (document.readyState === 'complete') {
              updateHeight();
            } else {
              window.addEventListener('load', updateHeight);
            }
            
            // Measure after all images load
            const images = document.querySelectorAll('img');
            let imagesToLoad = images.length;
            if (imagesToLoad > 0) {
              images.forEach(img => {
                if (img.complete) {
                  imagesToLoad--;
                } else {
                  img.addEventListener('load', () => {
                    imagesToLoad--;
                    if (imagesToLoad === 0) {
                      setTimeout(updateHeight, 100);
                    }
                  });
                  img.addEventListener('error', () => {
                    imagesToLoad--;
                    if (imagesToLoad === 0) {
                      setTimeout(updateHeight, 100);
                    }
                  });
                }
              });
              if (imagesToLoad === 0) {
                setTimeout(updateHeight, 100);
              }
            }
            
            // Measure periodically for complex emails (but limit retries)
            let retryCount = 0;
            const maxRetries = 10; // Increased for complex emails with async content
            const retryInterval = setInterval(() => {
              updateHeight();
              retryCount++;
              if (retryCount >= maxRetries) {
                clearInterval(retryInterval);
              }
            }, 400); // Longer interval to allow content to settle
          })();
          true; // Required for injected JavaScript
        `}
      />
    </View>
  );
};

interface EmailDetailViewProps {
  selectedEmail: EmailMessage;
  fullBody?: string | null;
  isLoadingBody?: boolean;
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
  fullBody,
  isLoadingBody = false,
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
  const scrollViewRef = useRef<ScrollView>(null);

  // Reset scroll position when email changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [selectedEmail.id]);

  // Use fullBody if provided, otherwise fall back to any existing body, then snippet
  const bodySource = useMemo(() => {
    if (fullBody && fullBody.trim().length > 0) return fullBody;
    if ((selectedEmail as any).body && (selectedEmail as any).body.trim().length > 0) {
      return (selectedEmail as any).body as string;
    }
    return selectedEmail.snippet;
  }, [fullBody, (selectedEmail as any).body, selectedEmail.snippet]);

  // Check if body is HTML (starts with < or contains HTML tags)
  const isHTML = useMemo(() => {
    if (!bodySource) return false;
    const trimmed = bodySource.trim();
    return trimmed.startsWith('<') || /<[a-z][\s\S]*>/i.test(trimmed);
  }, [bodySource]);

  // Check if HTML is complex (has style tags, inline styles, or complex structure)
  const isComplexHTML = useMemo(() => {
    if (!isHTML || !bodySource) return false;
    const body = bodySource.toLowerCase();
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
  }, [isHTML, bodySource]);

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
        ref={scrollViewRef}
        style={styles.detailContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
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
          {/* Skeleton while full body is loading */}
          {isLoadingBody && (
            <View style={{ gap: 10, marginBottom: 16 }}>
              <View style={{ height: 14, borderRadius: 7, backgroundColor: colors.surface }} />
              <View style={{ height: 14, borderRadius: 7, backgroundColor: colors.surface }} />
              <View style={{ height: 14, borderRadius: 7, width: '80%', backgroundColor: colors.surface }} />
            </View>
          )}

          {bodySource ? (
            isHTML ? (
              isComplexHTML ? (
                Platform.OS === 'web' ? (
                  // For web: Use iframe for better isolation and CSS support
                  <View style={{ width: '100%', minHeight: 400, backgroundColor: colors.background }}>
                    {/* @ts-ignore - web-only iframe element */}
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
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
                                text-decoration: none;
                              }
                              a:hover {
                                text-decoration: underline;
                              }
                              img {
                                max-width: 100%;
                                height: auto;
                              }
                            </style>
                          </head>
                          <body>
                            ${bodySource.replace(/<script/gi, '&lt;script').replace(/<\/script>/gi, '&lt;/script&gt;')}
                          </body>
                        </html>
                      `}
                      style={{
                        width: '100%',
                        height: '600px',
                        border: 'none',
                        backgroundColor: 'transparent',
                      }}
                      sandbox="allow-same-origin allow-scripts"
                      title="Email content"
                    />
                  </View>
                ) : WebView ? (
                  // For native: Use WebView with dynamic height
                  <EmailWebView
                    html={bodySource}
                    colors={colors}
                    width={width}
                  />
                ) : (
                  // Fallback: Use RenderHTML if WebView not available
                  <RenderHTML
                    contentWidth={htmlRenderConfig.contentWidth}
                    source={{ html: bodySource }}
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
                // Use RenderHTML for simple HTML
                <RenderHTML
                  contentWidth={htmlRenderConfig.contentWidth}
                  source={{ html: bodySource }}
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
                {bodySource}
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
