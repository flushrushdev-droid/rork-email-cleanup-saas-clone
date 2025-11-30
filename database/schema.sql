-- Supabase Database Schema for AthenXMail
-- 
-- This schema supports:
-- - Rules (email filtering rules)
-- - Custom folders (user-created folders)
-- - User preferences (theme, settings)
-- - Cross-device sync via real-time subscriptions
--
-- Run this in your Supabase SQL Editor after creating your project

-- ============================================
-- Rules Table
-- ============================================
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON rules(user_id);

-- Index for faster queries by user_id and enabled status
CREATE INDEX IF NOT EXISTS idx_rules_user_enabled ON rules(user_id, enabled);

-- ============================================
-- Custom Folders Table
-- ============================================
CREATE TABLE IF NOT EXISTS custom_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  rule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_custom_folders_user_id ON custom_folders(user_id);

-- ============================================
-- User Preferences Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  theme TEXT,
  settings JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Rules Policies
-- Users can only see their own rules
CREATE POLICY "Users can view their own rules"
  ON rules FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can insert their own rules
CREATE POLICY "Users can insert their own rules"
  ON rules FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own rules
CREATE POLICY "Users can update their own rules"
  ON rules FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own rules
CREATE POLICY "Users can delete their own rules"
  ON rules FOR DELETE
  USING (auth.uid()::text = user_id);

-- Custom Folders Policies
-- Users can only see their own folders
CREATE POLICY "Users can view their own folders"
  ON custom_folders FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can insert their own folders
CREATE POLICY "Users can insert their own folders"
  ON custom_folders FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own folders
CREATE POLICY "Users can update their own folders"
  ON custom_folders FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own folders
CREATE POLICY "Users can delete their own folders"
  ON custom_folders FOR DELETE
  USING (auth.uid()::text = user_id);

-- User Preferences Policies
-- Users can only see their own preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rules table
CREATE TRIGGER update_rules_updated_at
  BEFORE UPDATE ON rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for custom_folders table
CREATE TRIGGER update_custom_folders_updated_at
  BEFORE UPDATE ON custom_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_preferences table
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Real-time Subscriptions
-- ============================================
-- Enable real-time for all tables (for cross-device sync)
ALTER PUBLICATION supabase_realtime ADD TABLE rules;
ALTER PUBLICATION supabase_realtime ADD TABLE custom_folders;
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;

-- ============================================
-- Notes
-- ============================================
-- 
-- After running this schema:
-- 1. Go to Supabase Dashboard > Database > Replication
-- 2. Verify that rules, custom_folders, and user_preferences are enabled for real-time
-- 3. Test RLS policies by creating a test user
-- 4. For production, consider adding additional indexes based on query patterns
--
-- For authentication, you can either:
-- - Use Supabase Auth (recommended for production)
-- - Use your own auth system and set user_id manually (for beta, you can use email as user_id)
--
-- For beta testing without Supabase Auth:
-- - You can temporarily disable RLS or create policies that use a custom user_id
-- - Example: CREATE POLICY "Allow user_id based access" ON rules FOR ALL USING (true);
--   (NOT RECOMMENDED FOR PRODUCTION - only for testing)

