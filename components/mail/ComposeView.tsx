import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { X, Send, Paperclip, Save, Sparkles } from 'lucide-react-native';
import { z } from 'zod';
import { useTheme } from '@/contexts/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import { AttachmentList } from './compose/AttachmentList';
import { ComposeFormField } from './compose/ComposeFormField';
import { createComposeStyles } from './compose/styles';
import { createScopedLogger } from '@/utils/logger';
import { triggerButtonHaptic, triggerSuccessHaptic } from '@/utils/haptics';
import { useFormValidation } from '@/hooks/useFormValidation';
import { getEmailValidationError } from '@/utils/validation';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

const composeLogger = createScopedLogger('Compose');

// Email validation schema
const emailSchema = z
  .string()
  .refine(
    (email) => {
      if (!email || !email.trim()) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emails = email.split(',').map(e => e.trim()).filter(e => e.length > 0);
      return emails.length > 0 && emails.every(e => emailRegex.test(e));
    },
    { message: 'Invalid email address' }
  );

// Compose form validation schema
const composeSchema = z.object({
  composeTo: emailSchema.min(1, 'Recipient email is required'),
  composeCc: z
    .string()
    .optional()
    .refine(
      (cc) => !cc || !cc.trim() || emailSchema.safeParse(cc).success,
      { message: 'Invalid email address in Cc field' }
    ),
  composeSubject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be 200 characters or less'),
  composeBody: z
    .string()
    .min(1, 'Message body is required')
    .max(50000, 'Message body is too long'),
});

type ComposeFormValues = z.infer<typeof composeSchema>;

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
  const { showWarning, showError } = useEnhancedToast();

  // Form validation hook
  const {
    values: formValues,
    setFieldValue,
    errors,
    validateForm,
    reset,
  } = useFormValidation<ComposeFormValues>(composeSchema, {
    initialValues: {
      composeTo: '',
      composeCc: '',
      composeSubject: '',
      composeBody: '',
    },
    mode: 'onSubmit', // Only validate on submit for compose
  });

  // Sync form values with props - only update if prop value differs from form value
  // Using refs to prevent infinite loops by tracking if we've already synced
  const prevComposeToRef = React.useRef<string>(composeTo);
  const prevComposeCcRef = React.useRef<string>(composeCc);
  const prevComposeSubjectRef = React.useRef<string>(composeSubject);
  const prevComposeBodyRef = React.useRef<string>(composeBody);

  useEffect(() => {
    // Only sync if prop changed (tracked via ref) and form value is different
    // Don't include formValues in dependencies to avoid infinite loops
    if (prevComposeToRef.current !== composeTo) {
      prevComposeToRef.current = composeTo;
      // Check form value inside effect but don't depend on it
      if (formValues.composeTo !== composeTo) {
        setFieldValue('composeTo', composeTo, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeTo]);

  useEffect(() => {
    if (prevComposeCcRef.current !== composeCc) {
      prevComposeCcRef.current = composeCc;
      if (formValues.composeCc !== composeCc) {
        setFieldValue('composeCc', composeCc, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeCc]);

  useEffect(() => {
    if (prevComposeSubjectRef.current !== composeSubject) {
      prevComposeSubjectRef.current = composeSubject;
      if (formValues.composeSubject !== composeSubject) {
        setFieldValue('composeSubject', composeSubject, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeSubject]);

  useEffect(() => {
    if (prevComposeBodyRef.current !== composeBody) {
      prevComposeBodyRef.current = composeBody;
      if (formValues.composeBody !== composeBody) {
        setFieldValue('composeBody', composeBody, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeBody]);

  // Reset form when compose view closes
  useEffect(() => {
    if (!composeTo && !composeCc && !composeSubject && !composeBody) {
      reset();
    }
  }, [composeTo, composeCc, composeSubject, composeBody, reset]);

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
      composeLogger.error('Error picking document', error);
      showError('Failed to pick document. Please try again.');
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
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          accessibilityHint="Double tap to close and discard this message"
          onPress={async () => {
            await triggerButtonHaptic();
            onClose();
          }}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <AppText 
          style={[styles.composeTitle, { color: colors.text }]}
          accessibilityRole="header"
          accessibilityLabel="New Message"
          dynamicTypeStyle="title2"
        >
          New Message
        </AppText>
        <View style={styles.composeHeaderActions}>
          <TouchableOpacity
            testID="save-draft-button"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Save draft"
            accessibilityHint="Double tap to save this message as a draft"
            onPress={async () => {
              await triggerButtonHaptic();
              onSaveDraft();
            }}
            style={styles.headerActionButton}
          >
            <Save size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="send-email-button"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Send email"
            accessibilityHint="Double tap to send this message"
            onPress={async () => {
              // Validate using current prop values (not formValues which might not be synced yet)
              // This is important when replying/forwarding since props are set immediately
              const valuesToValidate: ComposeFormValues = {
                composeTo,
                composeCc,
                composeSubject,
                composeBody,
              };
              
              // Validate the current prop values directly
              try {
                composeSchema.parse(valuesToValidate);
                // Validation passed - sync form values to ensure consistency
                setFieldValue('composeTo', composeTo, false);
                setFieldValue('composeCc', composeCc, false);
                setFieldValue('composeSubject', composeSubject, false);
                setFieldValue('composeBody', composeBody, false);
                
                await triggerSuccessHaptic();
                onSend();
              } catch (error) {
                // Validation failed - sync form values first so errors show correctly
                setFieldValue('composeTo', composeTo, false);
                setFieldValue('composeCc', composeCc, false);
                setFieldValue('composeSubject', composeSubject, false);
                setFieldValue('composeBody', composeBody, false);
                
                // Trigger validation on form to populate error messages
                validateForm();
                await triggerButtonHaptic();
                showWarning('Please check your input and fix any errors before sending.');
                return;
              }
            }}
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
          onChangeText={(text) => {
            onChangeComposeTo(text);
            setFieldValue('composeTo', text);
          }}
          placeholder="recipient@example.com"
          keyboardType="email-address"
          colors={colors}
          error={!!errors.composeTo}
          errorMessage={errors.composeTo || (composeTo ? getEmailValidationError(composeTo, 'Recipient email') : undefined)}
        />

        <View style={[styles.composeDivider, { backgroundColor: colors.border }]} />

        <ComposeFormField
          label="Cc"
          value={composeCc}
          onChangeText={(text) => {
            onChangeComposeCc(text);
            setFieldValue('composeCc', text);
          }}
          placeholder="cc@example.com"
          keyboardType="email-address"
          colors={colors}
          error={!!errors.composeCc}
          errorMessage={errors.composeCc || (composeCc ? getEmailValidationError(composeCc, 'Cc email') : undefined)}
        />

        <View style={[styles.composeDivider, { backgroundColor: colors.border }]} />

        <ComposeFormField
          label="Subject"
          value={composeSubject}
          onChangeText={(text) => {
            onChangeComposeSubject(text);
            setFieldValue('composeSubject', text);
          }}
          placeholder="Email subject"
          colors={colors}
          error={!!errors.composeSubject}
          errorMessage={errors.composeSubject}
        />

        <View style={[styles.composeDivider, { backgroundColor: colors.border }]} />

        <ComposeFormField
          label=""
          value={composeBody}
          onChangeText={(text) => {
            onChangeComposeBody(text);
            setFieldValue('composeBody', text);
          }}
          placeholder="Compose your message..."
          multiline
          colors={colors}
          error={!!errors.composeBody}
          errorMessage={errors.composeBody}
        />

        <TouchableOpacity 
          style={[styles.attachButton, { borderColor: colors.border }]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Attach file"
          accessibilityHint="Double tap to attach a file to this message"
          onPress={async () => {
            await triggerButtonHaptic();
            handleAttachFile();
          }}
        >
          <Paperclip size={20} color={colors.primary} />
          <AppText style={[styles.attachButtonText, { color: colors.primary }]} dynamicTypeStyle="body">Attach file</AppText>
        </TouchableOpacity>

        <AttachmentList
          attachments={attachments}
          onRemove={handleRemoveAttachment}
          colors={colors}
        />

        <TouchableOpacity 
          style={[styles.aiButton, { borderColor: colors.border }]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Write with AI"
          accessibilityHint="Double tap to get AI assistance with writing this message"
          onPress={async () => {
            await triggerButtonHaptic();
            onOpenAIModal();
          }}
        >
          <Sparkles size={20} color={colors.primary} />
          <AppText style={[styles.aiButtonText, { color: colors.primary }]} dynamicTypeStyle="body">Write with AI</AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Styles are now in components/mail/compose/styles.ts
