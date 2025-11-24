import React, { useState } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Keyboard,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { Stack } from 'expo-router';
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
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await handleRefresh();
    setIsRefreshing(false);
  }, [handleRefresh]);

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
      onPress={openCreateModal}
      activeOpacity={0.7}
      testID="add-note-button"
    >
      <Text style={[styles.addNoteText, { color: colors.primary }]}>Create New Note</Text>
    </TouchableOpacity>
  ), [styles.addNoteButton, styles.addNoteText, colors, openCreateModal]);

  const listEmptyComponent = React.useMemo(() => (
    <View style={styles.emptyState}>
      <FileText size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notes Yet</Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Tap the + button to create your first note
      </Text>
    </View>
  ), [styles.emptyState, styles.emptyTitle, styles.emptyDescription, colors]);

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressViewOffset={0}
          />
        }
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={50}
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

