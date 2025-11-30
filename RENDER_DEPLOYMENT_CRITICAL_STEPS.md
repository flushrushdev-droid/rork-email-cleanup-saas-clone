# ⚠️ CRITICAL: Render Deployment Issues - Action Required

## Current Problem
The backend tRPC routes are returning 404 errors despite successful deployments. This means:
- ✅ Backend server is running (health check works)
- ❌ tRPC routes are not accessible (`/api/trpc/*` returns 404)
- ❌ Users cannot be created in Supabase

## Root Cause Analysis
The issue is that **environment variables are NOT set on Render**, causing the tRPC server to fail silently.

## ⚡ IMMEDIATE ACTION REQUIRED

### Step 1: Set Environment Variables on Render Dashboard

1. Go to https://dashboard.render.com
2. Select your `athenxmail-backend` service
3. Go to **Environment** tab
4. Add the following environment variables:

```
SUPABASE_URL=https://kczbtkclzzqvafxnyqly.supabase.co
SUPABASE_ANON_KEY=sb_publishable_rB-5H1AWygxxSMEefNYC6Q_qj7Jqdhp
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Q4xKJPC2HUjXVVbdNz01zA_YOfSyoNP
NODE_ENV=production
PORT=10000
```

**⚠️ IMPORTANT**: 
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is marked as **secret** (click the lock icon)
- After adding, click "Save Changes"
- This will trigger an **automatic redeployment**

### Step 2: Wait for Redeployment
- Render will automatically redeploy with the new environment variables
- This takes 2-5 minutes
- Wait for the deployment to show "Live"

### Step 3: Test the Routes

After deployment completes, run:
```bash
node scripts/test-trpc-routes.js
```

You should see:
```
📡 Testing Example Route (GET)...
   Status: 200
   ✅ Route exists (200)

📡 Testing Users.getById (GET)...
   Status: 200 or 500
   ✅ Route exists!

📡 Testing Users.upsert (POST)...
   Status: 200
   ✅ Route exists and user creation works!
```

### Step 4: Test Login
1. Clear browser cache
2. Restart frontend: `npm start`
3. Login with Gmail
4. Check Supabase `users` table - you should see your user!

## Why This Happened

1. **Render doesn't load `.env` files** - environment variables must be set in the dashboard
2. **`render.yaml` only declares variables** - it doesn't set their values
3. **Without env vars, Supabase client returns `null`**, causing all database operations to fail silently

## If Routes Still Return 404 After Setting Env Vars

This would indicate a routing configuration issue. Check Render logs:

1. Go to Render dashboard > your service > **Logs** tab
2. Look for errors like:
   - "Supabase client not configured"
   - "Cannot find module"
   - TypeScript/JavaScript errors

3. Share the error logs and we'll fix the routing issue

## Alternative: Bypass User Creation for Now

If you want to proceed without fixing this immediately, you can:
1. Manually create a user in Supabase:
   - Go to Supabase Table Editor > `users` table
   - Click "Insert" > "Insert row"
   - Add your Google ID and email
2. This will let you test other features while we fix the backend

## Next Steps After This Is Fixed

Once the backend routes work:
- ✅ User creation on login will work automatically
- ✅ User actions will be tracked
- ✅ All tRPC routes (rules, folders, preferences) will work
- ✅ Full integration between frontend and backend

---

**SUMMARY**: The fix is simple - **set the environment variables on Render dashboard**. This is the #1 issue preventing everything from working.

