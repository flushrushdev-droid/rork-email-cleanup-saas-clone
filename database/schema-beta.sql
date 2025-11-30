-- Supabase Database Schema for AthenXMail (Beta Version)
-- 
-- This is a beta-friendly version that works without Supabase Auth
-- For production, use schema.sql with proper RLS policies
--
-- Run this in your Supabase SQL Editor

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
-- Row Level Security (RLS) - Beta Version
-- ============================================

-- Enable RLS on all tables
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Beta-friendly policies: Allow access based on user_id matching
-- For beta, we'll use email as user_id and allow access if user_id matches
-- NOTE: This is less secure than production RLS but works for beta testing

-- Rules Policies (Beta - allows user_id-based access)
DROP POLICY IF EXISTS "Users can view their own rules" ON rules;
CREATE POLICY "Users can view their own rules"
  ON rules FOR SELECT
  USING (true);  -- For beta: allow all reads (filtered by user_id in application)

DROP POLICY IF EXISTS "Users can insert their own rules" ON rules;
CREATE POLICY "Users can insert their own rules"
  ON rules FOR INSERT
  WITH CHECK (true);  -- For beta: allow all inserts (user_id set by application)

DROP POLICY IF EXISTS "Users can update their own rules" ON rules;
CREATE POLICY "Users can update their own rules"
  ON rules FOR UPDATE
  USING (true)
  WITH CHECK (true);  -- For beta: allow all updates (filtered by user_id in application)

DROP POLICY IF EXISTS "Users can delete their own rules" ON rules;
CREATE POLICY "Users can delete their own rules"
  ON rules FOR DELETE
  USING (true);  -- For beta: allow all deletes (filtered by user_id in application)

-- Custom Folders Policies (Beta)
DROP POLICY IF EXISTS "Users can view their own folders" ON custom_folders;
CREATE POLICY "Users can view their own folders"
  ON custom_folders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own folders" ON custom_folders;
CREATE POLICY "Users can insert their own folders"
  ON custom_folders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own folders" ON custom_folders;
CREATE POLICY "Users can update their own folders"
  ON custom_folders FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own folders" ON custom_folders;
CREATE POLICY "Users can delete their own folders"
  ON custom_folders FOR DELETE
  USING (true);

-- User Preferences Policies (Beta)
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (true)
  WITH CHECK (true);

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
DROP TRIGGER IF EXISTS update_rules_updated_at ON rules;
CREATE TRIGGER update_rules_updated_at
  BEFORE UPDATE ON rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for custom_folders table
DROP TRIGGER IF EXISTS update_custom_folders_updated_at ON custom_folders;
CREATE TRIGGER update_custom_folders_updated_at
  BEFORE UPDATE ON custom_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_preferences table
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
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
-- Verification Queries (Optional - run to verify setup)
-- ============================================
-- SELECT * FROM rules LIMIT 1;
-- SELECT * FROM custom_folders LIMIT 1;
-- SELECT * FROM user_preferences LIMIT 1;

