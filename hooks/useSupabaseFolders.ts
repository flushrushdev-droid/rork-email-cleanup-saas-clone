/**
 * Hook for managing Custom Folders with Supabase
 * 
 * Provides CRUD operations for custom folders with real-time sync support
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { createScopedLogger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';

const logger = createScopedLogger('SupabaseFolders');

export interface CustomFolder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  rule: string | null;
  created_at: string;
  updated_at: string;
}

// Convert Supabase folder format to app format
function supabaseToFolder(row: CustomFolder) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    rule: row.rule,
    count: 0, // Count will be calculated based on emails
    isCustom: true as const,
  };
}

/**
 * Mock folders for demo mode
 */
const mockFolders = [
  {
    id: '1',
    name: 'Work Projects',
    color: '#3B82F6',
    count: 12,
    isCustom: true as const,
  },
  {
    id: '2',
    name: 'Personal Receipts',
    color: '#10B981',
    count: 8,
    isCustom: true as const,
  },
  {
    id: '3',
    name: 'Travel Plans',
    color: '#F59E0B',
    count: 5,
    isCustom: true as const,
  },
];

export function useSupabaseFolders() {
  const { isDemoMode, user } = useAuth();
  const [folders, setFolders] = useState<ReturnType<typeof supabaseToFolder>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get user ID for queries
  const userId = user?.email || 'demo-user';

  /**
   * Load folders from Supabase
   */
  const loadFolders = useCallback(async () => {
    if (isDemoMode) {
      setFolders(mockFolders);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('custom_folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedFolders = (data || []).map(supabaseToFolder);
      setFolders(formattedFolders);
      logger.debug('Loaded folders', undefined, { count: formattedFolders.length });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load folders');
      logger.error('Error loading folders', error);
      setError(error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, userId]);

  /**
   * Create a new folder
   */
  const createFolder = useCallback(async (folder: {
    name: string;
    color: string;
    rule?: string | null;
  }) => {
    if (isDemoMode) {
      const newFolder = {
        id: Date.now().toString(),
        name: folder.name,
        color: folder.color,
        count: 0,
        isCustom: true as const,
      };
      setFolders(prev => [newFolder, ...prev]);
      return newFolder;
    }

    try {
      const { data, error: createError } = await supabase
        .from('custom_folders')
        .insert({
          user_id: userId,
          name: folder.name,
          color: folder.color,
          rule: folder.rule || null,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      const formattedFolder = supabaseToFolder(data);
      setFolders(prev => [formattedFolder, ...prev]);
      logger.debug('Created folder', undefined, { folderId: data.id });
      return formattedFolder;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create folder');
      logger.error('Error creating folder', error);
      throw error;
    }
  }, [isDemoMode, userId]);

  /**
   * Update an existing folder
   */
  const updateFolder = useCallback(async (id: string, updates: {
    name?: string;
    color?: string;
    rule?: string | null;
  }) => {
    if (isDemoMode) {
      setFolders(prev => prev.map(folder =>
        folder.id === id
          ? { ...folder, ...updates }
          : folder
      ));
      return;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('custom_folders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const formattedFolder = supabaseToFolder(data);
      setFolders(prev => prev.map(folder =>
        folder.id === id ? formattedFolder : folder
      ));
      logger.debug('Updated folder', undefined, { folderId: id });
      return formattedFolder;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update folder');
      logger.error('Error updating folder', error);
      throw error;
    }
  }, [isDemoMode, userId]);

  /**
   * Delete a folder
   */
  const deleteFolder = useCallback(async (id: string) => {
    if (isDemoMode) {
      setFolders(prev => prev.filter(folder => folder.id !== id));
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('custom_folders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
      }

      setFolders(prev => prev.filter(folder => folder.id !== id));
      logger.debug('Deleted folder', undefined, { folderId: id });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete folder');
      logger.error('Error deleting folder', error);
      throw error;
    }
  }, [isDemoMode, userId]);

  // Load folders on mount and when dependencies change
  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // Set up real-time subscription (skip in demo mode)
  useEffect(() => {
    if (isDemoMode) return;

    const channel = supabase
      .channel('custom_folders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_folders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.debug('Folder change detected', undefined, { event: payload.eventType });
          loadFolders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isDemoMode, userId, loadFolders]);

  return {
    folders,
    loading,
    error,
    loadFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  };
}

