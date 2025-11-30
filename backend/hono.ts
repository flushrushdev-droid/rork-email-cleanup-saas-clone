import { Hono } from "hono";
import { cors } from "hono/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./trpc/app-router.js";
import { createContext } from "./trpc/create-context.js";

const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// Test endpoint to verify OAuth callback route is accessible
app.get("/auth/callback/test", (c) => {
  return c.json({ 
    status: "ok", 
    message: "OAuth callback route is accessible",
    appScheme: process.env.EXPO_PUBLIC_APP_SCHEME || "athenxmail-app",
    timestamp: new Date().toISOString(),
  });
});

// Privacy Policy page (required for Google OAuth)
app.get("/privacy", (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - AthenX Mail</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 30px; }
    p { color: #666; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
  
  <h2>1. Data Collection</h2>
  <p>AthenX Mail collects and processes your email data to provide email management and cleanup services. We access your Gmail account with your explicit consent through Google OAuth.</p>
  
  <h2>2. Data Usage</h2>
  <p>Your email data is used solely for providing the email cleanup, organization, and management features you request. We do not sell, share, or use your data for advertising purposes.</p>
  
  <h2>3. Data Security</h2>
  <p>We use industry-standard security measures including OAuth 2.0 authentication and encrypted connections to protect your data. Your email credentials are never stored on our servers.</p>
  
  <h2>4. Data Storage</h2>
  <p>Email data is processed in real-time and is not permanently stored on our servers unless you explicitly use features that require temporary storage (such as email backups).</p>
  
  <h2>5. Your Rights</h2>
  <p>You can revoke access to your Gmail account at any time through your Google Account settings. You can also request deletion of any data we may have stored.</p>
  
  <h2>6. Contact</h2>
  <p>For questions about this privacy policy, please contact us through the app support channels.</p>
</body>
</html>`);
});

// Terms of Service page (required for Google OAuth)
app.get("/terms", (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - AthenX Mail</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 30px; }
    p { color: #666; }
  </style>
</head>
<body>
  <h1>Terms of Service</h1>
  <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
  
  <h2>1. Acceptance of Terms</h2>
  <p>By accessing and using AthenX Mail, you accept and agree to be bound by the terms and provision of this agreement.</p>
  
  <h2>2. Service Description</h2>
  <p>AthenX Mail provides email management, organization, and cleanup services for Gmail accounts. The service helps users organize, filter, and manage their email inbox.</p>
  
  <h2>3. User Responsibilities</h2>
  <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
  
  <h2>4. Service Availability</h2>
  <p>We strive to provide reliable service but do not guarantee uninterrupted or error-free operation. The service may be temporarily unavailable due to maintenance or technical issues.</p>
  
  <h2>5. Limitation of Liability</h2>
  <p>AthenX Mail is provided "as is" without warranties of any kind. We are not liable for any damages resulting from use of the service.</p>
  
  <h2>6. Changes to Terms</h2>
  <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
</body>
</html>`);
});

// OAuth callback endpoint for mobile apps
// Google redirects here after authentication, then we redirect back to the app
app.get("/auth/callback", (c) => {
  const code = c.req.query("code");
  const error = c.req.query("error");
  const state = c.req.query("state");
  const errorDescription = c.req.query("error_description");
  
  // Log the callback request for debugging
  console.log('[OAuth Callback] Received request', {
    hasCode: !!code,
    hasError: !!error,
    error: error,
    state: state,
    userAgent: c.req.header('user-agent'),
    referer: c.req.header('referer'),
  });
  
  // App scheme for deep linking back to the app
  const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME || "athenxmail-app";
  console.log('[OAuth Callback] Using app scheme:', appScheme);
  
  if (error) {
    console.log('[OAuth Callback] OAuth error, redirecting to app with error');
    // OAuth error - redirect back to app with error
    const errorParams = new URLSearchParams({
      error: error,
      ...(errorDescription && { error_description: errorDescription }),
    });
    const deepLink = `${appScheme}://login?${errorParams.toString()}`;
    console.log('[OAuth Callback] Deep link:', deepLink);
    
    // Return HTML page that redirects to deep link (works better in webviews)
    return c.html(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting...</title>
  <script>
    window.location.href = "${deepLink}";
    setTimeout(function() {
      window.location.href = "${deepLink}";
    }, 100);
  </script>
</head>
<body>
  <p>Redirecting to app...</p>
</body>
</html>`);
  }
  
  if (code) {
    console.log('[OAuth Callback] OAuth success, redirecting to app with code');
    // Success - redirect back to app with code
    const params = new URLSearchParams({
      code: code,
      ...(state && { state: state }),
    });
    const deepLink = `${appScheme}://auth/callback?${params.toString()}`;
    console.log('[OAuth Callback] Deep link:', deepLink);
    
    // Return HTML page that attempts multiple methods to open the deep link
    // expo-auth-session uses WebBrowser which should handle this
    return c.html(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 20px;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007AFF;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
  <script>
    (function() {
      const deepLink = "${deepLink}";
      
      // Method 1: Direct location change (works in most cases)
      try {
        window.location.href = deepLink;
      } catch (e) {
        console.error('Failed to redirect:', e);
      }
      
      // Method 2: Try with setTimeout (fallback)
      setTimeout(function() {
        try {
          window.location.href = deepLink;
        } catch (e) {
          console.error('Failed to redirect (timeout):', e);
        }
      }, 100);
      
      // Method 3: Try using window.open (some webviews prefer this)
      setTimeout(function() {
        try {
          window.open(deepLink, '_self');
        } catch (e) {
          console.error('Failed to open:', e);
        }
      }, 200);
      
      // Show message if still here after 3 seconds
      setTimeout(function() {
        document.querySelector('.container').innerHTML = 
          '<p>If you are not redirected automatically, please return to the app.</p>' +
          '<p style="font-size: 12px; color: #666; margin-top: 20px;">The app should open automatically. If not, close this window and check the app.</p>';
      }, 3000);
    })();
  </script>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Redirecting to app...</p>
  </div>
</body>
</html>`);
  }
  
  console.log('[OAuth Callback] No code or error, redirecting to login');
  // No code or error - redirect to login
  return c.redirect(`${appScheme}://login`);
});

// Mount tRPC server using native fetch adapter
// This handles ALL /api/trpc/* requests
app.all("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

export default app;
