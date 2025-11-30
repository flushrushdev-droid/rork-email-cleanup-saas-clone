import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../create-context.js';
import { createSupabaseAdmin } from '../../../lib/supabase.js';

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  picture: z.string().nullable().optional(),
  provider: z.string().default('google'),
});

const updateUserSchema = z.object({
  id: z.string(),
  last_login_at: z.string().optional(),
  last_logout_at: z.string().optional(),
  plan_type: z.string().optional(),
  plan_status: z.string().optional(),
  subscription_id: z.string().nullable().optional(),
  subscription_started_at: z.string().nullable().optional(),
  subscription_ends_at: z.string().nullable().optional(),
  trial_ends_at: z.string().nullable().optional(),
  features: z.record(z.string(), z.unknown()).nullable().optional(),
  limits: z.record(z.string(), z.unknown()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  is_active: z.boolean().optional(),
});

const actionSchema = z.object({
  user_id: z.string(),
  action_type: z.string(),
  action_category: z.string().nullable().optional(),
  action_data: z.record(z.string(), z.unknown()).nullable().optional(),
  screen_name: z.string().nullable().optional(),
  device_type: z.string().nullable().optional(),
  app_version: z.string().nullable().optional(),
});

export default createTRPCRouter({
  // Get user by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }: { input: { id: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', input.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch user: ${error.message}`);
      }
      return data;
    }),

  // Get user by email
  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }: { input: { email: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('email', input.email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw new Error(`Failed to fetch user: ${error.message}`);
      }
      return data;
    }),

  // Create or update user (upsert)
  upsert: publicProcedure
    .input(userSchema)
    .mutation(async ({ input }: { input: z.infer<typeof userSchema> }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, registered_at, first_login_at, is_first_login')
        .eq('id', input.id)
        .single();

      const now = new Date().toISOString();
      const isNewUser = !existingUser;

      const userData: any = {
        id: input.id,
        email: input.email,
        name: input.name,
        picture: input.picture,
        provider: input.provider,
        updated_at: now,
      };

      // Set registration time for new users
      if (isNewUser) {
        userData.registered_at = now;
        userData.first_login_at = now;
        userData.is_first_login = false;
      }

      // Update last login time
      userData.last_login_at = now;

      const { data, error } = await supabase
        .from('users')
        .upsert(userData, {
          onConflict: 'id',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upsert user: ${error.message}`);
      }
      return data;
    }),

  // Update user
  update: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ input }: { input: z.infer<typeof updateUserSchema> }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const updateData: any = {
        ...input,
        updated_at: new Date().toISOString(),
      };
      delete updateData.id; // Remove id from update data

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      return data;
    }),

  // Track user action (analytics)
  trackAction: publicProcedure
    .input(actionSchema)
    .mutation(async ({ input }: { input: z.infer<typeof actionSchema> }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase
        .from('user_actions')
        .insert({
          user_id: input.user_id,
          action_type: input.action_type,
          action_category: input.action_category || null,
          action_data: input.action_data || {},
          screen_name: input.screen_name || null,
          device_type: input.device_type || null,
          app_version: input.app_version || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to track action: ${error.message}`);
      }
      return data;
    }),

  // Get user actions (for analytics)
  getActions: publicProcedure
    .input(z.object({
      user_id: z.string(),
      limit: z.number().default(50),
      offset: z.number().default(0),
      action_type: z.string().optional(),
    }))
    .query(async ({ input }: { input: { user_id: string; limit: number; offset: number; action_type?: string } }) => {
      const supabase = createSupabaseAdmin();
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      let query = supabase
        .from('user_actions')
        .select()
        .eq('user_id', input.user_id)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.action_type) {
        query = query.eq('action_type', input.action_type);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch actions: ${error.message}`);
      }
      return data;
    }),
});

