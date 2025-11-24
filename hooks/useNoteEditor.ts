import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalendarEvent } from './useCalendar';

const NOTES_KEY = 'notes-storage-v1';

interface UseNoteEditorReturn {
  isNoteEditVisible: boolean;
  noteEditId: string | null;
  noteTitle: string;
  noteContent: string;
  dueDate: Date;
  showDatePicker: boolean;
  showTimePicker: boolean;
  openInlineNoteEditor: (event: any) => Promise<void>;
  saveInlineNote: (setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>) => Promise<void>;
  setIsNoteEditVisible: (visible: boolean) => void;
  setNoteTitle: (title: string) => void;
  setNoteContent: (content: string) => void;
  setDueDate: (date: Date) => void;
  setShowDatePicker: (show: boolean) => void;
  setShowTimePicker: (show: boolean) => void;
}

export function useNoteEditor(): UseNoteEditorReturn {
  const [isNoteEditVisible, setIsNoteEditVisible] = useState(false);
  const [noteEditId, setNoteEditId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const openInlineNoteEditor = useCallback(async (event: any) => {
    try {
      setNoteEditId(event.noteId || null);
      let title = event.title || '';
      let content = event.description || '';
      // initialize date/time from event start
      const s = new Date(event.startTime || Date.now());
      setDueDate(s);
      
      if (event.noteId) {
        const raw = await AsyncStorage.getItem(NOTES_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as any[];
          const existing = parsed.find((n) => n.id === event.noteId);
          if (existing) {
            title = existing.title ?? title;
            content = existing.content ?? content;
            if (existing.dueDate) {
              setDueDate(new Date(existing.dueDate));
            }
          }
        }
      }
      setNoteTitle(title);
      setNoteContent(content);
      setIsNoteEditVisible(true);
    } catch {
      setNoteTitle(event.title || '');
      setNoteContent(event.description || '');
      setDueDate(new Date(event.startTime || Date.now()));
      setIsNoteEditVisible(true);
    }
  }, []);

  const saveInlineNote = useCallback(async (setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>) => {
    try {
      const raw = await AsyncStorage.getItem(NOTES_KEY);
      let list: any[] = raw ? JSON.parse(raw) : [];
      
      if (noteEditId) {
        list = list.map((n) =>
          n.id === noteEditId
            ? {
                ...n,
                title: noteTitle,
                content: noteContent,
                dueDate: dueDate.toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : n,
        );
      } else {
        const newId = Date.now().toString();
        list = [
          {
            id: newId,
            title: noteTitle,
            content: noteContent,
            dueDate: dueDate.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...list,
        ];
        setNoteEditId(newId);
      }
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(list));

      // Reflect updates in events list (title/description)
      setEvents((prev) =>
        prev.map((e) =>
          e.source === 'note' && (e.noteId === noteEditId || (!e.noteId && noteEditId))
            ? {
                ...e,
                title: noteTitle,
                description: noteContent,
                date: new Date(dueDate),
                startTime: new Date(dueDate),
                endTime: new Date(dueDate.getTime() + 60 * 60 * 1000),
                time: dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              }
            : e,
        ),
      );
    } catch {}
    setIsNoteEditVisible(false);
  }, [noteEditId, noteTitle, noteContent, dueDate]);

  return {
    isNoteEditVisible,
    noteEditId,
    noteTitle,
    noteContent,
    dueDate,
    showDatePicker,
    showTimePicker,
    openInlineNoteEditor,
    saveInlineNote,
    setIsNoteEditVisible,
    setNoteTitle,
    setNoteContent,
    setDueDate,
    setShowDatePicker,
    setShowTimePicker,
  };
}


