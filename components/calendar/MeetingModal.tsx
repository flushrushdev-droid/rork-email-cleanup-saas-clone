import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { X, Calendar, Clock, Video, MapPin } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { createCalendarStyles } from './styles/calendarStyles';

interface MeetingModalProps {
  visible: boolean;
  onClose: () => void;
  meetingTitle: string;
  setMeetingTitle: (title: string) => void;
  startTime: Date;
  setStartTime: (time: Date) => void;
  endTime: Date;
  setEndTime: (time: Date) => void;
  meetingLocation: string;
  setMeetingLocation: (location: string) => void;
  meetingDescription: string;
  setMeetingDescription: (description: string) => void;
  meetingType: 'in-person' | 'video';
  setMeetingType: (type: 'in-person' | 'video') => void;
  selectedDate: Date;
  onOpenDatePicker: () => void;
  onOpenStartTimePicker: () => void;
  onOpenEndTimePicker: () => void;
  onCreate: () => void;
  insets: EdgeInsets;
  colors: any;
}

export function MeetingModal({
  visible,
  onClose,
  meetingTitle,
  setMeetingTitle,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  meetingLocation,
  setMeetingLocation,
  meetingDescription,
  setMeetingDescription,
  meetingType,
  setMeetingType,
  selectedDate,
  onOpenDatePicker,
  onOpenStartTimePicker,
  onOpenEndTimePicker,
  onCreate,
  insets,
  colors,
}: MeetingModalProps) {
  const styles = createCalendarStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.aiModalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Meeting</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Meeting title"
                placeholderTextColor={colors.textSecondary}
                value={meetingTitle}
                onChangeText={setMeetingTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity
                style={styles.dateDisplay}
                onPress={() => {
                  console.log('Date picker pressed, current platform:', Platform.OS);
                  onOpenDatePicker();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.dateDisplayText}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <TouchableOpacity
                style={styles.dateDisplay}
                onPress={onOpenStartTimePicker}
                activeOpacity={0.7}
              >
                <Clock size={16} color={colors.primary} />
                <Text style={styles.dateDisplayText}>
                  {startTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>End Time</Text>
              <TouchableOpacity
                style={styles.dateDisplay}
                onPress={onOpenEndTimePicker}
                activeOpacity={0.7}
              >
                <Clock size={16} color={colors.primary} />
                <Text style={styles.dateDisplayText}>
                  {endTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Meeting Type</Text>
              <View style={styles.meetingTypeContainer}>
                <TouchableOpacity
                  style={[styles.meetingTypeButton, meetingType === 'video' && styles.meetingTypeButtonActive]}
                  onPress={() => setMeetingType('video')}
                >
                  <Video size={18} color={meetingType === 'video' ? '#FFFFFF' : colors.text} />
                  <Text style={[styles.meetingTypeText, meetingType === 'video' && styles.meetingTypeTextActive]}>
                    Video Call
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.meetingTypeButton, meetingType === 'in-person' && styles.meetingTypeButtonActive]}
                  onPress={() => setMeetingType('in-person')}
                >
                  <MapPin size={18} color={meetingType === 'in-person' ? '#FFFFFF' : colors.text} />
                  <Text style={[styles.meetingTypeText, meetingType === 'in-person' && styles.meetingTypeTextActive]}>
                    In Person
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder={meetingType === 'video' ? 'Zoom, Meet, etc.' : 'Meeting room or address'}
                placeholderTextColor={colors.textSecondary}
                value={meetingLocation}
                onChangeText={setMeetingLocation}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Meeting agenda or notes"
                placeholderTextColor={colors.textSecondary}
                value={meetingDescription}
                onChangeText={setMeetingDescription}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.createMeetingButton, !meetingTitle.trim() && styles.createMeetingButtonDisabled]}
            onPress={onCreate}
            disabled={!meetingTitle.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.createMeetingButtonText}>Create Meeting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


