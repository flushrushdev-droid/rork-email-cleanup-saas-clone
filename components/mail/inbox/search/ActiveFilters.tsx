import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
          <Text style={[searchStyles.activeFilterText, { color: colors.primary }]}>
            {labelFilter.charAt(0).toUpperCase() + labelFilter.slice(1)}
          </Text>
          <TouchableOpacity onPress={onClearLabel}>
            <X size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      {attachmentFilter && (
        <View style={[searchStyles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[searchStyles.activeFilterText, { color: colors.primary }]}>
            {attachmentFilter === 'any' ? 'Has attachment' : attachmentFilter.charAt(0).toUpperCase() + attachmentFilter.slice(1)}
          </Text>
          <TouchableOpacity onPress={onClearAttachment}>
            <X size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      {contactFilter && (
        <View style={[searchStyles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[searchStyles.activeFilterText, { color: colors.primary }]}>
            {contactFilter.name}
          </Text>
          <TouchableOpacity onPress={onClearContact}>
            <X size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

