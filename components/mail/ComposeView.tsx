import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { X, Send, Paperclip, Save, Sparkles, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';

interface ComposeViewProps {
  insets: { top: number; bottom: number };
  composeTo: string;
  composeCc: string;
  composeSubject: string;
  composeBody: string;
  onChangeComposeTo: (value: string) => void;
  onChangeComposeCc: (value: string) => void;
  onChangeComposeSubject: (value: string) => void;
  onChangeComposeBody: (value: string) => void;
  onClose: () => void;
  onSend: () => void;
  onSaveDraft: () => void;
  onOpenAIModal: () => void;
}

interface Attachment {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number | null;
}

export function ComposeView({
  insets,
  composeTo,
  composeCc,
  composeSubject,
  composeBody,
  onChangeComposeTo,
  onChangeComposeCc,
  onChangeComposeSubject,
  onChangeComposeBody,
  onClose,
  onSend,
  onSaveDraft,
  onOpenAIModal,
}: ComposeViewProps) {
  const { colors } = useTheme();
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name || 'Unknown file',
          mimeType: asset.mimeType || null,
          size: asset.size || null,
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.composeHeader, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          testID="cancel-compose"
          onPress={onClose}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.composeTitle, { color: colors.text }]}>New Message</Text>
        <View style={styles.composeHeaderActions}>
          <TouchableOpacity
            testID="save-draft-button"
            onPress={onSaveDraft}
            style={styles.headerActionButton}
          >
            <Save size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="send-email-button"
            onPress={onSend}
            style={styles.headerActionButton}
          >
            <Send size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.composeForm} keyboardShouldPersistTaps="handled">
        <View style={styles.composeField}>
          <Text style={[styles.composeLabel, { color: colors.textSecondary }]}>To</Text>
          <TextInput
            style={[styles.composeInput, { color: colors.text }]}
            placeholder="recipient@example.com"
            value={composeTo}
            onChangeText={onChangeComposeTo}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={[styles.composeDivider, { backgroundColor: colors.border }]} />

        <View style={styles.composeField}>
          <Text style={[styles.composeLabel, { color: colors.textSecondary }]}>Cc</Text>
          <TextInput
            style={[styles.composeInput, { color: colors.text }]}
            placeholder="cc@example.com"
            value={composeCc}
            onChangeText={onChangeComposeCc}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={[styles.composeDivider, { backgroundColor: colors.border }]} />

        <View style={styles.composeField}>
          <Text style={[styles.composeLabel, { color: colors.textSecondary }]}>Subject</Text>
          <TextInput
            style={[styles.composeInput, { color: colors.text }]}
            placeholder="Email subject"
            value={composeSubject}
            onChangeText={onChangeComposeSubject}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={[styles.composeDivider, { backgroundColor: colors.border }]} />

        <View style={[styles.composeField, styles.composeBodyField]}>
          <TextInput
            style={[styles.composeInput, styles.composeBodyInput, { color: colors.text }]}
            placeholder="Compose your message..."
            value={composeBody}
            onChangeText={onChangeComposeBody}
            multiline
            textAlignVertical="top"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <TouchableOpacity 
          style={[styles.attachButton, { borderColor: colors.border }]}
          onPress={handleAttachFile}
        >
          <Paperclip size={20} color={colors.primary} />
          <Text style={[styles.attachButtonText, { color: colors.primary }]}>Attach file</Text>
        </TouchableOpacity>

        {attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {attachments.map((attachment, index) => (
              <View 
                key={index} 
                style={[styles.attachmentItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.attachmentInfo}>
                  <Paperclip size={16} color={colors.primary} />
                  <View style={styles.attachmentDetails}>
                    <Text 
                      style={[styles.attachmentName, { color: colors.text }]} 
                      numberOfLines={1}
                    >
                      {attachment.name}
                    </Text>
                    <Text style={[styles.attachmentSize, { color: colors.textSecondary }]}>
                      {formatFileSize(attachment.size)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveAttachment(index)}
                  style={styles.removeAttachmentButton}
                >
                  <Trash2 size={16} color={colors.error || '#EF4444'} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={[styles.aiButton, { borderColor: colors.border }]}
          onPress={onOpenAIModal}
        >
          <Sparkles size={20} color={colors.primary} />
          <Text style={[styles.aiButtonText, { color: colors.primary }]}>Write with AI</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  composeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  composeTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  composeHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerActionButton: {
    padding: 4,
  },
  composeForm: {
    flex: 1,
  },
  composeField: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  composeBodyField: {
    flex: 1,
    minHeight: 200,
  },
  composeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  composeInput: {
    fontSize: 16,
    paddingVertical: 0,
  },
  composeBodyInput: {
    flex: 1,
    paddingTop: 0,
  },
  composeDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  attachButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  aiButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  attachmentsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  attachmentDetails: {
    flex: 1,
    gap: 2,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentSize: {
    fontSize: 12,
  },
  removeAttachmentButton: {
    padding: 4,
    marginLeft: 8,
  },
});
