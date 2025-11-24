import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccessibleButton } from '@/components/common/AccessibleButton';
import { AccessibleTextInput } from '@/components/common/AccessibleTextInput';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { ValidationError } from '@/utils/errorHandling';

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
  const [error, setError] = React.useState<ValidationError | null>(null);
  const nameInputRef = React.useRef<any>(null);
  const ruleInputRef = React.useRef<any>(null);

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
      setError(null);
    }
  }, [visible]);

  // Clear error when user starts typing
  React.useEffect(() => {
    if (folderName.trim() && folderRule.trim() && error) {
      setError(null);
    }
  }, [folderName, folderRule, error]);

  const handleCreate = () => {
    if (!folderName.trim()) {
      setError(new ValidationError('Folder name is required', 'folderName'));
      nameInputRef.current?.focus();
      return;
    }
    if (!folderRule.trim()) {
      setError(new ValidationError('Folder rule is required', 'folderRule'));
      ruleInputRef.current?.focus();
      return;
    }
    setError(null);
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
            <Text 
              style={[styles.modalTitle, { color: colors.text }]}
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel="Create Custom Folder"
            >
              Create Custom Folder
            </Text>
            <AccessibleButton
              accessibilityLabel="Close modal"
              accessibilityHint="Closes the create folder dialog"
              onPress={onClose}
              disabled={isCreating}
            >
              <X size={24} color={colors.text} />
            </AccessibleButton>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            scrollEnabled={false}
          >
            <Text 
              style={[styles.modalDescription, { color: colors.textSecondary }]}
              accessible={true}
              accessibilityRole="text"
            >
              Create a smart folder using natural language rules
            </Text>

          <AccessibleTextInput
            ref={nameInputRef}
            accessibilityLabel="Folder name"
            accessibilityHint="Enter a name for your new folder, for example Important Clients"
            placeholder="e.g., Important Clients"
            value={folderName}
            onChangeText={onFolderNameChange}
            editable={!isCreating}
            returnKeyType="next"
            onSubmitEditing={() => ruleInputRef.current?.focus()}
            error={error?.field === 'folderName'}
            errorMessage={error?.field === 'folderName' ? error.message : undefined}
            label="Folder Name"
          />

          <AccessibleTextInput
            ref={ruleInputRef}
            accessibilityLabel="Folder rule"
            accessibilityHint="Describe the rule in plain English. Our AI will understand it. For example, emails from clients about project updates or invoices"
            placeholder="e.g., Emails from clients about project updates or invoices"
            value={folderRule}
            onChangeText={onFolderRuleChange}
            multiline
            numberOfLines={4}
            editable={!isCreating}
            error={error?.field === 'folderRule'}
            errorMessage={error?.field === 'folderRule' ? error.message : undefined}
            label="Folder Rule"
            style={styles.textArea}
          />
          <Text 
            style={[styles.helperText, { color: colors.textSecondary }]}
            accessible={true}
            accessibilityRole="text"
          >
            Describe the rule in plain English. Our AI will understand it!
          </Text>

            {error && error.field === undefined && (
              <ErrorDisplay
                error={error}
                variant="inline"
                onDismiss={() => setError(null)}
              />
            )}

          <View style={styles.modalActions}>
            <AccessibleButton
              accessibilityLabel="Cancel"
              accessibilityHint="Closes the create folder dialog without saving"
              onPress={onClose}
              disabled={isCreating}
              style={[styles.modalButton, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </AccessibleButton>
            <AccessibleButton
              accessibilityLabel="Create folder"
              accessibilityHint="Creates the folder with the specified name and rule"
              onPress={handleCreate}
              disabled={isCreating}
              loading={isCreating}
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.createButtonText}>Create Folder</Text>
            </AccessibleButton>
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
