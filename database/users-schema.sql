-- Users and Analytics Schema for AthenXMail
-- 
-- This schema adds:
-- - Users table (registration, login tracking, subscription info)
-- - User actions table (analytics and user behavior tracking)
--
-- Run this in your Supabase SQL Editor after creating the base schema

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Google user ID or email for demo users
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  picture TEXT,
  provider TEXT NOT NULL DEFAULT 'google', -- 'google', 'demo', etc.
  
  -- Registration and first-time tracking
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_login_at TIMESTAMP WITH TIME ZONE,
  is_first_login BOOLEAN DEFAULT true,
  
  -- Session tracking
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_logout_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  total_session_time_seconds INTEGER DEFAULT 0, -- Cumulative session time
  
  -- Subscription and billing
  plan_type TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise', etc.
  plan_status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
  subscription_id TEXT, -- Stripe, PayPal, etc. subscription ID
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  billing_email TEXT,
  
  -- Feature flags and limits
  features JSONB DEFAULT '{}', -- Feature flags: {"ai_assistant": true, "custom_folders": 10}
  limits JSONB DEFAULT '{}', -- Usage limits: {"rules": 50, "folders": 20}
  
  -- Analytics and metadata
  metadata JSONB DEFAULT '{}', -- Flexible storage for analytics data
  referral_code TEXT, -- User's referral code
  referred_by TEXT, -- User ID who referred this user
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan_type ON users(plan_type);
CREATE INDEX IF NOT EXISTS idx_users_plan_status ON users(plan_status);
CREATE INDEX IF NOT EXISTS idx_users_registered_at ON users(registered_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ============================================
-- User Actions Table (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Action details
  action_type TEXT NOT NULL, -- 'login', 'logout', 'create_rule', 'delete_rule', 'sync_emails', etc.
  action_category TEXT, -- 'auth', 'rules', 'folders', 'sync', 'settings', etc.
  
  -- Action data (flexible JSONB for different action types)
  action_data JSONB DEFAULT '{}', -- e.g., {"rule_id": "123", "folder_name": "Work"}
  
  -- Context
  screen_name TEXT, -- Which screen the action occurred on
  device_type TEXT, -- 'web', 'ios', 'android'
  app_version TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_category ON user_actions(action_category);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_type ON user_actions(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_date ON user_actions(user_id, created_at);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- Users Policies (Beta - allows user_id-based access)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
DROP POLICY IF EXISTS "Users can update their own record" ON users;
DROP POLICY IF EXISTS "Users can view their own actions" ON user_actions;
DROP POLICY IF EXISTS "Users can insert their own actions" ON user_actions;

-- Users can view their own record
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (true); -- For beta: allow all reads (filtered by user_id in application)

-- Users can insert their own record (on first registration)
CREATE POLICY "Users can insert their own record"
  ON users FOR INSERT
  WITH CHECK (true); -- For beta: allow all inserts (user_id set by application)

-- Users can update their own record
CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true); -- For beta: allow all updates (filtered by user_id in application)

-- User Actions Policies (Beta)
-- Users can view their own actions
CREATE POLICY "Users can view their own actions"
  ON user_actions FOR SELECT
  USING (true);

-- Users can insert their own actions
CREATE POLICY "Users can insert their own actions"
  ON user_actions FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to automatically update updated_at timestamp
-- (reuse existing function if it exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to track first login
CREATE OR REPLACE FUNCTION track_first_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Set first_login_at on first login
  IF NEW.last_login_at IS NOT NULL AND OLD.last_login_at IS NULL THEN
    NEW.first_login_at = NEW.last_login_at;
    NEW.is_first_login = false;
  END IF;
  
  -- Increment login count
  IF NEW.last_login_at IS NOT NULL AND (OLD.last_login_at IS NULL OR NEW.last_login_at > OLD.last_login_at) THEN
    NEW.login_count = COALESCE(OLD.login_count, 0) + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track first login and increment login count
DROP TRIGGER IF EXISTS track_user_login ON users;
CREATE TRIGGER track_user_login
  BEFORE UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.last_login_at IS DISTINCT FROM OLD.last_login_at)
  EXECUTE FUNCTION track_first_login();

-- ============================================
-- Real-time Subscriptions
-- ============================================
-- Enable real-time for users table (optional - for admin dashboards)
-- Note: These commands will fail if tables are already in the publication, which is fine
DO $$
BEGIN
  -- Try to add users table to realtime publication (ignore if already exists)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, that's fine
    NULL;
  END;
  
  -- Try to add user_actions table to realtime publication (ignore if already exists)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_actions;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, that's fine
    NULL;
  END;
END $$;

-- ============================================
-- Helper Views (Optional - for analytics)
-- ============================================

-- View for active users (logged in within last 30 days)
CREATE OR REPLACE VIEW active_users AS
SELECT 
  id,
  email,
  name,
  plan_type,
  last_login_at,
  login_count,
  registered_at
FROM users
WHERE is_active = true
  AND last_login_at > NOW() - INTERVAL '30 days';

-- View for user activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  u.id,
  u.email,
  u.plan_type,
  u.login_count,
  u.last_login_at,
  COUNT(ua.id) as total_actions,
  COUNT(DISTINCT DATE(ua.created_at)) as active_days,
  MAX(ua.created_at) as last_action_at
FROM users u
LEFT JOIN user_actions ua ON u.id = ua.user_id
GROUP BY u.id, u.email, u.plan_type, u.login_count, u.last_login_at;

-- ============================================
-- Notes
-- ============================================
-- 
-- After running this schema:
-- 1. The users table will track all user registrations and logins
-- 2. The user_actions table will track all user interactions for analytics
-- 3. Update your backend/frontend to:
--    - Create/update user record on login
--    - Track user actions (login, logout, create rule, etc.)
--    - Update subscription status when user upgrades/downgrades
--
-- Example queries:
-- 
-- Get user by email:
-- SELECT * FROM users WHERE email = 'user@example.com';
--
-- Get user's recent actions:
-- SELECT * FROM user_actions WHERE user_id = 'user_id' ORDER BY created_at DESC LIMIT 50;
--
-- Get active users count:
-- SELECT COUNT(*) FROM active_users;
--
-- Get user activity:
-- SELECT * FROM user_activity_summary WHERE id = 'user_id';

