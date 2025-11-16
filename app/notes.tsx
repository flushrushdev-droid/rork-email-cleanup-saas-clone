import React, { useEffect, useState } from 'react';
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
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalendarStore } from '@/contexts/CalendarContext';
import type { CalendarEvent } from '@/hooks/useCalendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, Trash2, Calendar, FileText } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';

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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { addEvent } = useCalendarStore();
  const params = useLocalSearchParams<{ editNoteId?: string; prefillTitle?: string; prefillContent?: string }>();
  const [notes, setNotes] = useState<Note[]>(demoNotes);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  // Due date/time pickers
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);
  const [tmpYear, setTmpYear] = useState<number>(new Date().getFullYear());
  const [tmpMonth, setTmpMonth] = useState<number>(new Date().getMonth() + 1); // 1-based
  const [tmpDay, setTmpDay] = useState<number>(new Date().getDate());
  const [tmpHour12, setTmpHour12] = useState<string>('12');
  const [tmpMinute, setTmpMinute] = useState<string>('00');
  const [tmpAMPM, setTmpAMPM] = useState<'AM' | 'PM'>('PM');
  const MINUTE_STEP = 15;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    // Signed day difference (positive for future dates)
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((date.setHours(0,0,0,0) - now.setHours(0,0,0,0)) / msPerDay);

    const showYear = new Date(dateString).getFullYear() !== new Date().getFullYear();
    const concrete = new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: showYear ? 'numeric' : undefined,
    });

    if (diffDays === 0) return `Today • ${concrete}`;
    if (diffDays === 1) return `Tomorrow • ${concrete}`;
    if (diffDays === -1) return `Yesterday • ${concrete}`;
    if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days • ${concrete}`;
    if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago • ${concrete}`;

    // Fallback to concrete date
    return concrete;
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

  // Handle deep link edits from calendar (note-sourced events)
  React.useEffect(() => {
    if (params?.editNoteId || params?.prefillTitle || params?.prefillContent) {
      const existing = notes.find(n => n.id === params.editNoteId);
      if (existing) {
        openEditModal(existing);
      } else {
        setEditingNote(null);
        setTitle(params.prefillTitle ?? '');
        setContent(params.prefillContent ?? '');
        setDueDate(undefined);
        setModalVisible(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.editNoteId, params?.prefillTitle, params?.prefillContent]);

  // Persist notes so navigation away/back retains changes
  const NOTES_KEY = 'notes-storage-v1';
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTES_KEY);
        if (raw) {
          const parsed: Note[] = JSON.parse(raw);
          // Normalize dates if needed (strings are fine as we format with new Date())
          setNotes(parsed);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      } catch {}
    })();
  }, [notes]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    let createdNoteId: string | undefined;

    if (editingNote) {
      setNotes(prev =>
        prev.map((note) =>
          note.id === editingNote.id
            ? { ...note, title, content, dueDate, updatedAt: new Date().toISOString() }
            : note
        )
      );
    } else {
      createdNoteId = Date.now().toString();
      const newNote: Note = {
        id: createdNoteId,
        title,
        content,
        dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes(prev => [newNote, ...prev]);
    }

    // Link to Calendar if dueDate is set
    if (dueDate) {
      const start = new Date(dueDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // default 60 mins
      const event: CalendarEvent = {
        id: `note-${Date.now().toString()}`,
        title: title || 'Note',
        date: new Date(start),
        time: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        startTime: start,
        endTime: end,
        location: '',
        description: content,
        type: 'in-person',
        color: '#7C3AED',
        source: 'note',
        noteId: editingNote?.id ?? createdNoteId,
      };
      try {
        addEvent(event);
      } catch {}
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Notes',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.addNoteButton, { backgroundColor: colors.surface, borderColor: colors.primary + '30' }]}
          onPress={openCreateModal}
          activeOpacity={0.7}
          testID="add-note-button"
        >
          <Text style={[styles.addNoteText, { color: colors.primary }]}>Create New Note</Text>
        </TouchableOpacity>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notes Yet</Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Tap the + button to create your first note
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={[styles.noteCard, { backgroundColor: colors.surface }]}
              onPress={() => openEditModal(note)}
              activeOpacity={0.7}
              testID={`note-${note.id}`}
            >
              <View style={styles.noteHeader}>
                <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
                  {note.title}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDelete(note.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  testID={`delete-note-${note.id}`}
                >
                  <Trash2 size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={3}>
                {note.content}
              </Text>

              <View style={styles.noteFooter}>
                <View style={styles.dateContainer}>
                  <Calendar size={14} color={colors.textSecondary} />
                  <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                    {note.dueDate ? formatDate(note.dueDate) : formatDate(note.updatedAt)}
                  </Text>
                </View>
                {note.linkedEmailSubject && (
                  <Text style={[styles.linkedEmail, { color: colors.primary }]} numberOfLines={1}>
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
          <View style={[styles.modalContent, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{editingNote ? 'Edit Note' : 'New Note'}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
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
                onChangeText={setTitle}
                autoFocus
                testID="note-title-input"
              />

              <TextInput
                style={[styles.contentInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Write your note here..."
                placeholderTextColor={colors.textSecondary}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                testID="note-content-input"
              />

              <View style={styles.dueDateSection}>
                <Text style={[styles.dueDateLabel, { color: colors.text }]}>Due Date (Optional)</Text>
                <TouchableOpacity
                  style={[styles.dueDateButton, { backgroundColor: colors.background }]}
                  onPress={() => {
                    const base = dueDate ? new Date(dueDate) : new Date();
                    const roundedMin = Math.round(base.getMinutes() / MINUTE_STEP) * MINUTE_STEP;
                    setTmpYear(base.getFullYear());
                    setTmpMonth(base.getMonth() + 1);
                    setTmpDay(base.getDate());
                    setTmpHour12(((base.getHours() % 12) || 12).toString());
                    setTmpMinute((roundedMin % 60).toString().padStart(2, '0'));
                    setTmpAMPM(base.getHours() >= 12 ? 'PM' : 'AM');
                    setShowDueDatePicker(true);
                  }}
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
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
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

      {/* Due Date Picker - Grid */}
      <Modal visible={showDueDatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Due Date</Text>
            {/* Month header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 }}>
              <TouchableOpacity onPress={() => {
                let m = tmpMonth - 1; let y = tmpYear;
                if (m <= 0) { m = 12; y -= 1; }
                setTmpMonth(m); setTmpYear(y);
              }} style={styles.navButton}>
                <Calendar size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.monthText, { color: colors.text }]}>
                {new Date(tmpYear, tmpMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => {
                let m = tmpMonth + 1; let y = tmpYear;
                if (m > 12) { m = 1; y += 1; }
                setTmpMonth(m); setTmpYear(y);
              }} style={styles.navButton}>
                <Calendar size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
            {/* Day names */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, marginBottom: 6 }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <Text key={`${d}-${i}`} style={{ width: 36, textAlign: 'center', color: colors.textSecondary }}>{d}</Text>
              ))}
            </View>
            {/* Grid */}
            <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
              {(() => {
                const first = new Date(tmpYear, tmpMonth - 1, 1);
                const last = new Date(tmpYear, tmpMonth, 0);
                const startPad = first.getDay();
                const total = startPad + last.getDate();
                const days = Array.from({ length: Math.ceil(total / 7) * 7 }, (_, i) => i - startPad + 1);
                const rows = []; for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
                return rows.map((row, rIdx) => (
                  <View key={rIdx} style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 }}>
                    {row.map((d, cIdx) => {
                      const valid = d > 0 && d <= last.getDate();
                      const selected = valid && d === tmpDay;
                      return (
                        <TouchableOpacity
                          key={`${rIdx}-${cIdx}`}
                          disabled={!valid}
                          onPress={() => setTmpDay(d)}
                          style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
                            selected && { backgroundColor: colors.primary + '33' },
                            !valid && { opacity: 0 }]}
                        >
                          {valid && <Text style={{ color: selected ? colors.primary : colors.text }}>{d}</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ));
              })()}
            </View>
            <View style={styles.pickerButtons}>
              <TouchableOpacity onPress={() => setShowDueDatePicker(false)} style={[styles.pickerButton, { backgroundColor: colors.background }]}>
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowDueDatePicker(false); setShowDueTimePicker(true); }} style={[styles.pickerButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.pickerButtonText, { color: '#FFFFFF' }]}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Due Time Picker - 15 min list */}
      <Modal visible={showDueTimePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Time</Text>
            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingVertical: 8 }}>
              {Array.from({ length: (24 * 60) / MINUTE_STEP }, (_, i) => i * MINUTE_STEP).map((m) => {
                const hour24 = Math.floor(m / 60);
                const minute = m % 60;
                const label = new Date(2000, 0, 1, hour24, minute).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                const hour12 = ((hour24 % 12) || 12).toString();
                const ampm = hour24 >= 12 ? 'PM' : 'AM';
                const selected = hour12 === tmpHour12 && tmpMinute === minute.toString().padStart(2, '0') && ampm === tmpAMPM;
                return (
                  <TouchableOpacity
                    key={`${hour24}:${minute}`}
                    onPress={() => {
                      setTmpHour12(hour12);
                      setTmpMinute(minute.toString().padStart(2, '0'));
                      setTmpAMPM(ampm);
                    }}
                    style={[styles.pickerItem, { marginHorizontal: 16 }, selected && { backgroundColor: colors.primary + '20' }]}
                  >
                    <Text style={[styles.pickerItemText, { color: selected ? colors.primary : colors.text }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.pickerButtons}>
              <TouchableOpacity onPress={() => setShowDueTimePicker(false)} style={[styles.pickerButton, { backgroundColor: colors.background }]}>
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                const hour24 = (tmpAMPM === 'PM' ? (parseInt(tmpHour12, 10) % 12) + 12 : parseInt(tmpHour12, 10) % 12);
                const date = new Date(tmpYear, tmpMonth - 1, tmpDay, hour24, parseInt(tmpMinute, 10), 0, 0);
                setDueDate(date.toISOString());
                setShowDueTimePicker(false);
              }} style={[styles.pickerButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.pickerButtonText, { color: '#FFFFFF' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  noteCard: {
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
    flex: 1,
    marginRight: 12,
  },
  noteContent: {
    fontSize: 15,
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
  },
  linkedEmail: {
    fontSize: 12,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 100,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    minHeight: 150,
    maxHeight: 250,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {},
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
    marginBottom: 8,
  },
  dueDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dueDateButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Pickers (reuse styles similar to calendar)
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pickerButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  addNoteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  addNoteText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
