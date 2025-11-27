import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Calendar, Trash2 } from 'lucide-react-native';
import { createNotesStyles } from '@/styles/app/notes';
import type { Note } from '@/hooks/useNotes';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  formatDate: (date: Date | string) => string;
  colors: any;
}

export function NoteCard({ note, onEdit, onDelete, formatDate, colors }: NoteCardProps) {
  const styles = React.useMemo(() => createNotesStyles(colors), [colors]);

  return (
    <View
      key={note.id}
      style={[styles.noteCard, { backgroundColor: colors.surface }]}
    >
      <View style={styles.noteHeader}>
        <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
          {note.title}
        </Text>
        <Pressable
          onPress={() => {
            onDelete(note.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID={`delete-note-${note.id}`}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Trash2 size={18} color={colors.danger} />
        </Pressable>
      </View>

      <TouchableOpacity
        onPress={() => onEdit(note)}
        activeOpacity={0.7}
        testID={`note-${note.id}`}
        style={{ flex: 1 }}
      >
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
    </View>
  );
}

