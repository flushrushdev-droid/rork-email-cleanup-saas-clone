import React from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Keyboard,
  ListRenderItem,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText } from 'lucide-react-native';
import { DatePickerModal } from '@/components/calendar/DatePickerModal';
import { TimePickerModal } from '@/components/calendar/TimePickerModal';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteEditorModal } from '@/components/notes/NoteEditorModal';
import { EmptyState } from '@/components/common/EmptyState';
import { createNotesStyles } from '@/styles/app/notes';
import { useNotes, type Note } from '@/hooks/useNotes';

import { useTheme } from '@/contexts/ThemeContext';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { getOptimizedFlatListProps } from '@/utils/listConfig';
import { triggerButtonHaptic } from '@/utils/haptics';

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
    handleRefresh,
  } = useNotes();
  
  const { refreshControl } = useRefreshControl({
    onRefresh: handleRefresh,
  });

  const formatDateWrapper = React.useCallback((date: Date | string) => {
    const dateString = typeof date === 'string' ? date : date.toISOString();
    return formatDate(dateString);
  }, [formatDate]);

  const renderNoteItem: ListRenderItem<Note> = React.useCallback(({ item: note }) => (
    <NoteCard
      note={note}
      onEdit={openEditModal}
      onDelete={handleDelete}
      formatDate={formatDateWrapper}
      colors={colors}
    />
  ), [openEditModal, handleDelete, formatDateWrapper, colors]);

  const listHeaderComponent = React.useMemo(() => (
    <TouchableOpacity 
      style={[styles.addNoteButton, { backgroundColor: colors.surface, borderColor: colors.primary + '30' }]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Create New Note"
      accessibilityHint="Double tap to create a new note"
      onPress={async () => {
        await triggerButtonHaptic();
        openCreateModal();
      }}
      activeOpacity={0.7}
      testID="add-note-button"
    >
      <Text style={[styles.addNoteText, { color: colors.primary }]}>Create New Note</Text>
    </TouchableOpacity>
  ), [styles.addNoteButton, styles.addNoteText, colors, openCreateModal]);

  const listEmptyComponent = React.useMemo(() => (
    <EmptyState
      icon={FileText}
      title="No Notes Yet"
      description="Tap the + button to create your first note"
      iconSize={64}
      style={styles.emptyState}
    />
  ), [colors]);

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

      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={listEmptyComponent}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        {...getOptimizedFlatListProps()}
      />

      <NoteEditorModal
        visible={modalVisible}
        editingNote={editingNote}
        title={title}
        content={content}
        dueDate={dueDate ? new Date(dueDate) : null}
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

