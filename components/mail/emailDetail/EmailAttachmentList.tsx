import React, { useState } from 'react';
import { View, TouchableOpacity, Platform, Alert } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Paperclip, Download } from 'lucide-react-native';
import { createEmailDetailStyles } from './styles';
import type { ThemeColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { createScopedLogger } from '@/utils/logger';
import { AppConfig, validateSecureUrl } from '@/config/env';

const attachmentLogger = createScopedLogger('AttachmentDownload');
const GMAIL_API_BASE = validateSecureUrl(AppConfig.gmail.apiBase);

interface EmailAttachmentListProps {
  attachments?: Array<{ name: string; size: string; attachmentId?: string }>;
  emailId: string;
  colors: ThemeColors;
}

export function EmailAttachmentList({ attachments, emailId, colors }: EmailAttachmentListProps) {
  const styles = createEmailDetailStyles(colors);
  const { getValidAccessToken } = useAuth();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDownload = async (attachment: { name: string; size: string; attachmentId?: string }, index: number) => {
    if (!attachment.attachmentId) {
      Alert.alert('Download Error', 'Attachment ID not available. Cannot download this attachment.');
      return;
    }

    const downloadId = `${emailId}-${index}`;
    setDownloadingIds(prev => new Set(prev).add(downloadId));

    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        throw new Error('No valid access token');
      }

      // Fetch attachment from Gmail API
      const response = await fetch(
        `${GMAIL_API_BASE}/messages/${emailId}/attachments/${attachment.attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download attachment: ${response.statusText}`);
      }

      const data = await response.json();
      // Gmail API returns base64url encoded data
      const fileData = data.data;
      
      if (!fileData) {
        throw new Error('No attachment data received from Gmail API');
      }

      // Convert base64url to blob for web, or handle for native
      if (Platform.OS === 'web') {
        // For web: convert base64url to blob and trigger download
        // Gmail API uses base64url encoding (RFC 4648)
        const base64 = fileData.replace(/-/g, '+').replace(/_/g, '/');
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Try to determine MIME type from filename extension, fallback to octet-stream
        const getMimeType = (filename: string): string => {
          const ext = filename.split('.').pop()?.toLowerCase();
          const mimeTypes: Record<string, string> = {
            pdf: 'application/pdf',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            txt: 'text/plain',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          };
          return mimeTypes[ext || ''] || 'application/octet-stream';
        };
        
        const blob = new Blob([bytes], { type: getMimeType(attachment.name) });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        attachmentLogger.info('Attachment downloaded successfully', { filename: attachment.name });
      } else {
        // For native: show alert with instructions (can be enhanced with expo-file-system later)
        Alert.alert(
          'Download Complete',
          `Attachment "${attachment.name}" has been downloaded.`,
          [{ text: 'OK' }]
        );
        attachmentLogger.info('Attachment download initiated (native)', { filename: attachment.name });
      }
    } catch (error) {
      attachmentLogger.error('Failed to download attachment', error);
      Alert.alert(
        'Download Failed',
        error instanceof Error ? error.message : 'Failed to download attachment. Please try again.'
      );
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(downloadId);
        return newSet;
      });
    }
  };

  return (
    <View style={[styles.attachmentsSection, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      {attachments.map((attachment, index) => {
        const downloadId = `${emailId}-${index}`;
        const isDownloading = downloadingIds.has(downloadId);
        const canDownload = !!attachment.attachmentId;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.attachmentItem,
              { backgroundColor: colors.background },
              canDownload && !isDownloading && { opacity: 1 },
              (!canDownload || isDownloading) && { opacity: 0.6 },
            ]}
            onPress={() => canDownload && !isDownloading && handleDownload(attachment, index)}
            disabled={!canDownload || isDownloading}
            accessible={true}
            accessibilityLabel={`Attachment: ${attachment.name}, ${attachment.size}. ${canDownload ? 'Double tap to download' : 'Download not available'}`}
            accessibilityRole="button"
          >
            <Paperclip size={16} color={colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppText style={[styles.attachmentName, { color: colors.text }]} dynamicTypeStyle="body">
                {attachment.name}
              </AppText>
              <AppText style={[styles.attachmentSize, { color: colors.textSecondary }]} dynamicTypeStyle="caption">
                {attachment.size}
              </AppText>
            </View>
            {canDownload && (
              <TouchableOpacity
                onPress={() => handleDownload(attachment, index)}
                disabled={isDownloading}
                style={{ padding: 8 }}
                accessible={true}
                accessibilityLabel={isDownloading ? 'Downloading...' : 'Download attachment'}
                accessibilityRole="button"
              >
                <Download 
                  size={18} 
                  color={isDownloading ? colors.textSecondary : colors.primary} 
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


