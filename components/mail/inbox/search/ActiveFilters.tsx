import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { searchStyles } from '../styles/searchStyles';

interface ActiveFiltersProps {
  labelFilter: string | null;
  attachmentFilter: string | null;
  contactFilter: { name: string; email: string } | null;
  onClearLabel: () => void;
  onClearAttachment: () => void;
  onClearContact: () => void;
}

export function ActiveFilters({
  labelFilter,
  attachmentFilter,
  contactFilter,
  onClearLabel,
  onClearAttachment,
  onClearContact,
}: ActiveFiltersProps) {
  const { colors } = useTheme();

  const hasFilters = labelFilter || attachmentFilter || contactFilter;

  if (!hasFilters) {
    return null;
  }

  return (
    <View style={searchStyles.activeFiltersRow}>
      {labelFilter && (
        <View style={[searchStyles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
          <AppText style={[searchStyles.activeFilterText, { color: colors.primary }]} dynamicTypeStyle="caption">
            {labelFilter.charAt(0).toUpperCase() + labelFilter.slice(1)}
          </AppText>
          <TouchableOpacity onPress={onClearLabel}>
            <X size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      {attachmentFilter && (
        <View style={[searchStyles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
          <AppText style={[searchStyles.activeFilterText, { color: colors.primary }]} dynamicTypeStyle="caption">
            {attachmentFilter === 'any' ? 'Has attachment' : attachmentFilter.charAt(0).toUpperCase() + attachmentFilter.slice(1)}
          </AppText>
          <TouchableOpacity onPress={onClearAttachment}>
            <X size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      {contactFilter && (
        <View style={[searchStyles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
          <AppText style={[searchStyles.activeFilterText, { color: colors.primary }]} dynamicTypeStyle="caption">
            {contactFilter.name}
          </AppText>
          <TouchableOpacity onPress={onClearContact}>
            <X size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

