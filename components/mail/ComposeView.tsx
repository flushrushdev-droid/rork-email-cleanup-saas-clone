import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { X, Send, Paperclip, Save, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

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

        <TouchableOpacity style={[styles.attachButton, { borderColor: colors.border }]}>
          <Paperclip size={20} color={colors.primary} />
          <Text style={[styles.attachButtonText, { color: colors.primary }]}>Attach file</Text>
        </TouchableOpacity>

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
});
