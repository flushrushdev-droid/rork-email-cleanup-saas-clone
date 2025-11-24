import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { FolderOpen, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailCategory } from '@/constants/types';
import { FolderCard } from './folders/FolderCard';
import { createFoldersStyles } from './folders/styles';

interface SmartFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  count: number;
  category?: EmailCategory;
}

interface FoldersViewProps {
  insets: EdgeInsets;
  isDemoMode: boolean;
  smartFolders: SmartFolder[];
  onCreateFolder: () => void;
}

export function FoldersView({ 
  insets, 
  isDemoMode, 
  smartFolders, 
  onCreateFolder 
}: FoldersViewProps) {
  const { colors } = useTheme();
  const styles = createFoldersStyles(colors);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Smart Folders</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>AI-organized categories</Text>
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
          style={[styles.createFolderButton, { backgroundColor: colors.surface, borderColor: colors.primary }]} 
          onPress={onCreateFolder}
        >
          <Plus size={20} color={colors.primary} />
          <Text style={[styles.createFolderButtonText, { color: colors.primary }]}>Create Custom Folder</Text>
        </TouchableOpacity>

        {smartFolders.length === 0 ? (
          <View style={styles.emptyState}>
            <FolderOpen size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No folders yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Sync your emails to create smart folders</Text>
          </View>
        ) : (
          <View style={styles.foldersGrid}>
            {smartFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
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
                colors={colors}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Styles are now in components/mail/folders/styles.ts
