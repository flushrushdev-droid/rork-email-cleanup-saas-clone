import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText } from 'lucide-react-native';
import { DatePickerModal } from '@/components/calendar/DatePickerModal';
import { TimePickerModal } from '@/components/calendar/TimePickerModal';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteEditorModal } from '@/components/notes/NoteEditorModal';
import { createNotesStyles } from '@/styles/app/notes';
import { useNotes, type Note } from '@/hooks/useNotes';

import { useTheme } from '@/contexts/ThemeContext';

export default function NotesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createNotesStyles(colors), [colors]);
  
  const {
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
    handleDatePickerOpen,
    handleDateConfirm,
    handleDateCancel,
    handleTimeConfirm,
    handleTimeCancel,
  } = useNotes();

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
            <NoteCard
              key={note.id}
              note={note}
              onEdit={openEditModal}
              onDelete={handleDelete}
              formatDate={formatDate}
              colors={colors}
            />
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      <NoteEditorModal
        visible={modalVisible}
        editingNote={editingNote}
        title={title}
        content={content}
        dueDate={dueDate}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onDueDatePress={() => {
          Keyboard.dismiss();
          handleDatePickerOpen();
        }}
        colors={colors}
        insets={insets}
      />

      <DatePickerModal
        visible={showDueDatePicker}
        selectedDate={pickerDate}
        onConfirm={handleDateConfirm}
        onCancel={handleDateCancel}
        colors={colors}
      />

      <TimePickerModal
        visible={showDueTimePicker}
        selectedTime={pickerDate}
        onConfirm={handleTimeConfirm}
        onCancel={handleTimeCancel}
        title="Select Time"
        insets={insets}
        colors={colors}
      />
    </View>
  );
}

