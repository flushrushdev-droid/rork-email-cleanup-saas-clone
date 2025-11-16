import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { FolderOpen, AlertCircle, Receipt, ShoppingBag, Plane, Tag, Users, Plus, ChevronRight, FileText, Briefcase, Scale, X } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { mockSmartFolders, mockRecentEmails } from '@/mocks/emailData';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Email, EmailCategory } from '@/constants/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateFolderModal } from '@/components/mail/CreateFolderModal';

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

function categorizeEmail(email: Email): EmailCategory | undefined {
  const searchText = `${email.subject} ${email.snippet} ${email.from}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return category as EmailCategory;
    }
  }
  
  return undefined;
}

export default function FoldersScreen() {
  const { messages } = useGmailSync();
  const { isDemoMode } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>('');
  const [folderRule, setFolderRule] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [customFolders, setCustomFolders] = useState<Array<{ id: string; name: string; color: string; count: number }>>([]);
  // No persistence for demo mode - folders reset on refresh
  
  // One-time cleanup: remove persisted folders
  React.useEffect(() => {
    AsyncStorage.removeItem('custom-folders-v1').catch(() => {});
  }, []);

  const emailsWithCategories = useMemo(() => {
    if (isDemoMode || messages.length === 0) {
      return mockRecentEmails;
    }

    return messages.map(email => ({
      ...email,
      category: categorizeEmail(email),
      date: new Date(email.date),
      size: email.sizeBytes,
      tags: [],
      attachmentCount: 0,
      isStarred: false,
      priority: undefined as 'action' | 'later' | 'fyi' | 'low' | undefined,
    }));
  }, [messages, isDemoMode]);

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
    emailsWithCategories.forEach(email => {
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
  }, [messages, emailsWithCategories, isDemoMode]);

  const recentEmails = useMemo(() => {
    return emailsWithCategories
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [emailsWithCategories]);

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !folderRule.trim()) {
      Alert.alert('Missing Information', 'Please enter both folder name and rule');
      return;
    }

    setIsCreating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Creating folder:', { folderName, folderRule });
      
      // Add to custom list (no persistence for demo mode)
      const newFolder = { id: Date.now().toString(), name: folderName.trim(), color: Colors.light.primary, count: 0 };
      const updatedFolders = [newFolder, ...customFolders];
      setCustomFolders(updatedFolders);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Folders</Text>
        <Text style={styles.subtitle}>AI-organized email categories</Text>
        {isDemoMode && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoText}>Demo Mode - Sample Data</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity testID="create-folder" style={styles.createButton} onPress={() => setIsModalVisible(true)}>
          <Plus size={20} color={Colors.light.primary} />
          <Text style={styles.createButtonText}>Create Custom Folder</Text>
        </TouchableOpacity>

        {smartFolders.length === 0 && customFolders.length === 0 ? (
          <View style={styles.emptyState}>
            <FolderOpen size={48} color={Colors.light.textSecondary} />
            <Text style={styles.emptyStateTitle}>No folders yet</Text>
            <Text style={styles.emptyStateText}>Sync your emails to create smart folders</Text>
          </View>
        ) : (
          <View style={styles.foldersGrid}>
            {[...customFolders.map(f => ({...f, isCustom: true} as any)), ...smartFolders].map((folder: any) => {
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
                        category: folder.category,
                        folderColor: folder.color || Colors.light.primary,
                        ...(folder.isCustom ? { isCustom: '1' } : {}),
                      },
                    });
                  }}
                >
                  <View style={[styles.folderIcon, { backgroundColor: folder.color + '20' }]}>
                    {folder.isCustom ? <FolderOpen size={28} color={folder.color || Colors.light.primary} /> : <Icon size={28} color={folder.color} />}
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

        {recentEmails.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Emails</Text>
              <TouchableOpacity testID="view-all-recent" onPress={() => Alert.alert('Recent Emails', 'Showing all recent emails')}>
                <Text style={styles.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentEmails.map((email) => {
              const categoryColor = email.category ? Colors.light.category[email.category] : Colors.light.primary;
              
              return (
                <TouchableOpacity key={email.id} style={[styles.emailCard, { borderLeftColor: categoryColor }]} onPress={() => Alert.alert('Email', email.subject)}>
                  <View style={styles.emailHeader}>
                    <View style={styles.emailMeta}>
                      <Text style={styles.emailFrom} numberOfLines={1}>{email.from}</Text>
                      <Text style={styles.emailDate}>
                        {new Date(email.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.emailSubject} numberOfLines={1}>{email.subject}</Text>
                  <Text style={styles.emailSnippet} numberOfLines={2}>{email.snippet}</Text>
                  <View style={styles.emailTags}>
                    {email.category && (
                      <View style={[styles.emailTag, { backgroundColor: categoryColor + '20' }]}>
                        <Text style={[styles.emailTagText, { color: categoryColor }]}>
                          {email.category}
                        </Text>
                      </View>
                    )}
                    {email.priority && email.priority !== 'low' && (
                      <View style={[styles.emailTag, { backgroundColor: Colors.light.status[email.priority === 'action' ? 'actionRequired' : email.priority === 'later' ? 'waiting' : 'fyi'] + '20' }]}>
                        <Text style={[styles.emailTagText, { color: Colors.light.status[email.priority === 'action' ? 'actionRequired' : email.priority === 'later' ? 'waiting' : 'fyi'] }] }>
                          {email.priority}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  demoBadge: {
    backgroundColor: '#FFF4E5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  demoText: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  scrollContent: {
    padding: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  foldersGrid: {
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  emailCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emailHeader: {
    marginBottom: 8,
  },
  emailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailFrom: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    flex: 1,
  },
  emailDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  emailSnippet: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  emailTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
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
});
