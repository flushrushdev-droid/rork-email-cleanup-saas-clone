import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { Stack } from 'expo-router';
import { Plus, X, Trash2, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react-native';

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
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slideAnim] = useState(new Animated.Value(0));

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

  const toggleCalendar = () => {
    if (calendarVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setCalendarVisible(false));
    } else {
      setCalendarVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getNotesForDate = (date: Date) => {
    return notes.filter((note) => {
      if (!note.dueDate) return false;
      const noteDate = new Date(note.dueDate);
      return (
        noteDate.getDate() === date.getDate() &&
        noteDate.getMonth() === date.getMonth() &&
        noteDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const filteredNotes = useMemo(() => {
    if (!selectedDate) return notes;
    return notes.filter((note) => {
      if (!note.dueDate) return false;
      const noteDate = new Date(note.dueDate);
      return (
        noteDate.getDate() === selectedDate.getDate() &&
        noteDate.getMonth() === selectedDate.getMonth() &&
        noteDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [notes, selectedDate]);

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
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
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={toggleCalendar}
                testID="calendar-button"
              >
                <Calendar size={24} color={calendarVisible ? Colors.light.primary : Colors.light.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={openCreateModal}
                testID="add-note-button"
              >
                <Plus size={24} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {selectedDate && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterText}>
            Showing notes for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => setSelectedDate(null)}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color={Colors.light.textSecondary} />
            <Text style={styles.emptyTitle}>
              {selectedDate ? 'No Notes for This Date' : 'No Notes Yet'}
            </Text>
            <Text style={styles.emptyDescription}>
              {selectedDate
                ? 'No notes scheduled for this date'
                : 'Tap the + button to create your first note'}
            </Text>
          </View>
        ) : (
          filteredNotes.map((note) => (
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

      {calendarVisible && (
        <Animated.View
          style={[
            styles.calendarSidebar,
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
              }}
            >
              <ChevronLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.calendarMonthYear}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setCurrentMonth(newMonth);
              }}
            >
              <ChevronRight size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWeekDays}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <Text key={idx} style={styles.weekDayText}>
                {day}
              </Text>
            ))}
          </View>

          <ScrollView style={styles.calendarDays}>
            {(() => {
              const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
              const days = [];
              const today = new Date();

              for (let i = 0; i < startingDayOfWeek; i++) {
                days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
              }

              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day
                );
                const notesForDate = getNotesForDate(date);
                const isToday = isSameDay(date, today);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const hasNotes = notesForDate.length > 0;

                days.push(
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.calendarDay,
                      isToday && styles.calendarDayToday,
                      isSelected && styles.calendarDaySelected,
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedDate(null);
                      } else {
                        setSelectedDate(date);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isToday && styles.calendarDayTextToday,
                        isSelected && styles.calendarDayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                    {hasNotes && (
                      <View style={styles.noteDot}>
                        <Text style={styles.noteDotText}>{notesForDate.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }

              return days;
            })()}
          </ScrollView>
        </Animated.View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
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

            <View style={styles.modalBody}>
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
            </View>

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
        </View>
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
    marginRight: 8,
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
    padding: 20,
    minHeight: 300,
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
    maxHeight: 400,
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
  filterBanner: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  calendarSidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: Colors.light.surface,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    paddingTop: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  calendarWeekDays: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  } as any,
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  calendarDayToday: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
  },
  calendarDaySelected: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  calendarDayTextToday: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noteDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  noteDotText: {
    fontSize: 10,
    fontWeight: '700',
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
