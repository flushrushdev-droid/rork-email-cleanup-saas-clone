import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Plus, X, Trash2, Calendar, FileText } from 'lucide-react-native';

import Colors from '@/constants/colors';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  linkedEmailId?: string;
  linkedEmailSubject?: string;
  dueDate?: string;
}

const demoNotes: Note[] = [
  {
    id: '1',
    title: 'Follow up with client',
    content: 'Remember to send the proposal by Friday. Include pricing for Premium and Enterprise tiers.',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
    linkedEmailId: 'email1',
    linkedEmailSubject: 'Re: Project Discussion',
    dueDate: '2025-01-15T00:00:00Z',
  },
  {
    id: '2',
    title: 'Meeting notes',
    content: 'Key points from team sync:\n- Q1 goals finalized\n- New features approved\n- Budget review next week',
    createdAt: '2025-01-09T14:30:00Z',
    updatedAt: '2025-01-09T14:30:00Z',
    dueDate: '2025-01-12T00:00:00Z',
  },
  {
    id: '3',
    title: 'Important contacts',
    content: 'John Doe - john@example.com - Product Manager\nJane Smith - jane@example.com - Design Lead',
    createdAt: '2025-01-08T09:15:00Z',
    updatedAt: '2025-01-08T09:15:00Z',
  },
  {
    id: '4',
    title: 'Action items',
    content: '1. Review quarterly report\n2. Schedule dentist appointment\n3. Update project documentation\n4. Plan team building event',
    createdAt: '2025-01-07T16:45:00Z',
    updatedAt: '2025-01-10T11:20:00Z',
    dueDate: '2025-01-14T00:00:00Z',
  },
  {
    id: '5',
    title: 'Email templates',
    content: 'Out of office: "Thank you for your email. I will be out of the office until [date] with limited access to email."',
    createdAt: '2025-01-05T13:00:00Z',
    updatedAt: '2025-01-05T13:00:00Z',
  },
  {
    id: '6',
    title: 'Q1 Planning',
    content: 'Review objectives and key results for next quarter',
    createdAt: '2025-01-11T09:00:00Z',
    updatedAt: '2025-01-11T09:00:00Z',
    dueDate: '2025-01-20T00:00:00Z',
  },
  {
    id: '7',
    title: 'Team Retrospective',
    content: 'Gather feedback and discuss improvements',
    createdAt: '2025-01-13T15:30:00Z',
    updatedAt: '2025-01-13T15:30:00Z',
    dueDate: '2025-01-13T00:00:00Z',
  },
];

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>(demoNotes);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };



  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setDueDate(undefined);
    setModalVisible(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setDueDate(note.dueDate);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (editingNote) {
      setNotes(
        notes.map((note) =>
          note.id === editingNote.id
            ? { ...note, title, content, dueDate, updatedAt: new Date().toISOString() }
            : note
        )
      );
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
    }

    setModalVisible(false);
    setTitle('');
    setContent('');
    setDueDate(undefined);
  };

  const handleDelete = (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setNotes(notes.filter((note) => note.id !== noteId));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notes',
          headerStyle: { backgroundColor: Colors.light.surface },
          headerTintColor: Colors.light.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={openCreateModal}
              testID="add-note-button"
            >
              <Plus size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color={Colors.light.textSecondary} />
            <Text style={styles.emptyTitle}>No Notes Yet</Text>
            <Text style={styles.emptyDescription}>
              Tap the + button to create your first note
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={styles.noteCard}
              onPress={() => openEditModal(note)}
              activeOpacity={0.7}
              testID={`note-${note.id}`}
            >
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {note.title}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDelete(note.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  testID={`delete-note-${note.id}`}
                >
                  <Trash2 size={18} color={Colors.light.danger} />
                </TouchableOpacity>
              </View>

              <Text style={styles.noteContent} numberOfLines={3}>
                {note.content}
              </Text>

              <View style={styles.noteFooter}>
                <View style={styles.dateContainer}>
                  <Calendar size={14} color={Colors.light.textSecondary} />
                  <Text style={styles.noteDate}>
                    {note.dueDate ? formatDate(note.dueDate) : formatDate(note.updatedAt)}
                  </Text>
                </View>
                {note.linkedEmailSubject && (
                  <Text style={styles.linkedEmail} numberOfLines={1}>
                    {note.linkedEmailSubject}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingNote ? 'Edit Note' : 'New Note'}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={styles.titleInput}
                placeholder="Note title"
                placeholderTextColor={Colors.light.textSecondary}
                value={title}
                onChangeText={setTitle}
                autoFocus
                testID="note-title-input"
              />

              <TextInput
                style={styles.contentInput}
                placeholder="Write your note here..."
                placeholderTextColor={Colors.light.textSecondary}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                testID="note-content-input"
              />

              <View style={styles.dueDateSection}>
                <Text style={styles.dueDateLabel}>Due Date (Optional)</Text>
                <TouchableOpacity
                  style={styles.dueDateButton}
                  onPress={() => {
                    const today = new Date().toISOString().split('T')[0];
                    Alert.prompt(
                      'Set Due Date',
                      'Enter date (YYYY-MM-DD)',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Clear',
                          onPress: () => setDueDate(undefined),
                        },
                        {
                          text: 'Set',
                          onPress: (text?: string) => {
                            if (text) {
                              setDueDate(new Date(text).toISOString());
                            }
                          },
                        },
                      ],
                      'plain-text',
                      dueDate ? new Date(dueDate).toISOString().split('T')[0] : today
                    );
                  }}
                >
                  <Calendar size={16} color={Colors.light.primary} />
                  <Text style={styles.dueDateButtonText}>
                    {dueDate
                      ? new Date(dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Set Due Date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerButton: {
    marginRight: 16,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  noteCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
    marginRight: 12,
  },
  noteContent: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  linkedEmail: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 20,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 16,
    color: Colors.light.text,
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    minHeight: 200,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.background,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  dueDateSection: {
    marginTop: 12,
  },
  dueDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  dueDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
  },
  dueDateButtonText: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
