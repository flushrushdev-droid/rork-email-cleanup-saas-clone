import { useState, useEffect, useCallback } from 'react';
import { Animated, Dimensions, BackHandler, Platform, Alert } from 'react-native';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  description: string;
  type: 'in-person' | 'video';
}

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

  const handleCreateMeeting = () => {
    if (!meetingTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter meeting title');
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
    Alert.alert('Success', 'Meeting created successfully!');
    
    setMeetingTitle('');
    setMeetingLocation('');
    setMeetingDescription('');
    setMeetingType('video');
    const now = new Date();
    setStartTime(now);
    setEndTime(new Date(now.getTime() + 60 * 60 * 1000));
    setIsNewMeetingModalVisible(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
      }
    } else {
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleStartTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    if (date) {
      setStartTime(date);
    }
  };

  const handleEndTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    if (date) {
      setEndTime(date);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setEvents(prev => prev.filter(e => e.id !== eventId)),
        },
      ]
    );
  };

  const getEventsForSelectedDate = () => {
    return events.filter(event => {
      return event.date.getDate() === selectedDate.getDate() &&
             event.date.getMonth() === selectedDate.getMonth() &&
             event.date.getFullYear() === selectedDate.getFullYear();
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
    toggleCalendar,
    handleCreateMeeting,
    handleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleDeleteEvent,
    getEventsForSelectedDate,
  };
}
