import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Archive, Trash2, Folder, MailOpen } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { selectionStyles } from './styles/selectionStyles';

interface InboxSelectionToolbarProps {
  selectedCount: number;
  onArchive: () => void;
  onDelete: () => void;
  onMove: () => void;
  onMarkRead: () => void;
  insets: { top: number; bottom: number; left: number; right: number };
}

export function InboxSelectionToolbar({
  selectedCount,
  onArchive,
  onDelete,
  onMove,
  onMarkRead,
  insets,
}: InboxSelectionToolbarProps) {
  const { colors } = useTheme();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <View style={[
      selectionStyles.bottomToolbar,
      { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16 }
    ]}>
      <TouchableOpacity
        testID="bulk-archive"
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Archive ${selectedCount} selected emails`}
        accessibilityHint="Double tap to archive all selected emails"
        style={selectionStyles.toolbarButton}
        onPress={onArchive}
      >
        <Archive size={24} color={colors.text} />
        <AppText style={[selectionStyles.toolbarButtonText, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Archive</AppText>
      </TouchableOpacity>
      <TouchableOpacity
        testID="bulk-delete"
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${selectedCount} selected emails`}
        accessibilityHint="Double tap to delete all selected emails"
        style={selectionStyles.toolbarButton}
        onPress={onDelete}
      >
        <Trash2 size={24} color={colors.danger} />
        <AppText style={[selectionStyles.toolbarButtonText, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Delete</AppText>
      </TouchableOpacity>
      <TouchableOpacity
        testID="bulk-move"
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Move ${selectedCount} selected emails`}
        accessibilityHint="Double tap to move all selected emails to a folder"
        style={selectionStyles.toolbarButton}
        onPress={onMove}
      >
        <Folder size={24} color={colors.text} />
        <AppText style={[selectionStyles.toolbarButtonText, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Move</AppText>
      </TouchableOpacity>
      <TouchableOpacity
        testID="bulk-mark-read"
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Mark ${selectedCount} selected emails as read`}
        accessibilityHint="Double tap to mark all selected emails as read"
        style={selectionStyles.toolbarButton}
        onPress={onMarkRead}
      >
        <MailOpen size={24} color={colors.text} />
        <AppText style={[selectionStyles.toolbarButtonText, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Read</AppText>
      </TouchableOpacity>
    </View>
  );
}

