import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, X, FileEdit, Send, Trash2, Mail, Paperclip, Star, Plus, FolderOpen, AlertCircle, Receipt, ShoppingBag, Plane, Tag, Users, Archive, Folder, MailOpen, Check, PenSquare } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage, EmailCategory } from '@/constants/types';
import { formatDate } from '@/utils/dateFormat';

type FilterType = 'all' | 'unread' | 'starred' | 'drafts' | 'trash' | 'sent';

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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Mail</Text>
            <TouchableOpacity
              testID="compose-button"
              onPress={onCompose}
              style={[styles.composeButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <PenSquare size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search mail"
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor={colors.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <X size={18} color={colors.textSecondary} />
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
                { backgroundColor: colors.surface, borderColor: colors.border },
                activeFilter === filter && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => onFilterChange(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { color: colors.text },
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
          <Text style={[styles.smartFoldersTitle, { color: colors.text }]}>Smart Folders</Text>
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
                  <Text style={[styles.smartFolderName, { color: colors.text }]} numberOfLines={1}>{folder.name}</Text>
                  <View style={[styles.smartFolderBadge, { backgroundColor: folder.color }]}>
                    <Text style={styles.smartFolderCount}>{folder.count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              testID="create-folder-button"
              style={styles.smartFolderCard}
              onPress={onCreateFolder}
            >
              <View style={[styles.smartFolderIcon, styles.createFolderIcon, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                <Plus size={24} color={colors.primary} />
              </View>
              <Text style={[styles.smartFolderName, styles.createFolderText, { color: colors.primary }]}>Create</Text>
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
              <FileEdit size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No drafts</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Start composing to save drafts</Text>
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
                      <Text style={[styles.draftBadge, { color: colors.primary }]}>Draft</Text>
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
    borderWidth: 1,
  },
  filterButtonActive: {
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  createFolderText: {
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
});
