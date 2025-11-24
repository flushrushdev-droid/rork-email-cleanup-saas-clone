import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { createSenderStyles } from '@/styles/app/senders';
import type { Sender } from '@/constants/types';

type FilterType = 'all' | 'marketing' | 'high-noise' | 'trusted' | 'unread' | 'large-files';
type SortType = 'noise' | 'volume' | 'size' | 'engagement';

interface SenderFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  allSenders: Sender[];
  colors: any;
}

export function SenderFilters({
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  allSenders,
  colors,
}: SenderFiltersProps) {
  const styles = React.useMemo(() => createSenderStyles(colors), [colors]);

  const filterCounts = React.useMemo(() => {
    return {
      all: allSenders.length,
      marketing: allSenders.filter((s) => s.isMarketing).length,
      'high-noise': allSenders.filter((s) => s.noiseScore >= 7).length,
      trusted: allSenders.filter((s) => s.isTrusted).length,
      unread: allSenders.filter((s) => s.engagementRate < 50).length,
      'large-files': allSenders.filter((s) => s.totalSize > 500000000).length,
    };
  }, [allSenders]);

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'noise', label: 'Noise' },
    { value: 'volume', label: 'Volume' },
    { value: 'size', label: 'Size' },
    { value: 'engagement', label: 'Engagement' },
  ];

  return (
    <>
      <View style={[styles.filtersContainer, { backgroundColor: colors.background }]}>
        <View style={styles.filtersWrap}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: colors.surface },
              filter === 'all' && { backgroundColor: colors.primary },
            ]}
            onPress={() => onFilterChange('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: colors.text },
                filter === 'all' && styles.filterChipTextActive,
              ]}
            >
              All ({filterCounts.all})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: colors.surface },
              filter === 'marketing' && { backgroundColor: colors.primary },
            ]}
            onPress={() => onFilterChange('marketing')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: colors.text },
                filter === 'marketing' && styles.filterChipTextActive,
              ]}
            >
              Marketing ({filterCounts.marketing})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: colors.surface },
              filter === 'high-noise' && { backgroundColor: colors.primary },
            ]}
            onPress={() => onFilterChange('high-noise')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: colors.text },
                filter === 'high-noise' && styles.filterChipTextActive,
              ]}
            >
              High Noise ({filterCounts['high-noise']})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: colors.surface },
              filter === 'trusted' && { backgroundColor: colors.primary },
            ]}
            onPress={() => onFilterChange('trusted')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: colors.text },
                filter === 'trusted' && styles.filterChipTextActive,
              ]}
            >
              Trusted ({filterCounts.trusted})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: colors.surface },
              filter === 'unread' && { backgroundColor: colors.primary },
            ]}
            onPress={() => onFilterChange('unread')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: colors.text },
                filter === 'unread' && styles.filterChipTextActive,
              ]}
            >
              Unread ({filterCounts.unread})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: colors.surface },
              filter === 'large-files' && { backgroundColor: colors.primary },
            ]}
            onPress={() => onFilterChange('large-files')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: colors.text },
                filter === 'large-files' && styles.filterChipTextActive,
              ]}
            >
              Large Files ({filterCounts['large-files']})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.sortContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.sortLabel, { color: colors.text }]}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortChip,
                { backgroundColor: colors.surface },
                sortBy === option.value && { backgroundColor: colors.primary },
              ]}
              onPress={() => onSortChange(option.value)}
            >
              <Text
                style={[
                  styles.sortChipText,
                  { color: colors.text },
                  sortBy === option.value && styles.sortChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

