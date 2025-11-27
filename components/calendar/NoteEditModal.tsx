import React from 'react';
import { View, Modal, TouchableOpacity, TextInput } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Calendar, Clock } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { DatePickerModal } from './DatePickerModal';
import { TimePickerModal } from './TimePickerModal';
import { createCalendarStyles } from './styles/calendarStyles';
import type { ThemeColors } from '@/constants/colors';

interface NoteEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  noteTitle: string;
  setNoteTitle: (title: string) => void;
  noteContent: string;
  setNoteContent: (content: string) => void;
  dueDate: Date;
  onDueDateChange: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
  colors: ThemeColors;
  insets: EdgeInsets;
}

export function NoteEditModal({
  visible,
  onClose,
  onSave,
  noteTitle,
  setNoteTitle,
  noteContent,
  setNoteContent,
  dueDate,
  onDueDateChange,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
  colors,
  insets,
}: NoteEditModalProps) {
  const styles = createCalendarStyles(colors);

  const handleDateConfirm = (date: Date) => {
    onDueDateChange(date);
    setShowDatePicker(false);
  };

  const handleTimeConfirm = (time: Date) => {
    const newDate = new Date(dueDate);
    newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
    onDueDateChange(newDate);
    setShowTimePicker(false);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" presentationStyle="overFullScreen">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <AppText style={[styles.modalTitle, { color: colors.text }]} dynamicTypeStyle="title2">Edit Note</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Title"
              placeholderTextColor={colors.textSecondary}
              value={noteTitle}
              onChangeText={setNoteTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Content"
              placeholderTextColor={colors.textSecondary}
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              numberOfLines={4}
            />
            <View style={{ marginTop: 8 }}>
              <AppText style={[styles.eventsSectionTitle, { color: colors.text, marginBottom: 8 }]} dynamicTypeStyle="headline">Due</AppText>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border, flex: 1 }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={16} color={colors.textSecondary} />
                  <AppText style={[styles.timeButtonText, { color: colors.text }]} dynamicTypeStyle="body">
                    {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border, flex: 1 }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={16} color={colors.textSecondary} />
                  <AppText style={[styles.timeButtonText, { color: colors.text }]} dynamicTypeStyle="body">
                    {dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.pickerButtons}>
              <TouchableOpacity onPress={onClose} style={[styles.pickerButton, { backgroundColor: colors.background }]}>
                <AppText style={[styles.pickerButtonText, { color: colors.text }]} dynamicTypeStyle="headline">Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSave} style={[styles.pickerButton, { backgroundColor: colors.primary }]}>
                <AppText style={[styles.pickerButtonText, { color: colors.surface }]} dynamicTypeStyle="headline">Save</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={dueDate}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        colors={colors}
      />

      <TimePickerModal
        visible={showTimePicker}
        selectedTime={dueDate}
        onConfirm={handleTimeConfirm}
        onCancel={() => setShowTimePicker(false)}
        title="Select Time"
        insets={insets}
        colors={colors}
      />
    </>
  );
}


