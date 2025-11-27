# Platform-Specific OAuth Setup Guide

## Overview

This app supports OAuth authentication across three platforms:
- **Desktop Web** (browser-based)
- **Android** (native mobile app)
- **iOS** (native mobile app)

Each platform requires specific configuration in Google Cloud Console.

---

## Google OAuth Client Configuration

### Current Credentials

- **Client ID:** `your-google-oauth-client-id.apps.googleusercontent.com`
- **Client Secret:** `your-google-oauth-client-secret` (backend-only)

---

## Platform-Specific Redirect URIs

### 1. Desktop Web

**Redirect URI Format:**
```
https://rork.com/auth/callback
```

**For Production:**
```
https://your-app.vercel.app/auth/callback
https://your-app.onrender.com/auth/callback
```

**For Local Development:**
```
http://localhost:8081/auth/callback
```

**Configuration:**
- Uses `EXPO_PUBLIC_REDIRECT_BASE_URL` environment variable
- Default: `https://rork.com`
- Automatically appends `/auth/callback`

### 2. Android

**Redirect URI Format:**
```
rork-app://auth/callback
```

**How it works:**
- Uses app scheme from `app.json`: `rork-app`
- Generated automatically by `AuthSession.makeRedirectUri()`
- Deep linking configured in `app.json`

**Android Configuration:**
- App scheme: `rork-app` (from `app.json`)
- Package name: `app.rork.email_cleanup_saas_e0pgo27u`
- Deep linking handled by Expo

### 3. iOS

**Redirect URI Format:**
```
rork-app://auth/callback
```

**How it works:**
- Uses app scheme from `app.json`: `rork-app`
- Generated automatically by `AuthSession.makeRedirectUri()`
- Deep linking configured in `app.json`

**iOS Configuration:**
- App scheme: `rork-app` (from `app.json`)
- Bundle identifier: `app.rork.email-cleanup-saas-e0pgo27u`
- Deep linking handled by Expo

---

## Google Cloud Console Setup

### Step 1: Add Authorized Redirect URIs

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and add these redirect URIs to your OAuth 2.0 Client:

#### For Development:
```
https://rork.com/auth/callback
rork-app://auth/callback
http://localhost:8081/auth/callback
```

#### For Production:
```
https://your-app.vercel.app/auth/callback
https://your-app.onrender.com/auth/callback
rork-app://auth/callback
```

### Step 2: Platform-Specific Settings

#### Web Application:
- **Application type:** Web application
- **Authorized JavaScript origins:**
  - `https://rork.com`
  - `https://your-app.vercel.app` (production)
  - `http://localhost:8081` (development)

#### Android:
- **Application type:** Android
- **Package name:** `app.rork.email_cleanup_saas_e0pgo27u`
- **SHA-1 certificate fingerprint:** (Get from your Android keystore)

#### iOS:
- **Application type:** iOS
- **Bundle ID:** `app.rork.email-cleanup-saas-e0pgo27u`

**Note:** For Expo managed workflow, you may need to create separate OAuth clients or use a single client with all redirect URIs.

---

## How It Works

### Desktop Web Flow:
1. User clicks "Continue with Google"
2. Redirects to Google OAuth: `https://accounts.google.com/o/oauth2/v2/auth`
3. User authenticates
4. Google redirects to: `https://rork.com/auth/callback?code=...`
5. App exchanges code for tokens
6. User is authenticated

### Android/iOS Flow:
1. User clicks "Continue with Google"
2. Opens Google OAuth in browser or in-app browser
3. User authenticates
4. Google redirects to: `rork-app://auth/callback?code=...`
5. Deep link opens the app
6. App exchanges code for tokens
7. User is authenticated

---

## Code Implementation

### Redirect URI Generation

The app automatically generates the correct redirect URI based on platform:

```typescript
// config/env.ts
export function getRedirectUri(): string {
  if (Platform.OS === 'web') {
    return `${AppConfig.redirectBaseUrl}/auth/callback`;
  }
  return `${AppConfig.appScheme}://auth/callback`;
}

// contexts/AuthContext.tsx
function getPlatformRedirectUri(): string {
  if (Platform.OS === 'web') {
    return getRedirectUri();
  }
  // For native platforms, use AuthSession.makeRedirectUri()
  return AuthSession.makeRedirectUri({
    scheme: AppConfig.appScheme,
    path: 'auth/callback',
  });
}
```

### Platform Detection

The app uses `Platform.OS` to detect the current platform:
- `'web'` - Desktop web browser
- `'android'` - Android native app
- `'ios'` - iOS native app

---

## Testing

### Test Desktop Web:
1. Open app in browser
2. Click "Continue with Google"
3. Verify redirect goes to `https://rork.com/auth/callback`
4. Check browser console for redirect URI logs

### Test Android:
1. Build Android app: `expo run:android`
2. Click "Continue with Google"
3. Verify redirect goes to `rork-app://auth/callback`
4. Check logs for redirect URI

### Test iOS:
1. Build iOS app: `expo run:ios`
2. Click "Continue with Google"
3. Verify redirect goes to `rork-app://auth/callback`
4. Check logs for redirect URI

---

## Troubleshooting

### "redirect_uri_mismatch" Error

**Problem:** Google returns `redirect_uri_mismatch` error

**Solutions:**
1. Check that redirect URI in Google Cloud Console matches exactly
2. For web: Verify `EXPO_PUBLIC_REDIRECT_BASE_URL` is correct
3. For native: Verify app scheme in `app.json` matches
4. Check console logs for actual redirect URI being used

### Deep Link Not Opening App (Android/iOS)

**Problem:** After Google auth, app doesn't open

**Solutions:**
1. Verify app scheme in `app.json`: `"scheme": "rork-app"`
2. Check that redirect URI in Google Console includes `rork-app://auth/callback`
3. For Android: Verify package name matches
4. For iOS: Verify bundle identifier matches
5. Test deep link manually: `rork-app://auth/callback`

### Web Redirect Not Working

**Problem:** Web OAuth redirect fails

**Solutions:**
1. Verify `EXPO_PUBLIC_REDIRECT_BASE_URL` is set correctly
2. Check that `https://rork.com/auth/callback` is in Google Console
3. Verify CORS settings allow the redirect
4. Check browser console for errors

---

## Environment Variables

### Required for All Platforms:
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

### Web-Specific:
```env
EXPO_PUBLIC_REDIRECT_BASE_URL=https://rork.com
```

### Native-Specific (Android/iOS):
```env
EXPO_PUBLIC_APP_SCHEME=rork-app
```

---

## Security Notes

✅ **Secure:**
- Client ID is public (safe to expose)
- Client secret is backend-only (never in frontend)
- PKCE flow provides additional security
- Platform-specific redirect URIs prevent cross-platform attacks

⚠️ **Important:**
- Never commit `.env` files with real credentials
- Use different OAuth clients for dev/staging/production
- Rotate credentials if compromised
- Verify redirect URIs match exactly in Google Console

---

## Summary

The app is configured to handle OAuth authentication across all three platforms:

- ✅ **Desktop Web:** Uses HTTPS redirect URIs
- ✅ **Android:** Uses app scheme deep linking
- ✅ **iOS:** Uses app scheme deep linking

All platforms use the same Google OAuth Client ID but with platform-specific redirect URIs configured in Google Cloud Console.

