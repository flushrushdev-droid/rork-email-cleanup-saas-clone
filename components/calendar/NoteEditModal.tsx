import React from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { DatePickerModal } from './DatePickerModal';
import { TimePickerModal } from './TimePickerModal';
import { createCalendarStyles } from './styles/calendarStyles';

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
  colors: any;
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Note</Text>
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
              <Text style={[styles.eventsSectionTitle, { color: colors.text, marginBottom: 8 }]}>Due</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border, flex: 1 }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={16} color={colors.textSecondary} />
                  <Text style={[styles.timeButtonText, { color: colors.text }]}>
                    {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border, flex: 1 }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={16} color={colors.textSecondary} />
                  <Text style={[styles.timeButtonText, { color: colors.text }]}>
                    {dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.pickerButtons}>
              <TouchableOpacity onPress={onClose} style={[styles.pickerButton, { backgroundColor: colors.background }]}>
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSave} style={[styles.pickerButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.pickerButtonText, { color: '#FFFFFF' }]}>Save</Text>
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


