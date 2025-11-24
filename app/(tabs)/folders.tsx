import React, { useMemo, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
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


export default function FoldersScreen() {
  const { colors } = useTheme();
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
      const newFolder = { id: Date.now().toString(), name: folderName.trim(), color: colors.primary, count: 0 };
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

  const styles = React.useMemo(() => createFoldersStyles(colors), [colors]);

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
        <TouchableOpacity testID="create-folder" style={[styles.createButton, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={() => setIsModalVisible(true)}>
          <Plus size={20} color={colors.primary} />
          <Text style={[styles.createButtonText, { color: colors.primary }]}>Create Custom Folder</Text>
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
            {[...customFolders.map(f => ({...f, isCustom: true} as any)), ...smartFolders].map((folder: any) => {
              const Icon = folderIconMap[folder.icon] || FolderOpen;
              
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
                        folderColor: folder.color || colors.primary,
                        ...(folder.isCustom ? { isCustom: '1' } : {}),
                      },
                    });
                  }}
                >
                  <View style={[styles.folderIcon, { backgroundColor: folder.color + '20' }]}>
                    {folder.isCustom ? <FolderOpen size={28} color={folder.color || colors.primary} /> : <Icon size={28} color={folder.color} />}
                  </View>
                  <View style={styles.folderContent}>
                    <Text style={[styles.folderName, { color: colors.text }]}>{folder.name}</Text>
                    <Text style={[styles.folderCount, { color: colors.textSecondary }]}>{folder.count} emails</Text>
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
              <Text style={styles.sectionTitle}>Recent Emails</Text>
              <TouchableOpacity testID="view-all-recent" onPress={() => Alert.alert('Recent Emails', 'Showing all recent emails')}>
                <Text style={styles.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentEmails.map((email) => {
              const categoryColor = email.category ? colors.category[email.category] : colors.primary;
              
              return (
                <TouchableOpacity key={email.id} style={[styles.emailCard, { borderLeftColor: categoryColor, backgroundColor: colors.surface }]} onPress={() => Alert.alert('Email', email.subject)}>
                  <View style={styles.emailHeader}>
                    <View style={styles.emailMeta}>
                      <Text style={[styles.emailFrom, { color: colors.text }]} numberOfLines={1}>{email.from}</Text>
                      <Text style={[styles.emailDate, { color: colors.textSecondary }]}>
                        {new Date(email.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.emailSubject, { color: colors.text }]} numberOfLines={1}>{email.subject}</Text>
                  <Text style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>{email.snippet}</Text>
                  <View style={styles.emailTags}>
                    {email.category && (
                      <View style={[styles.emailTag, { backgroundColor: categoryColor + '20' }]}>
                        <Text style={[styles.emailTagText, { color: categoryColor }]}>
                          {email.category}
                        </Text>
                      </View>
                    )}
                    {email.priority && email.priority !== 'low' && (
                      <View style={[styles.emailTag, { backgroundColor: colors.status[email.priority === 'action' ? 'actionRequired' : email.priority === 'later' ? 'waiting' : 'fyi'] + '20' }]}>
                        <Text style={[styles.emailTagText, { color: colors.status[email.priority === 'action' ? 'actionRequired' : email.priority === 'later' ? 'waiting' : 'fyi'] }] }>
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

