# OAuth Redirect URI Troubleshooting

## Current Configuration

**OAuth Client ID:** `663983319983-o43ikpmfjiqs4ofcd07g8a4pakfae2ic.apps.googleusercontent.com`

**Expected Redirect URI (tunnel mode):** `https://athenxmail-backend.onrender.com/auth/callback`

## Google Console Checklist

Please verify in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. **Select the correct OAuth 2.0 Client ID:**
   - Go to APIs & Services → Credentials
   - Find the client ID: `663983319983-o43ikpmfjiqs4ofcd07g8a4pakfae2ic`
   - Click to edit it

2. **CRITICAL: Check Application Type:**
   - The OAuth client MUST be configured as **"Web application"** (not "Android" or "iOS")
   - Mobile apps using web redirect URIs require a "Web application" type client
   - If it's set to "Android" or "iOS", create a new "Web application" client or change the type

3. **Check Authorized redirect URIs:**
   - Must include EXACTLY: `https://athenxmail-backend.onrender.com/auth/callback`
   - NO trailing slash
   - Must be `https://` (not `http://`)
   - Must match exactly (case-sensitive)

3. **Common Issues:**
   - ❌ `https://athenxmail-backend.onrender.com/auth/callback/` (trailing slash)
   - ❌ `http://athenxmail-backend.onrender.com/auth/callback` (http instead of https)
   - ❌ `https://athenxmail-backend.onrender.com/auth/callback ` (trailing space)
   - ✅ `https://athenxmail-backend.onrender.com/auth/callback` (correct)

4. **Also verify these are in the list:**
   - `http://localhost:8081/auth/callback` (for local development)
   - `https://athenxmail-backend.onrender.com/auth/callback` (for tunnel/production)

## Testing

After updating Google Console:
1. Wait 1-2 minutes for changes to propagate
2. Reload the app on your phone
3. Try logging in again

## Debug Logs

Check the app logs to see what redirect URI is being sent:
- Look for: `[DEBUG] [Auth] OAuth configuration`
- Verify `redirectUri` matches exactly what's in Google Console

