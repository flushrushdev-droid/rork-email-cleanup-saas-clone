import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FolderOpen, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import type { EmailCategory } from '@/constants/types';
import { iconMap } from '../inbox/constants';
import { createFoldersStyles } from './styles';

interface SmartFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  count: number;
  category?: EmailCategory;
}

interface FolderCardProps {
  folder: SmartFolder;
  onPress: () => void;
  colors: any;
}

export const FolderCard = React.memo<FolderCardProps>(({ folder, onPress, colors }) => {
  const styles = createFoldersStyles(colors);
  const IconComponent = iconMap[folder.icon];
  const Icon = IconComponent || FolderOpen;

  return (
    <TouchableOpacity 
      testID={`folder-${folder.id}`} 
      style={[styles.folderCard, { backgroundColor: colors.surface }]} 
      onPress={onPress}
    >
      <View style={[styles.folderIcon, { backgroundColor: folder.color + '20' }]}>
        <Icon size={28} color={folder.color} />
      </View>
      <View style={styles.folderContent}>
        <Text style={[styles.folderName, { color: colors.text }]}>{folder.name}</Text>
        <Text style={[styles.folderCount, { color: colors.textSecondary }]}>{folder.count} emails</Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
});

FolderCard.displayName = 'FolderCard';


