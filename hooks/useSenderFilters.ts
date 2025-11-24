import { useState, useEffect, useMemo } from 'react';
import type { Sender } from '@/constants/types';

type FilterType = 'all' | 'marketing' | 'high-noise' | 'trusted' | 'unread' | 'large-files';
type SortType = 'noise' | 'volume' | 'size' | 'engagement';

interface UseSenderFiltersProps {
  allSenders: Sender[];
  initialSearchQuery?: string;
}

interface UseSenderFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  sortBy: SortType;
  setSortBy: (sort: SortType) => void;
  selectedSenders: string[];
  toggleSender: (senderId: string) => void;
  filteredSenders: Sender[];
}

export function useSenderFilters({
  allSenders,
  initialSearchQuery = '',
}: UseSenderFiltersProps): UseSenderFiltersReturn {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('noise');
  const [selectedSenders, setSelectedSenders] = useState<string[]>([]);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const filteredSenders = useMemo(() => {
    return allSenders
      .filter((sender) => {
        if (filter === 'marketing') return sender.isMarketing;
        if (filter === 'high-noise') return sender.noiseScore >= 7;
        if (filter === 'trusted') return sender.isTrusted;
        if (filter === 'unread') return sender.engagementRate < 50;
        if (filter === 'large-files') return sender.totalSize > 500000000;
        return true;
      })
      .filter(
        (sender) =>
          sender.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sender.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'noise') return b.noiseScore - a.noiseScore;
        if (sortBy === 'volume') return b.totalEmails - a.totalEmails;
        if (sortBy === 'size') return b.totalSize - a.totalSize;
        if (sortBy === 'engagement') return a.engagementRate - b.engagementRate;
        return 0;
      });
  }, [allSenders, filter, searchQuery, sortBy]);

  const toggleSender = (senderId: string) => {
    setSelectedSenders((prev) =>
      prev.includes(senderId) ? prev.filter((id) => id !== senderId) : [...prev, senderId]
    );
  };

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    selectedSenders,
    toggleSender,
    filteredSenders,
  };
}


