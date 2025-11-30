import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../create-context.js';
import { createSupabaseAdmin } from '../../../lib/supabase.js';

const folderSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  name: z.string().min(1),
  color: z.string(),
  rule: z.string().nullable().optional(),
});

export default createTRPCRouter({
  /**
   * Get all custom folders for a user
   */
  getAll: publicProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ input }: { input: { user_id: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('custom_folders')
        .select()
        .eq('user_id', input.user_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch folders: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get a single folder by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string(), user_id: z.string() }))
    .query(async ({ input }: { input: { id: string; user_id: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('custom_folders')
        .select()
        .eq('id', input.id)
        .eq('user_id', input.user_id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch folder: ${error.message}`);
      }

      return data;
    }),

  /**
   * Create a new custom folder
   */
  create: publicProcedure
    .input(folderSchema.omit({ id: true }))
    .mutation(async ({ input }: { input: z.infer<typeof folderSchema> & { id?: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('custom_folders')
        .insert({
          ...input,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create folder: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update an existing folder
   */
  update: publicProcedure
    .input(folderSchema.extend({ id: z.string() }))
    .mutation(async ({ input }: { input: z.infer<typeof folderSchema> & { id: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { id, ...updateData } = input;

      const { data, error } = await supabase
        .from('custom_folders')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', input.user_id) // Ensure user owns the folder
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update folder: ${error.message}`);
      }

      return data;
    }),

  /**
   * Delete a folder
   */
  delete: publicProcedure
    .input(z.object({ id: z.string(), user_id: z.string() }))
    .mutation(async ({ input }: { input: { id: string; user_id: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { error } = await supabase
        .from('custom_folders')
        .delete()
        .eq('id', input.id)
        .eq('user_id', input.user_id); // Ensure user owns the folder

      if (error) {
        throw new Error(`Failed to delete folder: ${error.message}`);
      }

      return { success: true };
    }),
});

