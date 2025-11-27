import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { X } from 'lucide-react-native';
import { z } from 'zod';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccessibleButton } from '@/components/common/AccessibleButton';
import { AccessibleTextInput } from '@/components/common/AccessibleTextInput';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { AnimatedModal } from '@/components/common/AnimatedModal';
import { ValidationError } from '@/utils/errorHandling';
import { useFormValidation } from '@/hooks/useFormValidation';

// Validation schema for folder creation
const folderSchema = z.object({
  folderName: z
    .string()
    .min(1, 'Folder name is required')
    .max(50, 'Folder name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Folder name can only contain letters, numbers, spaces, hyphens, and underscores'),
  folderRule: z
    .string()
    .min(10, 'Please provide a more detailed rule (at least 10 characters)')
    .max(500, 'Folder rule must be 500 characters or less'),
});

type FolderFormValues = z.infer<typeof folderSchema>;

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
  const nameInputRef = React.useRef<any>(null);
  const ruleInputRef = React.useRef<any>(null);

  // Form validation hook
  const {
    values,
    setFieldValue,
    setValues: setFormValues,
    errors,
    formError,
    setFormError,
    validateForm,
    reset,
  } = useFormValidation<FolderFormValues>(folderSchema, {
    initialValues: {
      folderName: '',
      folderRule: '',
    },
    mode: 'onChange',
  });

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

  // Track if modal was just opened to initialize values
  const isInitialMount = React.useRef(true);
  const prevVisible = React.useRef(visible);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!visible && prevVisible.current) {
      // Modal just closed
      reset();
      setFormError(null);
      isInitialMount.current = true;
    }
    prevVisible.current = visible;
  }, [visible, reset]);

  // Initialize form values from props when modal opens (only once)
  React.useEffect(() => {
    if (visible && isInitialMount.current) {
      // Use setValues to set multiple values at once without triggering validation
      setFormValues({
        folderName: folderName || '',
        folderRule: folderRule || '',
      });
      isInitialMount.current = false;
    }
  }, [visible, setFormValues]); // Only depend on visible to avoid loops

  const handleCreate = () => {
    if (!validateForm()) {
      // Focus on first error field
      if (errors.folderName) {
        nameInputRef.current?.focus();
      } else if (errors.folderRule) {
        ruleInputRef.current?.focus();
      }
      return;
    }
    
    setFormError(null);
    onCreate();
  };

  // No programmatic scrolling; we rely on KeyboardAvoidingView to lift content.
  return (
    <AnimatedModal
      visible={visible}
      onClose={() => !isCreating && onClose()}
      animationType="slide"
      position="bottom"
      presentationStyle="overFullScreen"
      onBackdropPress={!isCreating}
    >
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
            value={values.folderName}
            onChangeText={(text) => {
              setFieldValue('folderName', text);
              onFolderNameChange(text); // Update parent directly
            }}
            editable={!isCreating}
            returnKeyType="next"
            onSubmitEditing={() => ruleInputRef.current?.focus()}
            error={!!errors.folderName}
            errorMessage={errors.folderName}
            label="Folder Name"
          />

          <AccessibleTextInput
            ref={ruleInputRef}
            accessibilityLabel="Folder rule"
            accessibilityHint="Describe the rule in plain English. Our AI will understand it. For example, emails from clients about project updates or invoices"
            placeholder="e.g., Emails from clients about project updates or invoices"
            value={values.folderRule}
            onChangeText={(text) => {
              setFieldValue('folderRule', text);
              onFolderRuleChange(text); // Update parent directly
            }}
            multiline
            numberOfLines={4}
            editable={!isCreating}
            error={!!errors.folderRule}
            errorMessage={errors.folderRule}
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

            {formError && !errors.folderName && !errors.folderRule && (
              <ErrorDisplay
                error={new ValidationError(formError)}
                variant="inline"
                onDismiss={() => setFormError(null)}
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
    </AnimatedModal>
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
