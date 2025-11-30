# Google OAuth Client Setup - Privacy Policy & Terms of Service

## Current Issue
Google is showing a warning that Privacy Policy and Terms of Service links are missing for your OAuth client. This is required for OAuth consent screens.

## Solution: Add Privacy Policy and Terms of Service URLs

### Step 1: Go to OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent)
2. Select your project
3. You should see the "OAuth consent screen" configuration

### Step 2: Configure App Information
1. **App name**: Your app name (e.g., "AthenX Mail" or "Email Cleanup SaaS")
2. **User support email**: Your email address
3. **App logo** (optional): Upload a logo if you have one

### Step 3: Add Privacy Policy and Terms of Service URLs
You need to provide URLs for:
- **Privacy Policy URL**: `https://athenxmail-backend.onrender.com/privacy` (or your actual privacy policy URL)
- **Terms of Service URL**: `https://athenxmail-backend.onrender.com/terms` (or your actual terms URL)

### Option A: Create Simple Pages on Your Backend
Add these routes to your backend (`backend/hono.ts`):

```typescript
// Privacy Policy
app.get("/privacy", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Privacy Policy - AthenX Mail</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <p>Last updated: ${new Date().toLocaleDateString()}</p>
      <h2>Data Collection</h2>
      <p>We collect and process your email data to provide email management services.</p>
      <h2>Data Usage</h2>
      <p>Your email data is used solely for providing the email cleanup and management features.</p>
      <h2>Data Security</h2>
      <p>We use industry-standard security measures to protect your data.</p>
    </body>
    </html>
  `);
});

// Terms of Service
app.get("/terms", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Terms of Service - AthenX Mail</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <h1>Terms of Service</h1>
      <p>Last updated: ${new Date().toLocaleDateString()}</p>
      <h2>Acceptance of Terms</h2>
      <p>By using this service, you agree to these terms.</p>
      <h2>Service Description</h2>
      <p>This service provides email management and cleanup features.</p>
    </body>
    </html>
  `);
});
```

### Option B: Use External URLs
If you have privacy policy and terms pages hosted elsewhere, use those URLs.

### Step 4: Save and Publish
1. Fill in all required fields
2. Add the Privacy Policy and Terms of Service URLs
3. Click "Save and Continue"
4. Complete the scopes section (if prompted)
5. Add test users (your email) if the app is in "Testing" mode
6. Submit for verification (if going to production)

### Step 5: Wait for Changes
- Changes may take a few minutes to propagate
- Try the OAuth flow again after saving

## Notes
- For development/testing, you can use simple placeholder pages
- For production, you'll need proper legal documents
- The URLs must be publicly accessible (HTTPS)

