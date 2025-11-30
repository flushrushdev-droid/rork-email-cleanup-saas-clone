# Database Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Login with: `flushrushdev@gmail.com`
3. Select your project (or create one if needed)
4. Click on **"SQL Editor"** in the left sidebar
5. Click **"New query"**

### Step 2: Run the Database Schema

1. Open the file `database/schema-beta.sql` from this project
2. **Copy the entire contents** of the file
3. **Paste it into the Supabase SQL Editor**
4. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

You should see: **"Success. No rows returned"** - this means it worked!

### Step 3: Enable Real-time (Important for Cross-Device Sync)

1. In Supabase dashboard, go to **"Database"** > **"Replication"**
2. Make sure these tables are enabled for replication:
   - ✅ `rules`
   - ✅ `custom_folders`
   - ✅ `user_preferences`

If they're not enabled, click the toggle to enable them.

### Step 4: Verify Setup

Run these queries in SQL Editor to verify:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rules', 'custom_folders', 'user_preferences');

-- Should return 3 rows
```

### Step 5: Test Insert (Optional)

Test that you can insert data:

```sql
-- Test insert (will be cleaned up)
INSERT INTO rules (user_id, name, conditions, actions)
VALUES ('test@example.com', 'Test Rule', '{}', '{}')
RETURNING *;

-- Clean up
DELETE FROM rules WHERE user_id = 'test@example.com';
```

---

## Your Supabase Credentials

**Project URL:** `https://kczbtkclzzqvafxnyqly.supabase.co`

**Anon Key (Publishable):** `sb_publishable_rB-5H1AWygxxSMEefNYC6Q_qj7Jqdhp`

**Service Role Key (Secret):** `sb_secret_Q4xKJPC2HUjXVVbdNz01zA_YOfSyoNP`

⚠️ **Keep the Service Role Key secret!** Never expose it to the frontend.

---

## What Gets Created

### Tables:
1. **rules** - Stores email filtering rules
2. **custom_folders** - Stores user-created custom folders
3. **user_preferences** - Stores user theme and settings

### Features:
- ✅ Automatic `updated_at` timestamps
- ✅ Indexes for fast queries
- ✅ Row Level Security (RLS) enabled (beta-friendly policies)
- ✅ Real-time subscriptions enabled for cross-device sync

---

## Troubleshooting

### "relation already exists" error
- Tables already exist. This is fine - the schema uses `CREATE TABLE IF NOT EXISTS`
- You can continue or drop tables first if you want a fresh start

### "permission denied" error
- Make sure you're logged in as the project owner
- Check that you have the correct permissions

### Real-time not working
- Go to Database > Replication
- Make sure all three tables are enabled
- Refresh the page and try again

---

## Next Steps

After database setup:
1. ✅ Update your `.env` file with Supabase credentials
2. ✅ Test the connection from your app
3. ✅ Create a test rule to verify it works
4. ✅ Check Supabase dashboard to see the data

---

**Need Help?** Check `docs/INFRASTRUCTURE_SETUP.md` for detailed instructions.

