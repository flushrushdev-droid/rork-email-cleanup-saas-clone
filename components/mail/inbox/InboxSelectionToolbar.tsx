import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        style={selectionStyles.toolbarButton}
        onPress={onArchive}
      >
        <Archive size={24} color={colors.text} />
        <Text style={[selectionStyles.toolbarButtonText, { color: colors.textSecondary }]}>Archive</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="bulk-delete"
        style={selectionStyles.toolbarButton}
        onPress={onDelete}
      >
        <Trash2 size={24} color={colors.danger} />
        <Text style={[selectionStyles.toolbarButtonText, { color: colors.textSecondary }]}>Delete</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="bulk-move"
        style={selectionStyles.toolbarButton}
        onPress={onMove}
      >
        <Folder size={24} color={colors.text} />
        <Text style={[selectionStyles.toolbarButtonText, { color: colors.textSecondary }]}>Move</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="bulk-mark-read"
        style={selectionStyles.toolbarButton}
        onPress={onMarkRead}
      >
        <MailOpen size={24} color={colors.text} />
        <Text style={[selectionStyles.toolbarButtonText, { color: colors.textSecondary }]}>Read</Text>
      </TouchableOpacity>
    </View>
  );
}

