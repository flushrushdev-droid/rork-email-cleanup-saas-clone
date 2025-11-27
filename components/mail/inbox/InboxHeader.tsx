import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
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
          <TouchableOpacity 
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel selection"
            accessibilityHint="Double tap to exit selection mode"
            onPress={onCancelSelection}
          >
            <AppText style={[headerStyles.cancelText, { color: colors.primary }]} dynamicTypeStyle="headline">Cancel</AppText>
          </TouchableOpacity>
          <AppText 
            style={[headerStyles.headerTitle, { color: colors.text }]}
            accessibilityRole="header"
            accessibilityLabel={`${selectedEmails.size} emails selected`}
            dynamicTypeStyle="title2"
          >
            {selectedEmails.size} Selected
          </AppText>
          <TouchableOpacity 
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Select All"
            accessibilityHint="Double tap to select all emails in this view"
            onPress={onSelectAll}
          >
            <AppText style={[headerStyles.selectAllText, { color: colors.primary }]} dynamicTypeStyle="headline">Select All</AppText>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={headerStyles.headerLeft}>
            <TouchableOpacity
              testID="sidebar-toggle"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Toggle sidebar"
              accessibilityHint="Double tap to open or close the folders sidebar"
              onPress={onToggleSidebar}
              style={[headerStyles.sidebarButton, { backgroundColor: colors.surface }]}
              activeOpacity={0.7}
            >
              <Menu size={20} color={colors.primary} />
            </TouchableOpacity>
            <AppText 
              style={[headerStyles.headerTitle, { color: colors.text }]}
              accessibilityRole="header"
              accessibilityLabel={activeFilter === 'all' ? 'Mail' :
               activeFilter === 'drafts-ai' ? 'Drafts By AI' :
               activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              dynamicTypeStyle="title2"
            >
              {activeFilter === 'all' ? 'Mail' :
               activeFilter === 'drafts-ai' ? 'Drafts By AI' :
               activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
            </AppText>
          </View>
          <TouchableOpacity
            testID="compose-button"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Compose new email"
            accessibilityHint="Double tap to compose a new email message"
            onPress={onCompose}
            style={[headerStyles.composeButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Mail size={20} color={colors.surface} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

