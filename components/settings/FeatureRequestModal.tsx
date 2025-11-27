import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { createSettingsStyles } from '@/styles/app/settings';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

interface FeatureRequestModalProps {
  visible: boolean;
  title: string;
  description: string;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  colors: any;
}

export function FeatureRequestModal({
  visible,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onClose,
  onSubmit,
  colors,
}: FeatureRequestModalProps) {
  const styles = createSettingsStyles(colors);
  const { showWarning } = useEnhancedToast();

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      showWarning('Please provide both a title and description for your feature request.');
      return;
    }
    onSubmit();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Feature Request</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Brief title for your feature request"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={onTitleChange}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Describe your feature idea in detail..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={onDescriptionChange}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

