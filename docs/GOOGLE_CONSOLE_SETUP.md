# Google Cloud Console Setup Guide

## Current Configuration Issue

You're getting `Error 400: redirect_uri_mismatch` because the redirect URI in your Google Console doesn't match what the app is sending.

## Problem

**Google Console has:**
- Authorized redirect URI: `http://localhost:8081`

**App is sending:**
- Redirect URI: `http://localhost:8081/auth/callback`

## Solution

### Step 1: Update Google Cloud Console

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and update your OAuth 2.0 Client:

#### Authorized Redirect URIs

Add these redirect URIs (click "+ Add URI" for each):

**For Local Development:**
```
http://localhost:8081/auth/callback
```

**For Production (when you deploy):**
```
https://rork.com/auth/callback
https://your-app.vercel.app/auth/callback
https://your-app.onrender.com/auth/callback
```

**For Native Apps (Android/iOS):**
```
rork-app://auth/callback
```

#### Authorized JavaScript Origins

Keep these (for web OAuth):

**For Local Development:**
```
http://localhost:8081
```

**For Production:**
```
https://rork.com
https://your-app.vercel.app
https://your-app.onrender.com
```

### Step 2: Verify the Fix

After updating Google Console:

1. **Wait 5 minutes** (Google says it can take up to a few hours, but usually 5 minutes)
2. **Clear browser cache** or use incognito mode
3. **Try OAuth again** - it should work now

## Complete Redirect URI List

Here's the complete list you should have in Google Console:

### Development:
```
http://localhost:8081/auth/callback
rork-app://auth/callback
```

### Production:
```
https://rork.com/auth/callback
https://your-app.vercel.app/auth/callback
https://your-app.onrender.com/auth/callback
rork-app://auth/callback
```

## How the App Determines Redirect URI

### Web (Desktop):
- **Local Development:** Auto-detects `http://localhost:8081/auth/callback` from `window.location.origin`
- **Production:** Uses `EXPO_PUBLIC_REDIRECT_BASE_URL` or defaults to `https://rork.com/auth/callback`

### Android/iOS:
- Always uses: `rork-app://auth/callback` (from app scheme in `app.json`)

## Troubleshooting

### Still Getting redirect_uri_mismatch?

1. **Check the exact redirect URI:**
   - Open browser console
   - Look for OAuth logs
   - Verify the exact URI being sent

2. **Verify in Google Console:**
   - Go to your OAuth client
   - Check "Authorized redirect URIs"
   - Make sure it matches **exactly** (including `/auth/callback`)

3. **Common Mistakes:**
   - Missing `/auth/callback` path
   - Using `https://` instead of `http://` for localhost
   - Extra trailing slashes
   - Wrong port number

### Test the Redirect URI

You can test if the redirect URI is correct by checking the browser console logs. The app logs the redirect URI on startup in development mode.

Look for:
```
[Config] Redirect Base URL: http://localhost:8081
[Auth] OAuth configuration { redirectUri: 'http://localhost:8081/auth/callback', ... }
```

## Quick Fix Checklist

- [ ] Added `http://localhost:8081/auth/callback` to Google Console
- [ ] Waited 5 minutes after updating
- [ ] Cleared browser cache
- [ ] Verified redirect URI in console logs matches Google Console
- [ ] Tried OAuth again

## After Fixing

Once you've added the correct redirect URI to Google Console:

1. The `redirect_uri_mismatch` error will disappear
2. OAuth will redirect back to your app
3. Authentication will complete successfully

---

**Note:** The app now auto-detects the redirect URI for web, so it will automatically use `http://localhost:8081/auth/callback` when running locally, and `https://rork.com/auth/callback` in production (or whatever you set in `EXPO_PUBLIC_REDIRECT_BASE_URL`).

