# Infrastructure Setup Guide

This guide walks you through setting up Supabase (database) and Render (backend hosting) for AthenXMail.

## Prerequisites

- Supabase account (free tier is sufficient for beta)
- Render account (free tier available)
- Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in with your account: **flushrushdev@gmail.com**
3. Click "New Project"
4. Fill in:
   - **Name**: `athenxmail` (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for beta
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be created

### 1.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - **KEEP THIS SECRET!**

3. Copy these values - you'll need them later.

### 1.3 Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `database/schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### 1.4 Enable Real-time (for Cross-Device Sync)

1. Go to **Database** > **Replication**
2. Enable replication for:
   - `rules`
   - `custom_folders`
   - `user_preferences`
3. This enables real-time subscriptions for cross-device sync

### 1.5 (Optional) Configure Row Level Security

The schema includes RLS policies that use Supabase Auth. For beta testing without Supabase Auth:

1. You can temporarily disable RLS:
   ```sql
   ALTER TABLE rules DISABLE ROW LEVEL SECURITY;
   ALTER TABLE custom_folders DISABLE ROW LEVEL SECURITY;
   ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
   ```

2. **OR** modify the policies to use a custom `user_id` field (email-based):
   ```sql
   -- Example: Allow access based on user_id matching
   DROP POLICY IF EXISTS "Users can view their own rules" ON rules;
   CREATE POLICY "Users can view their own rules"
     ON rules FOR SELECT
     USING (true);  -- For beta, allow all (NOT for production!)
   ```

**Note**: For production, you should use proper authentication and RLS policies.

---

## Step 2: Set Up Render

### 2.1 Create Render Account

1. Go to [https://render.com](https://render.com)
2. Sign up (free tier available)
3. Connect your Git repository (GitHub, GitLab, or Bitbucket)

### 2.2 Deploy Backend Using Blueprint

1. In Render dashboard, click **"New"** > **"Blueprint"**
2. Connect your Git repository
3. Render will detect the `render.yaml` file
4. Review the service configuration
5. Click **"Apply"**

### 2.3 Configure Environment Variables

1. In your Render service dashboard, go to **Environment**
2. Add the following environment variables:

   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NODE_ENV=production
   PORT=10000
   CORS_ORIGINS=https://your-frontend-url.com
   ```

3. **Important**: 
   - Replace `your-project.supabase.co` with your actual Supabase URL
   - Replace `your-anon-key` with your Supabase anon key
   - Replace `your-service-role-key` with your Supabase service role key
   - Update `CORS_ORIGINS` with your frontend URL(s)

4. Click **"Save Changes"**

### 2.4 Manual Deployment (Alternative)

If you prefer not to use Blueprint:

1. Click **"New"** > **"Web Service"**
2. Connect your Git repository
3. Configure:
   - **Name**: `athenxmail-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run backend:start` (or `node backend/server.js`)
   - **Plan**: Free (or upgrade as needed)
4. Add environment variables (same as above)
5. Click **"Create Web Service"**

### 2.5 Get Your Backend URL

1. After deployment, Render will provide a URL like: `https://athenxmail-backend.onrender.com`
2. Copy this URL - you'll need it for your frontend configuration

---

## Step 3: Configure Frontend

### 3.1 Update Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your Supabase credentials:

   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # Backend API URL
   EXPO_PUBLIC_API_BASE_URL=https://athenxmail-backend.onrender.com
   ```

3. **Never commit `.env` to Git!** It should be in `.gitignore`

### 3.2 Update Backend URL in Code

Update `config/env.ts` or wherever you configure your API base URL to use the Render URL.

---

## Step 4: Test the Setup

### 4.1 Test Supabase Connection

1. Start your app locally
2. Check the console for Supabase connection errors
3. Try creating a rule or folder in the app
4. Check Supabase dashboard > **Table Editor** to see if data appears

### 4.2 Test Backend API

1. Visit your Render backend URL: `https://your-backend.onrender.com`
2. You should see: `{"status":"ok","message":"API is running"}`
3. Test tRPC endpoint (requires proper setup in your frontend)

### 4.3 Test Cross-Device Sync

1. Create a rule on Device A
2. Check if it appears on Device B (may take a few seconds)
3. Update a rule on Device A
4. Verify the update syncs to Device B

---

## Step 5: Production Considerations

### 5.1 Security

- ✅ Never commit `.env` files
- ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend
- ✅ Use Row Level Security (RLS) in production
- ✅ Implement proper authentication
- ✅ Use HTTPS everywhere

### 5.2 Monitoring

- Set up error tracking (Sentry is already integrated)
- Monitor Render logs for backend errors
- Monitor Supabase dashboard for database issues

### 5.3 Scaling

- **Free tier limits**:
  - Supabase: 500MB database, 2GB bandwidth/month
  - Render: Free tier spins down after 15min inactivity
- **Upgrade when needed**:
  - Supabase Pro: $25/month
  - Render: $7/month for always-on service

---

## Troubleshooting

### Backend Not Starting

- Check Render logs for errors
- Verify environment variables are set correctly
- Ensure `PORT` environment variable is set

### Supabase Connection Errors

- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active (not paused)
- Verify network connectivity

### RLS Policy Errors

- Check if RLS is enabled and policies are correct
- For beta, you can temporarily disable RLS (not recommended for production)
- Ensure `user_id` matches in queries

### Real-time Not Working

- Verify tables are enabled for replication in Supabase dashboard
- Check that you're using the correct Supabase client
- Ensure you're subscribed to the correct channel

---

## Next Steps

1. ✅ Supabase database set up
2. ✅ Render backend deployed
3. ✅ Environment variables configured
4. ⏭️ Test with real data
5. ⏭️ Implement authentication (if not using Supabase Auth)
6. ⏭️ Set up monitoring and alerts
7. ⏭️ Prepare for beta launch

---

## Support

- Supabase Docs: https://supabase.com/docs
- Render Docs: https://render.com/docs
- Project Issues: Check GitHub issues or contact the team

---

**Last Updated**: 2024-12-30

