import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Platform, TextInput, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft, ChevronRight, Plus, Video, MapPin, Trash2, Clock, ArrowLeft } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useCalendar } from '@/hooks/useCalendar';
import type { CalendarEvent } from '@/hooks/useCalendar';

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const calendar = useCalendar();

  const {
    selectedDate,
    setSelectedDate,
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
    handleCreateMeeting,
    handleDeleteEvent,
    cancelDeleteEvent,
    confirmDeleteEvent,
    getEventsForSelectedDate,
    feedback,
    clearFeedback,
  } = calendar;

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
    const week = days.slice(i, i + 7);
    // Pad the last week with null values to ensure it has 7 days
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
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
    }
  }, [showDatePicker, selectedDate]);

  React.useEffect(() => {
    if (showStartTimePicker) {
      const hour = startTime.getHours();
      const minute = startTime.getMinutes();
      setTempHour(((hour % 12) || 12).toString());
      setTempMinute(minute.toString().padStart(2, '0'));
      setTempAMPM(hour >= 12 ? 'PM' : 'AM');
    }
  }, [showStartTimePicker, startTime]);

  React.useEffect(() => {
    if (showEndTimePicker) {
      const hour = endTime.getHours();
      const minute = endTime.getMinutes();
      setTempHour(((hour % 12) || 12).toString());
      setTempMinute(minute.toString().padStart(2, '0'));
      setTempAMPM(hour >= 12 ? 'PM' : 'AM');
    }
  }, [showEndTimePicker, endTime]);

  const handleDateConfirm = () => {
    const year = parseInt(tempYear, 10);
    const month = parseInt(tempMonth, 10) - 1;
    const day = parseInt(tempDay, 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      setSelectedDate(new Date(year, month, day));
    }
    setShowDatePicker(false);
  };

  const handleStartTimeConfirm = () => {
    const hour = parseInt(tempHour, 10);
    const minute = parseInt(tempMinute, 10);
    if (!isNaN(hour) && !isNaN(minute)) {
      let adjustedHour = hour;
      if (tempAMPM === 'PM' && hour !== 12) {
        adjustedHour = hour + 12;
      } else if (tempAMPM === 'AM' && hour === 12) {
        adjustedHour = 0;
      }
      const newStartTime = new Date(selectedDate);
      newStartTime.setHours(adjustedHour, minute, 0, 0);
      setStartTime(newStartTime);
    }
    setShowStartTimePicker(false);
  };

  const handleEndTimeConfirm = () => {
    const hour = parseInt(tempHour, 10);
    const minute = parseInt(tempMinute, 10);
    if (!isNaN(hour) && !isNaN(minute)) {
      let adjustedHour = hour;
      if (tempAMPM === 'PM' && hour !== 12) {
        adjustedHour = hour + 12;
      } else if (tempAMPM === 'AM' && hour === 12) {
        adjustedHour = 0;
      }
      const newEndTime = new Date(selectedDate);
      newEndTime.setHours(adjustedHour, minute, 0, 0);
      setEndTime(newEndTime);
    }
    setShowEndTimePicker(false);
  };

  const eventsForSelectedDate = getEventsForSelectedDate();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.surface }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Calendar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: colors.text }]}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Day Names */}
        <View style={styles.dayNames}>
          {dayNames.map((name) => (
            <Text key={name} style={[styles.dayName, { color: colors.textSecondary }]}>
              {name}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => (
                <TouchableOpacity
                  key={dayIndex}
                  onPress={() => handleDayPress(day)}
                  style={[
                    styles.dayCell,
                    isToday(day) && { borderColor: colors.primary, borderWidth: 2 },
                    isSelected(day) && { backgroundColor: colors.primary },
                  ]}
                  disabled={!day}
                >
                  {day && (
                    <Text style={[
                      styles.dayText,
                      { color: isSelected(day) ? '#FFFFFF' : colors.text }
                    ]}>
                      {day}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

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
              <View key={event.id} style={[styles.eventCard, { backgroundColor: colors.background }]}>
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
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* New Meeting Modal */}
      <Modal
        visible={isNewMeetingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNewMeetingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Meeting</Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Meeting Title"
              placeholderTextColor={colors.textSecondary}
              value={meetingTitle}
              onChangeText={setMeetingTitle}
            />

            {/* Date selector */}
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.timeButton, { flex: 1, backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <Calendar size={16} color={colors.textSecondary} />
                <Text style={[styles.timeButtonText, { color: colors.text }]}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(true)}
                style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <Clock size={16} color={colors.textSecondary} />
                <Text style={[styles.timeButtonText, { color: colors.text }]}>
                  {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowEndTimePicker(true)}
                style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <Clock size={16} color={colors.textSecondary} />
                <Text style={[styles.timeButtonText, { color: colors.text }]}>
                  {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.meetingTypeRow}>
              <TouchableOpacity
                onPress={() => setMeetingType('in-person')}
                style={[
                  styles.meetingTypeButton,
                  { backgroundColor: meetingType === 'in-person' ? colors.primary : colors.background, borderColor: colors.border }
                ]}
              >
                <MapPin size={16} color={meetingType === 'in-person' ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.meetingTypeText, { color: meetingType === 'in-person' ? '#FFFFFF' : colors.text }]}>
                  In Person
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMeetingType('video')}
                style={[
                  styles.meetingTypeButton,
                  { backgroundColor: meetingType === 'video' ? colors.primary : colors.background, borderColor: colors.border }
                ]}
              >
                <Video size={16} color={meetingType === 'video' ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.meetingTypeText, { color: meetingType === 'video' ? '#FFFFFF' : colors.text }]}>
                  Video Call
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Location"
              placeholderTextColor={colors.textSecondary}
              value={meetingLocation}
              onChangeText={setMeetingLocation}
            />

            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textSecondary}
              value={meetingDescription}
              onChangeText={setMeetingDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsNewMeetingModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleCreateMeeting();
                  setIsNewMeetingModalVisible(false);
                }}
                style={[styles.modalButton, styles.primaryButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide" presentationStyle="overFullScreen">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Date</Text>
            <View style={[styles.timePicker, { height: 220 }]}>
              {/* Month */}
              <View style={styles.pickerColumn}>
                <ScrollView ref={monthRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScrollContent}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setTempMonth(m.toString())}
                      style={[styles.pickerItem, tempMonth === m.toString() && { backgroundColor: colors.primary + '20' }]}
                    >
                      <Text style={[styles.pickerItemText, { color: tempMonth === m.toString() ? colors.primary : colors.text }]}>
                        {new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'short' })}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Day */}
              <View style={styles.pickerColumn}>
                <ScrollView ref={dayRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScrollContent}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setTempDay(d.toString())}
                      style={[styles.pickerItem, tempDay === d.toString() && { backgroundColor: colors.primary + '20' }]}
                    >
                      <Text style={[styles.pickerItemText, { color: tempDay === d.toString() ? colors.primary : colors.text }]}>
                        {d.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Year */}
              <View style={styles.pickerColumn}>
                <ScrollView ref={yearRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScrollContent}>
                  {Array.from({ length: 10 }, (_, i) => selectedDate.getFullYear() - 5 + i).map((y) => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setTempYear(y.toString())}
                      style={[styles.pickerItem, tempYear === y.toString() && { backgroundColor: colors.primary + '20' }]}
                    >
                      <Text style={[styles.pickerItemText, { color: tempYear === y.toString() ? colors.primary : colors.text }]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={styles.pickerButtons}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={[styles.pickerButton, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDateConfirm}
                style={[styles.pickerButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.pickerButtonText, { color: '#FFFFFF' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Start Time Picker Modal */}
      <Modal visible={showStartTimePicker} transparent animationType="slide" presentationStyle="overFullScreen">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Start Time</Text>
            <View style={styles.timePicker}>
              <View style={styles.pickerColumn}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScrollContent}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      onPress={() => setTempHour(hour.toString())}
                      style={[
                        styles.pickerItem,
                        tempHour === hour.toString() && { backgroundColor: colors.primary + '20' }
                      ]}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: tempHour === hour.toString() ? colors.primary : colors.text }
                      ]}>
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <Text style={[styles.pickerSeparator, { color: colors.text }]}>:</Text>
              <View style={styles.pickerColumn}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScrollContent}>
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      onPress={() => setTempMinute(minute.toString().padStart(2, '0'))}
                      style={[
                        styles.pickerItem,
                        tempMinute === minute.toString().padStart(2, '0') && { backgroundColor: colors.primary + '20' }
                      ]}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: tempMinute === minute.toString().padStart(2, '0') ? colors.primary : colors.text }
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.pickerColumn}>
                <TouchableOpacity
                  onPress={() => setTempAMPM('AM')}
                  style={[
                    styles.pickerItem,
                    tempAMPM === 'AM' && { backgroundColor: colors.primary + '20' }
                  ]}
                >
                  <Text style={[
                    styles.pickerItemText,
                    { color: tempAMPM === 'AM' ? colors.primary : colors.text }
                  ]}>
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTempAMPM('PM')}
                  style={[
                    styles.pickerItem,
                    tempAMPM === 'PM' && { backgroundColor: colors.primary + '20' }
                  ]}
                >
                  <Text style={[
                    styles.pickerItemText,
                    { color: tempAMPM === 'PM' ? colors.primary : colors.text }
                  ]}>
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.pickerButtons}>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(false)}
                style={[styles.pickerButton, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleStartTimeConfirm}
                style={[styles.pickerButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.pickerButtonText, { color: '#FFFFFF' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* End Time Picker Modal */}
      <Modal visible={showEndTimePicker} transparent animationType="slide" presentationStyle="overFullScreen">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select End Time</Text>
            <View style={styles.timePicker}>
              <View style={styles.pickerColumn}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScrollContent}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      onPress={() => setTempHour(hour.toString())}
                      style={[
                        styles.pickerItem,
                        tempHour === hour.toString() && { backgroundColor: colors.primary + '20' }
                      ]}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: tempHour === hour.toString() ? colors.primary : colors.text }
                      ]}>
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <Text style={[styles.pickerSeparator, { color: colors.text }]}>:</Text>
              <View style={styles.pickerColumn}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerScrollContent}>
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      onPress={() => setTempMinute(minute.toString().padStart(2, '0'))}
                      style={[
                        styles.pickerItem,
                        tempMinute === minute.toString().padStart(2, '0') && { backgroundColor: colors.primary + '20' }
                      ]}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        { color: tempMinute === minute.toString().padStart(2, '0') ? colors.primary : colors.text }
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.pickerColumn}>
                <TouchableOpacity
                  onPress={() => setTempAMPM('AM')}
                  style={[
                    styles.pickerItem,
                    tempAMPM === 'AM' && { backgroundColor: colors.primary + '20' }
                  ]}
                >
                  <Text style={[
                    styles.pickerItemText,
                    { color: tempAMPM === 'AM' ? colors.primary : colors.text }
                  ]}>
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTempAMPM('PM')}
                  style={[
                    styles.pickerItem,
                    tempAMPM === 'PM' && { backgroundColor: colors.primary + '20' }
                  ]}
                >
                  <Text style={[
                    styles.pickerItemText,
                    { color: tempAMPM === 'PM' ? colors.primary : colors.text }
                  ]}>
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.pickerButtons}>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(false)}
                style={[styles.pickerButton, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEndTimeConfirm}
                style={[styles.pickerButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.pickerButtonText, { color: '#FFFFFF' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!pendingDeleteEventId}
        transparent
        animationType="fade"
        onRequestClose={cancelDeleteEvent}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={[styles.deleteModalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.deleteModalTitle, { color: colors.text }]}>Delete Event</Text>
            <Text style={[styles.deleteModalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to delete "{pendingDeleteEvent?.title}"?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                onPress={cancelDeleteEvent}
                style={[styles.deleteModalButton, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.deleteModalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDeleteEvent}
                style={[styles.deleteModalButton, { backgroundColor: colors.danger }]}
              >
                <Text style={[styles.deleteModalButtonText, { color: '#FFFFFF' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    navButton: {
      padding: 8,
    },
    monthText: {
      fontSize: 20,
      fontWeight: '600',
    },
    dayNames: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    dayName: {
      width: 40,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '600',
    },
    calendarGrid: {
      marginBottom: 30,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 8,
    },
    dayCell: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },
    dayText: {
      fontSize: 16,
    },
    eventsSection: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    eventsSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    eventsSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 16,
    },
    eventCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    eventContent: {
      flex: 1,
      flexDirection: 'row',
    },
    eventColorBar: {
      width: 4,
      borderRadius: 2,
      marginRight: 12,
    },
    eventDetails: {
      flex: 1,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    eventMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    eventTime: {
      marginLeft: 6,
      fontSize: 14,
    },
    eventLocation: {
      marginLeft: 6,
      fontSize: 14,
    },
    deleteButton: {
      padding: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 40,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 20,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    dateTimeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    timeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginHorizontal: 4,
    },
    timeButtonText: {
      marginLeft: 8,
      fontSize: 16,
    },
    meetingTypeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    meetingTypeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginHorizontal: 4,
    },
    meetingTypeText: {
      marginLeft: 8,
      fontSize: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    primaryButton: {
      // backgroundColor set dynamically
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    pickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    pickerContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 40,
    },
    pickerTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 20,
      textAlign: 'center',
    },
    timePicker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 200,
    },
    pickerColumn: {
      width: 80,
      height: 200,
    },
    pickerScrollContent: {
      paddingVertical: 80,
    },
    pickerItem: {
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginVertical: 2,
    },
    pickerItemText: {
      fontSize: 18,
      fontWeight: '500',
    },
    pickerSeparator: {
      fontSize: 24,
      fontWeight: '700',
      marginHorizontal: 8,
    },
    pickerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    pickerButton: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    pickerButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    deleteModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteModalContent: {
      width: '80%',
      borderRadius: 12,
      padding: 24,
    },
    deleteModalTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 12,
    },
    deleteModalMessage: {
      fontSize: 16,
      marginBottom: 24,
    },
    deleteModalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    deleteModalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    deleteModalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    feedbackToast: {
      position: 'absolute',
      left: 20,
      right: 20,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    feedbackText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

