import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useEmailState } from '@/contexts/EmailStateContext';
import { useDrafts } from '@/hooks/useDrafts';
import { useSmartFolders } from '@/hooks/useSmartFolders';
import { mockRecentEmails } from '@/mocks/emailData';
import { categorizeEmail } from '@/utils/emailCategories';
import type { EmailMessage, Email, EmailCategory, MailFolder } from '@/constants/types';
import Colors from '@/constants/colors';

type MailView = 'inbox' | 'compose' | 'detail' | 'folders' | 'folder-detail';

export function useMailScreen() {
  const params = useLocalSearchParams<{ emailId?: string; timestamp?: string; compose?: string }>();
  const router = useRouter();
  const { isDemoMode } = useAuth();
  const { messages, markAsRead, archiveMessage, syncMailbox, isSyncing } = useGmailSync();
  const { starredEmails, toggleStarredEmail } = useEmailState();
  const { drafts, saveDraft, loadDraft, deleteDraft } = useDrafts();

  // View state
  const [currentView, setCurrentView] = useState<MailView>('inbox');
  const [currentFolder] = useState<MailFolder>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [selectedFolder] = useState<{ id: string; name: string; color: string; category?: EmailCategory } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'starred' | 'drafts' | 'drafts-ai' | 'trash' | 'sent'>('all');

  // Compose state
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Folder creation state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>('');
  const [folderRule, setFolderRule] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [customFolders, setCustomFolders] = useState<Array<{ id: string; name: string; color: string; count: number }>>([]);

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Toast state
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void; timer?: number } | null>(null);
  const [toastTimer, setToastTimer] = useState(5);

  // Archive/Delete state
  const [pendingArchive, setPendingArchive] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Set<string>>(new Set());
  const [archivedEmails, setArchivedEmails] = useState<Set<string>>(new Set());
  const [trashedEmails, setTrashedEmails] = useState<Set<string>>(new Set());
  const archiveTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const deleteTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // AI Modal state
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);

  // Process all emails
  const allEmails: EmailMessage[] = useMemo(() => {
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

  // Filter emails
  const filteredEmails = useMemo(() => {
    let filtered = allEmails;

    if (activeFilter !== 'archived') {
      filtered = filtered.filter((email: EmailMessage) => !archivedEmails.has(email.id));
    }
    
    if (activeFilter !== 'trash') {
      filtered = filtered.filter((email: EmailMessage) => !trashedEmails.has(email.id));
    } else {
      filtered = filtered.filter((email: EmailMessage) => trashedEmails.has(email.id));
    }

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
        case 'archived':
          filtered = filtered.filter((email: EmailMessage) => archivedEmails.has(email.id));
          break;
      }
    }

    return filtered.sort((a: EmailMessage, b: EmailMessage) => b.date.getTime() - a.date.getTime());
  }, [allEmails, currentFolder, currentView, selectedFolder, searchQuery, starredEmails, activeFilter, archivedEmails, trashedEmails]);

  // Handle email press
  const handleEmailPress = useCallback((email: EmailMessage) => {
    setSelectedEmail(email);
    setCurrentView('detail');
    
    if (!email.isRead && !isDemoMode) {
      markAsRead(email.id).catch(() => {
        console.error('Failed to mark as read');
      });
    }
  }, [isDemoMode, markAsRead]);

  // Handle compose
  const handleCompose = useCallback(() => {
    setComposeTo('');
    setComposeCc('');
    setComposeSubject('');
    setComposeBody('');
    setCurrentView('compose');
  }, []);

  // Handle send
  const handleSend = useCallback(() => {
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
  }, [composeTo, composeSubject, isDemoMode]);

  // Handle save draft
  const handleSaveDraft = useCallback(() => {
    if (saveDraft(composeTo, composeCc, composeSubject, composeBody)) {
      setCurrentView('inbox');
      setActiveFilter('drafts');
    }
  }, [composeTo, composeCc, composeSubject, composeBody, saveDraft]);

  // Handle load draft
  const handleLoadDraft = useCallback((draft: typeof drafts[0]) => {
    const loaded = loadDraft(draft);
    setComposeTo(loaded.to);
    setComposeCc(loaded.cc || '');
    setComposeSubject(loaded.subject);
    setComposeBody(loaded.body);
    setCurrentView('compose');
  }, [loadDraft, drafts]);

  // Handle delete draft
  const handleDeleteDraft = useCallback((draftId: string) => {
    deleteDraft(draftId);
  }, [deleteDraft]);

  // Handle archive
  const handleArchive = useCallback(async (email: EmailMessage) => {
    if (isDemoMode) {
      const existingTimeout = archiveTimeoutRef.current.get(email.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        archiveTimeoutRef.current.delete(email.id);
      }
      
      setPendingArchive(prev => new Set(prev).add(email.id));
      
      setToast({
        message: 'Email archived',
        onUndo: () => {
          const timeout = archiveTimeoutRef.current.get(email.id);
          if (timeout) {
            clearTimeout(timeout);
            archiveTimeoutRef.current.delete(email.id);
          }
          setPendingArchive(prev => {
            const newSet = new Set(prev);
            newSet.delete(email.id);
            return newSet;
          });
          setToast(null);
        },
      });
      
      const timeout = setTimeout(() => {
        setPendingArchive(prev => {
          if (prev.has(email.id)) {
            setArchivedEmails(archived => new Set(archived).add(email.id));
            return new Set([...prev].filter(id => id !== email.id));
          }
          return prev;
        });
        archiveTimeoutRef.current.delete(email.id);
        setToast(null);
      }, 5000);
      
      archiveTimeoutRef.current.set(email.id, timeout);
      return;
    }

    try {
      await archiveMessage(email.id);
      Alert.alert('Success', 'Email archived');
      setCurrentView('inbox');
    } catch {
      Alert.alert('Error', 'Failed to archive email');
    }
  }, [isDemoMode, archiveMessage]);

  // Handle delete
  const handleDelete = useCallback(async (email: EmailMessage) => {
    if (isDemoMode) {
      const existingTimeout = deleteTimeoutRef.current.get(email.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        deleteTimeoutRef.current.delete(email.id);
      }
      
      const emailIndex = filteredEmails.findIndex(e => e.id === email.id);
      const hasNextEmail = emailIndex >= 0 && emailIndex < filteredEmails.length - 1;
      const nextEmail = hasNextEmail ? filteredEmails[emailIndex + 1] : null;
      
      setPendingDelete(prev => new Set(prev).add(email.id));
      
      setToast({
        message: 'Email moved to Trash',
        onUndo: () => {
          const timeout = deleteTimeoutRef.current.get(email.id);
          if (timeout) {
            clearTimeout(timeout);
            deleteTimeoutRef.current.delete(email.id);
          }
          setPendingDelete(prev => {
            const newSet = new Set(prev);
            newSet.delete(email.id);
            return newSet;
          });
          setToast(null);
        },
      });
      
      if (currentView === 'detail') {
        if (nextEmail) {
          setSelectedEmail(nextEmail);
          if (!nextEmail.isRead && !isDemoMode) {
            markAsRead(nextEmail.id).catch(() => {
              console.error('Failed to mark as read');
            });
          }
        } else {
          setCurrentView('inbox');
        }
      }
      
      const timeout = setTimeout(() => {
        setPendingDelete(prev => {
          if (prev.has(email.id)) {
            setTrashedEmails(trashed => new Set(trashed).add(email.id));
            return new Set([...prev].filter(id => id !== email.id));
          }
          return prev;
        });
        deleteTimeoutRef.current.delete(email.id);
        setToast(null);
        
        if (currentView === 'detail' && !nextEmail) {
          setCurrentView('inbox');
        }
      }, 5000);
      
      deleteTimeoutRef.current.set(email.id, timeout);
      return;
    }

    try {
      setCurrentView('inbox');
    } catch {
      Alert.alert('Error', 'Failed to delete email');
    }
  }, [isDemoMode, filteredEmails, currentView, markAsRead]);

  // Handle star
  const handleStar = useCallback((emailId: string) => {
    toggleStarredEmail(emailId);
  }, [toggleStarredEmail]);

  // Handle reply
  const handleReply = useCallback((email: EmailMessage) => {
    const senderEmail = email.from.match(/<(.+?)>/) ?.[1] || email.from;
    setComposeTo(senderEmail);
    setComposeCc('');
    setComposeSubject(`Re: ${email.subject}`);
    setComposeBody(`\n\n---\nOn ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${email.from.split('<')[0].trim()} wrote:\n${email.snippet}`);
    setCurrentView('compose');
  }, []);

  // Handle reply all
  const handleReplyAll = useCallback((email: EmailMessage) => {
    const senderEmail = email.from.match(/<(.+?)>/) ?.[1] || email.from;
    const allRecipients = [senderEmail, ...email.to].filter(e => e !== 'sarah.chen@company.com').join(', ');
    setComposeTo(allRecipients);
    setComposeCc('');
    setComposeSubject(`Re: ${email.subject}`);
    setComposeBody(`\n\n---\nOn ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${email.from.split('<')[0].trim()} wrote:\n${email.snippet}`);
    setCurrentView('compose');
  }, []);

  // Handle forward
  const handleForward = useCallback((email: EmailMessage) => {
    setComposeTo('');
    setComposeCc('');
    setComposeSubject(`Fwd: ${email.subject}`);
    setComposeBody(`\n\n---\nForwarded message:\nFrom: ${email.from}\nDate: ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\nSubject: ${email.subject}\n\n${email.snippet}`);
    setCurrentView('compose');
  }, []);

  // Handle next email
  const handleNextEmail = useCallback(() => {
    if (!selectedEmail) return;
    const currentIndex = filteredEmails.findIndex(e => e.id === selectedEmail.id);
    if (currentIndex !== -1 && currentIndex < filteredEmails.length - 1) {
      const nextEmail = filteredEmails[currentIndex + 1];
      setSelectedEmail(nextEmail);
      if (!nextEmail.isRead && !isDemoMode) {
        markAsRead(nextEmail.id).catch(() => {
          console.error('Failed to mark as read');
        });
      }
    }
  }, [selectedEmail, filteredEmails, isDemoMode, markAsRead]);

  // Handle prev email
  const handlePrevEmail = useCallback(() => {
    if (!selectedEmail) return;
    const currentIndex = filteredEmails.findIndex(e => e.id === selectedEmail.id);
    if (currentIndex > 0) {
      const prevEmail = filteredEmails[currentIndex - 1];
      setSelectedEmail(prevEmail);
      if (!prevEmail.isRead && !isDemoMode) {
        markAsRead(prevEmail.id).catch(() => {
          console.error('Failed to mark as read');
        });
      }
    }
  }, [selectedEmail, filteredEmails, isDemoMode, markAsRead]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (isDemoMode) {
      // In demo mode, restore all deleted/archived emails by clearing the state
      setArchivedEmails(new Set());
      setTrashedEmails(new Set());
      setPendingArchive(new Set());
      setPendingDelete(new Set());
      // Clear any pending timeouts
      archiveTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      deleteTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      archiveTimeoutRef.current.clear();
      deleteTimeoutRef.current.clear();
      return;
    }
    
    if (!syncMailbox) {
      return;
    }
    
    try {
      await syncMailbox();
    } catch (error) {
      console.error('Error refreshing emails:', error);
    }
  }, [isDemoMode, syncMailbox]);

  // Handle create folder
  const handleCreateFolder = useCallback(async () => {
    if (!folderName.trim() || !folderRule.trim()) {
      Alert.alert('Missing Information', 'Please enter both folder name and rule');
      return;
    }

    setIsCreating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newFolder = { 
        id: Date.now().toString(), 
        name: folderName.trim(), 
        color: Colors.light.primary, 
        count: 0 
      };
      
      setCustomFolders(prev => [newFolder, ...prev]);
      setToast({ message: `Folder "${folderName}" created successfully!` });
      setIsModalVisible(false);
      setFolderName('');
      setFolderRule('');
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Error', 'Failed to create folder. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [folderName, folderRule]);

  // Selection handlers
  const handleToggleSelection = useCallback((emailId: string) => {
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
        if (newSet.size === 0) {
          setSelectionMode(false);
        }
      } else {
        newSet.add(emailId);
        setSelectionMode(true);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedEmails(new Set(filteredEmails.map(e => e.id)));
  }, [filteredEmails]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedEmails(new Set());
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Bulk delete is disabled in demo mode');
      return;
    }
    Alert.alert(
      'Delete Emails',
      `Delete ${selectedEmails.size} emails?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', `${selectedEmails.size} emails deleted`);
            handleCancelSelection();
          },
        },
      ]
    );
  }, [isDemoMode, selectedEmails.size, handleCancelSelection]);

  const handleBulkArchive = useCallback(() => {
    if (isDemoMode) {
      setArchivedEmails(prev => {
        const newSet = new Set(prev);
        selectedEmails.forEach(id => newSet.add(id));
        return newSet;
      });
      handleCancelSelection();
      return;
    }
    Alert.alert('Success', `${selectedEmails.size} emails archived`);
    handleCancelSelection();
  }, [isDemoMode, selectedEmails, handleCancelSelection]);

  const handleBulkMarkRead = useCallback(() => {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Bulk mark read is disabled in demo mode');
      return;
    }
    Alert.alert('Success', `${selectedEmails.size} emails marked as read`);
    handleCancelSelection();
  }, [isDemoMode, selectedEmails.size, handleCancelSelection]);

  const handleBulkMove = useCallback(() => {
    Alert.alert('Move Emails', `Move ${selectedEmails.size} emails to...`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Promotions', onPress: () => handleCancelSelection() },
      { text: 'Social', onPress: () => handleCancelSelection() },
      { text: 'Spam', onPress: () => handleCancelSelection() },
    ]);
  }, [selectedEmails.size, handleCancelSelection]);

  // Smart folders
  const smartFolders = useSmartFolders(messages, allEmails, isDemoMode);

  // Handle params for email navigation
  useEffect(() => {
    if (params.emailId && allEmails.length > 0) {
      const email = allEmails.find(e => e.id === params.emailId);
      if (email) {
        setSelectedEmail(email);
        if (params.compose) {
          if (params.compose === 'reply') {
            const senderEmail = email.from.match(/<(.+?)>/) ?.[1] || email.from;
            setComposeTo(senderEmail);
            setComposeCc('');
            setComposeSubject(`Re: ${email.subject}`);
            setComposeBody(`\n\n---\nOn ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${email.from.split('<')[0].trim()} wrote:\n${email.snippet}`);
            setCurrentView('compose');
          } else if (params.compose === 'replyAll') {
            const senderEmail = email.from.match(/<(.+?)>/) ?.[1] || email.from;
            const allRecipients = [senderEmail, ...email.to].filter(e => e !== 'sarah.chen@company.com').join(', ');
            setComposeTo(allRecipients);
            setComposeCc('');
            setComposeSubject(`Re: ${email.subject}`);
            setComposeBody(`\n\n---\nOn ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${email.from.split('<')[0].trim()} wrote:\n${email.snippet}`);
            setCurrentView('compose');
          } else if (params.compose === 'forward') {
            setComposeTo('');
            setComposeCc('');
            setComposeSubject(`Fwd: ${email.subject}`);
            setComposeBody(`\n\n---\nForwarded message:\nFrom: ${email.from}\nDate: ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\nSubject: ${email.subject}\n\n${email.snippet}`);
            setCurrentView('compose');
          }
        } else {
          setCurrentView('detail');
        }
      }
    }
  }, [params.emailId, params.timestamp, params.compose, allEmails]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
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
  }, [currentView]);

  // Toast management
  useEffect(() => {
    if (!toast) return;
    if (toast.onUndo) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!toast || !toast.onUndo) {
      setToastTimer(5);
      return;
    }

    setToastTimer(5);
    const interval = setInterval(() => {
      setToastTimer((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [toast]);

  return {
    // State
    currentView,
    setCurrentView,
    selectedEmail,
    setSelectedEmail,
    selectedFolder,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    composeTo,
    setComposeTo,
    composeCc,
    setComposeCc,
    composeSubject,
    setComposeSubject,
    composeBody,
    setComposeBody,
    isModalVisible,
    setIsModalVisible,
    folderName,
    setFolderName,
    folderRule,
    setFolderRule,
    isCreating,
    customFolders,
    selectionMode,
    selectedEmails,
    toast,
    toastTimer,
    isAIModalVisible,
    setIsAIModalVisible,
    // Data
    allEmails,
    filteredEmails,
    drafts,
    smartFolders,
    // Handlers
    handleEmailPress,
    handleCompose,
    handleSend,
    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
    handleArchive,
    handleDelete,
    handleStar,
    handleReply,
    handleReplyAll,
    handleForward,
    handleNextEmail,
    handlePrevEmail,
    handleCreateFolder,
    handleToggleSelection,
    handleSelectAll,
    handleCancelSelection,
    handleBulkDelete,
    handleBulkArchive,
    handleBulkMarkRead,
    handleBulkMove,
    handleRefresh,
    // Additional state
    isDemoMode,
    isSyncing,
  };
}

