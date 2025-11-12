import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Animated, Dimensions, BackHandler, Platform } from 'react-native';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  description: string;
  type: 'in-person' | 'video';
}

export type CalendarFeedback = {
  type: 'success' | 'error';
  message: string;
};

export function useCalendar() {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarSlideAnim = useState(new Animated.Value(Dimensions.get('window').width))[0];
  const [isNewMeetingModalVisible, setIsNewMeetingModalVisible] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingType, setMeetingType] = useState<'in-person' | 'video'>('video');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [pendingDeleteEventId, setPendingDeleteEventId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<CalendarFeedback | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFeedback = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    setFeedback(null);
  }, []);

  const showFeedback = useCallback(
    (type: CalendarFeedback['type'], message: string) => {
      clearFeedback();
      setFeedback({ type, message });
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
        feedbackTimeoutRef.current = null;
      }, 3200);
    },
    [clearFeedback],
  );

  const toggleCalendar = useCallback(() => {
    const toValue = isCalendarVisible ? Dimensions.get('window').width : 0;
    Animated.spring(calendarSlideAnim, {
      toValue,
      useNativeDriver: false,
      tension: 65,
      friction: 10,
    }).start();
    setIsCalendarVisible(!isCalendarVisible);
  }, [isCalendarVisible, calendarSlideAnim]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isCalendarVisible) {
        toggleCalendar();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isCalendarVisible, toggleCalendar]);

  useEffect(() => {
    return () => {
      clearFeedback();
    };
  }, [clearFeedback]);

  const handleCreateMeeting = () => {
    if (!meetingTitle.trim()) {
      showFeedback('error', 'Please enter a meeting title.');
      return;
    }

    if (endTime <= startTime) {
      showFeedback('error', 'End time must be after start time.');
      return;
    }

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const timeString = `${formatTime(startTime)} - ${formatTime(endTime)}`;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: meetingTitle,
      date: selectedDate,
      time: timeString,
      location: meetingLocation,
      description: meetingDescription,
      type: meetingType,
    };

    setEvents(prev => [...prev, newEvent]);
    showFeedback('success', 'Meeting created successfully.');

    setMeetingTitle('');
    setMeetingLocation('');
    setMeetingDescription('');
    setMeetingType('video');
    const resetStart = new Date(selectedDate);
    resetStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    const resetEnd = new Date(resetStart.getTime() + 60 * 60 * 1000);
    setStartTime(resetStart);
    setEndTime(resetEnd);
    setIsNewMeetingModalVisible(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
      }
    } else if (date) {
      setSelectedDate(date);
    }
  };

  const applySelectedDateToTime = useCallback(
    (time: Date, referenceDate: Date) => {
      const adjusted = new Date(referenceDate);
      adjusted.setHours(time.getHours(), time.getMinutes(), 0, 0);
      return adjusted;
    },
    [],
  );

  const handleStartTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    if (date) {
      setStartTime(applySelectedDateToTime(date, selectedDate));
    }
  };

  const handleEndTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    if (date) {
      setEndTime(applySelectedDateToTime(date, selectedDate));
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setPendingDeleteEventId(eventId);
  };

  const cancelDeleteEvent = useCallback(() => {
    setPendingDeleteEventId(null);
  }, []);

  const confirmDeleteEvent = useCallback(() => {
    if (!pendingDeleteEventId) {
      return;
    }
    setEvents(prev => prev.filter(e => e.id !== pendingDeleteEventId));
    setPendingDeleteEventId(null);
    showFeedback('success', 'Meeting deleted.');
  }, [pendingDeleteEventId, showFeedback]);

  const pendingDeleteEvent = useMemo(() => {
    if (!pendingDeleteEventId) {
      return undefined;
    }
    return events.find(event => event.id === pendingDeleteEventId);
  }, [events, pendingDeleteEventId]);

  const getEventsForSelectedDate = () => {
    return events.filter(event => {
      return (
        event.date.getDate() === selectedDate.getDate() &&
        event.date.getMonth() === selectedDate.getMonth() &&
        event.date.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  return {
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
    events,
    setEvents,
    pendingDeleteEventId,
    pendingDeleteEvent,
    toggleCalendar,
    handleCreateMeeting,
    handleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleDeleteEvent,
    cancelDeleteEvent,
    confirmDeleteEvent,
    getEventsForSelectedDate,
    feedback,
    clearFeedback,
  };
}
