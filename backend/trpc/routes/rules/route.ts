import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../create-context';
import { createSupabaseAdmin } from '../../lib/supabase';

const ruleSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  name: z.string().min(1),
  conditions: z.record(z.unknown()),
  actions: z.record(z.unknown()),
  enabled: z.boolean().default(true),
});

export default createTRPCRouter({
  /**
   * Get all rules for a user
   */
  getAll: publicProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ input }: { input: { user_id: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .eq('user_id', input.user_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch rules: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get a single rule by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string(), user_id: z.string() }))
    .query(async ({ input }: { input: { id: string; user_id: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .eq('id', input.id)
        .eq('user_id', input.user_id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch rule: ${error.message}`);
      }

      return data;
    }),

  /**
   * Create a new rule
   */
  create: publicProcedure
    .input(ruleSchema.omit({ id: true }))
    .mutation(async ({ input }: { input: z.infer<typeof ruleSchema> & { id?: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('rules')
        .insert({
          ...input,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create rule: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update an existing rule
   */
  update: publicProcedure
    .input(ruleSchema.extend({ id: z.string() }))
    .mutation(async ({ input }: { input: z.infer<typeof ruleSchema> & { id: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { id, ...updateData } = input;

      const { data, error } = await supabase
        .from('rules')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', input.user_id) // Ensure user owns the rule
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update rule: ${error.message}`);
      }

      return data;
    }),

  /**
   * Delete a rule
   */
  delete: publicProcedure
    .input(z.object({ id: z.string(), user_id: z.string() }))
    .mutation(async ({ input }: { input: { id: string; user_id: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', input.id)
        .eq('user_id', input.user_id); // Ensure user owns the rule

      if (error) {
        throw new Error(`Failed to delete rule: ${error.message}`);
      }

      return { success: true };
    }),
});

