import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, StyleSheet, ScrollView, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { X } from 'lucide-react-native';
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
  // Some environments (e.g., certain web previews) may not provide KeyboardAvoidingView at runtime.
  // Fall back to a regular View while keeping manual keyboard translation logic.
  // Using typeof avoids ReferenceError when the symbol isn't defined.
  // @ts-ignore
  const Container: any = typeof KeyboardAvoidingView !== 'undefined' ? KeyboardAvoidingView : View;
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);
  const [showError, setShowError] = React.useState(false);
  const nameInputRef = React.useRef<TextInput>(null);
  const ruleInputRef = React.useRef<TextInput>(null);

  // iOS: Lift the bottom sheet while keyboard is visible
  React.useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const onShow = Keyboard.addListener('keyboardWillShow', (e) => {
      const height = e.endCoordinates?.height ?? 0;
      // subtract bottom inset so we don't over-shift
      setKeyboardOffset(Math.max(0, height - (insets.bottom || 0)));
    });
    const onHide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardOffset(0);
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [insets.bottom]);

  // Clear error when modal opens/closes
  React.useEffect(() => {
    if (!visible) {
      setShowError(false);
    }
  }, [visible]);

  // Clear error when user starts typing
  React.useEffect(() => {
    if (folderName.trim() && folderRule.trim() && showError) {
      setShowError(false);
    }
  }, [folderName, folderRule, showError]);

  const handleCreate = () => {
    if (!folderName.trim() || !folderRule.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onCreate();
  };

  // No programmatic scrolling; we rely on KeyboardAvoidingView to lift content.
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={() => !isCreating && onClose()}
    >
      <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { paddingBottom: insets.bottom + 16, paddingTop: insets.top + 12, backgroundColor: colors.surface },
            Platform.OS === 'ios' && (Container === View) ? { transform: [{ translateY: -keyboardOffset }] } : null,
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Custom Folder</Text>
            <TouchableOpacity onPress={() => !isCreating && onClose()} disabled={isCreating}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            scrollEnabled={false}
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
            />
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Describe the rule in plain English. Our AI will understand it!
            </Text>
          </View>

            {showError && (
              <Text style={[styles.errorText, { color: colors.danger || '#EF4444' }]}>
                Please Fill In All The Details
              </Text>
            )}

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
                onPress={handleCreate}
                disabled={isCreating}
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
      </Container>
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
  errorText: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
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
