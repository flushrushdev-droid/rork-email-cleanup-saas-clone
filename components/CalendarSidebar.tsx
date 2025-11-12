import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet, Modal, Platform, TextInput, Pressable } from 'react-native';
import { SafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, X, ChevronLeft, ChevronRight, Plus, Video, MapPin, Trash2, Clock } from 'lucide-react-native';

import Colors from '@/constants/colors';
import type { CalendarEvent, CalendarFeedback } from '@/hooks/useCalendar';

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
  insets: SafeAreaInsets;
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
  } = props;

  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  const isToday = (day: number | null) => {
    if (!day) return false;
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };
  
  const isSelected = (day: number | null) => {
    if (!day) return false;
    return day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear();
  };
  
  const handleDayPress = (day: number | null) => {
    if (day) {
      setSelectedDate(new Date(currentYear, currentMonth, day));
    }
  };
  
  const goToPreviousMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const goToNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const [tempHour, setTempHour] = React.useState<string>('12');
  const [tempMinute, setTempMinute] = React.useState<string>('00');
  const [tempAMPM, setTempAMPM] = React.useState<'AM' | 'PM'>('PM');
  const [tempYear, setTempYear] = React.useState<string>('2025');
  const [tempMonth, setTempMonth] = React.useState<string>('1');
  const [tempDay, setTempDay] = React.useState<string>('1');

  const monthRef = React.useRef<ScrollView>(null);
  const dayRef = React.useRef<ScrollView>(null);
  const yearRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    if (showDatePicker) {
      setTempYear(selectedDate.getFullYear().toString());
      setTempMonth((selectedDate.getMonth() + 1).toString());
      setTempDay(selectedDate.getDate().toString());
      
      setTimeout(() => {
        const currentMonth = parseInt((selectedDate.getMonth() + 1).toString(), 10);
        const currentDay = selectedDate.getDate();
        const currentYear = selectedDate.getFullYear();
        
        monthRef.current?.scrollTo({ y: (currentMonth - 1) * 44, animated: false });
        dayRef.current?.scrollTo({ y: (currentDay - 1) * 44, animated: false });
        yearRef.current?.scrollTo({ y: (currentYear - 2000) * 44, animated: false });
      }, 100);
    }
  }, [showDatePicker, selectedDate]);

  React.useEffect(() => {
    if (showStartTimePicker) {
      let hours = startTime.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTempHour(hours.toString());
      setTempMinute(startTime.getMinutes().toString().padStart(2, '0'));
      setTempAMPM(ampm);
    }
  }, [showStartTimePicker, startTime]);

  React.useEffect(() => {
    if (showEndTimePicker) {
      let hours = endTime.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTempHour(hours.toString());
      setTempMinute(endTime.getMinutes().toString().padStart(2, '0'));
      setTempAMPM(ampm);
    }
  }, [showEndTimePicker, endTime]);

  const handleDateConfirm = () => {
    const year = parseInt(tempYear, 10);
    const month = parseInt(tempMonth, 10) - 1;
    const day = parseInt(tempDay, 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(year, month, day);
      setSelectedDate(newDate);
      
      const newStartTime = new Date(startTime);
      newStartTime.setFullYear(year, month, day);
      setStartTime(newStartTime);
      
      const newEndTime = new Date(endTime);
      newEndTime.setFullYear(year, month, day);
      setEndTime(newEndTime);
    }
    setShowDatePicker(false);
  };

  const handleTimeConfirm = (isStart: boolean) => {
    let hour = parseInt(tempHour, 10);
    const minute = parseInt(tempMinute, 10);
    if (!isNaN(hour) && !isNaN(minute)) {
      if (tempAMPM === 'PM' && hour !== 12) {
        hour += 12;
      } else if (tempAMPM === 'AM' && hour === 12) {
        hour = 0;
      }
      const newDate = new Date(isStart ? startTime : endTime);
      newDate.setHours(hour, minute, 0, 0);
      if (isStart) {
        setStartTime(newDate);
        setShowStartTimePicker(false);
      } else {
        setEndTime(newDate);
        setShowEndTimePicker(false);
      }
    } else {
      if (isStart) {
        setShowStartTimePicker(false);
      } else {
        setShowEndTimePicker(false);
      }
    }
  };

  const renderDatePicker = () => {
    if (!showDatePicker) return null;

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const years = Array.from({ length: 50 }, (_, i) => 2000 + i);

    return (
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.pickerCenterOverlay}>
          <Pressable
            testID="ios-date-picker-backdrop"
            style={styles.pickerBackdrop}
            onPress={() => setShowDatePicker(false)}
          />
          <View style={styles.pickerCenterContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={handleDateConfirm} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.datePickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.wheelPickersContainer}>
              <View style={styles.wheelPickerColumn}>
                <Text style={styles.wheelPickerLabel}>Month</Text>
                <View style={styles.wheelPickerWrapper}>
                  <View style={styles.wheelPickerHighlight} />
                  <ScrollView
                    ref={monthRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={44}
                    decelerationRate="fast"
                    onMomentumScrollEnd={(e) => {
                      const index = Math.round(e.nativeEvent.contentOffset.y / 44);
                      setTempMonth((index + 1).toString());
                    }}
                    contentContainerStyle={styles.wheelScrollContent}
                  >
                    {months.map((month) => (
                      <TouchableOpacity
                        key={month}
                        style={styles.wheelItem}
                        onPress={() => {
                          setTempMonth(month.toString());
                          monthRef.current?.scrollTo({ y: (month - 1) * 44, animated: true });
                        }}
                      >
                        <Text style={[styles.wheelItemText, tempMonth === month.toString() && styles.wheelItemTextActive]}>
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <View style={styles.wheelPickerColumn}>
                <Text style={styles.wheelPickerLabel}>Day</Text>
                <View style={styles.wheelPickerWrapper}>
                  <View style={styles.wheelPickerHighlight} />
                  <ScrollView
                    ref={dayRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={44}
                    decelerationRate="fast"
                    onMomentumScrollEnd={(e) => {
                      const index = Math.round(e.nativeEvent.contentOffset.y / 44);
                      setTempDay((index + 1).toString());
                    }}
                    contentContainerStyle={styles.wheelScrollContent}
                  >
                    {days.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={styles.wheelItem}
                        onPress={() => {
                          setTempDay(day.toString());
                          dayRef.current?.scrollTo({ y: (day - 1) * 44, animated: true });
                        }}
                      >
                        <Text style={[styles.wheelItemText, tempDay === day.toString() && styles.wheelItemTextActive]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <View style={[styles.wheelPickerColumn, { flex: 1.3 }]}>
                <Text style={styles.wheelPickerLabel}>Year</Text>
                <View style={styles.wheelPickerWrapper}>
                  <View style={styles.wheelPickerHighlight} />
                  <ScrollView
                    ref={yearRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={44}
                    decelerationRate="fast"
                    onMomentumScrollEnd={(e) => {
                      const index = Math.round(e.nativeEvent.contentOffset.y / 44);
                      setTempYear((2000 + index).toString());
                    }}
                    contentContainerStyle={styles.wheelScrollContent}
                  >
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={styles.wheelItem}
                        onPress={() => {
                          setTempYear(year.toString());
                          yearRef.current?.scrollTo({ y: (year - 2000) * 44, animated: true });
                        }}
                      >
                        <Text style={[styles.wheelItemText, tempYear === year.toString() && styles.wheelItemTextActive]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTimePicker = (visible: boolean, isStart: boolean, title: string) => {
    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => isStart ? setShowStartTimePicker(false) : setShowEndTimePicker(false)}
      >
        <View style={styles.iosPickerOverlay}>
          <Pressable
            testID={`ios-time-picker-backdrop-${isStart ? 'start' : 'end'}`}
            style={styles.iosPickerBackdrop}
            onPress={() => isStart ? setShowStartTimePicker(false) : setShowEndTimePicker(false)}
          />
          <View style={[styles.datePickerContainerIOS, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>{title}</Text>
              <TouchableOpacity onPress={() => handleTimeConfirm(isStart)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.datePickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeInputsRow}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.dateInputLabel}>Hour</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempHour}
                  onChangeText={setTempHour}
                  keyboardType="number-pad"
                  placeholder="12"
                  maxLength={2}
                />
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeInputGroup}>
                <Text style={styles.dateInputLabel}>Minute</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempMinute}
                  onChangeText={setTempMinute}
                  keyboardType="number-pad"
                  placeholder="00"
                  maxLength={2}
                />
              </View>
              <View style={styles.ampmContainer}>
                <TouchableOpacity
                  style={[styles.ampmButton, tempAMPM === 'AM' && styles.ampmButtonActive]}
                  onPress={() => setTempAMPM('AM')}
                >
                  <Text style={[styles.ampmText, tempAMPM === 'AM' && styles.ampmTextActive]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ampmButton, tempAMPM === 'PM' && styles.ampmButtonActive]}
                  onPress={() => setTempAMPM('PM')}
                >
                  <Text style={[styles.ampmText, tempAMPM === 'PM' && styles.ampmTextActive]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Animated.View style={[styles.calendarSidebar, { right: calendarSlideAnim }]}>
        <View style={[styles.calendarHeader, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.calendarTitle}>Calendar</Text>
          <TouchableOpacity onPress={toggleCalendar}>
            <X size={24} color={Colors.light.text} />
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
                accessibilityRole="button"
              >
                <X size={16} color={feedback.type === 'success' ? Colors.light.success : Colors.light.danger} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
              <ChevronLeft size={20} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{monthNames[currentMonth]} {currentYear}</Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
              <ChevronRight size={20} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarGrid}>
            <View style={styles.weekDaysRow}>
              {dayNames.map((day) => (
                <View key={day} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>
            
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day, dayIndex) => (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      isToday(day) && styles.todayCell,
                      isSelected(day) && styles.selectedDayCell,
                    ]}
                    onPress={() => handleDayPress(day)}
                    disabled={!day}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !day && styles.emptyDayText,
                        isToday(day) && styles.todayText,
                        isSelected(day) && styles.selectedDayText,
                      ]}
                    >
                      {day || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          
          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateLabel}>Selected Date</Text>
            <Text style={styles.selectedDateValue}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          
          <View style={styles.calendarEvents}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsTitle}>Events</Text>
              <TouchableOpacity 
                style={styles.newMeetingButton}
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
                  <Calendar size={32} color={Colors.light.textSecondary} />
                  <Text style={styles.emptyEventsText}>No events for this day</Text>
                  <TouchableOpacity 
                    style={styles.addEventButton}
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
                        onPress={() => handleDeleteEvent(event.id)}
                        style={styles.deleteEventButton}
                      >
                        <Trash2 size={20} color={Colors.light.danger} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.location && (
                      <View style={styles.eventLocation}>
                        <MapPin size={14} color={Colors.light.textSecondary} />
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

      <Modal
        visible={isNewMeetingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNewMeetingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.aiModalBackdrop}
            activeOpacity={1}
            onPress={() => setIsNewMeetingModalVisible(false)}
          />
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Meeting</Text>
              <TouchableOpacity onPress={() => setIsNewMeetingModalVisible(false)}>
                <X size={24} color={Colors.light.text} />
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
                  placeholderTextColor={Colors.light.textSecondary}
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
                    setShowDatePicker(true);
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Calendar size={16} color={Colors.light.primary} />
                  <Text style={styles.dateDisplayText}>
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <TouchableOpacity
                  style={styles.dateDisplay}
                  onPress={() => setShowStartTimePicker(true)}
                  activeOpacity={0.7}
                >
                  <Clock size={16} color={Colors.light.primary} />
                  <Text style={styles.dateDisplayText}>
                    {startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>End Time</Text>
                <TouchableOpacity
                  style={styles.dateDisplay}
                  onPress={() => setShowEndTimePicker(true)}
                  activeOpacity={0.7}
                >
                  <Clock size={16} color={Colors.light.primary} />
                  <Text style={styles.dateDisplayText}>
                    {endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
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
                    <Video size={18} color={meetingType === 'video' ? '#FFFFFF' : Colors.light.text} />
                    <Text style={[styles.meetingTypeText, meetingType === 'video' && styles.meetingTypeTextActive]}>Video Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.meetingTypeButton, meetingType === 'in-person' && styles.meetingTypeButtonActive]}
                    onPress={() => setMeetingType('in-person')}
                  >
                    <MapPin size={18} color={meetingType === 'in-person' ? '#FFFFFF' : Colors.light.text} />
                    <Text style={[styles.meetingTypeText, meetingType === 'in-person' && styles.meetingTypeTextActive]}>In Person</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder={meetingType === 'video' ? 'Zoom, Meet, etc.' : 'Meeting room or address'}
                  placeholderTextColor={Colors.light.textSecondary}
                  value={meetingLocation}
                  onChangeText={setMeetingLocation}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Meeting agenda or notes"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={meetingDescription}
                  onChangeText={setMeetingDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.createMeetingButton,
                !meetingTitle.trim() && styles.createMeetingButtonDisabled
              ]}
              onPress={handleCreateMeeting}
              disabled={!meetingTitle.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.createMeetingButtonText}>Create Meeting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderDatePicker()}
      {renderTimePicker(showStartTimePicker, true, 'Select Start Time')}
      {renderTimePicker(showEndTimePicker, false, 'Select End Time')}

      <Modal
        visible={Boolean(pendingDeleteEventId)}
        transparent
        animationType="fade"
        onRequestClose={cancelDeleteEvent}
      >
        <View style={styles.confirmOverlay}>
          <TouchableOpacity
            style={styles.confirmBackdrop}
            activeOpacity={1}
            onPress={cancelDeleteEvent}
          />
          <View style={[styles.confirmContent, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.confirmIcon}>
              <Trash2 size={24} color={Colors.light.danger} />
            </View>
            <Text style={styles.confirmTitle}>Delete meeting?</Text>
            <Text style={styles.confirmDescription}>{pendingDeleteEvent ? `"${pendingDeleteEvent.title}" scheduled for ${pendingDeleteEvent.time} on ${pendingDeleteEvent.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} will be removed` : 'This meeting will be removed permanently'}</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={cancelDeleteEvent}
                testID="cancel-delete-meeting"
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDeleteEvent}
                testID="confirm-delete-meeting"
              >
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  calendarButton: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  calendarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  calendarSidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '85%',
    backgroundColor: Colors.light.background,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
    zIndex: 1000,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  calendarTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  calendarContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 16,
    gap: 12,
  },
  feedbackBannerSuccess: {
    backgroundColor: '#E9F6EE',
  },
  feedbackBannerError: {
    backgroundColor: '#FDECEF',
  },
  feedbackIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  feedbackIndicatorSuccess: {
    backgroundColor: Colors.light.success,
  },
  feedbackIndicatorError: {
    backgroundColor: Colors.light.danger,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  feedbackTextSuccess: {
    color: Colors.light.success,
  },
  feedbackTextError: {
    color: Colors.light.danger,
  },
  feedbackDismiss: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.surface,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  calendarGrid: {
    marginBottom: 24,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  todayCell: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  selectedDayCell: {
    backgroundColor: Colors.light.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'center',
  },
  emptyDayText: {
    opacity: 0,
  },
  todayText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedDateInfo: {
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    marginBottom: 24,
  },
  selectedDateLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  selectedDateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  calendarEvents: {
    flex: 1,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  emptyEvents: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyEventsText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 12,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  newMeetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
  newMeetingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  eventTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTime: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  deleteEventButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  eventLocationText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  eventDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  addEventButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
  addEventButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  meetingTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  meetingTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  meetingTypeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  meetingTypeText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  meetingTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  confirmContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.light.surface,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  confirmIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFE9EA',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  confirmTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
  },
  confirmDescription: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  confirmCancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  confirmDeleteButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: Colors.light.danger,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  createMeetingButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  createMeetingButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  createMeetingButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  aiModalBackdrop: {
    flex: 1,
  },
  iosPickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  iosPickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  datePickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  datePickerContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: 400,
  },
  datePickerContainerIOS: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  dateTimePicker: {
    width: '100%',
    height: 200,
    backgroundColor: 'transparent',
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 20,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingVertical: 20,
  },
  dateInputGroup: {
    flex: 1,
  },
  timeInputGroup: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  ampmContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  ampmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: 60,
    alignItems: 'center',
  },
  ampmButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  ampmText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  ampmTextActive: {
    color: '#FFFFFF',
  },
  pickerCenterOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 24,
  },
  pickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pickerCenterContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.light.background,
    borderRadius: 24,
    padding: 20,
  },
  wheelPickersContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  wheelPickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  wheelPickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  wheelPickerWrapper: {
    height: 176,
    width: '100%',
    position: 'relative',
  },
  wheelPickerHighlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 44,
    marginTop: -22,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    zIndex: 1,
    pointerEvents: 'none',
  },
  wheelScrollContent: {
    paddingVertical: 66,
  },
  wheelItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#999999',
  },
  wheelItemTextActive: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
});
