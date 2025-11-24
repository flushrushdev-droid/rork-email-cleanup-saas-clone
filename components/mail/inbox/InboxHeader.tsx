import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, Mail } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { FilterType } from './types';
import { headerStyles } from './styles/headerStyles';

interface InboxHeaderProps {
  insets: { top: number; bottom: number; left: number; right: number };
  activeFilter: FilterType;
  selectionMode: boolean;
  selectedEmails: Set<string>;
  onCancelSelection: () => void;
  onSelectAll: () => void;
  onToggleSidebar: () => void;
  onCompose: () => void;
}

export function InboxHeader({
  insets,
  activeFilter,
  selectionMode,
  selectedEmails,
  onCancelSelection,
  onSelectAll,
  onToggleSidebar,
  onCompose,
}: InboxHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[headerStyles.header, { paddingTop: insets.top + 16 }]}>
      {selectionMode ? (
        <>
          <TouchableOpacity onPress={onCancelSelection}>
            <Text style={[headerStyles.cancelText, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[headerStyles.headerTitle, { color: colors.text }]}>
            {selectedEmails.size} Selected
          </Text>
          <TouchableOpacity onPress={onSelectAll}>
            <Text style={[headerStyles.selectAllText, { color: colors.primary }]}>Select All</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={headerStyles.headerLeft}>
            <TouchableOpacity
              testID="sidebar-toggle"
              onPress={onToggleSidebar}
              style={[headerStyles.sidebarButton, { backgroundColor: colors.surface }]}
              activeOpacity={0.7}
            >
              <Menu size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[headerStyles.headerTitle, { color: colors.text }]}>
              {activeFilter === 'all' ? 'Mail' :
               activeFilter === 'drafts-ai' ? 'Drafts By AI' :
               activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
            </Text>
          </View>
          <TouchableOpacity
            testID="compose-button"
            onPress={onCompose}
            style={[headerStyles.composeButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Mail size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

