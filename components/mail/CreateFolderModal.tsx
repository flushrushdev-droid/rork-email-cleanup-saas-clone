import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, StyleSheet, ScrollView, Keyboard, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { KeyboardAvoid } from '@/components/common/KeyboardAvoid';
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
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);

  // iOS: Lift the bottom sheet while keyboard is visible
  React.useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const onShow = Keyboard.addListener('keyboardWillShow', (e) => {
      const height = e.endCoordinates?.height ?? 0;
      // subtract bottom inset so we don't over-shift
      setKeyboardOffset(Math.max(0, height - (insets.bottom || 0)));
    });
    const onHide = Keyboard.addListener('keyboardWillHide', () => setKeyboardOffset(0));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [insets.bottom]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={() => !isCreating && onClose()}
    >
      <KeyboardAvoid>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, Platform.OS === 'ios' ? { transform: [{ translateY: -keyboardOffset }] } : null]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Folder</Text>
              <TouchableOpacity onPress={() => !isCreating && onClose()} disabled={isCreating}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            >
              <Text style={styles.modalDescription}>
                Create a smart folder using natural language rules
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Folder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Important Clients"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={folderName}
                  onChangeText={onFolderNameChange}
                  editable={!isCreating}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Folder Rule</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g., Emails from clients about project updates or invoices"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={folderRule}
                  onChangeText={onFolderRuleChange}
                  multiline
                  numberOfLines={4}
                  editable={!isCreating}
                />
                <Text style={styles.helperText}>
                  Describe the rule in plain English. Our AI will understand it!
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                  disabled={isCreating}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
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
        </View>
      </KeyboardAvoid>
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
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
  },
  modalDescription: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top' as const,
  },
  helperText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
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
  cancelButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  createButton: {
    backgroundColor: Colors.light.primary,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
