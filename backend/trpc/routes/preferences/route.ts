import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../create-context.js';
import { createSupabaseAdmin } from '../../lib/supabase.js';

const preferencesSchema = z.object({
  user_id: z.string(),
  theme: z.string().nullable().optional(),
  settings: z.record(z.unknown()).nullable().optional(),
});

export default createTRPCRouter({
  /**
   * Get user preferences
   */
  get: publicProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ input }: { input: { user_id: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select()
        .eq('user_id', input.user_id)
        .single();

      if (error) {
        // If no preferences exist, return null (not an error)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to fetch preferences: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update user preferences (upsert)
   */
  update: publicProcedure
    .input(preferencesSchema)
    .mutation(async ({ input }: { input: z.infer<typeof preferencesSchema> }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      // Use upsert to create or update
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            ...input,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update preferences: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update theme only
   */
  updateTheme: publicProcedure
    .input(z.object({ user_id: z.string(), theme: z.string() }))
    .mutation(async ({ input }: { input: { user_id: string; theme: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: input.user_id,
            theme: input.theme,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update theme: ${error.message}`);
      }

      return data;
    }),

  /**
   * Update settings only
   */
  updateSettings: publicProcedure
    .input(z.object({ user_id: z.string(), settings: z.record(z.unknown()) }))
    .mutation(async ({ input }: { input: { user_id: string; settings: Record<string, unknown> } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: input.user_id,
            settings: input.settings,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update settings: ${error.message}`);
      }

      return data;
    }),
});

