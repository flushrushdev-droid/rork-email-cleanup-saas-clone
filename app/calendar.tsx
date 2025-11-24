import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, ArrowLeft, Trash2, MapPin, Plus } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useCalendar } from '@/hooks/useCalendar';
import { useNoteEditor } from '@/hooks/useNoteEditor';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { MeetingModal } from '@/components/calendar/MeetingModal';
import { DeleteMeetingModal } from '@/components/calendar/DeleteMeetingModal';
import { NoteEditModal } from '@/components/calendar/NoteEditModal';
import { DatePickerModal } from '@/components/calendar/DatePickerModal';
import { TimePickerModal } from '@/components/calendar/TimePickerModal';
import { createCalendarScreenStyles } from '@/styles/app/calendar';

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const calendar = useCalendar();

  const {
    selectedDate,
    setSelectedDate,
    events,
    setEvents,
    isNewMeetingModalVisible,
    setIsNewMeetingModalVisible,
    beginEditEvent,
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
    handleCreateMeeting,
    handleDeleteEvent,
    cancelDeleteEvent,
    confirmDeleteEvent,
    getEventsForSelectedDate,
    feedback,
    clearFeedback,
  } = calendar;

  // Note editor hook
  const noteEditor = useNoteEditor();
  
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

  const eventsForSelectedDate = getEventsForSelectedDate();
  const styles = React.useMemo(() => createCalendarScreenStyles(colors), [colors]);

  // Date picker handlers for meeting modal
  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    const newStartTime = new Date(startTime);
    newStartTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setStartTime(newStartTime);
    const newEndTime = new Date(endTime);
    newEndTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setEndTime(newEndTime);
    setShowDatePicker(false);
    if (Platform.OS === 'ios') {
      setIsNewMeetingModalVisible(true);
    }
  };

  const handleStartTimeConfirm = (time: Date) => {
      const newStartTime = new Date(selectedDate);
    newStartTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
      setStartTime(newStartTime);
    setShowStartTimePicker(false);
    if (Platform.OS === 'ios') {
      setIsNewMeetingModalVisible(true);
    }
  };

  const handleEndTimeConfirm = (time: Date) => {
      const newEndTime = new Date(selectedDate);
    newEndTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
      setEndTime(newEndTime);
    setShowEndTimePicker(false);
    if (Platform.OS === 'ios') {
      setIsNewMeetingModalVisible(true);
    }
  };

  // Note editor handlers
  const handleOpenNoteEditor = async (event: any) => {
    await noteEditor.openInlineNoteEditor(event);
  };

  const handleSaveNote = async () => {
    await noteEditor.saveInlineNote(setEvents);
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.surface }]}>
        <TouchableOpacity
          onPress={() => {
            try {
              // Prefer popping if possible; otherwise go to home
              // @ts-ignore - canGoBack is available in expo-router
              if (typeof router.canGoBack === 'function' ? router.canGoBack() : true) {
                router.back();
              } else {
                router.replace('/');
              }
            } catch {
              router.replace('/');
            }
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Calendar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <CalendarGrid
          selectedDate={selectedDate}
          onDayPress={handleDayPress}
          goToPreviousMonth={goToPreviousMonth}
          goToNextMonth={goToNextMonth}
          colors={colors}
          events={events}
          showEventIndicators={true}
          showSelectedDateInfo={false}
        />

        {/* Events Section */}
        <View style={[styles.eventsSection, { backgroundColor: colors.surface }]}>
          <View style={styles.eventsSectionHeader}>
            <Text style={[styles.eventsSectionTitle, { color: colors.text }]}>
              Events for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
            <TouchableOpacity
              onPress={() => setIsNewMeetingModalVisible(true)}
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {eventsForSelectedDate.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No events scheduled
              </Text>
            </View>
          ) : (
            eventsForSelectedDate.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, { backgroundColor: colors.background }]}
                onPress={() => {
                  if (event.source === 'note') {
                    handleOpenNoteEditor(event);
                  } else {
                    beginEditEvent(event);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.eventContent}>
                  <View style={[styles.eventColorBar, { backgroundColor: event.color || colors.primary }]} />
                  <View style={styles.eventDetails}>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                    <View style={styles.eventMeta}>
                      <Clock size={14} color={colors.textSecondary} />
                      <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                        {event.startTime && event.endTime
                          ? `${event.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${event.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                          : event.time || 'Time not set'}
                      </Text>
                    </View>
                    {event.location && (
                      <View style={styles.eventMeta}>
                        <MapPin size={14} color={colors.textSecondary} />
                        <Text style={[styles.eventLocation, { color: colors.textSecondary }]}>
                          {event.location}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteEvent(event.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={18} color={colors.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

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
        onOpenDatePicker={() => {
                  if (Platform.OS === 'ios') {
                    setIsNewMeetingModalVisible(false);
                    requestAnimationFrame(() => setShowDatePicker(true));
                  } else {
                    setShowDatePicker(true);
                  }
                }}
        onOpenStartTimePicker={() => {
                  if (Platform.OS === 'ios') {
                    setIsNewMeetingModalVisible(false);
                    requestAnimationFrame(() => setShowStartTimePicker(true));
                  } else {
                    setShowStartTimePicker(true);
                  }
                }}
        onOpenEndTimePicker={() => {
                  if (Platform.OS === 'ios') {
                    setIsNewMeetingModalVisible(false);
                    requestAnimationFrame(() => setShowEndTimePicker(true));
                  } else {
                    setShowEndTimePicker(true);
                  }
                }}
        onCreate={() => {
                  handleCreateMeeting();
                  setIsNewMeetingModalVisible(false);
                }}
        insets={insets}
        colors={colors}
      />

      <NoteEditModal
        visible={noteEditor.isNoteEditVisible}
        onClose={() => noteEditor.setIsNoteEditVisible(false)}
        onSave={handleSaveNote}
        noteTitle={noteEditor.noteTitle}
        setNoteTitle={noteEditor.setNoteTitle}
        noteContent={noteEditor.noteContent}
        setNoteContent={noteEditor.setNoteContent}
        dueDate={noteEditor.dueDate}
        onDueDateChange={noteEditor.setDueDate}
        showDatePicker={noteEditor.showDatePicker}
        setShowDatePicker={noteEditor.setShowDatePicker}
        showTimePicker={noteEditor.showTimePicker}
        setShowTimePicker={noteEditor.setShowTimePicker}
        colors={colors}
        insets={insets}
      />

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onConfirm={handleDateConfirm}
        onCancel={() => {
                  setShowDatePicker(false);
          if (Platform.OS === 'ios') {
            setIsNewMeetingModalVisible(true);
          }
        }}
        colors={colors}
      />

      <TimePickerModal
        visible={showStartTimePicker}
        selectedTime={startTime}
        onConfirm={handleStartTimeConfirm}
        onCancel={() => {
                  setShowStartTimePicker(false);
          if (Platform.OS === 'ios') {
            setIsNewMeetingModalVisible(true);
          }
        }}
        title="Select Start Time"
        insets={insets}
        colors={colors}
      />

      <TimePickerModal
        visible={showEndTimePicker}
        selectedTime={endTime}
        onConfirm={handleEndTimeConfirm}
        onCancel={() => {
                  setShowEndTimePicker(false);
          if (Platform.OS === 'ios') {
            setIsNewMeetingModalVisible(true);
          }
        }}
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

      {/* Feedback Toast */}
      {feedback && (
        <View style={[
          styles.feedbackToast,
          { 
            backgroundColor: feedback.type === 'success' ? colors.success : colors.danger,
            bottom: insets.bottom + 20 
          }
        ]}>
          <Text style={styles.feedbackText}>{feedback.message}</Text>
        </View>
      )}
    </View>
  );
}

