# Quick Setup Guide

## Step 1: Create Users Tables in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the **entire contents** of `database/users-schema.sql`
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

This will create:
- `users` table - for user registration and tracking
- `user_actions` table - for analytics

## Step 2: Verify Tables Were Created

Run this query in Supabase SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_actions');
```

You should see both tables listed.

## Step 3: Test User Creation

After logging in, check if a user was created:

```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
```

## Troubleshooting

### If you see 404 errors:
- The backend route might not be deployed yet
- Check Render dashboard to see if deployment is complete
- Wait a few minutes and try again

### If user creation fails:
- Make sure you ran `database/users-schema.sql` in Supabase
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in Render environment variables
- Check Render logs for any errors

### If tables are empty:
- Make sure you ran the schema SQL
- Check that the backend has the correct Supabase credentials
- Try logging in again after verifying the setup

