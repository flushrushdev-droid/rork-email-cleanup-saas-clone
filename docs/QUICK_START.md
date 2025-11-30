# Quick Start Guide - Infrastructure Setup

This is a condensed guide to get your Supabase and Render infrastructure running quickly.

## 🚀 5-Minute Setup

### Step 1: Supabase (2 minutes)

1. **Login to Supabase**
   - Go to https://app.supabase.com
   - Email: `flushrushdev@gmail.com`
   - Password: `+}-eu2,G{KqDBB>z`

2. **Create Project**
   - Click "New Project"
   - Name: `athenxmail`
   - Choose region and set database password
   - Wait 2-3 minutes for setup

3. **Get Credentials**
   - Go to Settings > API
   - Copy: Project URL, anon key, service_role key

4. **Run Database Schema**
   - Go to SQL Editor
   - Open `database/schema.sql`
   - Copy/paste and click "Run"

5. **Enable Real-time**
   - Go to Database > Replication
   - Enable for: `rules`, `custom_folders`, `user_preferences`

### Step 2: Render (2 minutes)

1. **Create Account**
   - Go to https://render.com
   - Sign up (free tier available)

2. **Deploy Backend**
   - Click "New" > "Blueprint"
   - Connect your Git repository
   - Render will detect `render.yaml`
   - Click "Apply"

3. **Set Environment Variables**
   In Render dashboard > Environment, add:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NODE_ENV=production
   PORT=10000
   CORS_ORIGINS=https://your-frontend-url.com
   ```

4. **Get Backend URL**
   - After deployment, copy your Render URL
   - Example: `https://athenxmail-backend.onrender.com`

### Step 3: Frontend Configuration (1 minute)

1. **Create `.env` file** (copy from `.env.example`)
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
   ```

2. **Test Connection**
   - Start your app
   - Check console for errors
   - Visit backend URL to verify it's running

## ✅ Verification Checklist

- [ ] Supabase project created and active
- [ ] Database schema executed successfully
- [ ] Real-time enabled for all tables
- [ ] Render backend deployed and running
- [ ] Environment variables set in Render
- [ ] Frontend `.env` file configured
- [ ] Backend URL accessible (returns `{"status":"ok"}`)
- [ ] No console errors in frontend

## 🐛 Common Issues

**Backend won't start:**
- Check Render logs
- Verify all environment variables are set
- Ensure `PORT` is set to `10000`

**Supabase connection errors:**
- Verify URL and keys are correct
- Check Supabase project is not paused
- Ensure `.env` file is in project root

**Real-time not working:**
- Verify tables are enabled in Replication settings
- Check you're using the correct Supabase client
- Ensure subscriptions are set up correctly

## 📚 Full Documentation

For detailed setup instructions, see:
- `docs/INFRASTRUCTURE_SETUP.md` - Complete setup guide
- `CREDENTIALS_TEMPLATE.md` - Credentials storage template

## 🎯 Next Steps

After infrastructure is set up:
1. Test creating a rule in the app
2. Verify it appears in Supabase dashboard
3. Test cross-device sync (if you have multiple devices)
4. Monitor Render logs for any errors
5. Proceed with beta launch preparation

---

**Need Help?** Check the full documentation or review the error logs in Supabase and Render dashboards.

