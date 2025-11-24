import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNotesStyles } from '@/styles/app/notes';
import type { Note } from '@/hooks/useNotes';

interface NoteEditorModalProps {
  visible: boolean;
  editingNote: Note | null;
  title: string;
  content: string;
  dueDate: Date | null;
  onClose: () => void;
  onSave: () => void;
  onTitleChange: (text: string) => void;
  onContentChange: (text: string) => void;
  onDueDatePress: () => void;
  colors: any;
  insets: any;
}

export function NoteEditorModal({
  visible,
  editingNote,
  title,
  content,
  dueDate,
  onClose,
  onSave,
  onTitleChange,
  onContentChange,
  onDueDatePress,
  colors,
  insets,
}: NoteEditorModalProps) {
  const styles = React.useMemo(() => createNotesStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingNote ? 'Edit Note' : 'New Note'}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              style={[styles.titleInput, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Note title"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={onTitleChange}
              autoFocus
              testID="note-title-input"
            />

            <TextInput
              style={[styles.contentInput, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Write your note here..."
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={onContentChange}
              multiline
              textAlignVertical="top"
              testID="note-content-input"
            />

            <View style={styles.dueDateSection}>
              <Text style={[styles.dueDateLabel, { color: colors.text }]}>Due Date (Optional)</Text>
              <TouchableOpacity
                style={[styles.dueDateButton, { backgroundColor: colors.background }]}
                onPress={onDueDatePress}
              >
                <Calendar size={16} color={colors.primary} />
                <Text style={[styles.dueDateButtonText, { color: colors.primary }]}>
                  {dueDate
                    ? new Date(dueDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Set Due Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={onSave}
              testID="save-note-button"
            >
              <Text style={styles.saveButtonText}>
                {editingNote ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

