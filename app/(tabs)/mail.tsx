import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, BackHandler, Animated, Dimensions, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Mail, Inbox, Send, Archive, Trash2, Star, Search, PenSquare, ChevronLeft, Paperclip, X, FolderOpen, AlertCircle, Receipt, ShoppingBag, Plane, Tag, Users, ChevronRight, FileText, Briefcase, Scale, Plus, Clock, AlertOctagon, FileEdit, MailOpen, Filter, Calendar, Sparkles, ChevronDown, Video, MapPin, Bell, Save } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { mockRecentEmails, mockSmartFolders } from '@/mocks/emailData';
import Colors from '@/constants/colors';
import type { EmailMessage, Email, EmailCategory } from '@/constants/types';

type MailView = 'inbox' | 'compose' | 'detail' | 'folders' | 'folder-detail';
type MailFolder = 'inbox' | 'sent' | 'archived' | 'starred' | 'unread' | 'drafts' | 'spam' | 'trash' | 'important' | 'snoozed';

const iconMap: Record<string, any> = {
  'alert-circle': AlertCircle,
  'receipt': Receipt,
  'shopping-bag': ShoppingBag,
  'plane': Plane,
  'tag': Tag,
  'users': Users,
  'file-text': FileText,
  'briefcase': Briefcase,
  'scale': Scale,
};

const categoryKeywords: Record<EmailCategory, string[]> = {
  invoices: ['invoice', 'bill', 'payment', 'billing', 'charge'],
  receipts: ['receipt', 'order confirmation', 'purchase', 'transaction'],
  travel: ['flight', 'hotel', 'booking', 'reservation', 'trip', 'travel'],
  hr: ['hr', 'human resources', 'benefits', 'payroll', 'pto', 'time off'],
  legal: ['legal', 'contract', 'agreement', 'terms', 'policy'],
  personal: ['personal', 'family', 'friend'],
  promotions: ['sale', 'discount', 'offer', 'deal', 'promo', 'marketing'],
  social: ['linkedin', 'facebook', 'twitter', 'instagram', 'notification'],
  system: ['alert', 'security', 'notification', 'update', 'reminder'],
};

function categorizeEmail(email: EmailMessage | Email): EmailCategory | undefined {
  const searchText = `${email.subject} ${email.snippet} ${email.from}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return category as EmailCategory;
    }
  }
  
  return undefined;
}

export default function MailScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode } = useAuth();
  const { messages, markAsRead, archiveMessage } = useGmailSync();
  const [currentView, setCurrentView] = useState<MailView>('inbox');
  const [currentFolder, setCurrentFolder] = useState<MailFolder>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [starredEmails, setStarredEmails] = useState<Set<string>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string; color: string; category?: EmailCategory } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>('');
  const [folderRule, setFolderRule] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'starred' | 'drafts' | 'trash' | 'sent'>('all');
  const [drafts, setDrafts] = useState<Array<{
    id: string;
    to: string;
    cc?: string;
    subject: string;
    body: string;
    date: Date;
  }>>([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarSlideAnim = useState(new Animated.Value(Dimensions.get('window').width))[0];
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [aiFormat, setAiFormat] = useState('professional');
  const [aiTone, setAiTone] = useState('friendly');
  const [aiLength, setAiLength] = useState('medium');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [showLengthDropdown, setShowLengthDropdown] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isNewMeetingModalVisible, setIsNewMeetingModalVisible] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingType, setMeetingType] = useState<'in-person' | 'video'>('video');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [events, setEvents] = useState<Array<{
    id: string;
    title: string;
    date: Date;
    time: string;
    location: string;
    description: string;
    type: 'in-person' | 'video';
  }>>([]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isCalendarVisible) {
        toggleCalendar();
        return true;
      }
      if (currentView === 'detail') {
        setCurrentView('inbox');
        return true;
      }
      if (currentView === 'compose') {
        setCurrentView('inbox');
        return true;
      }
      if (currentView === 'folder-detail') {
        setCurrentView('folders');
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [currentView, isCalendarVisible]);

  const allEmails = useMemo(() => {
    const emails = isDemoMode || messages.length === 0 
      ? mockRecentEmails.map(email => ({
          ...email,
          isStarred: starredEmails.has(email.id),
          category: categorizeEmail(email),
        }))
      : messages.map((msg: Email): EmailMessage => {
          const email = {
            id: msg.id,
            threadId: msg.threadId || msg.id,
            from: msg.from,
            to: msg.to,
            subject: msg.subject,
            snippet: msg.snippet,
            date: new Date(msg.date),
            size: msg.sizeBytes || 0,
            labels: msg.labels,
            tags: [],
            hasAttachments: msg.hasAttachments || false,
            attachmentCount: 0,
            isRead: msg.isRead,
            isStarred: starredEmails.has(msg.id),
            priority: undefined,
            confidence: 1,
            category: undefined as EmailCategory | undefined,
          };
          email.category = categorizeEmail(email);
          return email;
        });

    return emails;
  }, [isDemoMode, messages, starredEmails]);

  const filteredEmails = useMemo(() => {
    let filtered = allEmails;

    if (currentView === 'folder-detail' && selectedFolder) {
      if (selectedFolder.name === 'Action Required') {
        filtered = filtered.filter((email: EmailMessage) => 
          email.priority === 'action' || 
          email.subject.toLowerCase().includes('action required') ||
          email.subject.toLowerCase().includes('urgent')
        );
      } else if (selectedFolder.category) {
        filtered = filtered.filter((email: EmailMessage) => email.category === selectedFolder.category);
      }
    } else {
      switch (currentFolder) {
        case 'unread':
          filtered = filtered.filter((email: EmailMessage) => !email.isRead);
          break;
        case 'starred':
          filtered = filtered.filter((email: EmailMessage) => starredEmails.has(email.id));
          break;
        case 'important':
          filtered = filtered.filter((email: EmailMessage) => 
            email.labels.includes('IMPORTANT') || 
            email.priority === 'action' ||
            email.subject.toLowerCase().includes('urgent')
          );
          break;
        case 'snoozed':
          filtered = [];
          break;
        case 'sent':
          filtered = [];
          break;
        case 'drafts':
          filtered = [];
          break;
        case 'spam':
          filtered = [];
          break;
        case 'trash':
          filtered = [];
          break;
        case 'archived':
          filtered = [];
          break;
        default:
          filtered = filtered.filter((email: EmailMessage) => email.labels.includes('inbox') || email.labels.includes('INBOX'));
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((email: EmailMessage) =>
        email.subject.toLowerCase().includes(query) ||
        email.from.toLowerCase().includes(query) ||
        email.snippet.toLowerCase().includes(query)
      );
    }

    if (currentView === 'inbox') {
      switch (activeFilter) {
        case 'unread':
          filtered = filtered.filter((email: EmailMessage) => !email.isRead);
          break;
        case 'starred':
          filtered = filtered.filter((email: EmailMessage) => starredEmails.has(email.id));
          break;
        case 'drafts':
          filtered = [];
          break;
        case 'trash':
          filtered = [];
          break;
        case 'sent':
          filtered = [];
          break;
        default:
          break;
      }
    }

    return filtered.sort((a: EmailMessage, b: EmailMessage) => b.date.getTime() - a.date.getTime());
  }, [allEmails, currentFolder, currentView, selectedFolder, searchQuery, starredEmails, activeFilter]);

  const handleEmailPress = (email: EmailMessage) => {
    setSelectedEmail(email);
    setCurrentView('detail');
    
    if (!email.isRead && !isDemoMode) {
      markAsRead(email.id).catch(() => {
        console.error('Failed to mark as read');
      });
    }
  };

  const handleCompose = () => {
    setComposeTo('');
    setComposeCc('');
    setComposeSubject('');
    setComposeBody('');
    setCurrentView('compose');
  };

  const handleSaveDraft = () => {
    if (!composeTo && !composeSubject && !composeBody) {
      Alert.alert('Error', 'Draft is empty');
      return;
    }

    const newDraft = {
      id: Date.now().toString(),
      to: composeTo,
      cc: composeCc,
      subject: composeSubject,
      body: composeBody,
      date: new Date(),
    };

    setDrafts(prev => [newDraft, ...prev]);
    Alert.alert('Success', 'Draft saved successfully');
    setCurrentView('inbox');
    setActiveFilter('drafts');
  };

  const handleLoadDraft = (draft: typeof drafts[0]) => {
    setComposeTo(draft.to);
    setComposeCc(draft.cc || '');
    setComposeSubject(draft.subject);
    setComposeBody(draft.body);
    setCurrentView('compose');
    setDrafts(prev => prev.filter(d => d.id !== draft.id));
  };

  const handleDeleteDraft = (draftId: string) => {
    Alert.alert(
      'Delete Draft',
      'Are you sure you want to delete this draft?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setDrafts(prev => prev.filter(d => d.id !== draftId)),
        },
      ]
    );
  };

  const handleSend = () => {
    if (!composeTo || !composeSubject) {
      Alert.alert('Error', 'Please fill in recipient and subject');
      return;
    }

    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Email sending is disabled in demo mode');
      setCurrentView('inbox');
      return;
    }

    Alert.alert('Success', 'Email sent successfully!');
    setCurrentView('inbox');
  };

  const handleArchive = async (email: EmailMessage) => {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Archive is disabled in demo mode');
      return;
    }

    try {
      await archiveMessage(email.id);
      Alert.alert('Success', 'Email archived');
      setCurrentView('inbox');
    } catch {
      Alert.alert('Error', 'Failed to archive email');
    }
  };

  const handleStar = (emailId: string) => {
    setStarredEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !folderRule.trim()) {
      Alert.alert('Missing Information', 'Please enter both folder name and rule');
      return;
    }

    setIsCreating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Creating folder:', { folderName, folderRule });
      
      Alert.alert('Success', `Folder "${folderName}" created successfully!`);
      
      setIsModalVisible(false);
      setFolderName('');
      setFolderRule('');
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Error', 'Failed to create folder. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const smartFolders = useMemo(() => {
    if (isDemoMode || messages.length === 0) {
      return mockSmartFolders;
    }

    const actionRequiredEmails = messages.filter(email => 
      email.labels.includes('IMPORTANT') || 
      email.subject.toLowerCase().includes('action required') ||
      email.subject.toLowerCase().includes('urgent')
    );

    const categoryCounts = new Map<EmailCategory, number>();
    allEmails.forEach(email => {
      if (email.category) {
        categoryCounts.set(email.category, (categoryCounts.get(email.category) || 0) + 1);
      }
    });

    return [
      {
        id: '1',
        name: 'Action Required',
        icon: 'alert-circle',
        color: '#FF3B30',
        query: 'priority:action',
        count: actionRequiredEmails.length,
      },
      {
        id: '2',
        name: 'Invoices',
        icon: 'receipt',
        color: '#FF9500',
        query: 'category:invoices',
        count: categoryCounts.get('invoices') || 0,
        category: 'invoices' as EmailCategory,
      },
      {
        id: '3',
        name: 'Receipts',
        icon: 'shopping-bag',
        color: '#34C759',
        query: 'category:receipts',
        count: categoryCounts.get('receipts') || 0,
        category: 'receipts' as EmailCategory,
      },
      {
        id: '4',
        name: 'Travel',
        icon: 'plane',
        color: '#5AC8FA',
        query: 'category:travel',
        count: categoryCounts.get('travel') || 0,
        category: 'travel' as EmailCategory,
      },
      {
        id: '5',
        name: 'Promotions',
        icon: 'tag',
        color: '#FFCC00',
        query: 'category:promotions',
        count: categoryCounts.get('promotions') || 0,
        category: 'promotions' as EmailCategory,
      },
      {
        id: '6',
        name: 'Social',
        icon: 'users',
        color: '#FF6482',
        query: 'category:social',
        count: categoryCounts.get('social') || 0,
        category: 'social' as EmailCategory,
      },
      {
        id: '7',
        name: 'HR',
        icon: 'briefcase',
        color: '#5856D6',
        query: 'category:hr',
        count: categoryCounts.get('hr') || 0,
        category: 'hr' as EmailCategory,
      },
      {
        id: '8',
        name: 'Legal',
        icon: 'scale',
        color: '#FF2D55',
        query: 'category:legal',
        count: categoryCounts.get('legal') || 0,
        category: 'legal' as EmailCategory,
      },
      {
        id: '9',
        name: 'System',
        icon: 'alert-circle',
        color: '#8E8E93',
        query: 'category:system',
        count: categoryCounts.get('system') || 0,
        category: 'system' as EmailCategory,
      },
    ].filter(folder => folder.count > 0);
  }, [messages, allEmails, isDemoMode]);

  const toggleCalendar = () => {
    const toValue = isCalendarVisible ? Dimensions.get('window').width : 0;
    Animated.spring(calendarSlideAnim, {
      toValue,
      useNativeDriver: false,
      tension: 65,
      friction: 10,
    }).start();
    setIsCalendarVisible(!isCalendarVisible);
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (hours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleCreateMeeting = () => {
    if (!meetingTitle.trim() || !meetingTime.trim()) {
      Alert.alert('Missing Information', 'Please enter meeting title and time');
      return;
    }

    const newEvent = {
      id: Date.now().toString(),
      title: meetingTitle,
      date: selectedDate,
      time: meetingTime,
      location: meetingLocation,
      description: meetingDescription,
      type: meetingType,
    };

    setEvents(prev => [...prev, newEvent]);
    Alert.alert('Success', 'Meeting created successfully!');
    
    setMeetingTitle('');
    setMeetingTime('');
    setMeetingLocation('');
    setMeetingDescription('');
    setMeetingType('video');
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

  const handleTimeSelect = (hour: number) => {
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0, 0);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };
    
    setMeetingTime(`${formatTime(startTime)} - ${formatTime(endTime)}`);
    setSelectedTime(startTime);
    setShowTimePicker(false);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(hour);
    }
    return slots;
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

  const renderCalendar = () => {
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
    
    return (
      <Animated.View style={[styles.calendarSidebar, { right: calendarSlideAnim }]}>
        <View style={[styles.calendarHeader, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.calendarTitle}>Calendar</Text>
          <TouchableOpacity onPress={toggleCalendar}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarContent}>
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
                        <Trash2 size={16} color={Colors.light.danger} />
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
    );
  };

  const renderFolders = () => (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.headerTitle}>Smart Folders</Text>
          <Text style={styles.headerSubtitle}>AI-organized categories</Text>
        </View>
      </View>

      {isDemoMode && (
        <View style={styles.demoBadge}>
          <Text style={styles.demoText}>Demo Mode - Sample Data</Text>
        </View>
      )}

      <ScrollView 
        style={styles.emailList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        <TouchableOpacity 
          testID="create-folder" 
          style={styles.createFolderButton} 
          onPress={() => setIsModalVisible(true)}
        >
          <Plus size={20} color={Colors.light.primary} />
          <Text style={styles.createFolderButtonText}>Create Custom Folder</Text>
        </TouchableOpacity>

        {smartFolders.length === 0 ? (
          <View style={styles.emptyState}>
            <FolderOpen size={48} color={Colors.light.textSecondary} />
            <Text style={styles.emptyText}>No folders yet</Text>
            <Text style={styles.emptySubtext}>Sync your emails to create smart folders</Text>
          </View>
        ) : (
          <View style={styles.foldersGrid}>
            {smartFolders.map((folder) => {
              const Icon = iconMap[folder.icon] || FolderOpen;
              
              return (
                <TouchableOpacity 
                  key={folder.id} 
                  testID={`folder-${folder.id}`} 
                  style={styles.folderCard} 
                  onPress={() => {
                    router.push({
                      pathname: '/folder-details',
                      params: {
                        folderName: folder.name,
                        category: folder.category || '',
                        folderColor: folder.color,
                      },
                    });
                  }}
                >
                  <View style={[styles.folderIcon, { backgroundColor: folder.color + '20' }]}>
                    <Icon size={28} color={folder.color} />
                  </View>
                  <View style={styles.folderContent}>
                    <Text style={styles.folderName}>{folder.name}</Text>
                    <Text style={styles.folderCount}>{folder.count} emails</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderFolderDetail = () => {
    if (!selectedFolder) return null;

    return (
      <View style={styles.container}>
        <View style={[styles.folderDetailHeader, { backgroundColor: selectedFolder.color, paddingTop: insets.top + 16 }]}>
          <TouchableOpacity 
            onPress={() => setCurrentView('folders')} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.folderDetailHeaderContent}>
            <Text style={styles.folderDetailTitle}>{selectedFolder.name}</Text>
            <Text style={styles.folderDetailSubtitle}>{filteredEmails.length} emails</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.emailList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        >
          {filteredEmails.length === 0 ? (
            <View style={styles.emptyState}>
              <Mail size={48} color={Colors.light.textSecondary} />
              <Text style={styles.emptyText}>No emails found</Text>
            </View>
          ) : (
            filteredEmails.map((email: EmailMessage) => {
              const categoryColor = email.category ? Colors.light.category[email.category] : Colors.light.primary;
              
              return (
                <TouchableOpacity
                  key={email.id}
                  testID={`email-${email.id}`}
                  style={[styles.emailCard, !email.isRead && styles.emailCardUnread, { borderLeftColor: categoryColor }]}
                  onPress={() => handleEmailPress(email)}
                  activeOpacity={0.7}
                >
                  <View style={styles.emailCardContent}>
                    <View style={styles.emailCardHeader}>
                      <Text
                        style={[styles.emailFrom, !email.isRead && styles.emailFromUnread]}
                        numberOfLines={1}
                      >
                        {email.from.split('<')[0].trim() || email.from}
                      </Text>
                      <View style={styles.emailMeta}>
                        <Text style={styles.emailDate}>{formatDate(email.date)}</Text>
                        <TouchableOpacity
                          testID={`star-${email.id}`}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleStar(email.id);
                          }}
                          style={styles.starButton}
                        >
                          <Star
                            size={16}
                            color={email.isStarred ? Colors.light.warning : Colors.light.textSecondary}
                            fill={email.isStarred ? Colors.light.warning : 'none'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text
                      style={[styles.emailSubject, !email.isRead && styles.emailSubjectUnread]}
                      numberOfLines={1}
                    >
                      {email.subject}
                    </Text>
                    <Text style={styles.emailSnippet} numberOfLines={2}>
                      {email.snippet}
                    </Text>
                    {email.category && (
                      <View style={styles.emailTags}>
                        <View style={[styles.emailTag, { backgroundColor: categoryColor + '20' }]}>
                          <Text style={[styles.emailTagText, { color: categoryColor }]}>
                            {email.category}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  {!email.isRead && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  };

  const renderInbox = () => (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Mail</Text>
        <TouchableOpacity
          testID="calendar-toggle"
          onPress={toggleCalendar}
          style={styles.calendarButton}
        >
          <Calendar size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.light.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search mail"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.light.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterButtonsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterButtonsScroll}
        >
          {(['all', 'unread', 'starred', 'drafts', 'sent', 'trash'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              testID={`filter-${filter}`}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {smartFolders.length > 0 && (
        <View style={styles.smartFoldersSection}>
          <Text style={styles.smartFoldersTitle}>Smart Folders</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.smartFoldersScroll}
          >
            {smartFolders.map((folder) => {
              const Icon = iconMap[folder.icon] || FolderOpen;
              return (
                <TouchableOpacity
                  key={folder.id}
                  testID={`smart-folder-${folder.id}`}
                  style={styles.smartFolderCard}
                  onPress={() => {
                    router.push({
                      pathname: '/folder-details',
                      params: {
                        folderName: folder.name,
                        category: folder.category || '',
                        folderColor: folder.color,
                      },
                    });
                  }}
                >
                  <View style={[styles.smartFolderIcon, { backgroundColor: folder.color + '20' }]}>
                    <Icon size={20} color={folder.color} />
                  </View>
                  <Text style={styles.smartFolderName} numberOfLines={1}>{folder.name}</Text>
                  <View style={[styles.smartFolderBadge, { backgroundColor: folder.color }]}>
                    <Text style={styles.smartFolderCount}>{folder.count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              testID="create-folder-button"
              style={styles.smartFolderCard}
              onPress={() => setIsModalVisible(true)}
            >
              <View style={[styles.smartFolderIcon, styles.createFolderIcon]}>
                <Plus size={24} color={Colors.light.primary} />
              </View>
              <Text style={[styles.smartFolderName, styles.createFolderText]}>Create</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <ScrollView 
        style={styles.emailList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {activeFilter === 'drafts' ? (
          drafts.length === 0 ? (
            <View style={styles.emptyState}>
              <FileEdit size={48} color={Colors.light.textSecondary} />
              <Text style={styles.emptyText}>No drafts</Text>
              <Text style={styles.emptySubtext}>Start composing to save drafts</Text>
            </View>
          ) : (
            drafts.map((draft) => (
              <TouchableOpacity
                key={draft.id}
                testID={`draft-${draft.id}`}
                style={styles.draftCard}
                onPress={() => handleLoadDraft(draft)}
                activeOpacity={0.7}
              >
                <View style={styles.draftCardContent}>
                  <View style={styles.draftCardHeader}>
                    <FileEdit size={16} color={Colors.light.primary} />
                    <Text style={styles.draftBadge}>Draft</Text>
                    <Text style={styles.draftDate}>{formatDate(draft.date)}</Text>
                  </View>
                  <Text style={styles.draftTo} numberOfLines={1}>
                    To: {draft.to || '(no recipient)'}
                  </Text>
                  <Text style={styles.draftSubject} numberOfLines={1}>
                    {draft.subject || '(no subject)'}
                  </Text>
                  {draft.body && (
                    <Text style={styles.draftBody} numberOfLines={2}>
                      {draft.body}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  testID={`delete-draft-${draft.id}`}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteDraft(draft.id);
                  }}
                  style={styles.deleteDraftButton}
                >
                  <Trash2 size={18} color={Colors.light.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )
        ) : activeFilter === 'sent' ? (
          <View style={styles.emptyState}>
            <Send size={48} color={Colors.light.textSecondary} />
            <Text style={styles.emptyText}>No sent emails</Text>
            <Text style={styles.emptySubtext}>Your sent messages will appear here</Text>
          </View>
        ) : activeFilter === 'trash' ? (
          <View style={styles.emptyState}>
            <Trash2 size={48} color={Colors.light.textSecondary} />
            <Text style={styles.emptyText}>Trash is empty</Text>
            <Text style={styles.emptySubtext}>Deleted emails will appear here</Text>
          </View>
        ) : filteredEmails.length === 0 ? (
          <View style={styles.emptyState}>
            <Mail size={48} color={Colors.light.textSecondary} />
            <Text style={styles.emptyText}>No emails found</Text>
          </View>
        ) : (
          filteredEmails.map((email: EmailMessage) => (
            <TouchableOpacity
              key={email.id}
              testID={`email-${email.id}`}
              style={[styles.emailCard, !email.isRead && styles.emailCardUnread]}
              onPress={() => handleEmailPress(email)}
              activeOpacity={0.7}
            >
              <View style={styles.emailCardContent}>
                <View style={styles.emailCardHeader}>
                  <Text
                    style={[styles.emailFrom, !email.isRead && styles.emailFromUnread]}
                    numberOfLines={1}
                  >
                    {email.from.split('<')[0].trim() || email.from}
                  </Text>
                  <View style={styles.emailMeta}>
                    <Text style={styles.emailDate}>{formatDate(email.date)}</Text>
                    <TouchableOpacity
                      testID={`star-${email.id}`}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleStar(email.id);
                      }}
                      style={styles.starButton}
                    >
                      <Star
                        size={16}
                        color={email.isStarred ? Colors.light.warning : Colors.light.textSecondary}
                        fill={email.isStarred ? Colors.light.warning : 'none'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text
                  style={[styles.emailSubject, !email.isRead && styles.emailSubjectUnread]}
                  numberOfLines={1}
                >
                  {email.subject}
                </Text>
                <Text style={styles.emailSnippet} numberOfLines={2}>
                  {email.snippet}
                </Text>
                {email.hasAttachments && (
                  <View style={styles.attachmentBadge}>
                    <Paperclip size={12} color={Colors.light.textSecondary} />
                  </View>
                )}
              </View>
              {!email.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  const handleReply = (email: EmailMessage) => {
    const senderEmail = email.from.match(/<(.+?)>/) ?.[1] || email.from;
    setComposeTo(senderEmail);
    setComposeCc('');
    setComposeSubject(`Re: ${email.subject}`);
    setComposeBody(`\n\n---\nOn ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${email.from.split('<')[0].trim()} wrote:\n${email.snippet}`);
    setCurrentView('compose');
  };

  const handleReplyAll = (email: EmailMessage) => {
    const senderEmail = email.from.match(/<(.+?)>/) ?.[1] || email.from;
    const allRecipients = [senderEmail, ...email.to].filter(e => e !== 'sarah.chen@company.com').join(', ');
    setComposeTo(allRecipients);
    setComposeCc('');
    setComposeSubject(`Re: ${email.subject}`);
    setComposeBody(`\n\n---\nOn ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${email.from.split('<')[0].trim()} wrote:\n${email.snippet}`);
    setCurrentView('compose');
  };

  const handleForward = (email: EmailMessage) => {
    setComposeTo('');
    setComposeCc('');
    setComposeSubject(`Fwd: ${email.subject}`);
    setComposeBody(`\n\n---\nForwarded message:\nFrom: ${email.from}\nDate: ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\nSubject: ${email.subject}\n\n${email.snippet}`);
    setCurrentView('compose');
  };

  const renderEmailDetail = () => {
    if (!selectedEmail) return null;

    return (
      <View style={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            testID="back-to-inbox"
            style={styles.backButton}
            onPress={() => setCurrentView('inbox')}
          >
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <View style={styles.detailActions}>
            <TouchableOpacity
              testID="star-email"
              style={styles.actionButton}
              onPress={() => handleStar(selectedEmail.id)}
            >
              <Star
                size={20}
                color={selectedEmail.isStarred ? Colors.light.warning : Colors.light.text}
                fill={selectedEmail.isStarred ? Colors.light.warning : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              testID="archive-email"
              style={styles.actionButton}
              onPress={() => handleArchive(selectedEmail)}
            >
              <Archive size={20} color={Colors.light.text} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="delete-email"
              style={styles.actionButton}
              onPress={() => Alert.alert('Delete', 'Delete this email?')}
            >
              <Trash2 size={20} color={Colors.light.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.detailContent} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Text style={styles.detailSubject}>{selectedEmail.subject}</Text>
          
          <View style={styles.detailFrom}>
            <View style={styles.detailAvatar}>
              <Text style={styles.detailAvatarText}>
                {selectedEmail.from[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailSenderInfo}>
              <Text style={styles.detailSenderName}>
                {selectedEmail.from.split('<')[0].trim() || selectedEmail.from}
              </Text>
              <Text style={styles.detailSenderEmail}>
                {selectedEmail.from.match(/<(.+?)>/) ?.[1] || selectedEmail.from}
              </Text>
            </View>
            <Text style={styles.detailDate}>
              {selectedEmail.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {selectedEmail.hasAttachments && (
            <View style={styles.attachmentsSection}>
              <View style={styles.attachmentItem}>
                <Paperclip size={16} color={Colors.light.textSecondary} />
                <Text style={styles.attachmentName}>attachment.pdf</Text>
                <Text style={styles.attachmentSize}>234 KB</Text>
              </View>
            </View>
          )}

          <View style={styles.detailBody}>
            <Text style={styles.detailBodyText}>{selectedEmail.snippet}</Text>
            <Text style={styles.detailBodyText}>
              {'\n\n'}Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              {'\n\n'}Best regards,{'\n'}{selectedEmail.from.split('<')[0].trim()}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.emailActionButtons}>
          <TouchableOpacity
            testID="reply-button"
            style={styles.emailActionButton}
            onPress={() => handleReply(selectedEmail)}
          >
            <Mail size={18} color="#FFFFFF" />
            <Text style={styles.emailActionButtonText}>Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="reply-all-button"
            style={styles.emailActionButton}
            onPress={() => handleReplyAll(selectedEmail)}
          >
            <Users size={18} color="#FFFFFF" />
            <Text style={styles.emailActionButtonText}>Reply All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="forward-button"
            style={styles.emailActionButton}
            onPress={() => handleForward(selectedEmail)}
          >
            <Send size={18} color="#FFFFFF" />
            <Text style={styles.emailActionButtonText}>Forward</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCompose = () => (
    <View style={styles.container}>
      <View style={[styles.composeHeader, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          testID="cancel-compose"
          onPress={() => setCurrentView('inbox')}
        >
          <X size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.composeTitle}>New Message</Text>
        <View style={styles.composeHeaderActions}>
          <TouchableOpacity
            testID="save-draft-button"
            onPress={handleSaveDraft}
            style={styles.headerActionButton}
          >
            <Save size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="send-email-button"
            onPress={handleSend}
            style={styles.headerActionButton}
          >
            <Send size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.composeForm} keyboardShouldPersistTaps="handled">
        <View style={styles.composeField}>
          <Text style={styles.composeLabel}>To</Text>
          <TextInput
            style={styles.composeInput}
            placeholder="recipient@example.com"
            value={composeTo}
            onChangeText={setComposeTo}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.composeDivider} />

        <View style={styles.composeField}>
          <Text style={styles.composeLabel}>Cc</Text>
          <TextInput
            style={styles.composeInput}
            placeholder="cc@example.com"
            value={composeCc}
            onChangeText={setComposeCc}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.composeDivider} />

        <View style={styles.composeField}>
          <Text style={styles.composeLabel}>Subject</Text>
          <TextInput
            style={styles.composeInput}
            placeholder="Email subject"
            value={composeSubject}
            onChangeText={setComposeSubject}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.composeDivider} />

        <View style={[styles.composeField, styles.composeBodyField]}>
          <TextInput
            style={[styles.composeInput, styles.composeBodyInput]}
            placeholder="Compose your message..."
            value={composeBody}
            onChangeText={setComposeBody}
            multiline
            textAlignVertical="top"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <TouchableOpacity style={styles.attachButton}>
          <Paperclip size={20} color={Colors.light.primary} />
          <Text style={styles.attachButtonText}>Attach file</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.aiButton}
          onPress={() => setIsAIModalVisible(true)}
        >
          <Sparkles size={20} color={Colors.light.primary} />
          <Text style={styles.aiButtonText}>Write with AI</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.safeArea]}>
      {currentView === 'inbox' && renderInbox()}
      {currentView === 'folders' && renderFolders()}
      {currentView === 'folder-detail' && renderFolderDetail()}
      {currentView === 'detail' && renderEmailDetail()}
      {currentView === 'compose' && renderCompose()}

      {renderCalendar()}

      {isCalendarVisible && (
        <TouchableOpacity
          style={styles.calendarOverlay}
          activeOpacity={1}
          onPress={toggleCalendar}
        />
      )}

      {currentView !== 'compose' && currentView !== 'detail' && (
        <TouchableOpacity
          testID="compose-fab"
          style={[styles.composeFab, { bottom: insets.bottom + 30 }]}
          onPress={handleCompose}
          activeOpacity={0.8}
        >
          <PenSquare size={24} color="#FFFFFF" />
        </TouchableOpacity>
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
                <Text style={styles.inputLabel}>Time *</Text>
                <TouchableOpacity
                  style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                  onPress={() => setShowTimePicker(!showTimePicker)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.timeText, !meetingTime && styles.timePlaceholder]}>
                    {meetingTime || 'e.g., 2:00 PM - 3:00 PM'}
                  </Text>
                  <ChevronDown size={16} color={Colors.light.textSecondary} />
                </TouchableOpacity>
                {showTimePicker && (
                  <ScrollView style={styles.timeDropdown} nestedScrollEnabled>
                    {generateTimeSlots().map((hour) => {
                      const date = new Date();
                      date.setHours(hour, 0, 0, 0);
                      const endDate = new Date(date);
                      endDate.setHours(hour + 1, 0, 0, 0);
                      
                      const timeLabel = `${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                      
                      return (
                        <TouchableOpacity
                          key={hour}
                          style={styles.timeSlot}
                          onPress={() => handleTimeSelect(hour)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.timeSlotText}>{timeLabel}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
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
              style={[styles.createButtonModal, !meetingTitle.trim() || !meetingTime.trim() ? styles.createButtonDisabled : null]}
              onPress={handleCreateMeeting}
              disabled={!meetingTitle.trim() || !meetingTime.trim()}
            >
              <Text style={styles.createButtonModalText}>Create Meeting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={[styles.datePickerContainer, { paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                textColor={Colors.light.text}
                style={styles.dateTimePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showDatePicker && Platform.OS === 'web' && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={[styles.datePickerContainer, { paddingBottom: 20 }]}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                textColor={Colors.light.text}
                style={styles.dateTimePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      <Modal
        visible={isAIModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAIModalVisible(false)}
      >
        <View style={styles.aiModalOverlay}>
          <TouchableOpacity 
            style={styles.aiModalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setIsAIModalVisible(false);
              setShowFormatDropdown(false);
              setShowToneDropdown(false);
              setShowLengthDropdown(false);
            }}
          />
          <View style={[styles.aiModalContent, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.aiModalHandle} />
            
            <Text style={styles.aiModalTitle}>Write with AI</Text>
            
            <ScrollView 
              style={styles.aiModalScroll}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            >
              <View style={styles.aiPromptContainer}>
                <TextInput
                  style={styles.aiPromptInput}
                  placeholder="What's on your mind?"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={aiPrompt}
                  onChangeText={setAiPrompt}
                  multiline
                />
              </View>
              
              <View style={styles.aiOptionsContainer}>
                <View style={styles.aiOption}>
                  <Text style={styles.aiDropdownLabel}>Format</Text>
                  <TouchableOpacity
                    style={styles.aiDropdownButton}
                    onPress={() => {
                      setShowFormatDropdown(!showFormatDropdown);
                      setShowToneDropdown(false);
                      setShowLengthDropdown(false);
                    }}
                  >
                    <Text style={styles.aiDropdownValue}>{aiFormat}</Text>
                    <ChevronDown size={16} color={Colors.light.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.aiOption}>
                  <Text style={styles.aiDropdownLabel}>Tone</Text>
                  <TouchableOpacity
                    style={styles.aiDropdownButton}
                    onPress={() => {
                      setShowToneDropdown(!showToneDropdown);
                      setShowFormatDropdown(false);
                      setShowLengthDropdown(false);
                    }}
                  >
                    <Text style={styles.aiDropdownValue}>{aiTone}</Text>
                    <ChevronDown size={16} color={Colors.light.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.aiOption}>
                  <Text style={styles.aiDropdownLabel}>Length</Text>
                  <TouchableOpacity
                    style={styles.aiDropdownButton}
                    onPress={() => {
                      setShowLengthDropdown(!showLengthDropdown);
                      setShowFormatDropdown(false);
                      setShowToneDropdown(false);
                    }}
                  >
                    <Text style={styles.aiDropdownValue}>{aiLength}</Text>
                    <ChevronDown size={16} color={Colors.light.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {showFormatDropdown && (
                <View style={styles.aiDropdownOverlay}>
                  {['professional', 'casual', 'formal', 'creative'].map((format) => (
                    <TouchableOpacity
                      key={format}
                      style={styles.aiDropdownItem}
                      onPress={() => {
                        setAiFormat(format);
                        setShowFormatDropdown(false);
                      }}
                    >
                      <Text style={[styles.aiDropdownItemText, aiFormat === format && styles.aiDropdownItemTextActive]}>
                        {format}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {showToneDropdown && (
                <View style={styles.aiDropdownOverlay}>
                  {['friendly', 'professional', 'confident', 'empathetic'].map((tone) => (
                    <TouchableOpacity
                      key={tone}
                      style={styles.aiDropdownItem}
                      onPress={() => {
                        setAiTone(tone);
                        setShowToneDropdown(false);
                      }}
                    >
                      <Text style={[styles.aiDropdownItemText, aiTone === tone && styles.aiDropdownItemTextActive]}>
                        {tone}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {showLengthDropdown && (
                <View style={styles.aiDropdownOverlay}>
                  {['short', 'medium', 'long'].map((length) => (
                    <TouchableOpacity
                      key={length}
                      style={styles.aiDropdownItem}
                      onPress={() => {
                        setAiLength(length);
                        setShowLengthDropdown(false);
                      }}
                    >
                      <Text style={[styles.aiDropdownItemText, aiLength === length && styles.aiDropdownItemTextActive]}>
                        {length}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.aiGenerateButton}
              onPress={() => {
                Alert.alert('AI Generation', `Generating ${aiFormat} email with ${aiTone} tone, ${aiLength} length...`);
                setIsAIModalVisible(false);
                setShowFormatDropdown(false);
                setShowToneDropdown(false);
                setShowLengthDropdown(false);
              }}
            >
              <Sparkles size={20} color="#FFFFFF" />
              <Text style={styles.aiGenerateButtonText}>Generate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !isCreating && setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Folder</Text>
              <TouchableOpacity
                onPress={() => !isCreating && setIsModalVisible(false)}
                disabled={isCreating}
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Create a smart folder using natural language rules
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Folder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Important Clients"
                placeholderTextColor={Colors.light.textSecondary}
                value={folderName}
                onChangeText={setFolderName}
                editable={!isCreating}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Folder Rule</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Emails from clients about project updates or invoices"
                placeholderTextColor={Colors.light.textSecondary}
                value={folderRule}
                onChangeText={setFolderRule}
                multiline
                numberOfLines={4}
                editable={!isCreating}
              />
              <Text style={styles.helperText}>
                Describe the rule in plain English. Our AI will understand it!
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
                disabled={isCreating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButtonModal]}
                onPress={handleCreateFolder}
                disabled={isCreating || !folderName.trim() || !folderRule.trim()}
              >
                {isCreating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonModalText}>Create Folder</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  composeFab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
  },

  filterButtonsContainer: {
    marginBottom: 16,
  },
  filterButtonsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  smartFoldersSection: {
    marginTop: 12,
    marginBottom: 16,
  },
  smartFoldersTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  smartFoldersScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  smartFolderCard: {
    alignItems: 'center',
    gap: 6,
    width: 100,
  },
  smartFolderIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartFolderName: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'center',
  },
  smartFolderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  smartFolderCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  createFolderIcon: {
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
  },
  createFolderText: {
    color: Colors.light.primary,
  },

  emailList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  demoBadge: {
    backgroundColor: '#FFF4E5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  demoText: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
    fontWeight: '600',
  },
  foldersGrid: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  folderIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderContent: {
    flex: 1,
  },
  folderName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  folderDetailHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  folderDetailHeaderContent: {
    gap: 4,
  },
  folderDetailTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  folderDetailSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  emailTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  emailTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emailTagText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emailCard: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emailCardUnread: {
    backgroundColor: '#FFFFFF',
  },
  emailCardContent: {
    flex: 1,
  },
  emailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  emailFrom: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  emailFromUnread: {
    fontWeight: '700',
  },
  emailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  starButton: {
    padding: 2,
  },
  emailSubject: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.light.text,
    marginBottom: 4,
  },
  emailSubjectUnread: {
    fontWeight: '600',
  },
  emailSnippet: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  attachmentBadge: {
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginLeft: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 4,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  detailContent: {
    flex: 1,
  },
  detailSubject: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  detailFrom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  detailAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  detailSenderInfo: {
    flex: 1,
  },
  detailSenderName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  detailSenderEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  detailDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  attachmentsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },
  attachmentSize: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  detailBody: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  detailBodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.text,
  },
  composeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  composeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
  },
  sendButton: {
    padding: 4,
  },
  composeForm: {
    flex: 1,
  },
  composeField: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  composeBodyField: {
    flex: 1,
    minHeight: 200,
  },
  composeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  composeInput: {
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
  },
  composeBodyInput: {
    flex: 1,
    paddingTop: 0,
  },
  composeDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  attachButtonText: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  aiButtonText: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  aiModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  aiModalBackdrop: {
    flex: 1,
  },
  aiModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  aiModalScroll: {
    flexGrow: 0,
  },
  aiModalHandle: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  aiModalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 20,
  },
  aiPromptContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 80,
  },
  aiPromptInput: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
  },
  aiOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  aiOption: {
    flex: 1,
  },
  aiDropdownButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiDropdownLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  aiDropdownValue: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  aiDropdownOverlay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  aiDropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  aiDropdownItemText: {
    fontSize: 15,
    color: Colors.light.text,
    textTransform: 'capitalize',
  },
  aiDropdownItemTextActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  aiGenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  aiGenerateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createFolderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
  },
  createFolderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
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
  modalDescription: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 24,
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
  helperText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  createButtonModal: {
    backgroundColor: Colors.light.primary,
  },
  createButtonModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  draftCard: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  draftCardContent: {
    flex: 1,
  },
  draftCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  draftBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  draftDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 'auto',
  },
  draftTo: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
    fontWeight: '500',
  },
  draftSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  draftBody: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  deleteDraftButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composeHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerActionButton: {
    padding: 4,
  },
  saveDraftButton: {
    padding: 4,
  },
  composeSaveDraftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  composeSaveDraftButtonText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
  },
  composeSendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  composeSendButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
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
    padding: 4,
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
  createButtonDisabled: {
    opacity: 0.5,
  },
  emailActionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  emailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
  },
  emailActionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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
  timeText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  timePlaceholder: {
    color: Colors.light.textSecondary,
  },
  timeDropdown: {
    maxHeight: 200,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  timeSlotText: {
    fontSize: 15,
    color: Colors.light.text,
  },
});
