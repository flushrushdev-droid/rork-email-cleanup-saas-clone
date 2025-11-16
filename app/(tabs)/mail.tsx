import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, BackHandler, Modal, ActivityIndicator } from 'react-native';
import { Mail, Star, PenSquare, ChevronLeft, X, Check } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { mockRecentEmails } from '@/mocks/emailData';
import Colors from '@/constants/colors';
import type { EmailMessage, Email, EmailCategory } from '@/constants/types';
import { useTheme } from '@/contexts/ThemeContext';
import { categorizeEmail } from '@/utils/emailCategories';
import { useDrafts } from '@/hooks/useDrafts';
import { useSmartFolders } from '@/hooks/useSmartFolders';
import { formatDate } from '@/utils/dateFormat';
import type { MailFolder } from '@/utils/emailFilters';
import { AIModal } from '@/components/mail/AIModal';
import { ComposeView } from '@/components/mail/ComposeView';
import { EmailDetailView } from '@/components/mail/EmailDetailView';
import { FoldersView } from '@/components/mail/FoldersView';
import { InboxView } from '@/components/mail/InboxView';
import { CreateFolderModal } from '@/components/mail/CreateFolderModal';

type MailView = 'inbox' | 'compose' | 'detail' | 'folders' | 'folder-detail';



export default function MailScreen() {
  const params = useLocalSearchParams<{ emailId?: string; timestamp?: string; compose?: string }>();
  const { colors } = useTheme();
  const { isDemoMode } = useAuth();
  const { messages, markAsRead, archiveMessage } = useGmailSync();
  const [currentView, setCurrentView] = useState<MailView>('inbox');
  const [currentFolder] = useState<MailFolder>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [starredEmails, setStarredEmails] = useState<Set<string>>(new Set());
  const [selectedFolder] = useState<{ id: string; name: string; color: string; category?: EmailCategory } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>('');
  const [folderRule, setFolderRule] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'starred' | 'drafts' | 'trash' | 'sent'>('all');
  const { drafts, saveDraft, loadDraft, deleteDraft } = useDrafts();
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string } | null>(null);
  
  const insets = useSafeAreaInsets();

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

  useEffect(() => {
    if (params.emailId && allEmails.length > 0) {
      const email = allEmails.find(e => e.id === params.emailId);
      if (email) {
        setSelectedEmail(email);
        // If compose parameter is present, set up compose view instead of detail view
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
        case 'drafts-ai':
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
        case 'drafts-ai':
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
    if (saveDraft(composeTo, composeCc, composeSubject, composeBody)) {
      setCurrentView('inbox');
      setActiveFilter('drafts');
    }
  };

  const handleLoadDraft = (draft: typeof drafts[0]) => {
    const loaded = loadDraft(draft);
    setComposeTo(loaded.to);
    setComposeCc(loaded.cc || '');
    setComposeSubject(loaded.subject);
    setComposeBody(loaded.body);
    setCurrentView('compose');
  };

  const handleDeleteDraft = (draftId: string) => {
    deleteDraft(draftId);
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
      
      // Load existing custom folders
      const existingRaw = await AsyncStorage.getItem('custom-folders-v1');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      
      // Add new folder
      const newFolder = { 
        id: Date.now().toString(), 
        name: folderName.trim(), 
        color: Colors.light.primary, 
        count: 0 
      };
      const updatedFolders = [newFolder, ...existing];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('custom-folders-v1', JSON.stringify(updatedFolders));
      
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
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const smartFolders = useSmartFolders(messages, allEmails, isDemoMode);

  const renderFolderDetail = () => {
    if (!selectedFolder) return null;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.folderDetailHeader, { backgroundColor: selectedFolder.color, paddingTop: insets.top + 16 }]}>
          <TouchableOpacity 
            onPress={() => setCurrentView('folders')} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.folderDetailHeaderContent}>
            <Text style={[styles.folderDetailTitle]}>{selectedFolder.name}</Text>
            <Text style={[styles.folderDetailSubtitle]}>{filteredEmails.length} emails</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.emailList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        >
          {filteredEmails.length === 0 ? (
            <View style={styles.emptyState}>
              <Mail size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No emails found</Text>
            </View>
          ) : (
            filteredEmails.map((email: EmailMessage) => {
              const categoryColor = email.category ? colors.category[email.category] : colors.primary;
              
              return (
                <TouchableOpacity
                  key={email.id}
                  testID={`email-${email.id}`}
                  style={[styles.emailCard, { backgroundColor: colors.surface }, !email.isRead && { backgroundColor: colors.surface }, { borderLeftColor: categoryColor }]}
                  onPress={() => handleEmailPress(email)}
                  activeOpacity={0.7}
                >
                  <View style={styles.emailCardContent}>
                    <View style={styles.emailCardHeader}>
                      <Text
                        style={[styles.emailFrom, { color: colors.text }, !email.isRead && styles.emailFromUnread]}
                        numberOfLines={1}
                      >
                        {email.from.split('<')[0].trim() || email.from}
                      </Text>
                      <View style={styles.emailMeta}>
                        <Text style={[styles.emailDate, { color: colors.textSecondary }]}>{formatDate(email.date)}</Text>
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
                            color={email.isStarred ? colors.warning : colors.textSecondary}
                            fill={email.isStarred ? colors.warning : 'none'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text
                      style={[styles.emailSubject, { color: colors.text }, !email.isRead && styles.emailSubjectUnread]}
                      numberOfLines={1}
                    >
                      {email.subject}
                    </Text>
                    <Text style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
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

  const handleToggleSelection = (emailId: string) => {
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
  };

  const handleSelectAll = () => {
    setSelectedEmails(new Set(filteredEmails.map(e => e.id)));
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedEmails(new Set());
  };

  const handleBulkDelete = () => {
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
  };

  const handleBulkArchive = () => {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Bulk archive is disabled in demo mode');
      return;
    }
    Alert.alert('Success', `${selectedEmails.size} emails archived`);
    handleCancelSelection();
  };

  const handleBulkMarkRead = () => {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Bulk mark read is disabled in demo mode');
      return;
    }
    Alert.alert('Success', `${selectedEmails.size} emails marked as read`);
    handleCancelSelection();
  };

  const handleBulkMove = () => {
    Alert.alert('Move Emails', `Move ${selectedEmails.size} emails to...`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Promotions', onPress: () => handleCancelSelection() },
      { text: 'Social', onPress: () => handleCancelSelection() },
      { text: 'Spam', onPress: () => handleCancelSelection() },
    ]);
  };

  const handleNextEmail = () => {
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
  };

  const handlePrevEmail = () => {
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
  };





  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {currentView === 'inbox' && (
        <InboxView
          insets={insets}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filteredEmails={filteredEmails}
          drafts={drafts}
          smartFolders={smartFolders}
          onEmailPress={handleEmailPress}
          onStarEmail={handleStar}
          onLoadDraft={handleLoadDraft}
          onDeleteDraft={handleDeleteDraft}
          onCreateFolder={() => setIsModalVisible(true)}
          selectionMode={selectionMode}
          selectedEmails={selectedEmails}
          onToggleSelection={handleToggleSelection}
          onSelectAll={handleSelectAll}
          onCancelSelection={handleCancelSelection}
          onBulkDelete={handleBulkDelete}
          onBulkArchive={handleBulkArchive}
          onBulkMarkRead={handleBulkMarkRead}
          onBulkMove={handleBulkMove}
          onCompose={handleCompose}
        />
      )}
      {currentView === 'folders' && (
        <FoldersView
          insets={insets}
          isDemoMode={isDemoMode}
          smartFolders={smartFolders}
          onCreateFolder={() => setIsModalVisible(true)}
        />
      )}
      {currentView === 'folder-detail' && renderFolderDetail()}
      {currentView === 'detail' && selectedEmail && (() => {
        const currentIndex = filteredEmails.findIndex(e => e.id === selectedEmail.id);
        const hasNext = currentIndex !== -1 && currentIndex < filteredEmails.length - 1;
        const hasPrev = currentIndex > 0;
        
        return (
        <EmailDetailView
          selectedEmail={selectedEmail}
          insets={insets}
          onBack={() => setCurrentView('inbox')}
          onStar={handleStar}
          onArchive={handleArchive}
          onReply={handleReply}
          onReplyAll={handleReplyAll}
          onForward={handleForward}
            onNext={hasNext ? handleNextEmail : undefined}
            onPrev={hasPrev ? handlePrevEmail : undefined}
            hasNext={hasNext}
            hasPrev={hasPrev}
            currentIndex={currentIndex !== -1 ? currentIndex : undefined}
            totalCount={filteredEmails.length}
        />
        );
      })()}
      {currentView === 'compose' && (
        <ComposeView
          insets={insets}
          composeTo={composeTo}
          composeCc={composeCc}
          composeSubject={composeSubject}
          composeBody={composeBody}
          onChangeComposeTo={setComposeTo}
          onChangeComposeCc={setComposeCc}
          onChangeComposeSubject={setComposeSubject}
          onChangeComposeBody={setComposeBody}
          onClose={() => setCurrentView('inbox')}
          onSend={handleSend}
          onSaveDraft={handleSaveDraft}
          onOpenAIModal={() => setIsAIModalVisible(true)}
        />
      )}






      <AIModal
        visible={isAIModalVisible}
        onClose={() => setIsAIModalVisible(false)}
        onGenerate={(format, tone, length, prompt) => {
          Alert.alert('AI Generation', `Generating ${format} email with ${tone} tone, ${length} length...`);
        }}
        insets={insets}
      />

      <CreateFolderModal
        visible={isModalVisible}
        folderName={folderName}
        folderRule={folderRule}
        isCreating={isCreating}
        onClose={() => !isCreating && setIsModalVisible(false)}
        onFolderNameChange={setFolderName}
        onFolderRuleChange={setFolderRule}
        onCreate={handleCreateFolder}
      />

      {toast && (
        <View
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: insets.bottom + 8, // hug the bottom as close as safe
            backgroundColor: colors.surface,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#10B98155', // emerald tint
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#10B98122', // soft emerald background
                borderWidth: 1,
                borderColor: '#10B98155',
              }}
            >
              <Check size={18} color="#10B981" strokeWidth={3} />
            </View>
            <Text style={{ color: colors.text }}>{toast.message}</Text>
          </View>
        </View>
      )}
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
  backButton: {
    padding: 4,
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
});
