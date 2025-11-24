import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { X, Send, Paperclip, Save, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import { AttachmentList } from './compose/AttachmentList';
import { ComposeFormField } from './compose/ComposeFormField';
import { createComposeStyles } from './compose/styles';

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
  const styles = createComposeStyles(colors);

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
        <ComposeFormField
          label="To"
          value={composeTo}
          onChangeText={onChangeComposeTo}
          placeholder="recipient@example.com"
          keyboardType="email-address"
          colors={colors}
        />

        <View style={[styles.composeDivider, { backgroundColor: colors.border }]} />

        <ComposeFormField
          label="Cc"
          value={composeCc}
          onChangeText={onChangeComposeCc}
          placeholder="cc@example.com"
          keyboardType="email-address"
          colors={colors}
        />

        <View style={[styles.composeDivider, { backgroundColor: colors.border }]} />

        <ComposeFormField
          label="Subject"
          value={composeSubject}
          onChangeText={onChangeComposeSubject}
          placeholder="Email subject"
          colors={colors}
        />

        <View style={[styles.composeDivider, { backgroundColor: colors.border }]} />

        <ComposeFormField
          label=""
          value={composeBody}
          onChangeText={onChangeComposeBody}
          placeholder="Compose your message..."
          multiline
          colors={colors}
        />

        <TouchableOpacity 
          style={[styles.attachButton, { borderColor: colors.border }]}
          onPress={handleAttachFile}
        >
          <Paperclip size={20} color={colors.primary} />
          <Text style={[styles.attachButtonText, { color: colors.primary }]}>Attach file</Text>
        </TouchableOpacity>

        <AttachmentList
          attachments={attachments}
          onRemove={handleRemoveAttachment}
          colors={colors}
        />

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

// Styles are now in components/mail/compose/styles.ts
