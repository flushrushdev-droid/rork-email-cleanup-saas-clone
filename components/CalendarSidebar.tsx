import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Calendar, X, Plus, Video, MapPin, Trash2 } from 'lucide-react-native';

import type { CalendarEvent, CalendarFeedback } from '@/hooks/useCalendar';
import { CalendarGrid } from './calendar/CalendarGrid';
import { MeetingModal } from './calendar/MeetingModal';
import { DatePickerModal } from './calendar/DatePickerModal';
import { TimePickerModal } from './calendar/TimePickerModal';
import { DeleteMeetingModal } from './calendar/DeleteMeetingModal';
import { createCalendarStyles } from './calendar/styles/calendarStyles';

interface CalendarRenderProps {
  isCalendarVisible: boolean;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  calendarSlideAnim: Animated.Value;
  isNewMeetingModalVisible: boolean;
  setIsNewMeetingModalVisible: (visible: boolean) => void;
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
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  showStartTimePicker: boolean;
  setShowStartTimePicker: (show: boolean) => void;
  showEndTimePicker: boolean;
  setShowEndTimePicker: (show: boolean) => void;
  pendingDeleteEventId: string | null;
  pendingDeleteEvent?: CalendarEvent;
  toggleCalendar: () => void;
  handleCreateMeeting: () => void;
  handleDeleteEvent: (eventId: string) => void;
  cancelDeleteEvent: () => void;
  confirmDeleteEvent: () => void;
  getEventsForSelectedDate: () => CalendarEvent[];
  feedback: CalendarFeedback | null;
  clearFeedback: () => void;
  insets: EdgeInsets;
  colors: any;
}

export function CalendarSidebar(props: CalendarRenderProps) {
  const {
    isCalendarVisible,
    selectedDate,
    setSelectedDate,
    calendarSlideAnim,
    isNewMeetingModalVisible,
    setIsNewMeetingModalVisible,
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
    showDatePicker,
    setShowDatePicker,
    showStartTimePicker,
    setShowStartTimePicker,
    showEndTimePicker,
    setShowEndTimePicker,
    pendingDeleteEventId,
    pendingDeleteEvent,
    toggleCalendar,
    handleCreateMeeting,
    handleDeleteEvent,
    cancelDeleteEvent,
    confirmDeleteEvent,
    getEventsForSelectedDate,
    feedback,
    clearFeedback,
    insets,
    colors,
  } = props;

  const styles = React.useMemo(() => createCalendarStyles(colors), [colors]);

  const handleDayPress = (day: number | null) => {
    if (day) {
      const currentMonth = selectedDate.getMonth();
      const currentYear = selectedDate.getFullYear();
      setSelectedDate(new Date(currentYear, currentMonth, day));
    }
  };

  const goToPreviousMonth = () => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    const newStartTime = new Date(startTime);
    newStartTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setStartTime(newStartTime);
    const newEndTime = new Date(endTime);
    newEndTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setEndTime(newEndTime);
    setShowDatePicker(false);
  };

  const handleStartTimeConfirm = (time: Date) => {
    setStartTime(time);
    setShowStartTimePicker(false);
  };

  const handleEndTimeConfirm = (time: Date) => {
    setEndTime(time);
    setShowEndTimePicker(false);
  };

  return (
    <>
      <Animated.View style={[styles.calendarSidebar, { right: calendarSlideAnim }]}>
        <View style={[styles.calendarHeader, { paddingTop: insets.top + 16 }]}>
          <Text 
            style={styles.calendarTitle}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel="Calendar"
          >
            Calendar
          </Text>
          <TouchableOpacity 
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close calendar"
            accessibilityHint="Double tap to close the calendar sidebar"
            onPress={toggleCalendar}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarContent}>
          {feedback && (
            <View
              style={[
                styles.feedbackBanner,
                feedback.type === 'success' ? styles.feedbackBannerSuccess : styles.feedbackBannerError,
              ]}
            >
              <View
                style={[
                  styles.feedbackIndicator,
                  feedback.type === 'success' ? styles.feedbackIndicatorSuccess : styles.feedbackIndicatorError,
                ]}
              />
              <Text
                style={[
                  styles.feedbackText,
                  feedback.type === 'success' ? styles.feedbackTextSuccess : styles.feedbackTextError,
                ]}
              >
                {feedback.message}
              </Text>
              <TouchableOpacity
                onPress={clearFeedback}
                style={styles.feedbackDismiss}
                testID="dismiss-calendar-feedback"
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Dismiss feedback"
                accessibilityHint="Double tap to dismiss this feedback message"
              >
                <X size={16} color={feedback.type === 'success' ? colors.success : colors.danger} />
              </TouchableOpacity>
            </View>
          )}
          
          <CalendarGrid
            selectedDate={selectedDate}
            onDayPress={handleDayPress}
            goToPreviousMonth={goToPreviousMonth}
            goToNextMonth={goToNextMonth}
            colors={colors}
          />
          
          <View style={styles.calendarEvents}>
            <View style={styles.eventsHeader}>
              <Text 
                style={styles.eventsTitle}
                accessible={true}
                accessibilityRole="header"
                accessibilityLabel="Events"
              >
                Events
              </Text>
              <TouchableOpacity 
                style={styles.newMeetingButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="New event"
                accessibilityHint="Double tap to create a new calendar event"
                onPress={() => setIsNewMeetingModalVisible(true)}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.newMeetingButtonText}>New</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.eventsList}
            >
              {getEventsForSelectedDate().length === 0 ? (
                <View style={styles.emptyEvents}>
                  <Calendar size={32} color={colors.textSecondary} />
                  <Text style={styles.emptyEventsText}>No events for this day</Text>
                  <TouchableOpacity 
                    style={styles.addEventButton}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Add Event"
                    accessibilityHint="Double tap to create a new calendar event for this day"
                    onPress={() => setIsNewMeetingModalVisible(true)}
                  >
                    <Text style={styles.addEventButtonText}>Add Event</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                getEventsForSelectedDate().map(event => (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={styles.eventCardHeader}>
                      <View style={[styles.eventTypeIcon, { backgroundColor: event.type === 'video' ? '#5AC8FA20' : '#34C75920' }]}>
                        {event.type === 'video' ? (
                          <Video size={16} color="#5AC8FA" />
                        ) : (
                          <MapPin size={16} color="#34C759" />
                        )}
                      </View>
                      <Text style={styles.eventTime}>{event.time}</Text>
                      <TouchableOpacity
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete event ${event.title}`}
                        accessibilityHint="Double tap to delete this calendar event"
                        onPress={() => handleDeleteEvent(event.id)}
                        style={styles.deleteEventButton}
                      >
                        <Trash2 size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.location && (
                      <View style={styles.eventLocation}>
                        <MapPin size={14} color={colors.textSecondary} />
                        <Text style={styles.eventLocationText}>{event.location}</Text>
                      </View>
                    )}
                    {event.description && (
                      <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Animated.View>

      {isCalendarVisible && (
        <TouchableOpacity
          style={styles.calendarOverlay}
          activeOpacity={1}
          onPress={toggleCalendar}
        />
      )}

      <MeetingModal
        visible={isNewMeetingModalVisible}
        onClose={() => setIsNewMeetingModalVisible(false)}
        meetingTitle={meetingTitle}
        setMeetingTitle={setMeetingTitle}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        meetingLocation={meetingLocation}
        setMeetingLocation={setMeetingLocation}
        meetingDescription={meetingDescription}
        setMeetingDescription={setMeetingDescription}
        meetingType={meetingType}
        setMeetingType={setMeetingType}
        selectedDate={selectedDate}
        onOpenDatePicker={() => setShowDatePicker(true)}
        onOpenStartTimePicker={() => setShowStartTimePicker(true)}
        onOpenEndTimePicker={() => setShowEndTimePicker(true)}
        onCreate={handleCreateMeeting}
        insets={insets}
        colors={colors}
      />

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        colors={colors}
      />

      <TimePickerModal
        visible={showStartTimePicker}
        selectedTime={startTime}
        onConfirm={handleStartTimeConfirm}
        onCancel={() => setShowStartTimePicker(false)}
        title="Select Start Time"
        insets={insets}
        colors={colors}
      />

      <TimePickerModal
        visible={showEndTimePicker}
        selectedTime={endTime}
        onConfirm={handleEndTimeConfirm}
        onCancel={() => setShowEndTimePicker(false)}
        title="Select End Time"
        insets={insets}
        colors={colors}
      />

      <DeleteMeetingModal
        visible={Boolean(pendingDeleteEventId)}
        event={pendingDeleteEvent}
        onConfirm={confirmDeleteEvent}
        onCancel={cancelDeleteEvent}
        insets={insets}
        colors={colors}
      />
    </>
  );
}

// Styles are now in components/calendar/styles/calendarStyles.ts
