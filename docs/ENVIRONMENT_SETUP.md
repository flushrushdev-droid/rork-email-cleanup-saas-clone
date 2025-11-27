# Environment Variables Setup Guide

This guide explains how to configure environment variables for different deployment platforms.

## Overview

The app uses a centralized configuration system (`config/env.ts`) that supports:
- **Rork** development environment
- **Vercel** production deployments
- **Render** production deployments
- **Supabase** backend integration
- **Local development**

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values in `.env`

3. For Expo/React Native, environment variables are loaded automatically

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-client-id.apps.googleusercontent.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_APP_ENV` | Environment (development/staging/production) | `development` |
| `EXPO_PUBLIC_APP_SCHEME` | App scheme for deep linking | `rork-app` |
| `EXPO_PUBLIC_REDIRECT_BASE_URL` | Base URL for OAuth redirects | `https://rork.com` |
| `EXPO_PUBLIC_API_BASE_URL` | API base URL | Auto-detected |
| `EXPO_PUBLIC_ENABLE_DEMO_MODE` | Enable demo mode | `true` |
| `EXPO_PUBLIC_ENABLE_DEBUG_LOGGING` | Enable debug logging | `false` |

## Platform-Specific Setup

### Rork Development

Rork automatically provides environment variables. You can set them in the Rork dashboard:

1. Go to your Rork project settings
2. Navigate to Environment Variables
3. Add the variables from `.env.example`

**Note:** Rork uses `EXPO_PUBLIC_RORK_API_BASE_URL` for API base URL, which is supported for backward compatibility.

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add all variables from `.env.example` with the `EXPO_PUBLIC_` prefix

**Example:**
```
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_BASE_URL=https://your-api.vercel.app
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id
EXPO_PUBLIC_REDIRECT_BASE_URL=https://your-app.vercel.app
```

**Important:** 
- Set different values for Production, Preview, and Development environments
- Use production Google OAuth Client ID for production environment
- Use development Client ID for preview/development

### Render Deployment

1. Go to your Render dashboard
2. Select your service
3. Navigate to **Environment** tab
4. Add environment variables

**Example:**
```
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_BASE_URL=https://your-api.onrender.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id
EXPO_PUBLIC_REDIRECT_BASE_URL=https://your-app.onrender.com
```

### Supabase Integration

For Supabase backend:

1. Go to your Supabase project settings
2. Navigate to **API Settings**
3. Use the following variables:

**Frontend (EXPO_PUBLIC_):**
```
EXPO_PUBLIC_API_BASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Backend (no EXPO_PUBLIC_ prefix):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@host:port/database
```

### Local Development

1. Create `.env` file in the project root
2. Copy values from `.env.example`
3. Fill in your local values:

```env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-dev-client-id
EXPO_PUBLIC_REDIRECT_BASE_URL=http://localhost:8081
EXPO_PUBLIC_ENABLE_DEMO_MODE=true
EXPO_PUBLIC_ENABLE_DEBUG_LOGGING=true
```

## Google OAuth Setup

### Creating OAuth Clients

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create separate OAuth 2.0 Client IDs for:
   - **Development** (localhost, Rork)
   - **Staging** (preview deployments)
   - **Production** (production deployments)

### Authorized Redirect URIs

For each OAuth client, add authorized redirect URIs:

**Development:**
- `http://localhost:8081/auth/callback`
- `rork-app://auth/callback`
- `https://rork.com/auth/callback`

**Production:**
- `https://your-app.vercel.app/auth/callback`
- `https://your-app.onrender.com/auth/callback`
- `your-app-scheme://auth/callback`

## app.json Configuration

The `app.json` file contains some hardcoded values that may need to be updated for different environments:

```json
{
  "expo": {
    "scheme": "rork-app",  // Update for your app
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://rork.com/"  // Update for your domain
        }
      ]
    ]
  }
}
```

**Note:** For production builds, you may want to create environment-specific `app.json` files or use build-time configuration.

## Backend Environment Variables

Backend variables (without `EXPO_PUBLIC_` prefix) are server-side only:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-jwt-secret

# CORS
CORS_ORIGINS=https://your-app.vercel.app,https://your-app.onrender.com
```

## Testing Configuration

To verify your configuration is working:

1. Check the console logs (if debug logging is enabled)
2. The app will log configuration on startup in development mode
3. Check that API calls are going to the correct endpoint
4. Verify OAuth redirects work correctly

## Troubleshooting

### Variables Not Loading

- Ensure variables are prefixed with `EXPO_PUBLIC_` for client-side access
- Restart the Expo development server after changing `.env` files
- Clear cache: `expo start -c`

### OAuth Not Working

- Verify redirect URIs match in Google Cloud Console
- Check that `EXPO_PUBLIC_REDIRECT_BASE_URL` matches your deployment URL
- Ensure `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is correct for the environment

### API Calls Failing

- Verify `EXPO_PUBLIC_API_BASE_URL` is set correctly
- Check CORS settings on your backend
- Ensure the API endpoint is accessible from your deployment

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use different OAuth clients** for development and production
3. **Rotate secrets regularly** in production
4. **Use environment-specific values** for each deployment
5. **Limit CORS origins** to your actual domains
6. **Keep backend secrets** (no `EXPO_PUBLIC_` prefix) server-side only

## Migration from Hardcoded Values

If you're migrating from hardcoded values:

1. All hardcoded values now use `config/env.ts`
2. Default fallbacks maintain backward compatibility
3. Update your deployment platform environment variables
4. Test in each environment before deploying

## Support

For issues or questions:
- Check `config/env.ts` for available configuration options
- Review `.env.example` for all available variables
- Check platform-specific documentation (Vercel, Render, Supabase)

