import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Platform, TextInput, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft, ChevronRight, Plus, Video, MapPin, Trash2, Clock, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    events,
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
  const MINUTE_STEP = 15;
  const ITEM_HEIGHT = 40; // must mirror styles.pickerItem.height
  const ITEM_MARGIN_V = 2; // must mirror styles.pickerItem.marginVertical
  const ROW_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN_V * 2;

  const buildTimes = React.useCallback(() => {
    const items: { label: string; hour24: number; minute: number }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += MINUTE_STEP) {
        const d = new Date(2000, 0, 1, h, m, 0, 0);
        const label = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        items.push({ label, hour24: h, minute: m });
      }
    }
    return items;
  }, []);
  const TIME_ITEMS = React.useMemo(buildTimes, [buildTimes]);

  React.useEffect(() => {
    if (showDatePicker) {
      setTempYear(selectedDate.getFullYear().toString());
      setTempMonth((selectedDate.getMonth() + 1).toString());
      setTempDay(selectedDate.getDate().toString());
      // Scroll each wheel to current selection
      requestAnimationFrame(() => {
        const mIndex = selectedDate.getMonth(); // 0-based
        const dIndex = selectedDate.getDate() - 1; // 0-based
        const startYear = selectedDate.getFullYear() - 5;
        const yIndex = selectedDate.getFullYear() - startYear;
        const PADDING_TOP = 80; // must mirror styles.pickerScrollContent.paddingVertical
        monthRef.current?.scrollTo({ y: PADDING_TOP + mIndex * ROW_HEIGHT, animated: false });
        dayRef.current?.scrollTo({ y: PADDING_TOP + dIndex * ROW_HEIGHT, animated: false });
        yearRef.current?.scrollTo({ y: PADDING_TOP + yIndex * ROW_HEIGHT, animated: false });
      });
    }
  }, [showDatePicker, selectedDate]);

  React.useEffect(() => {
    if (showStartTimePicker) {
      const hour = startTime.getHours();
      // Round minutes to nearest 15 for default position
      const minute = Math.round(startTime.getMinutes() / MINUTE_STEP) * MINUTE_STEP;
      setTempHour(((hour % 12) || 12).toString());
      setTempMinute((minute % 60).toString().padStart(2, '0'));
      setTempAMPM(hour >= 12 ? 'PM' : 'AM');
    }
  }, [showStartTimePicker, startTime]);

  React.useEffect(() => {
    if (showEndTimePicker) {
      const hour = endTime.getHours();
      const minute = Math.round(endTime.getMinutes() / MINUTE_STEP) * MINUTE_STEP;
      setTempHour(((hour % 12) || 12).toString());
      setTempMinute((minute % 60).toString().padStart(2, '0'));
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
    if (Platform.OS === 'ios') {
      setIsNewMeetingModalVisible(true);
    }
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
      // snap to 15-min grid
      const snapped = Math.round(minute / MINUTE_STEP) * MINUTE_STEP;
      newStartTime.setHours(adjustedHour, snapped % 60, 0, 0);
      setStartTime(newStartTime);
    }
    setShowStartTimePicker(false);
    if (Platform.OS === 'ios') {
      setIsNewMeetingModalVisible(true);
    }
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
      const snapped = Math.round(minute / MINUTE_STEP) * MINUTE_STEP;
      newEndTime.setHours(adjustedHour, snapped % 60, 0, 0);
      setEndTime(newEndTime);
    }
    setShowEndTimePicker(false);
    if (Platform.OS === 'ios') {
      setIsNewMeetingModalVisible(true);
    }
  };

  const eventsForSelectedDate = getEventsForSelectedDate();
  // no-op placeholder removed
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Inline Note Editor (for note-sourced events)
  const [isNoteEditVisible, setIsNoteEditVisible] = React.useState(false);
  const [noteEditId, setNoteEditId] = React.useState<string | null>(null);
  const [noteTitle, setNoteTitle] = React.useState('');
  const [noteContent, setNoteContent] = React.useState('');
  const NOTES_KEY = 'notes-storage-v1';
  // temp date/time for note due
  const [noteYear, setNoteYear] = React.useState<number>(new Date().getFullYear());
  const [noteMonth, setNoteMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [noteDay, setNoteDay] = React.useState<number>(new Date().getDate());
  const [noteHour12, setNoteHour12] = React.useState<string>('12');
  const [noteMinute, setNoteMinute] = React.useState<string>('00');
  const [noteAMPM, setNoteAMPM] = React.useState<'AM' | 'PM'>('PM');
  const [showNoteDatePicker, setShowNoteDatePicker] = React.useState(false);
  const [showNoteTimePicker, setShowNoteTimePicker] = React.useState(false);

  const openInlineNoteEditor = async (event: any) => {
    try {
      setNoteEditId(event.noteId || null);
      let title = event.title || '';
      let content = event.description || '';
      // initialize temp date/time from event start
      const s = new Date(event.startTime || Date.now());
      setNoteYear(s.getFullYear());
      setNoteMonth(s.getMonth() + 1);
      setNoteDay(s.getDate());
      setNoteHour12(((s.getHours() % 12) || 12).toString());
      setNoteMinute(s.getMinutes().toString().padStart(2, '0'));
      setNoteAMPM(s.getHours() >= 12 ? 'PM' : 'AM');
      if (event.noteId) {
        const raw = await AsyncStorage.getItem(NOTES_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as any[];
          const existing = parsed.find((n) => n.id === event.noteId);
          if (existing) {
            title = existing.title ?? title;
            content = existing.content ?? content;
          }
        }
      }
      setNoteTitle(title);
      setNoteContent(content);
      setIsNoteEditVisible(true);
    } catch {
      setNoteTitle(event.title || '');
      setNoteContent(event.description || '');
      setIsNoteEditVisible(true);
    }
  };

  const saveInlineNote = async () => {
    try {
      // build due date from temp fields
      const hour24 =
        noteAMPM === 'PM' ? ((parseInt(noteHour12, 10) % 12) + 12) : (parseInt(noteHour12, 10) % 12);
      const due = new Date(noteYear, noteMonth - 1, noteDay, hour24, parseInt(noteMinute, 10), 0, 0);

      const raw = await AsyncStorage.getItem(NOTES_KEY);
      let list: any[] = raw ? JSON.parse(raw) : [];
      if (noteEditId) {
        list = list.map((n) =>
          n.id === noteEditId ? { ...n, title: noteTitle, content: noteContent, dueDate: due.toISOString(), updatedAt: new Date().toISOString() } : n,
        );
      } else {
        const newId = Date.now().toString();
        list = [{ id: newId, title: noteTitle, content: noteContent, dueDate: due.toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...list];
        setNoteEditId(newId);
      }
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(list));

      // Reflect updates in events list (title/description)
      setEvents((prev) =>
        prev.map((e) =>
          e.source === 'note' && (e.noteId === noteEditId || (!e.noteId && noteEditId))
            ? {
                ...e,
                title: noteTitle,
                description: noteContent,
                date: new Date(due),
                startTime: new Date(due),
                endTime: new Date(due.getTime() + 60 * 60 * 1000),
                time: due.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              }
            : e,
        ),
      );
    } catch {}
    setIsNoteEditVisible(false);
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
                    <>
                      <Text style={[
                        styles.dayText,
                        { color: isSelected(day) ? '#FFFFFF' : colors.text }
                      ]}>
                        {day}
                      </Text>
                      {/* Event dot indicator */}
                      {events.some(e =>
                        e.date.getFullYear() === currentYear &&
                        e.date.getMonth() === currentMonth &&
                        e.date.getDate() === day
                      ) && (
                        <View style={{ position: 'absolute', bottom: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: isSelected(day) ? '#FFFFFF' : colors.primary }} />
                      )}
                    </>
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
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, { backgroundColor: colors.background }]}
                onPress={() => {
                  if (event.source === 'note') {
                    openInlineNoteEditor(event);
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
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    setIsNewMeetingModalVisible(false);
                    requestAnimationFrame(() => setShowDatePicker(true));
                  } else {
                    setShowDatePicker(true);
                  }
                }}
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
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    setIsNewMeetingModalVisible(false);
                    requestAnimationFrame(() => setShowStartTimePicker(true));
                  } else {
                    setShowStartTimePicker(true);
                  }
                }}
                style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <Clock size={16} color={colors.textSecondary} />
                <Text style={[styles.timeButtonText, { color: colors.text }]}>
                  {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    setIsNewMeetingModalVisible(false);
                    requestAnimationFrame(() => setShowEndTimePicker(true));
                  } else {
                    setShowEndTimePicker(true);
                  }
                }}
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

      {/* Inline Note Edit Modal */}
      <Modal visible={isNoteEditVisible} transparent animationType="slide" presentationStyle="overFullScreen">
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
                  onPress={() => setShowNoteDatePicker(true)}
                >
                  <Calendar size={16} color={colors.textSecondary} />
                  <Text style={[styles.timeButtonText, { color: colors.text }]}>
                    {new Date(noteYear, noteMonth - 1, noteDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border, flex: 1 }]}
                  onPress={() => setShowNoteTimePicker(true)}
                >
                  <Clock size={16} color={colors.textSecondary} />
                  <Text style={[styles.timeButtonText, { color: colors.text }]}>
                    {(() => {
                      const h24 = noteAMPM === 'PM' ? ((parseInt(noteHour12, 10) % 12) + 12) : (parseInt(noteHour12, 10) % 12);
                      const d = new Date(2000, 0, 1, h24, parseInt(noteMinute, 10));
                      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    })()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.pickerButtons}>
              <TouchableOpacity onPress={() => setIsNoteEditVisible(false)} style={[styles.pickerButton, { backgroundColor: colors.background }]}>
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveInlineNote} style={[styles.pickerButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.pickerButtonText, { color: '#FFFFFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Note Due Date Picker */}
      <Modal visible={showNoteDatePicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Date</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 }}>
              <TouchableOpacity onPress={() => { let m = noteMonth - 1, y = noteYear; if (m <= 0) { m = 12; y -= 1; } setNoteMonth(m); setNoteYear(y); }} style={styles.navButton}>
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.monthText, { color: colors.text }]}>{new Date(noteYear, noteMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</Text>
              <TouchableOpacity onPress={() => { let m = noteMonth + 1, y = noteYear; if (m > 12) { m = 1; y += 1; } setNoteMonth(m); setNoteYear(y); }} style={styles.navButton}>
                <ChevronRight size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, marginBottom: 6 }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <Text key={`${d}-${i}`} style={{ width: 36, textAlign: 'center', color: colors.textSecondary }}>{d}</Text>
              ))}
            </View>
            <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
              {(() => {
                const first = new Date(noteYear, noteMonth - 1, 1);
                const last = new Date(noteYear, noteMonth, 0);
                const startPad = first.getDay();
                const total = startPad + last.getDate();
                const days = Array.from({ length: Math.ceil(total / 7) * 7 }, (_, i) => i - startPad + 1);
                const rows = []; for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
                return rows.map((row, rIdx) => (
                  <View key={rIdx} style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 }}>
                    {row.map((d, cIdx) => {
                      const valid = d > 0 && d <= last.getDate();
                      const selected = valid && d === noteDay;
                      return (
                        <TouchableOpacity key={`${rIdx}-${cIdx}`} disabled={!valid} onPress={() => setNoteDay(d)} style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, selected && { backgroundColor: colors.primary + '33' }, !valid && { opacity: 0 }]}>
                          {valid && <Text style={{ color: selected ? colors.primary : colors.text }}>{d}</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ));
              })()}
            </View>
            <View style={styles.pickerButtons}>
              <TouchableOpacity onPress={() => setShowNoteDatePicker(false)} style={[styles.pickerButton, { backgroundColor: colors.background }]}>
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowNoteDatePicker(false)} style={[styles.pickerButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.pickerButtonText, { color: '#FFFFFF' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Note Time Picker */}
      <Modal visible={showNoteTimePicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Time</Text>
            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingVertical: 8 }}>
              {Array.from({ length: (24 * 60) / 15 }, (_, i) => i * 15).map((m) => {
                const hour24 = Math.floor(m / 60);
                const minute = m % 60;
                const label = new Date(2000, 0, 1, hour24, minute).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                const h12 = ((hour24 % 12) || 12).toString();
                const ampm = hour24 >= 12 ? 'PM' : 'AM';
                const selected = h12 === noteHour12 && noteMinute === minute.toString().padStart(2, '0') && ampm === noteAMPM;
                return (
                  <TouchableOpacity key={`${hour24}:${minute}`} onPress={() => { setNoteHour12(h12); setNoteMinute(minute.toString().padStart(2, '0')); setNoteAMPM(ampm); }} style={[styles.pickerItem, { marginHorizontal: 16 }, selected && { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.pickerItemText, { color: selected ? colors.primary : colors.text }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.pickerButtons}>
              <TouchableOpacity onPress={() => setShowNoteTimePicker(false)} style={[styles.pickerButton, { backgroundColor: colors.background }]}>
                <Text style={[styles.pickerButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowNoteTimePicker(false)} style={[styles.pickerButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.pickerButtonText, { color: '#FFFFFF' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal - Grid UI */}
      <Modal visible={showDatePicker} transparent animationType="slide" presentationStyle="overFullScreen">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: colors.border + '80', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: -4 } }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Date</Text>
            {/* Month header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 }}>
              <TouchableOpacity onPress={() => {
                let m = parseInt(tempMonth, 10) - 2; // convert to 0-based and decrement
                let y = parseInt(tempYear, 10);
                if (m < 0) { m = 11; y -= 1; }
                setTempMonth((m + 1).toString());
                setTempYear(y.toString());
              }} style={styles.navButton}>
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.monthText, { color: colors.text }]}>
                {new Date(parseInt(tempYear, 10), parseInt(tempMonth, 10) - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => {
                let m = parseInt(tempMonth, 10); // 1-based
                let y = parseInt(tempYear, 10);
                if (m >= 12) { m = 1; y += 1; } else { m += 1; }
                setTempMonth(m.toString());
                setTempYear(y.toString());
              }} style={styles.navButton}>
                <ChevronRight size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            {/* Day names */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, marginBottom: 6 }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <Text key={`${d}-${i}`} style={{ width: 36, textAlign: 'center', color: colors.textSecondary }}>{d}</Text>
              ))}
            </View>
            {/* Grid */}
            <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
              {(() => {
                const year = parseInt(tempYear, 10);
                const monthIdx = parseInt(tempMonth, 10) - 1;
                const first = new Date(year, monthIdx, 1);
                const last = new Date(year, monthIdx + 1, 0);
                const startPad = first.getDay();
                const total = startPad + last.getDate();
                const days = Array.from({ length: Math.ceil(total / 7) * 7 }, (_, i) => i - startPad + 1);
                const rows = [];
                for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
                const selDayNum = parseInt(tempDay, 10);
                const today = new Date();
                const isTodayMonth = today.getFullYear() === year && today.getMonth() === monthIdx;
                const hasEvent = (d: number) => {
                  // count events for that date
                  const target = new Date(year, monthIdx, d);
                  return events.some(e =>
                    e.date.getFullYear() === target.getFullYear() &&
                    e.date.getMonth() === target.getMonth() &&
                    e.date.getDate() === target.getDate()
                  );
                };
                return rows.map((row, rIdx) => (
                  <View key={rIdx} style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 }}>
                    {row.map((d, cIdx) => {
                      const valid = d > 0 && d <= last.getDate();
                      const isSelected = valid && d === selDayNum;
                      const isTodayCell = valid && isTodayMonth && d === today.getDate();
                      return (
                        <TouchableOpacity
                          key={`${rIdx}-${cIdx}`}
                          disabled={!valid}
                          onPress={() => setTempDay(d.toString())}
                          style={[
                            { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
                            isSelected && { backgroundColor: colors.primary + '33' },
                            isTodayCell && !isSelected && { borderWidth: 1, borderColor: colors.primary },
                            !valid && { opacity: 0 },
                          ]}
                        >
                          {valid && (
                            <>
                              <Text style={{ color: isSelected ? colors.primary : colors.text }}>{d}</Text>
                              {hasEvent(d) && (
                                <View style={{ position: 'absolute', bottom: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
                              )}
                            </>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ));
              })()}
            </View>
            <View style={styles.pickerButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowDatePicker(false);
                  if (Platform.OS === 'ios') setIsNewMeetingModalVisible(true);
                }}
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

      {/* Start Time Picker Modal (15-min list) */}
      <Modal visible={showStartTimePicker} transparent animationType="slide" presentationStyle="overFullScreen">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Start Time</Text>
            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingVertical: 8 }}>
              {TIME_ITEMS.map((t) => {
                const currentHour = parseInt(tempHour, 10);
                const hour12 = ((t.hour24 % 12) || 12).toString();
                const ampm = t.hour24 >= 12 ? 'PM' : 'AM';
                const selected = hour12 === tempHour && t.minute.toString().padStart(2, '0') === tempMinute && ampm === tempAMPM;
                return (
                  <TouchableOpacity
                    key={`${t.hour24}:${t.minute}`}
                    onPress={() => {
                      setTempHour(hour12);
                      setTempMinute(t.minute.toString().padStart(2, '0'));
                      setTempAMPM(ampm);
                    }}
                    style={[styles.pickerItem, { marginHorizontal: 16 }, selected && { backgroundColor: colors.primary + '20' }]}
                  >
                    <Text style={[styles.pickerItemText, { color: selected ? colors.primary : colors.text }]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.pickerButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowStartTimePicker(false);
                  if (Platform.OS === 'ios') setIsNewMeetingModalVisible(true);
                }}
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

      {/* End Time Picker Modal (15-min list + duration presets) */}
      <Modal visible={showEndTimePicker} transparent animationType="slide" presentationStyle="overFullScreen">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select End Time</Text>
            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingVertical: 8 }}>
              {TIME_ITEMS.map((t) => {
                const hour12 = ((t.hour24 % 12) || 12).toString();
                const ampm = t.hour24 >= 12 ? 'PM' : 'AM';
                const selected = hour12 === tempHour && t.minute.toString().padStart(2, '0') === tempMinute && ampm === tempAMPM;
                return (
                  <TouchableOpacity
                    key={`${t.hour24}:${t.minute}`}
                    onPress={() => {
                      setTempHour(hour12);
                      setTempMinute(t.minute.toString().padStart(2, '0'));
                      setTempAMPM(ampm);
                    }}
                    style={[styles.pickerItem, { marginHorizontal: 16 }, selected && { backgroundColor: colors.primary + '20' }]}
                  >
                    <Text style={[styles.pickerItemText, { color: selected ? colors.primary : colors.text }]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Quick duration presets */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingTop: 8 }}>
              {[30, 45, 60, 90, 120].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  onPress={() => {
                    const newEnd = new Date(startTime);
                    newEnd.setMinutes(startTime.getMinutes() + mins);
                    setTempHour((((newEnd.getHours() % 12) || 12)).toString());
                    setTempMinute((Math.round(newEnd.getMinutes() / MINUTE_STEP) * MINUTE_STEP % 60).toString().padStart(2, '0'));
                    setTempAMPM(newEnd.getHours() >= 12 ? 'PM' : 'AM');
                  }}
                  style={[styles.pickerChip, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.text }}>{mins < 60 ? `${mins} mins` : `${mins / 60} hr${mins === 60 ? '' : 's'}`}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.pickerButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowEndTimePicker(false);
                  if (Platform.OS === 'ios') setIsNewMeetingModalVisible(true);
                }}
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
    pickerChip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
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

