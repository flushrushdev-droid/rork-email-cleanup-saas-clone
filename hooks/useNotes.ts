import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCalendarStore } from '@/contexts/CalendarContext';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import type { CalendarEvent } from '@/hooks/useCalendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
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

export function useNotes() {
  const { addEvent, setEvents } = useCalendarStore();
  const params = useLocalSearchParams<{ editNoteId?: string; prefillTitle?: string; prefillContent?: string }>();
  const [notes, setNotes] = useState<Note[]>(demoNotes);
  const { showError } = useEnhancedToast();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
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

    return concrete;
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setDueDate(undefined);
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setDueDate(note.dueDate);
    setModalVisible(true);
  }, []);

  // Handle deep link edits from calendar (note-sourced events)
  useEffect(() => {
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
  }, [params?.editNoteId, params?.prefillTitle, params?.prefillContent, notes, openEditModal]);

  // No persistence for demo mode - notes reset on refresh
  const NOTES_KEY = 'notes-storage-v1';
  useEffect(() => {
    AsyncStorage.removeItem(NOTES_KEY).catch(() => {});
  }, []);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      showError('Please enter a title');
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
      const end = new Date(start.getTime() + 60 * 60 * 1000);
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
  }, [title, content, dueDate, editingNote, addEvent, showError]);

  const performDelete = useCallback(async (noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    setEvents((prevEvents) => prevEvents.filter((event) => event.noteId !== noteId));
  }, [setEvents]);

  const handleDelete = useCallback((noteId: string) => {
    performDelete(noteId);
  }, [performDelete]);

  const handleDatePickerOpen = useCallback(() => {
    const base = dueDate ? new Date(dueDate) : new Date();
    setPickerDate(base);
    if (Platform.OS === 'ios') {
      setModalVisible(false);
      requestAnimationFrame(() => setShowDueDatePicker(true));
    } else {
      setShowDueDatePicker(true);
    }
  }, [dueDate]);

  const handleDateConfirm = useCallback((date: Date) => {
    setPickerDate(date);
    setShowDueDatePicker(false);
    setShowDueTimePicker(true);
  }, []);

  const handleDateCancel = useCallback(() => {
    setShowDueDatePicker(false);
    if (Platform.OS === 'ios') {
      setModalVisible(true);
    }
  }, []);

  const handleTimeConfirm = useCallback((time: Date) => {
    setDueDate(time.toISOString());
    setShowDueTimePicker(false);
    if (Platform.OS === 'ios') {
      setModalVisible(true);
    }
  }, []);

  const handleTimeCancel = useCallback(() => {
    setShowDueTimePicker(false);
    if (Platform.OS === 'ios') {
      setModalVisible(true);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    // Reset to demo notes (restore all deleted notes)
    setNotes([...demoNotes]);
  }, []);

  return {
    notes,
    modalVisible,
    setModalVisible,
    editingNote,
    title,
    setTitle,
    content,
    setContent,
    dueDate,
    setDueDate,
    showDueDatePicker,
    showDueTimePicker,
    pickerDate,
    formatDate,
    openCreateModal,
    openEditModal,
    handleSave,
    handleDelete,
    performDelete,
    handleDatePickerOpen,
    handleDateConfirm,
    handleDateCancel,
    handleTimeConfirm,
    handleTimeCancel,
    handleRefresh,
  };
}


