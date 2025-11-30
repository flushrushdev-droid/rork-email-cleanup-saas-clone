# Fix OAuth Consent Screen Stuck Issue

## The Problem
You're stuck on the Google consent screen that says "Make sure you trust athenxmail-backend.onrender.com" and shows a warning about Privacy Policy/Terms links.

## Why Backend Has No Logs
The backend won't receive any requests until you click "Continue" on the consent screen. Google only redirects to your backend after you grant consent.

## Solution Steps

### Step 1: Configure OAuth Consent Screen in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Select your project
3. You should see the "OAuth consent screen" configuration

### Step 2: Check Publishing Status

**If your app is in "Testing" mode:**
- You MUST add your email as a "Test user"
- Go to "Test users" section
- Click "+ ADD USERS"
- Add your email: `madkongo@gmail.com`
- Save

**If your app is in "Production" mode:**
- Make sure Privacy Policy and Terms URLs are configured

### Step 3: Add Privacy Policy and Terms URLs

1. In the OAuth consent screen, look for:
   - **Application home page** (optional but recommended)
   - **Privacy Policy link** (REQUIRED)
   - **Terms of Service link** (REQUIRED)

2. Add these URLs:
   - Privacy Policy: `https://athenxmail-backend.onrender.com/privacy`
   - Terms of Service: `https://athenxmail-backend.onrender.com/terms`

3. If you don't see these fields:
   - Make sure you're on the "OAuth consent screen" tab (not "Credentials")
   - Scroll down - they might be further down the page
   - They might be under "App domain" section

### Step 4: Save and Wait

1. Click "Save and Continue" or "Save"
2. Wait 1-2 minutes for changes to propagate
3. If in Testing mode, make sure you're logged in with a test user email

### Step 5: Try Again

1. Reload the app on your phone
2. Try logging in again
3. The consent screen should now show the Privacy Policy and Terms links
4. Click "Continue" to proceed

## Common Issues

**Issue: "This app isn't verified"**
- This is normal for apps in Testing mode
- Click "Advanced" → "Go to [Your App] (unsafe)" to proceed

**Issue: Still stuck on consent screen**
- Make sure you're using a test user email (if in Testing mode)
- Check that Privacy Policy and Terms URLs are accessible
- Wait a few more minutes for Google's changes to propagate

**Issue: Backend still has no logs**
- This is normal until you click "Continue" on the consent screen
- Once you grant consent, Google will redirect to your backend
- Then you'll see logs in Render

