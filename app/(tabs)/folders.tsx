import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { router } from 'expo-router';
import { FolderOpen, Plus, ChevronRight, X } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { mockSmartFolders, mockRecentEmails } from '@/mocks/emailData';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Email, EmailCategory } from '@/constants/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateFolderModal } from '@/components/mail/CreateFolderModal';
import { createFoldersStyles } from '@/styles/app/folders';
import { categorizeEmail, folderIconMap } from '@/utils/emailCategories';
import { createScopedLogger } from '@/utils/logger';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { EmptyState } from '@/components/common/EmptyState';
import type { SmartFolder } from '@/hooks/useSmartFolders';

const foldersLogger = createScopedLogger('Folders');


export default function FoldersScreen() {
  const { colors } = useTheme();
  const { messages } = useGmailSync();
  const { isDemoMode } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useEnhancedToast();
  const { handleAsync } = useErrorHandler({ showAlert: true });
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>('');
  const [folderRule, setFolderRule] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  type CustomFolder = { id: string; name: string; color: string; count: number; isCustom: true };
  type FolderWithCustom = SmartFolder | CustomFolder;
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
        color: colors.status.actionRequired,
        query: 'priority:action',
        count: actionRequiredEmails.length,
      },
      {
        id: '2',
        name: 'Invoices',
        icon: 'receipt',
        color: colors.category.invoices,
        query: 'category:invoices',
        count: categoryCounts.get('invoices') || 0,
        category: 'invoices' as EmailCategory,
      },
      {
        id: '3',
        name: 'Receipts',
        icon: 'shopping-bag',
        color: colors.category.receipts,
        query: 'category:receipts',
        count: categoryCounts.get('receipts') || 0,
        category: 'receipts' as EmailCategory,
      },
      {
        id: '4',
        name: 'Travel',
        icon: 'plane',
        color: colors.category.travel,
        query: 'category:travel',
        count: categoryCounts.get('travel') || 0,
        category: 'travel' as EmailCategory,
      },
      {
        id: '5',
        name: 'Promotions',
        icon: 'tag',
        color: colors.category.promotions,
        query: 'category:promotions',
        count: categoryCounts.get('promotions') || 0,
        category: 'promotions' as EmailCategory,
      },
      {
        id: '6',
        name: 'Social',
        icon: 'users',
        color: colors.category.social,
        query: 'category:social',
        count: categoryCounts.get('social') || 0,
        category: 'social' as EmailCategory,
      },
      {
        id: '7',
        name: 'HR',
        icon: 'briefcase',
        color: colors.category.hr,
        query: 'category:hr',
        count: categoryCounts.get('hr') || 0,
        category: 'hr' as EmailCategory,
      },
      {
        id: '8',
        name: 'Legal',
        icon: 'scale',
        color: colors.category.legal,
        query: 'category:legal',
        count: categoryCounts.get('legal') || 0,
        category: 'legal' as EmailCategory,
      },
      {
        id: '9',
        name: 'System',
        icon: 'alert-circle',
        color: colors.category.system,
        query: 'category:system',
        count: categoryCounts.get('system') || 0,
        category: 'system' as EmailCategory,
      },
    ].filter(folder => folder.count > 0);
  }, [messages, emailsWithCategories, isDemoMode, colors]);

  const recentEmails = useMemo(() => {
    return emailsWithCategories
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [emailsWithCategories]);

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !folderRule.trim()) {
      showWarning('Please enter both folder name and rule');
      return;
    }

    setIsCreating(true);
    
    await handleAsync(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      foldersLogger.debug('Creating folder', undefined, { folderName, folderRule });
      
      // Add to custom list (no persistence for demo mode)
      const newFolder = { id: Date.now().toString(), name: folderName.trim(), color: colors.primary, count: 0 };
      const updatedFolders = [newFolder, ...customFolders];
      setCustomFolders(updatedFolders);
      
      showSuccess(`Folder "${folderName}" created successfully!`);
      
      setIsModalVisible(false);
      setFolderName('');
      setFolderRule('');
    }, {
      showAlert: true,
      onError: (error) => {
        showError('Failed to create folder. Please try again.');
      },
    });
    
    setIsCreating(false);
  };

  const styles = React.useMemo(() => createFoldersStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText style={styles.title} dynamicTypeStyle="title1">Smart Folders</AppText>
        <AppText style={styles.subtitle} dynamicTypeStyle="body">AI-organized email categories</AppText>
        {isDemoMode && (
          <View style={styles.demoBadge}>
            <AppText style={styles.demoText} dynamicTypeStyle="caption">Demo Mode - Sample Data</AppText>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity testID="create-folder" style={[styles.createButton, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={() => setIsModalVisible(true)}>
          <Plus size={20} color={colors.primary} />
          <AppText style={[styles.createButtonText, { color: colors.primary }]} dynamicTypeStyle="headline">Create Custom Folder</AppText>
        </TouchableOpacity>

        {smartFolders.length === 0 && customFolders.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No folders yet"
            description="Sync your emails to create smart folders"
            iconSize={48}
            style={styles.emptyState}
          />
        ) : (
          <View style={styles.foldersGrid}>
            {([...customFolders.map(f => ({...f, isCustom: true} as CustomFolder)), ...smartFolders] as FolderWithCustom[]).map((folder) => {
              const Icon = folderIconMap[folder.icon] || FolderOpen;
              
              return (
                <TouchableOpacity 
                  key={folder.id} 
                  testID={`folder-${folder.id}`}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`${folder.name}, ${folder.count} emails`}
                  accessibilityHint="Double tap to view emails in this folder"
                  style={styles.folderCard} 
                  onPress={() => {
                    router.push({
                      pathname: '/folder-details',
                      params: {
                        folderName: folder.name,
                        category: folder.category,
                        folderColor: folder.color || colors.primary,
                        ...(folder.isCustom ? { isCustom: '1' } : {}),
                      },
                    });
                  }}
                >
                  <View 
                    style={[styles.folderIcon, { backgroundColor: folder.color + '20' }]}
                    accessible={true}
                    accessibilityRole="image"
                    accessibilityLabel={`${folder.name} folder icon`}
                  >
                    {folder.isCustom ? <FolderOpen size={28} color={folder.color || colors.primary} /> : <Icon size={28} color={folder.color} />}
                  </View>
                  <View style={styles.folderContent}>
                    <AppText 
                      style={[styles.folderName, { color: colors.text }]}
                      accessibilityRole="text"
                      dynamicTypeStyle="body"
                    >
                      {folder.name}
                    </AppText>
                    <AppText 
                      style={[styles.folderCount, { color: colors.textSecondary }]}
                      accessibilityRole="text"
                      dynamicTypeStyle="caption"
                    >
                      {folder.count} emails
                    </AppText>
                  </View>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {recentEmails.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle} dynamicTypeStyle="headline">Recent Emails</AppText>
              <TouchableOpacity 
                testID="view-all-recent"
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="View All"
                accessibilityHint="Double tap to view all recent emails"
                onPress={() => showInfo('Showing all recent emails')}
              >
                <AppText style={styles.seeAll} dynamicTypeStyle="caption">View All</AppText>
              </TouchableOpacity>
            </View>

            {recentEmails.map((email) => {
              const categoryColor = email.category ? colors.category[email.category] : colors.primary;
              
              return (
                <TouchableOpacity 
                  key={email.id} 
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Email from ${email.from}, subject: ${email.subject || 'No subject'}`}
                  accessibilityHint="Double tap to view this email"
                  style={[styles.emailCard, { borderLeftColor: categoryColor, backgroundColor: colors.surface }]} 
                  onPress={() => {
                    router.push({
                      pathname: '/email-detail',
                      params: { emailId: email.id },
                    });
                  }}
                >
                  <View style={styles.emailHeader}>
                    <View style={styles.emailMeta}>
                      <AppText 
                        style={[styles.emailFrom, { color: colors.text }]} 
                        numberOfLines={1}
                        accessibilityRole="text"
                        dynamicTypeStyle="body"
                      >
                        {email.from}
                      </AppText>
                      <AppText 
                        style={[styles.emailDate, { color: colors.textSecondary }]}
                        accessibilityRole="text"
                        dynamicTypeStyle="caption"
                      >
                        {new Date(email.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </AppText>
                    </View>
                  </View>
                  <AppText 
                    style={[styles.emailSubject, { color: colors.text }]} 
                    numberOfLines={1}
                    accessibilityRole="text"
                    dynamicTypeStyle="body"
                  >
                    {email.subject}
                  </AppText>
                  <AppText 
                    style={[styles.emailSnippet, { color: colors.textSecondary }]} 
                    numberOfLines={2}
                    accessibilityRole="text"
                    dynamicTypeStyle="caption"
                  >
                    {email.snippet}
                  </AppText>
                  <View style={styles.emailTags}>
                    {email.category && (
                      <View style={[styles.emailTag, { backgroundColor: categoryColor + '20' }]}>
                        <AppText style={[styles.emailTagText, { color: categoryColor }]} dynamicTypeStyle="caption">
                          {email.category}
                        </AppText>
                      </View>
                    )}
                    {email.priority && email.priority !== 'low' && (
                      <View style={[styles.emailTag, { backgroundColor: colors.status[email.priority === 'action' ? 'actionRequired' : email.priority === 'later' ? 'waiting' : 'fyi'] + '20' }]}>
                        <AppText style={[styles.emailTagText, { color: colors.status[email.priority === 'action' ? 'actionRequired' : email.priority === 'later' ? 'waiting' : 'fyi'] }] } dynamicTypeStyle="caption">
                          {email.priority}
                        </AppText>
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

