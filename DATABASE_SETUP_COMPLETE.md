# ✅ Database Setup - Next Steps

Your Supabase credentials have been configured! Now you need to run the database schema.

## 🚀 Quick Setup (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to **https://app.supabase.com**
2. Login with: `flushrushdev@gmail.com`
3. Select your project
4. Click **"SQL Editor"** in the left sidebar
5. Click **"New query"**

### Step 2: Run the Database Schema

**Option A: Beta-Friendly Schema (Recommended for testing)**
1. Open `database/schema-beta.sql` from this project
2. Copy the **entire contents**
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press `Ctrl+Enter`)

**Option B: Production Schema (With proper RLS)**
1. Open `database/schema.sql` from this project
2. Copy the **entire contents**
3. Paste into Supabase SQL Editor
4. Click **"Run"**

You should see: **"Success. No rows returned"** ✅

### Step 3: Enable Real-time

1. In Supabase dashboard, go to **"Database"** > **"Replication"**
2. Enable replication for:
   - ✅ `rules`
   - ✅ `custom_folders`
   - ✅ `user_preferences`

### Step 4: Test Connection

Run this command to test your connection:

```bash
node scripts/test-supabase-connection.js
```

You should see all tests passing! ✅

---

## 📋 What's Already Done

✅ Supabase credentials configured in `.env` file  
✅ Frontend Supabase client ready (`lib/supabase.ts`)  
✅ Backend Supabase client ready (`backend/lib/supabase.ts`)  
✅ tRPC routes created for rules, folders, preferences  
✅ Database schema files created  

## 📋 What You Need to Do

⏳ Run the database schema in Supabase SQL Editor  
⏳ Enable real-time replication  
⏳ Test the connection  

---

## 🔍 Verify Setup

After running the schema, you can verify in Supabase:

1. Go to **"Table Editor"** in Supabase dashboard
2. You should see 3 tables:
   - `rules`
   - `custom_folders`
   - `user_preferences`

3. Test insert (in SQL Editor):
```sql
INSERT INTO rules (user_id, name, conditions, actions)
VALUES ('test@example.com', 'Test Rule', '{}', '{}')
RETURNING *;

-- Clean up
DELETE FROM rules WHERE user_id = 'test@example.com';
```

---

## 📚 Files Created

- ✅ `.env` - Your credentials (DO NOT COMMIT)
- ✅ `database/schema-beta.sql` - Beta-friendly schema
- ✅ `database/schema.sql` - Production schema
- ✅ `setup-database.md` - Detailed setup instructions
- ✅ `scripts/test-supabase-connection.js` - Connection test script

---

## 🎯 Next Steps After Database Setup

1. ✅ Test connection with the test script
2. ✅ Create a test rule in your app
3. ✅ Verify data appears in Supabase dashboard
4. ✅ Test cross-device sync (if you have multiple devices)
5. ✅ Deploy backend to Render
6. ✅ Update frontend to use the backend API

---

**Need Help?** Check `setup-database.md` for detailed instructions.

