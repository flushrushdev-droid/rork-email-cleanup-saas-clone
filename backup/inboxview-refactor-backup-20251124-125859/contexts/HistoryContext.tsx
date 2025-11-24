import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HistoryEntry, HistoryActionType } from '@/constants/types';
import { sampleHistoryEntries } from '@/mocks/historyData';

const STORAGE_KEY = '@history_entries';
const HISTORY_RETENTION_DAYS = 60;

export const [HistoryProvider, useHistory] = createContextHook(() => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const isDemoMode = await AsyncStorage.getItem('@demo_mode');
      
      if (stored) {
        const parsed: HistoryEntry[] = JSON.parse(stored);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - HISTORY_RETENTION_DAYS);
        
        const filtered = parsed.filter(entry => 
          new Date(entry.timestamp) > cutoffDate
        );
        
        setEntries(filtered);
        
        if (filtered.length !== parsed.length) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
      } else if (isDemoMode === 'true') {
        setEntries(sampleHistoryEntries);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sampleHistoryEntries));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const addHistoryEntry = useCallback(async (
    type: HistoryActionType,
    description: string,
    metadata?: HistoryEntry['metadata']
  ) => {
    try {
      const newEntry: HistoryEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        timestamp: new Date().toISOString(),
        description,
        metadata,
      };

      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error adding history entry:', error);
    }
  }, [entries]);

  const clearHistory = useCallback(async () => {
    try {
      setEntries([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, []);

  const getEntriesByType = useCallback((type: HistoryActionType) => {
    return entries.filter(entry => entry.type === type);
  }, [entries]);

  const getEntriesInRange = useCallback((startDate: Date, endDate: Date) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }, [entries]);

  const getStats = useCallback(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const last30Days = entries.filter(e => new Date(e.timestamp) >= thirtyDaysAgo);
    const last7Days = entries.filter(e => new Date(e.timestamp) >= sevenDaysAgo);

    const deletedEmails = entries.filter(e => 
      e.type === 'email_deleted' || e.type === 'bulk_delete'
    ).reduce((sum, e) => sum + (e.metadata?.count || 1), 0);

    const archivedEmails = entries.filter(e => 
      e.type === 'email_archived' || e.type === 'bulk_archive'
    ).reduce((sum, e) => sum + (e.metadata?.count || 1), 0);

    const unsubscribedCount = entries.filter(e => 
      e.type === 'newsletter_unsubscribed'
    ).length;

    const foldersCreated = entries.filter(e => 
      e.type === 'folder_created'
    ).length;

    const rulesCreated = entries.filter(e => 
      e.type === 'rule_created'
    ).length;

    return {
      totalActions: entries.length,
      last30DaysCount: last30Days.length,
      last7DaysCount: last7Days.length,
      deletedEmails,
      archivedEmails,
      unsubscribedCount,
      foldersCreated,
      rulesCreated,
    };
  }, [entries]);

  return useMemo(() => ({
    entries,
    addHistoryEntry,
    clearHistory,
    getEntriesByType,
    getEntriesInRange,
    getStats,
  }), [entries, addHistoryEntry, clearHistory, getEntriesByType, getEntriesInRange, getStats]);
});
