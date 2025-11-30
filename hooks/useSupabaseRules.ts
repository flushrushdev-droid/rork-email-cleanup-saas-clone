/**
 * Hook for managing Rules with Supabase
 * 
 * Provides CRUD operations for rules with real-time sync support
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Rule, RuleCondition, RuleAction } from '@/constants/types';
import { createScopedLogger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';

const logger = createScopedLogger('SupabaseRules');

// Convert Supabase rule format to app Rule format
function supabaseToRule(row: {
  id: string;
  user_id: string;
  name: string;
  conditions: unknown;
  actions: unknown;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}): Rule {
  return {
    id: row.id,
    name: row.name,
    enabled: row.enabled,
    conditions: (row.conditions as RuleCondition[]) || [],
    actions: (row.actions as RuleAction[]) || [],
    createdAt: new Date(row.created_at),
    // Note: lastRun and matchCount are not stored in Supabase yet
    // These can be added later if needed
  };
}

// Convert app Rule format to Supabase format
function ruleToSupabase(rule: Omit<Rule, 'lastRun' | 'matchCount'>, userId: string) {
  return {
    user_id: userId,
    name: rule.name,
    conditions: rule.conditions,
    actions: rule.actions,
    enabled: rule.enabled,
  };
}

/**
 * Mock rules for demo mode
 */
const mockRules: Rule[] = [
  {
    id: '1',
    name: 'Archive old newsletters',
    enabled: true,
    conditions: [
      { field: 'sender', operator: 'contains', value: 'newsletter' },
      { field: 'age', operator: 'greaterThan', value: 90 },
    ],
    actions: [{ type: 'archive' }],
    createdAt: new Date('2024-11-01'),
    lastRun: new Date(Date.now() - 86400000),
    matchCount: 347,
  },
  {
    id: '2',
    name: 'Label receipts automatically',
    enabled: true,
    conditions: [
      { field: 'semantic', operator: 'matches', value: 'receipt OR invoice' },
    ],
    actions: [
      { type: 'label', value: 'Receipts' },
      { type: 'tag', value: 'finance' },
    ],
    createdAt: new Date('2024-10-15'),
    lastRun: new Date(Date.now() - 3600000),
    matchCount: 156,
  },
  {
    id: '3',
    name: 'Delete spam from specific domain',
    enabled: false,
    conditions: [
      { field: 'domain', operator: 'equals', value: 'spam-domain.com' },
    ],
    actions: [{ type: 'delete' }],
    createdAt: new Date('2024-09-20'),
    matchCount: 0,
  },
];

/**
 * Hook for managing rules with Supabase
 */
export function useSupabaseRules() {
  const { user, isDemoMode } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get user ID - use email for now (can be changed to use Supabase Auth later)
  const userId = user?.email || 'demo@example.com';

  // Load rules from Supabase (or use mock data in demo mode)
  const loadRules = useCallback(async () => {
    // In demo mode, use mock rules
    if (isDemoMode) {
      setIsLoading(false);
      setRules([...mockRules]);
      setError(null);
      logger.debug(`Loaded ${mockRules.length} mock rules (demo mode)`);
      return;
    }

    if (!supabase) {
      setError(new Error('Supabase client not configured'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const convertedRules = (data || []).map(supabaseToRule);
      setRules(convertedRules);
      logger.debug(`Loaded ${convertedRules.length} rules`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load rules');
      logger.error('Error loading rules', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isDemoMode]);

  // Create a new rule
  const createRule = useCallback(async (rule: Omit<Rule, 'id' | 'createdAt' | 'lastRun' | 'matchCount'>) => {
    // In demo mode, just add to local state
    if (isDemoMode) {
      const newRule: Rule = {
        ...rule,
        id: `demo-${Date.now()}`,
        createdAt: new Date(),
      };
      setRules((prev) => [newRule, ...prev]);
      logger.debug('Created demo rule', newRule.id);
      return newRule;
    }

    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      const ruleData = ruleToSupabase(rule, userId);
      const { data, error: insertError } = await supabase
        .from('rules')
        .insert(ruleData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const newRule = supabaseToRule(data);
      setRules((prev) => [newRule, ...prev]);
      logger.debug('Created rule', newRule.id);
      return newRule;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create rule');
      logger.error('Error creating rule', error);
      throw error;
    }
  }, [userId, isDemoMode]);

  // Update an existing rule
  const updateRule = useCallback(async (rule: Rule) => {
    // In demo mode, just update local state
    if (isDemoMode) {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
      logger.debug('Updated demo rule', rule.id);
      return rule;
    }

    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      const ruleData = ruleToSupabase(rule, userId);
      const { data, error: updateError } = await supabase
        .from('rules')
        .update(ruleData)
        .eq('id', rule.id)
        .eq('user_id', userId) // Ensure user owns the rule
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedRule = supabaseToRule(data);
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updatedRule : r)));
      logger.debug('Updated rule', rule.id);
      return updatedRule;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update rule');
      logger.error('Error updating rule', error);
      throw error;
    }
  }, [userId, isDemoMode]);

  // Delete a rule
  const deleteRule = useCallback(async (ruleId: string) => {
    // In demo mode, just update local state
    if (isDemoMode) {
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      logger.debug('Deleted demo rule', ruleId);
      return;
    }

    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      const { error: deleteError } = await supabase
        .from('rules')
        .delete()
        .eq('id', ruleId)
        .eq('user_id', userId); // Ensure user owns the rule

      if (deleteError) {
        throw deleteError;
      }

      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      logger.debug('Deleted rule', ruleId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete rule');
      logger.error('Error deleting rule', error);
      throw error;
    }
  }, [userId, isDemoMode]);

  // Toggle rule enabled/disabled
  const toggleRule = useCallback(async (ruleId: string, enabled: boolean) => {
    // In demo mode, just update local state
    if (isDemoMode) {
      setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, enabled } : r)));
      logger.debug('Toggled demo rule', ruleId, enabled);
      return;
    }

    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      const { data, error: updateError } = await supabase
        .from('rules')
        .update({ enabled })
        .eq('id', ruleId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedRule = supabaseToRule(data);
      setRules((prev) => prev.map((r) => (r.id === ruleId ? updatedRule : r)));
      logger.debug('Toggled rule', ruleId, enabled);
      return updatedRule;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle rule');
      logger.error('Error toggling rule', error);
      throw error;
    }
  }, [userId, isDemoMode]);

  // Set up real-time subscription for cross-device sync (skip in demo mode)
  useEffect(() => {
    // In demo mode, just load mock rules
    if (isDemoMode) {
      loadRules();
      return;
    }

    if (!supabase) return;

    const channel = supabase
      .channel('rules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rules',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.debug('Real-time update', payload.eventType, payload.new);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newRule = supabaseToRule(payload.new as any);
            setRules((prev) => {
              // Avoid duplicates
              if (prev.some((r) => r.id === newRule.id)) {
                return prev;
              }
              return [newRule, ...prev];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedRule = supabaseToRule(payload.new as any);
            setRules((prev) => prev.map((r) => (r.id === updatedRule.id ? updatedRule : r)));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setRules((prev) => prev.filter((r) => r.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    // Load initial rules
    loadRules();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isDemoMode, loadRules]);

  return {
    rules,
    isLoading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    refresh: loadRules,
  };
}

