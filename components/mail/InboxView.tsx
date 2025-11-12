import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, X, Calendar, FileEdit, Send, Trash2, Mail, Paperclip, Star, Plus, FolderOpen, AlertCircle, Receipt, ShoppingBag, Plane, Tag, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
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
  onToggleCalendar: () => void;
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
  onToggleCalendar,
}: InboxViewProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Mail</Text>
        <TouchableOpacity
          testID="calendar-toggle"
          onPress={onToggleCalendar}
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
          onChangeText={onSearchChange}
          placeholderTextColor={Colors.light.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
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
              onPress={() => onFilterChange(filter)}
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
              onPress={onCreateFolder}
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
                onPress={() => onLoadDraft(draft)}
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
                    onDeleteDraft(draft.id);
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
              onPress={() => onEmailPress(email)}
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
                        onStarEmail(email.id);
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
}

const styles = StyleSheet.create({
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
  calendarButton: {
    padding: 4,
    backgroundColor: 'transparent',
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
