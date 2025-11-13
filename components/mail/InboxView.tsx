import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Animated, Modal } from 'react-native';
import { Search, X, FileEdit, Send, Trash2, Mail, Paperclip, Star, Plus, FolderOpen, AlertCircle, Receipt, ShoppingBag, Plane, Tag, Users, Archive, Folder, MailOpen, Check, Menu, Inbox, Clock, Bookmark, Calendar, File } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage, EmailCategory } from '@/constants/types';
import { formatDate } from '@/utils/dateFormat';

type FilterType = 'all' | 'unread' | 'starred' | 'drafts' | 'drafts-ai' | 'trash' | 'sent';

type Draft = {
  id: string;
  to: string;
  cc?: string;
  subject: string;
  body: string;
  date: Date;
};

type SmartFolder = {
  id: string;
  name: string;
  count: number;
  color: string;
  icon: string;
  category?: EmailCategory;
};

interface InboxViewProps {
  insets: { top: number; bottom: number; left: number; right: number };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  filteredEmails: EmailMessage[];
  drafts: Draft[];
  smartFolders: SmartFolder[];
  onEmailPress: (email: EmailMessage) => void;
  onStarEmail: (emailId: string) => void;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => void;
  onCreateFolder: () => void;
  selectionMode: boolean;
  selectedEmails: Set<string>;
  onToggleSelection: (emailId: string) => void;
  onSelectAll: () => void;
  onCancelSelection: () => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onBulkMarkRead: () => void;
  onBulkMove: () => void;
  onCompose: () => void;
}

const iconMap: Record<string, any> = {
  'alert-circle': AlertCircle,
  'receipt': Receipt,
  'shopping-bag': ShoppingBag,
  'plane': Plane,
  'tag': Tag,
  'users': Users,
  'file-text': FileEdit,
  'briefcase': FileEdit,
  'scale': FileEdit,
};

export function InboxView({
  insets,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filteredEmails,
  drafts,
  smartFolders,
  onEmailPress,
  onStarEmail,
  onLoadDraft,
  onDeleteDraft,
  onCreateFolder,
  selectionMode,
  selectedEmails,
  onToggleSelection,
  onSelectAll,
  onCancelSelection,
  onBulkDelete,
  onBulkArchive,
  onBulkMarkRead,
  onBulkMove,
  onCompose,
}: InboxViewProps) {
  const { colors } = useTheme();
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [activeFilterModal, setActiveFilterModal] = React.useState<'labels' | 'from' | 'to' | 'attachment' | null>(null);
  const [labelSearchQuery, setLabelSearchQuery] = React.useState('');
  const [contactSearchQuery, setContactSearchQuery] = React.useState('');
  const [appliedLabelFilter, setAppliedLabelFilter] = React.useState<string | null>(null);
  const [appliedAttachmentFilter, setAppliedAttachmentFilter] = React.useState<string | null>(null);
  const [appliedContactFilter, setAppliedContactFilter] = React.useState<{ name: string; email: string } | null>(null);
  const [searchHistory] = React.useState<string[]>([
    'Important',
    'Receipts',
    'Newsletter',
    'Work',
  ]);
  const [mockContacts] = React.useState([
    { name: 'John Smith', email: 'john.smith@company.com', initial: 'J', color: '#FF6B6B' },
    { name: 'Sarah Johnson', email: 'sarah.j@example.com', initial: 'S', color: '#4ECDC4' },
    { name: 'Michael Brown', email: 'mbrown@work.com', initial: 'M', color: '#45B7D1' },
    { name: 'Emily Davis', email: 'emily.davis@email.com', initial: 'E', color: '#96CEB4' },
    { name: 'David Wilson', email: 'dwilson@company.com', initial: 'D', color: '#FFEAA7' },
    { name: 'Lisa Anderson', email: 'lisa.a@domain.com', initial: 'L', color: '#DFE6E9' },
    { name: 'James Taylor', email: 'jtaylor@work.com', initial: 'J', color: '#74B9FF' },
    { name: 'Jessica Martinez', email: 'jmartinez@example.com', initial: 'J', color: '#A29BFE' },
  ]);
  const sidebarSlideAnim = React.useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    Animated.timing(sidebarSlideAnim, {
      toValue: isSidebarVisible ? 0 : -300,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isSidebarVisible, sidebarSlideAnim]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const getFilteredSearchResults = () => {
    let results = filteredEmails;

    // Apply label filter
    if (appliedLabelFilter) {
      switch (appliedLabelFilter) {
        case 'starred':
          results = results.filter(e => e.isStarred);
          break;
        case 'important':
          results = results.filter(e => e.priority === 'action' || e.subject.toLowerCase().includes('important'));
          break;
        case 'sent':
          // For demo, show empty or some sent-like emails
          results = [];
          break;
        case 'drafts':
          results = [];
          break;
        case 'purchases':
          results = results.filter(e => 
            e.subject.toLowerCase().includes('order') ||
            e.subject.toLowerCase().includes('receipt') ||
            e.subject.toLowerCase().includes('purchase')
          );
          break;
        case 'all':
          // Show all
          break;
        default:
          break;
      }
    }

    // Apply attachment filter
    if (appliedAttachmentFilter) {
      switch (appliedAttachmentFilter) {
        case 'any':
          results = results.filter(e => e.hasAttachments);
          break;
        case 'documents':
          results = results.filter(e => 
            e.hasAttachments && e.attachments?.some(a => 
              a.filename.match(/\.(doc|docx)$/i) ||
              a.mimeType.includes('msword') ||
              a.mimeType.includes('wordprocessingml')
            )
          );
          break;
        case 'images':
          results = results.filter(e => 
            e.hasAttachments && e.attachments?.some(a => 
              a.filename.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i) ||
              a.mimeType.startsWith('image/')
            )
          );
          break;
        case 'pdfs':
          results = results.filter(e => 
            e.hasAttachments && e.attachments?.some(a => 
              a.filename.match(/\.pdf$/i) ||
              a.mimeType === 'application/pdf'
            )
          );
          break;
        case 'videos':
          results = results.filter(e => 
            e.hasAttachments && e.attachments?.some(a => 
              a.filename.match(/\.(mp4|avi|mov|wmv|flv|mkv|webm)$/i) ||
              a.mimeType.startsWith('video/')
            )
          );
          break;
        case 'slides':
          results = results.filter(e => 
            e.hasAttachments && e.attachments?.some(a => 
              a.filename.match(/\.(ppt|pptx)$/i) ||
              a.mimeType.includes('presentation')
            )
          );
          break;
        case 'sheets':
          results = results.filter(e => 
            e.hasAttachments && e.attachments?.some(a => 
              a.filename.match(/\.(xls|xlsx|csv)$/i) ||
              a.mimeType.includes('spreadsheet')
            )
          );
          break;
        default:
          results = results.filter(e => e.hasAttachments);
          break;
      }
    }

    // Apply contact filter (From/To)
    if (appliedContactFilter) {
      results = results.filter(e => 
        e.from.toLowerCase().includes(appliedContactFilter.email.toLowerCase()) ||
        e.from.toLowerCase().includes(appliedContactFilter.name.toLowerCase())
      );
    }

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(e =>
        e.subject.toLowerCase().includes(query) ||
        e.from.toLowerCase().includes(query) ||
        e.snippet.toLowerCase().includes(query)
      );
    }

    return results;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        {selectionMode ? (
          <>
            <TouchableOpacity onPress={onCancelSelection}>
              <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{selectedEmails.size} Selected</Text>
            <TouchableOpacity onPress={onSelectAll}>
              <Text style={[styles.selectAllText, { color: colors.primary }]}>Select All</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                testID="sidebar-toggle"
                onPress={toggleSidebar}
                style={[styles.sidebarButton, { backgroundColor: colors.surface }]}
                activeOpacity={0.7}
              >
                <Menu size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {activeFilter === 'all' ? 'Mail' : 
                 activeFilter === 'drafts-ai' ? 'Drafts By AI' :
                 activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              </Text>
            </View>
            <TouchableOpacity
              testID="compose-button"
              onPress={onCompose}
              style={[styles.composeButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Mail size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {!isSearchFocused && (
        <TouchableOpacity 
          style={[styles.searchContainer, { backgroundColor: colors.surface }]}
          onPress={() => setIsSearchFocused(true)}
          activeOpacity={0.8}
        >
          <Search size={18} color={colors.textSecondary} />
          <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
            Search mail
          </Text>
        </TouchableOpacity>
      )}

      {isSearchFocused ? (
        <View style={[styles.searchView, { backgroundColor: colors.background }]}>
          <View style={[styles.searchHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              onPress={() => {
                setIsSearchFocused(false);
                setAppliedLabelFilter(null);
                setAppliedAttachmentFilter(null);
                setAppliedContactFilter(null);
              }} 
              style={styles.backButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={[styles.searchInputContainer, { backgroundColor: colors.surface }]}>
              <Search size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search in emails"
                value={searchQuery}
                onChangeText={onSearchChange}
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => onSearchChange('')}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.searchContent} showsVerticalScrollIndicator={false}>
            <View style={styles.filterRow}>
              <TouchableOpacity 
                style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setActiveFilterModal('labels')}
              >
                <Text style={[styles.filterButtonText, { color: colors.text }]}>Labels</Text>
                <Text style={[styles.filterArrow, { color: colors.textSecondary }]}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setActiveFilterModal('from')}
              >
                <Text style={[styles.filterButtonText, { color: colors.text }]}>From</Text>
                <Text style={[styles.filterArrow, { color: colors.textSecondary }]}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setActiveFilterModal('to')}
              >
                <Text style={[styles.filterButtonText, { color: colors.text }]}>To</Text>
                <Text style={[styles.filterArrow, { color: colors.textSecondary }]}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setActiveFilterModal('attachment')}
              >
                <Text style={[styles.filterButtonText, { color: colors.text }]}>Attachment</Text>
                <Text style={[styles.filterArrow, { color: colors.textSecondary }]}>▼</Text>
              </TouchableOpacity>
            </View>

            {searchQuery.length === 0 && searchHistory.length > 0 && !appliedLabelFilter && !appliedAttachmentFilter && !appliedContactFilter && (
              <View style={styles.historySection}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>Recent email searches</Text>
                {searchHistory.map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.historyItem, { borderBottomColor: colors.border }]}
                    onPress={() => onSearchChange(term)}
                  >
                    <View style={[styles.historyIcon, { backgroundColor: colors.surface }]}>
                      <Search size={16} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.historyText, { color: colors.text }]}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {(searchQuery.length > 0 || appliedLabelFilter || appliedAttachmentFilter || appliedContactFilter) && (
              <View style={styles.searchResults}>
                {(appliedLabelFilter || appliedAttachmentFilter || appliedContactFilter) && (
                  <View style={styles.activeFiltersRow}>
                    {appliedLabelFilter && (
                      <View style={[styles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.activeFilterText, { color: colors.primary }]}>
                          {appliedLabelFilter.charAt(0).toUpperCase() + appliedLabelFilter.slice(1)}
                        </Text>
                        <TouchableOpacity onPress={() => setAppliedLabelFilter(null)}>
                          <X size={14} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    )}
                    {appliedAttachmentFilter && (
                      <View style={[styles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.activeFilterText, { color: colors.primary }]}>
                          {appliedAttachmentFilter === 'any' ? 'Has attachment' : appliedAttachmentFilter.charAt(0).toUpperCase() + appliedAttachmentFilter.slice(1)}
                        </Text>
                        <TouchableOpacity onPress={() => setAppliedAttachmentFilter(null)}>
                          <X size={14} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    )}
                    {appliedContactFilter && (
                      <View style={[styles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.activeFilterText, { color: colors.primary }]}>
                          {appliedContactFilter.name}
                        </Text>
                        <TouchableOpacity onPress={() => setAppliedContactFilter(null)}>
                          <X size={14} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
                <Text style={[styles.resultsTitle, { color: colors.text }]}>
                  {getFilteredSearchResults().length} results
                </Text>
                {getFilteredSearchResults().slice(0, 50).map((email) => {
                  const senderName = email.from.split('<')[0].trim() || email.from;
                  const senderInitial = senderName[0]?.toUpperCase() || '?';
                  const senderColor = `hsl(${senderInitial.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`;

                  return (
                    <TouchableOpacity
                      key={email.id}
                      style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                      onPress={() => {
                        setIsSearchFocused(false);
                        setAppliedLabelFilter(null);
                        setAppliedAttachmentFilter(null);
                        setAppliedContactFilter(null);
                        onEmailPress(email);
                      }}
                    >
                      <View style={[styles.senderAvatar, { backgroundColor: senderColor }]}>
                        <Text style={styles.senderInitial}>{senderInitial}</Text>
                      </View>
                      <View style={styles.searchResultContent}>
                        <Text style={[styles.searchResultSubject, { color: colors.text }]} numberOfLines={1}>
                          {email.subject}
                        </Text>
                        <Text style={[styles.searchResultFrom, { color: colors.textSecondary }]} numberOfLines={1}>
                          {email.from}
                        </Text>
                        <Text style={[styles.searchResultSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
                          {email.snippet}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        <ScrollView 
          style={styles.emailList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        >
        {activeFilter === 'drafts' || activeFilter === 'drafts-ai' ? (
          drafts.length === 0 ? (
            <View style={styles.emptyState}>
              <FileEdit size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {activeFilter === 'drafts-ai' ? 'No AI drafts' : 'No drafts'}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {activeFilter === 'drafts-ai' ? 'Use AI to generate email drafts' : 'Start composing to save drafts'}
              </Text>
            </View>
          ) : (
            drafts.map((draft) => {
              // Get initial from recipient
              const recipientName = draft.to?.split('<')[0].trim() || draft.to || '?';
              const recipientInitial = recipientName[0]?.toUpperCase() || 'D';

              return (
                <TouchableOpacity
                  key={draft.id}
                  testID={`draft-${draft.id}`}
                  style={[styles.draftCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}
                  onPress={() => onLoadDraft(draft)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.senderAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.senderInitial}>{recipientInitial}</Text>
                  </View>
                  <View style={styles.draftCardContent}>
                    <View style={styles.draftCardHeader}>
                      <FileEdit size={16} color={colors.primary} />
                      <Text style={[styles.draftBadge, { color: colors.primary }]}>
                        {activeFilter === 'drafts-ai' ? 'AI Draft' : 'Draft'}
                      </Text>
                      <Text style={[styles.draftDate, { color: colors.textSecondary }]}>{formatDate(draft.date)}</Text>
                    </View>
                    <Text style={[styles.draftTo, { color: colors.text }]} numberOfLines={1}>
                      To: {draft.to || '(no recipient)'}
                    </Text>
                    <Text style={[styles.draftSubject, { color: colors.text }]} numberOfLines={1}>
                      {draft.subject || '(no subject)'}
                    </Text>
                    {draft.body && (
                      <Text style={[styles.draftBody, { color: colors.textSecondary }]} numberOfLines={2}>
                        {draft.body}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    testID={`delete-draft-${draft.id}`}
                    onPress={(e) => {
                      e.stopPropagation();
                      onDeleteDraft(draft.id);
                    }}
                    style={styles.deleteDraftButton}
                  >
                    <Trash2 size={18} color={colors.danger} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )
        ) : activeFilter === 'sent' ? (
          <View style={styles.emptyState}>
            <Send size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No sent emails</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Your sent messages will appear here</Text>
          </View>
        ) : activeFilter === 'trash' ? (
          <View style={styles.emptyState}>
            <Trash2 size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Trash is empty</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Deleted emails will appear here</Text>
          </View>
        ) : filteredEmails.length === 0 ? (
          <View style={styles.emptyState}>
            <Mail size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No emails found</Text>
          </View>
        ) : (
          filteredEmails.map((email: EmailMessage) => {
            // Extract sender name and get initial
            const senderName = email.from.split('<')[0].trim() || email.from;
            const senderEmail = email.from.match(/<(.+?)>/) ? email.from.match(/<(.+?)>/)![1] : email.from;
            const initial = senderName[0]?.toUpperCase() || '?';
            
            // Generate consistent color based on sender email
            const colorIndex = senderEmail.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
            const avatarColors = [
              '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
              '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
            ];
            const avatarColor = avatarColors[colorIndex];

            const isSelected = selectedEmails.has(email.id);

            return (
              <TouchableOpacity
                key={email.id}
                testID={`email-${email.id}`}
                style={[styles.emailCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }, !email.isRead && { backgroundColor: colors.surface }, isSelected && { backgroundColor: colors.primary + '15' }]}
                onPress={() => {
                  if (selectionMode) {
                    onToggleSelection(email.id);
                  } else {
                    onEmailPress(email);
                  }
                }}
                onLongPress={() => onToggleSelection(email.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.senderAvatar, { backgroundColor: avatarColor }]}>
                  <Text style={styles.senderInitial}>{initial}</Text>
                </View>
                <View style={styles.emailCardContent}>
                  <View style={styles.emailCardHeader}>
                    <Text
                      style={[styles.emailFrom, { color: colors.text }, !email.isRead && styles.emailFromUnread]}
                      numberOfLines={1}
                    >
                      {senderName}
                    </Text>
                    <View style={styles.emailMeta}>
                      <Text style={[styles.emailDate, { color: colors.textSecondary }]}>{formatDate(email.date)}</Text>
                      <TouchableOpacity
                        testID={`star-${email.id}`}
                        onPress={(e) => {
                          e.stopPropagation();
                          onStarEmail(email.id);
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
                  {email.hasAttachments && (
                    <View style={styles.attachmentBadge}>
                      <Paperclip size={12} color={colors.textSecondary} />
                    </View>
                  )}
                </View>
                {selectionMode ? (
                  <View style={[styles.checkbox, { borderColor: colors.border }, isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                    {isSelected && <Check size={16} color="#FFFFFF" />}
                  </View>
                ) : (
                  !email.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      )}

      {selectionMode && selectedEmails.size > 0 && (
        <View style={[styles.bottomToolbar, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            testID="bulk-archive"
            style={styles.toolbarButton}
            onPress={onBulkArchive}
          >
            <Archive size={24} color={colors.text} />
            <Text style={[styles.toolbarButtonText, { color: colors.textSecondary }]}>Archive</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="bulk-delete"
            style={styles.toolbarButton}
            onPress={onBulkDelete}
          >
            <Trash2 size={24} color={colors.danger} />
            <Text style={[styles.toolbarButtonText, { color: colors.textSecondary }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="bulk-move"
            style={styles.toolbarButton}
            onPress={onBulkMove}
          >
            <Folder size={24} color={colors.text} />
            <Text style={[styles.toolbarButtonText, { color: colors.textSecondary }]}>Move</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="bulk-mark-read"
            style={styles.toolbarButton}
            onPress={onBulkMarkRead}
          >
            <MailOpen size={24} color={colors.text} />
            <Text style={[styles.toolbarButtonText, { color: colors.textSecondary }]}>Read</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { backgroundColor: colors.background, left: sidebarSlideAnim, paddingTop: insets.top }]}>
        <View style={[styles.sidebarHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sidebarTitle, { color: colors.text }]}>Filters & Folders</Text>
          <TouchableOpacity onPress={toggleSidebar}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.sidebarContent} showsVerticalScrollIndicator={false}>
          {/* Mail Filters Section */}
          <View style={styles.sidebarSection}>
            <View style={styles.sectionHeader}>
              <Inbox size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Mail</Text>
            </View>
            
            {(['all', 'unread', 'starred', 'drafts', 'drafts-ai', 'sent', 'trash'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                testID={`sidebar-filter-${filter}`}
                style={[
                  styles.sidebarItem,
                  { backgroundColor: activeFilter === filter ? colors.primary + '15' : 'transparent' }
                ]}
                onPress={() => {
                  onFilterChange(filter);
                  toggleSidebar();
                }}
              >
                <Text style={[
                  styles.sidebarItemText,
                  { color: activeFilter === filter ? colors.primary : colors.text }
                ]}>
                  {filter === 'drafts-ai' ? 'Drafts By AI' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
                {activeFilter === filter && (
                  <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Smart Folders Section */}
          {smartFolders.length > 0 && (
            <View style={styles.sidebarSection}>
              <View style={styles.sectionHeader}>
                <FolderOpen size={20} color={colors.secondary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Folders</Text>
              </View>
              
              {smartFolders.map((folder) => {
                const Icon = iconMap[folder.icon] || FolderOpen;
                return (
                  <TouchableOpacity
                    key={folder.id}
                    testID={`sidebar-folder-${folder.id}`}
                    style={styles.sidebarItem}
                    onPress={() => {
                      router.push({
                        pathname: '/folder-details',
                        params: {
                          folderName: folder.name,
                          category: folder.category || '',
                          folderColor: folder.color,
                        },
                      });
                      toggleSidebar();
                    }}
                  >
                    <View style={styles.folderItemContent}>
                      <View style={[styles.folderIcon, { backgroundColor: folder.color + '20' }]}>
                        <Icon size={16} color={folder.color} />
                      </View>
                      <Text style={[styles.sidebarItemText, { color: colors.text }]}>{folder.name}</Text>
                    </View>
                    <View style={[styles.folderBadge, { backgroundColor: folder.color }]}>
                      <Text style={styles.folderBadgeText}>{folder.count}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                testID="sidebar-create-folder"
                style={[styles.sidebarItem, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 16 }]}
                onPress={() => {
                  onCreateFolder();
                  toggleSidebar();
                }}
              >
                <View style={styles.folderItemContent}>
                  <View style={[styles.folderIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Plus size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.sidebarItemText, { color: colors.primary }]}>Create Folder</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Overlay */}
      {isSidebarVisible && (
        <TouchableOpacity
          style={styles.sidebarOverlay}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
      )}

      {/* Filter Modals */}
      {/* Attachment Filter Modal */}
      <Modal
        visible={activeFilterModal === 'attachment'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveFilterModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Attachment</Text>
              <TouchableOpacity onPress={() => setActiveFilterModal(null)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {[
                { id: 'any', label: 'Has any attachment', icon: Paperclip },
                { id: 'documents', label: 'Documents', icon: File },
                { id: 'slides', label: 'Slides', icon: FileEdit },
                { id: 'sheets', label: 'Sheets', icon: FileEdit },
                { id: 'images', label: 'Images', icon: File },
                { id: 'pdfs', label: 'PDFs', icon: File },
                { id: 'videos', label: 'Videos', icon: File },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.modalItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setAppliedAttachmentFilter(type.id);
                      setActiveFilterModal(null);
                    }}
                  >
                    <Icon size={20} color={colors.primary} />
                    <Text style={[styles.modalItemText, { color: colors.text }]}>{type.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Labels Filter Modal */}
      <Modal
        visible={activeFilterModal === 'labels'}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setActiveFilterModal(null);
          setLabelSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Labels</Text>
              <TouchableOpacity onPress={() => {
                setActiveFilterModal(null);
                setLabelSearchQuery('');
              }}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={[styles.modalSearchContainer, { backgroundColor: colors.background }]}>
              <Search size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Search for labels"
                placeholderTextColor={colors.textSecondary}
                value={labelSearchQuery}
                onChangeText={setLabelSearchQuery}
              />
            </View>
            <ScrollView style={styles.modalList}>
              {[
                { id: 'starred', label: 'Starred', icon: Star },
                { id: 'snoozed', label: 'Snoozed', icon: Clock },
                { id: 'important', label: 'Important', icon: Bookmark },
                { id: 'sent', label: 'Sent', icon: Send },
                { id: 'scheduled', label: 'Scheduled', icon: Calendar },
                { id: 'drafts', label: 'Drafts', icon: FileEdit },
                { id: 'all', label: 'All mail', icon: Mail },
                { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
              ]
                .filter(label => 
                  label.label.toLowerCase().includes(labelSearchQuery.toLowerCase())
                )
                .map((label) => {
                  const Icon = label.icon;
                  return (
                    <TouchableOpacity
                      key={label.id}
                      style={[styles.modalItem, { borderBottomColor: colors.border }]}
                      onPress={() => {
                        setAppliedLabelFilter(label.id);
                        setActiveFilterModal(null);
                        setLabelSearchQuery('');
                      }}
                    >
                      <Icon size={20} color={colors.textSecondary} />
                      <Text style={[styles.modalItemText, { color: colors.text }]}>{label.label}</Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* To/From Filter Modal */}
      <Modal
        visible={activeFilterModal === 'to' || activeFilterModal === 'from'}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setActiveFilterModal(null);
          setContactSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {activeFilterModal === 'to' ? 'To' : 'From'}
              </Text>
              <TouchableOpacity onPress={() => {
                setActiveFilterModal(null);
                setContactSearchQuery('');
              }}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={[styles.modalSearchContainer, { backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Type a name or email address"
                placeholderTextColor={colors.textSecondary}
                value={contactSearchQuery}
                onChangeText={setContactSearchQuery}
              />
            </View>
            <ScrollView style={styles.modalList}>
              <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>Suggestions</Text>
              {mockContacts
                .filter(contact =>
                  contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                  contact.email.toLowerCase().includes(contactSearchQuery.toLowerCase())
                )
                .map((contact, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.modalItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setAppliedContactFilter({ name: contact.name, email: contact.email });
                      setActiveFilterModal(null);
                      setContactSearchQuery('');
                    }}
                  >
                    <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                      <Text style={styles.contactInitial}>{contact.initial}</Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                      <Text style={[styles.contactEmail, { color: colors.textSecondary }]}>{contact.email}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              
              {contactSearchQuery.length === 0 && (
                <>
                  <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>All contacts</Text>
                  <Text style={[styles.contactSectionLetter, { color: colors.text }]}>J</Text>
                  {mockContacts.filter(c => c.name.startsWith('J')).map((contact, index) => (
                    <TouchableOpacity
                      key={`all-${index}`}
                      style={[styles.modalItem, { borderBottomColor: colors.border }]}
                      onPress={() => {
                        setAppliedContactFilter({ name: contact.name, email: contact.email });
                        setActiveFilterModal(null);
                        setContactSearchQuery('');
                      }}
                    >
                      <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                        <Text style={styles.contactInitial}>{contact.initial}</Text>
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                        <Text style={[styles.contactEmail, { color: colors.textSecondary }]}>{contact.email}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sidebarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingVertical: 0,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
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
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  emailCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emailCardUnread: {
    backgroundColor: '#FFFFFF',
  },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  },
  starButton: {
    padding: 2,
  },
  emailSubject: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  emailSubjectUnread: {
    fontWeight: '600',
  },
  emailSnippet: {
    fontSize: 13,
    lineHeight: 18,
  },
  attachmentBadge: {
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  draftCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 3,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  draftDate: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  draftTo: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  draftSubject: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  draftBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  deleteDraftButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  bottomToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  toolbarButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
    zIndex: 1000,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  sidebarContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sidebarSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  sidebarItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  folderItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  folderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  folderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchView: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  searchContent: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterArrow: {
    fontSize: 10,
  },
  historySection: {
    paddingTop: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyText: {
    flex: 1,
    fontSize: 15,
  },
  searchResults: {
    paddingTop: 16,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultSubject: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  searchResultFrom: {
    fontSize: 13,
    marginBottom: 4,
  },
  searchResultSnippet: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  modalList: {
    flex: 1,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  modalItemText: {
    flex: 1,
    fontSize: 15,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 13,
  },
  contactSectionLetter: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
