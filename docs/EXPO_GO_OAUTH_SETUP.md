# Expo Go OAuth Setup Guide

This guide explains how to set up Google OAuth to work in Expo Go using the Expo AuthSession proxy.

## Overview

When running in Expo Go, we use the Expo AuthSession proxy (`https://auth.expo.io/@username/slug`) instead of a custom redirect URI. This is because Expo Go doesn't support custom URL schemes for OAuth redirects.

## Your Expo Configuration

- **Expo Username**: `athenx`
- **App Slug**: `email-cleanup-saas-e0pgo27u`
- **Proxy Redirect URI**: `https://auth.expo.io/@athenx/email-cleanup-saas-e0pgo27u`

## Step 1: Add Proxy Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **Web OAuth Client** (the one with your `EXPO_PUBLIC_GOOGLE_CLIENT_ID`)
4. Click **Edit** (pencil icon)
5. Under **Authorized redirect URIs**, add:
   ```
   https://auth.expo.io/@athenx/email-cleanup-saas-e0pgo27u
   ```
6. Click **Save**

## Step 2: Verify the Setup

The code automatically detects if you're running in Expo Go and uses the proxy:

- **Expo Go**: Uses `https://auth.expo.io/@athenx/email-cleanup-saas-e0pgo27u` with `useProxy: true`
- **Standalone/Dev Build**: Uses your configured redirect URI (e.g., `https://rork.com/auth/callback`)
- **Web**: Uses the current origin's redirect URI

## How It Works

1. When you tap "Sign in with Google" in Expo Go:
   - The app opens Google's OAuth page in the system browser
   - After authentication, Google redirects to `https://auth.expo.io/@athenx/email-cleanup-saas-e0pgo27u`
   - The Expo proxy receives the OAuth code and redirects back to Expo Go
   - Expo Go processes the response and completes the authentication

2. The code automatically:
   - Detects Expo Go using `Constants.executionEnvironment === 'storeClient'`
   - Uses `AuthSession.makeRedirectUri({ useProxy: true })` for the redirect URI
   - Calls `promptAsync({ useProxy: true })` to enable the proxy

## Important Notes

⚠️ **The Expo AuthSession proxy is deprecated** but still works for development in Expo Go.

For production, you should:
- Use a **Custom Development Build** or **Standalone Build**
- Configure a proper redirect URI (e.g., `https://yourdomain.com/auth/callback`)
- Use `useProxy: false` in production builds

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure you added the exact proxy URI to Google Cloud Console
- The URI must match exactly: `https://auth.expo.io/@athenx/email-cleanup-saas-e0pgo27u`

### Error: "Access blocked: Authorization Error"
- Check that your Google OAuth client is configured correctly
- Verify the redirect URI is added in Google Cloud Console
- Make sure you're using the **Web OAuth Client ID** (not iOS/Android client ID)

### OAuth flow doesn't complete
- Check Metro logs for any errors
- Verify you're logged into Expo (`npx expo whoami`)
- Try clearing Expo Go cache and restarting

## Testing

1. Run `npx expo start` (or `npm start`)
2. Open the app in Expo Go on your device
3. Navigate to the login screen
4. Tap "Sign in with Google"
5. Complete the OAuth flow in the browser
6. You should be redirected back to Expo Go and logged in

