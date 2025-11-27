import React from 'react';
import { View, Modal, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { AppText } from '@/components/common/AppText';
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
            <AppText 
              style={styles.modalTitle}
              accessibilityRole="header"
              accessibilityLabel="New Meeting"
              dynamicTypeStyle="title2"
            >
              New Meeting
            </AppText>
            <TouchableOpacity 
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close"
              accessibilityHint="Double tap to close the meeting modal"
              onPress={onClose}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputContainer}>
              <AppText style={styles.inputLabel} dynamicTypeStyle="headline">Title *</AppText>
              <TextInput
                style={styles.input}
                placeholder="Meeting title"
                placeholderTextColor={colors.textSecondary}
                value={meetingTitle}
                onChangeText={setMeetingTitle}
                accessible={true}
                accessibilityLabel="Meeting title"
                accessibilityHint="Enter the title for this meeting"
              />
            </View>

            <View style={styles.inputContainer}>
              <AppText style={styles.inputLabel} dynamicTypeStyle="headline">Date</AppText>
              <TouchableOpacity
                style={styles.dateDisplay}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Meeting date: ${selectedDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}`}
                accessibilityHint="Double tap to change the meeting date"
                onPress={() => {
                  onOpenDatePicker();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Calendar size={16} color={colors.primary} />
                <AppText style={styles.dateDisplayText} dynamicTypeStyle="body">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <AppText style={styles.inputLabel} dynamicTypeStyle="headline">Start Time</AppText>
              <TouchableOpacity
                style={styles.dateDisplay}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Start time: ${startTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}`}
                accessibilityHint="Double tap to change the meeting start time"
                onPress={onOpenStartTimePicker}
                activeOpacity={0.7}
              >
                <Clock size={16} color={colors.primary} />
                <AppText style={styles.dateDisplayText} dynamicTypeStyle="body">
                  {startTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <AppText style={styles.inputLabel} dynamicTypeStyle="headline">End Time</AppText>
              <TouchableOpacity
                style={styles.dateDisplay}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`End time: ${endTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}`}
                accessibilityHint="Double tap to change the meeting end time"
                onPress={onOpenEndTimePicker}
                activeOpacity={0.7}
              >
                <Clock size={16} color={colors.primary} />
                <AppText style={styles.dateDisplayText} dynamicTypeStyle="body">
                  {endTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <AppText style={styles.inputLabel} dynamicTypeStyle="headline">Meeting Type</AppText>
              <View style={styles.meetingTypeContainer}>
                <TouchableOpacity
                  style={[styles.meetingTypeButton, meetingType === 'video' && styles.meetingTypeButtonActive]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Video Call"
                  accessibilityHint="Double tap to select video call as meeting type"
                  accessibilityState={{ selected: meetingType === 'video' }}
                  onPress={() => setMeetingType('video')}
                >
                  <Video size={18} color={meetingType === 'video' ? colors.surface : colors.text} />
                  <AppText style={[styles.meetingTypeText, meetingType === 'video' && styles.meetingTypeTextActive]} dynamicTypeStyle="body">
                    Video Call
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.meetingTypeButton, meetingType === 'in-person' && styles.meetingTypeButtonActive]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="In Person"
                  accessibilityHint="Double tap to select in-person as meeting type"
                  accessibilityState={{ selected: meetingType === 'in-person' }}
                  onPress={() => setMeetingType('in-person')}
                >
                  <MapPin size={18} color={meetingType === 'in-person' ? colors.surface : colors.text} />
                  <AppText style={[styles.meetingTypeText, meetingType === 'in-person' && styles.meetingTypeTextActive]} dynamicTypeStyle="body">
                    In Person
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <AppText style={styles.inputLabel} dynamicTypeStyle="headline">Location</AppText>
              <TextInput
                style={styles.input}
                placeholder={meetingType === 'video' ? 'Zoom, Meet, etc.' : 'Meeting room or address'}
                placeholderTextColor={colors.textSecondary}
                value={meetingLocation}
                onChangeText={setMeetingLocation}
                accessible={true}
                accessibilityLabel="Meeting location"
                accessibilityHint={meetingType === 'video' ? 'Enter video call link like Zoom or Meet' : 'Enter meeting room or address'}
              />
            </View>

            <View style={styles.inputContainer}>
              <AppText style={styles.inputLabel} dynamicTypeStyle="headline">Description</AppText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Meeting agenda or notes"
                placeholderTextColor={colors.textSecondary}
                value={meetingDescription}
                onChangeText={setMeetingDescription}
                multiline
                numberOfLines={4}
                accessible={true}
                accessibilityLabel="Meeting description"
                accessibilityHint="Enter meeting agenda or notes"
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.createMeetingButton, !meetingTitle.trim() && styles.createMeetingButtonDisabled]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Create Meeting"
            accessibilityHint={!meetingTitle.trim() ? 'Meeting title is required to create a meeting' : 'Double tap to create the meeting'}
            accessibilityState={{ disabled: !meetingTitle.trim() }}
            onPress={onCreate}
            disabled={!meetingTitle.trim()}
            activeOpacity={0.8}
          >
            <AppText style={styles.createMeetingButtonText} dynamicTypeStyle="headline">Create Meeting</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


