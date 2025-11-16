import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, StyleSheet, ScrollView, Keyboard, Platform, useWindowDimensions, KeyboardAvoidingView } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CreateFolderModalProps = {
  visible: boolean;
  folderName: string;
  folderRule: string;
  isCreating: boolean;
  onClose: () => void;
  onFolderNameChange: (text: string) => void;
  onFolderRuleChange: (text: string) => void;
  onCreate: () => void;
};

export function CreateFolderModal({
  visible,
  folderName,
  folderRule,
  isCreating,
  onClose,
  onFolderNameChange,
  onFolderRuleChange,
  onCreate,
}: CreateFolderModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const nameInputRef = React.useRef<TextInput>(null);
  const ruleInputRef = React.useRef<TextInput>(null);
  const { height: windowHeight } = useWindowDimensions();

  // iOS: Lift the bottom sheet while keyboard is visible
  React.useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const onShow = Keyboard.addListener('keyboardWillShow', (e) => {
      const height = e.endCoordinates?.height ?? 0;
      // subtract bottom inset so we don't over-shift
      setKeyboardOffset(Math.max(0, height - (insets.bottom || 0)));
      setKeyboardHeight(height);
    });
    const onHide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardOffset(0);
      setKeyboardHeight(0);
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [insets.bottom]);

  // Ensure a focused field is visible above the keyboard on iOS
  const ensureFieldVisible = (inputRef: React.RefObject<TextInput>) => {
    if (Platform.OS !== 'ios') return;
    requestAnimationFrame(() => {
      const node = inputRef.current;
      if (!node) return;
      (node as any).measureInWindow?.((x: number, y: number, w: number, h: number) => {
        const fieldBottom = y + h;
        const visibleBottom = windowHeight - keyboardHeight - (insets.bottom || 0) - 12; // small margin
        if (fieldBottom > visibleBottom) {
          const delta = fieldBottom - visibleBottom;
          scrollRef.current?.scrollTo({ y: delta, animated: true });
        }
      });
    });
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={() => !isCreating && onClose()}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { paddingBottom: insets.bottom + 16, paddingTop: insets.top + 12, backgroundColor: colors.surface },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Custom Folder</Text>
            <TouchableOpacity onPress={() => !isCreating && onClose()} disabled={isCreating}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            {...(Platform.OS === 'ios' ? { contentInset: { bottom: keyboardHeight } } : {})}
          >
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Create a smart folder using natural language rules
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Folder Name</Text>
              <TextInput
                ref={nameInputRef}
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="e.g., Important Clients"
                placeholderTextColor={colors.textSecondary}
                value={folderName}
                onChangeText={onFolderNameChange}
                editable={!isCreating}
                returnKeyType="next"
                onFocus={() => ensureFieldVisible(nameInputRef)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Folder Rule</Text>
              <TextInput
                ref={ruleInputRef}
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="e.g., Emails from clients about project updates or invoices"
                placeholderTextColor={colors.textSecondary}
                value={folderRule}
                onChangeText={onFolderRuleChange}
                multiline
                numberOfLines={4}
                editable={!isCreating}
                onFocus={() => ensureFieldVisible(ruleInputRef)}
              />
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                Describe the rule in plain English. Our AI will understand it!
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}
                onPress={onClose}
                disabled={isCreating}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={onCreate}
                disabled={isCreating || !folderName.trim() || !folderRule.trim()}
              >
                {isCreating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>Create Folder</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  modalDescription: {
    fontSize: 15,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top' as const,
  },
  helperText: {
    fontSize: 13,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
