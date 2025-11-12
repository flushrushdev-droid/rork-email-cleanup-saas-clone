import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { X, Send, Paperclip, Save, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';

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
  return (
    <View style={styles.container}>
      <View style={[styles.composeHeader, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          testID="cancel-compose"
          onPress={onClose}
        >
          <X size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.composeTitle}>New Message</Text>
        <View style={styles.composeHeaderActions}>
          <TouchableOpacity
            testID="save-draft-button"
            onPress={onSaveDraft}
            style={styles.headerActionButton}
          >
            <Save size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="send-email-button"
            onPress={onSend}
            style={styles.headerActionButton}
          >
            <Send size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.composeForm} keyboardShouldPersistTaps="handled">
        <View style={styles.composeField}>
          <Text style={styles.composeLabel}>To</Text>
          <TextInput
            style={styles.composeInput}
            placeholder="recipient@example.com"
            value={composeTo}
            onChangeText={onChangeComposeTo}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.composeDivider} />

        <View style={styles.composeField}>
          <Text style={styles.composeLabel}>Cc</Text>
          <TextInput
            style={styles.composeInput}
            placeholder="cc@example.com"
            value={composeCc}
            onChangeText={onChangeComposeCc}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.composeDivider} />

        <View style={styles.composeField}>
          <Text style={styles.composeLabel}>Subject</Text>
          <TextInput
            style={styles.composeInput}
            placeholder="Email subject"
            value={composeSubject}
            onChangeText={onChangeComposeSubject}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.composeDivider} />

        <View style={[styles.composeField, styles.composeBodyField]}>
          <TextInput
            style={[styles.composeInput, styles.composeBodyInput]}
            placeholder="Compose your message..."
            value={composeBody}
            onChangeText={onChangeComposeBody}
            multiline
            textAlignVertical="top"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <TouchableOpacity style={styles.attachButton}>
          <Paperclip size={20} color={Colors.light.primary} />
          <Text style={styles.attachButtonText}>Attach file</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.aiButton}
          onPress={onOpenAIModal}
        >
          <Sparkles size={20} color={Colors.light.primary} />
          <Text style={styles.aiButtonText}>Write with AI</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  composeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  composeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
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
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  composeInput: {
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
  },
  composeBodyInput: {
    flex: 1,
    paddingTop: 0,
  },
  composeDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
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
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  attachButtonText: {
    fontSize: 15,
    color: Colors.light.primary,
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
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  aiButtonText: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
