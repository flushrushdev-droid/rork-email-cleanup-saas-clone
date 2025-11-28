# Frontend Security Enhancements (Frontend-Only)

## Overview
This document outlines **frontend-only** security enhancements that can be implemented without backend changes. All recommendations are achievable purely in the React Native/Expo frontend.

**Priority:** High - Security should be addressed before refactoring to avoid introducing vulnerabilities during code restructuring.

---

## 🔴 Critical Security Issues (Must Fix - Frontend Only)

### 1. **Secure Token Storage**
**Current State:** Using `AsyncStorage` (unencrypted) for storing OAuth tokens
**Risk:** High - Tokens are stored in plaintext and can be accessed by other apps or through device compromise

**Solution (Frontend Only):**
- Migrate to `expo-secure-store` for sensitive data (tokens, refresh tokens)
- Keep `AsyncStorage` only for non-sensitive data (user preferences, demo mode flag)

**Files to Update:**
- `contexts/AuthContext.tsx` - Replace AsyncStorage with SecureStore for tokens

**Implementation:**
import * as SecureStore from 'expo-secure-store';

// Store tokens securely
await SecureStore.setItemAsync('auth_tokens', JSON.stringify(tokens));

// Retrieve tokens securely
const stored = await SecureStore.getItemAsync('auth_tokens');
if (stored) {
  const tokens = JSON.parse(stored);
}**Package Required:**
npx expo install expo-secure-store**Priority:** 🔴 Critical - Should be done before production

---

### 2. **Deep Link Parameter Validation**
**Current State:** Deep link parameters are parsed and used without validation
**Risk:** Medium-High - Could lead to injection attacks or unexpected behavior

**Solution (Frontend Only):**
- Validate all URL parameters before processing
- Sanitize and validate OAuth codes, state parameters
- Validate email IDs, folder names, etc. before using in navigation
- Reject malformed or suspicious parameters

**Files to Update:**
- `app/auth/callback.tsx` - Validate OAuth code format
- `app/affected-emails.tsx` - Validate JSON before parsing
- `hooks/useIOSShortcuts.ts` - Validate shortcut action parameters
- `hooks/useAndroidIntents.ts` - Validate intent parameters
- `app/stat-details.tsx` - Validate stat type parameter
- `app/email-detail.tsx` - Validate emailId parameter

**Implementation:**
Create `utils/security.ts`:script
/**
 * Validate OAuth authorization code format
 */
export function isValidOAuthCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  // OAuth codes are typically alphanumeric with dashes/underscores
  return /^[A-Za-z0-9_-]+$/.test(code) && code.length >= 20 && code.length <= 200;
}

/**
 * Validate email ID format
 */
export function isValidEmailId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[A-Za-z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 100;
}

/**
 * Validate stat type parameter
 */
export function isValidStatType(type: string): type is 'unread' | 'noise' | 'files' | 'automated' {
  return ['unread', 'noise', 'files', 'automated'].includes(type);
}

/**
 * Validate and sanitize folder name
 */
export function isValidFolderName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  return /^[A-Za-z0-9\s_-]+$/.test(name) && name.length > 0 && name.length <= 50;
}

/**
 * Validate JSON string before parsing
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    return parsed;
  } catch {
    return fallback;
  }
}**Priority:** 🔴 Critical - Should be done before production

---

### 3. **Input Sanitization & Validation**
**Current State:** Basic email validation exists, but other inputs may not be sanitized
**Risk:** Medium - XSS, injection attacks through user input

**Solution (Frontend Only):**
- Enhance input validation utilities
- Sanitize all user inputs (search queries, folder names, rule conditions)
- Validate and sanitize email content display
- Limit input lengths to prevent DoS

**Files to Update:**
- `utils/validation.ts` - Add more validation and sanitization functions
- `components/mail/ComposeView.tsx` - Validate and sanitize all inputs
- `app/create-rule.tsx` - Validate rule conditions
- `components/mail/inbox/InboxSearchView.tsx` - Sanitize search queries

**Implementation:**
Add to `utils/validation.ts`:ript
/**
 * Sanitize search query to prevent XSS
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 200); // Limit length
}

/**
 * Sanitize folder name
 */
export function sanitizeFolderName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .replace(/[<>]/g, '')
    .replace(/[^\w\s-]/g, '') // Only allow alphanumeric, spaces, dashes, underscores
    .slice(0, 50);
}

/**
 * Sanitize email subject for display
 */
export function sanitizeEmailSubject(subject: string): string {
  if (!subject || typeof subject !== 'string') return '';
  return subject
    .replace(/[<>]/g, '')
    .slice(0, 500); // Limit length
}

/**
 * Validate rule condition value
 */
export function isValidRuleConditionValue(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  // Prevent script injection
  if (/<script|javascript:|on\w+=/gi.test(value)) return false;
  // Limit length
  if (value.length > 1000) return false;
  return true;
}**Priority:** 🔴 Critical - Should be done before production

---

## 🟡 High Priority Security Enhancements (Frontend Only)

### 4. **HTTPS Enforcement (Client-Side)**
**Current State:** No explicit HTTPS enforcement for production
**Risk:** Medium - Man-in-the-middle attacks, data interception

**Solution (Frontend Only):**
- Validate that API URLs use HTTPS in production
- Reject HTTP connections in production (except localhost for development)
- Add URL validation before making requests

**Files to Update:**
- `config/env.ts` - Add HTTPS validation
- `contexts/GmailSyncContext.tsx` - Validate URLs are HTTPS in production
- `lib/trpc.ts` - Ensure HTTPS for tRPC calls

**Implementation:**
Add to `config/env.ts`:script
/**
 * Validate and enforce HTTPS in production
 */
export function validateSecureUrl(url: string): string {
  if (AppConfig.env === 'production') {
    if (!url.startsWith('https://')) {
      throw new Error('HTTPS required in production environment');
    }
    // Reject localhost in production
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      throw new Error('Localhost URLs not allowed in production');
    }
  }
  return url;
}**Priority:** 🟡 High - Should be done before production

---

### 5. **Content Security Policy (Web Platform)**
**Current State:** ✅ Implemented - CSP meta tag and HTTP headers configured
**Risk:** Medium - XSS attacks, unauthorized script execution

**Solution (Frontend Only):**
- ✅ CSP meta tag added to web HTML via `app/_layout.tsx`
- ✅ HTTP headers configured for hosting providers (Vercel, Netlify, Render)
- ✅ Environment-aware CSP that adjusts based on `AppConfig.env`
- ✅ Includes `frame-ancestors` directive via HTTP headers (not supported in meta tags)

**Files Created/Updated:**
- `app/_layout.tsx` - Applies CSP meta tag for web platform
- `utils/csp.ts` - CSP utility with environment-aware policy generation
- `vercel.json` - Vercel headers configuration (includes full CSP with frame-ancestors)
- `netlify.toml` - Netlify headers configuration (includes full CSP with frame-ancestors)
- `public/_headers` - Headers file for Render/Cloudflare Pages (includes full CSP with frame-ancestors)
- `docs/DEPLOYMENT_CSP.md` - Complete deployment guide for CSP configuration

**Implementation Notes:**
- ✅ Uses `AppConfig.env` and `AppConfig.api.baseUrl` to determine which domains to allow
- ✅ For **development**: Allows `localhost`, `127.0.0.1`, and Rork domains (`https://rork.com`)
- ✅ For **production**: Only allows production domains (from `AppConfig.api.baseUrl`) and Google APIs
- ✅ Allows `'unsafe-inline'` and `'unsafe-eval'` for React/Expo (unavoidable for now)
- ✅ Allows Google APIs (`https://*.googleapis.com`, `https://*.google.com`) for OAuth and Gmail integration
- ✅ Uses `AppConfig.redirectBaseUrl` to determine allowed connect-src domains
- ✅ `frame-ancestors 'none'` configured via HTTP headers (prevents clickjacking)

**Deployment:**
- **Vercel**: Automatically reads `vercel.json` on deployment
- **Netlify**: Automatically reads `netlify.toml` on deployment
- **Render/Cloudflare**: Uses `public/_headers` file (ensure it's copied to build output)
- See `docs/DEPLOYMENT_CSP.md` for detailed deployment instructions

**Priority:** 🟡 High - ✅ Completed

---

### 6. **Rate Limiting (Client-Side)**
**Current State:** ✅ Implemented - Rate limiting with exponential backoff
**Risk:** Low-Medium - API abuse, excessive retry attempts

**Solution (Frontend Only):**
- ✅ Client-side rate limiting for API calls
- ✅ Exponential backoff for failed requests
- ✅ Retry logic with configurable attempts per time window
- ✅ Automatic cleanup of old rate limit entries

**Files Created/Updated:**
- `utils/rateLimiter.ts` - Comprehensive rate limiter utility with:
  - Rate limiting per endpoint/key
  - Exponential backoff calculator
  - Retry utility with configurable retry logic
  - Automatic memory cleanup
- `contexts/GmailSyncContext.tsx` - Integrated rate limiting and retry logic into `makeGmailRequest`

**Implementation Details:**
- **Rate Limiting**: 100 requests per minute (configurable per endpoint)
- **Retry Logic**: Up to 3 retries with exponential backoff (1s, 2s, 4s delays)
- **Smart Retry**: Only retries on network errors, 429 (rate limit), and 5xx server errors
- **No Retry**: Auth errors (401/403) and client errors (4xx) are not retried
- **Automatic Cleanup**: Old rate limit entries are cleaned up every 5 minutes

**Priority:** 🟡 High - ✅ Completed

---

## 🟢 Medium Priority Security Enhancements (Frontend Only)

### 7. **Token Expiration Handling**
**Current State:** ✅ Implemented - Enhanced token expiration handling
**Risk:** Low-Medium - Token theft, replay attacks

**Solution (Frontend Only):**
- ✅ Token expiration warnings (5 min and 1 min before expiration)
- ✅ Automatic logout on multiple refresh failures (3 consecutive failures)
- ✅ Token validation before use (structure and format checks)
- ✅ Periodic expiration checks (every 30 seconds)

**Files Updated:**
- `contexts/AuthContext.tsx` - Enhanced token refresh and validation logic

**Implementation Details:**
- **Expiration Warnings**: Warns at 5 minutes and 1 minute before expiration
- **Refresh Failure Tracking**: Logs out after 3 consecutive refresh failures
- **Token Validation**: Validates token structure, format, and expiration before use
- **Periodic Checks**: Checks token expiration every 30 seconds

**Priority:** 🟢 Medium - ✅ Completed

---

### 8. **Error Message Sanitization**
**Current State:** ✅ Implemented - Error messages are sanitized before display
**Risk:** Low - Information disclosure

**Solution (Frontend Only):**
- ✅ Sanitize error messages before displaying to users
- ✅ Show generic messages to users, log detailed errors
- ✅ Remove API endpoints, tokens, file paths, and internal structure

**Files Updated:**
- `utils/errorHandling.ts` - Added `sanitizeErrorMessage()` function and integrated into `formatErrorMessage()`

**Implementation Details:**
- **Removes**: API endpoints, tokens, secrets, file paths, stack traces, internal IDs
- **Limits**: Message length to 200 characters
- **Generic Messages**: Uses user-friendly messages based on error type
- **Security**: Prevents exposure of sensitive information in error messages

**Priority:** 🟢 Medium - ✅ Completed

---

### 9. **Session Timeout (Client-Side)**
**Current State:** ✅ Implemented - Session timeout based on inactivity
**Risk:** Low - Session hijacking

**Solution (Frontend Only):**
- ✅ Session timeout based on inactivity (30 minutes)
- ✅ Track last activity (mouse, keyboard, touch, scroll events)
- ✅ Automatic logout after extended inactivity

**Files Updated:**
- `contexts/AuthContext.tsx` - Added session timeout logic with activity tracking

**Implementation Details:**
- **Timeout Duration**: 30 minutes of inactivity
- **Activity Tracking**: Tracks mouse, keyboard, touch, and scroll events
- **Automatic Logout**: Logs out user after timeout with clear message
- **Periodic Checks**: Checks for timeout every minute

**Priority:** 🟢 Medium - ✅ Completed

---

## ⚠️ Note on Client Secret

**Current Issue:** Client secret is exposed in frontend code (web OAuth only)

**Frontend-Only Limitation:** This cannot be fully fixed without backend changes. The current implementation includes a note that this is a temporary solution.

**Frontend Mitigation (Partial):**
- Ensure client secret is only in environment variables (not hardcoded) ✅ Already done
- Use `EXPO_PUBLIC_` prefix only for truly public values
- Document that this should be moved to backend ✅ Already documented
- Consider using a different OAuth flow that doesn't require client secret (if Google supports it)

**Recommendation:** This should be addressed by the backend team when implementing the OAuth proxy endpoint.

---

## 📋 Security Checklist (Frontend Only)

### Critical (Before Production):
- [x] Migrate token storage to SecureStore (#1)
- [x] Validate all deep link parameters (#2)
- [x] Sanitize all user inputs (#3)
- [x] Enforce HTTPS in production (#4)

### High Priority:
- [x] Configure Content Security Policy for web (#5)
- [x] Implement client-side rate limiting (#6)

### Medium Priority:
- [x] Enhance token expiration handling (#7)
- [x] Sanitize error messages (#8)
- [x] Add session timeout (#9)

---

## 🎯 Recommended Implementation Order

### Before Refactoring:
1. **Secure token storage** (#1) - High impact, low risk
2. **Deep link validation** (#2) - Prevents injection attacks
3. **Input sanitization** (#3) - Prevents XSS

### During Refactoring:
4. **HTTPS enforcement** (#4) - Easy to add during refactor
5. **Rate limiting** (#6) - Can be added to API wrapper

### After Refactoring:
6. **CSP configuration** (#5) ⏭️ NEXT - Web-specific, environment-aware (local dev, Rork, production)
7. **Token expiration** (#7) - Enhance existing logic
8. **Session timeout** (#9) - Add to auth context
9. **Error sanitization** (#8) - Enhance error handling

---

## 📝 Progress Summary

### ✅ Completed Today:
1. **Secure token storage** (#1) - Migrated to SecureStore
2. **Deep link validation** (#2) - Added validation utilities and applied to all deep links
3. **Input sanitization** (#3) - Enhanced validation utilities
4. **HTTPS enforcement** (#4) - Added production validation for all API calls
5. **Toast crash fix** - Fixed Android crash in EnhancedToast component (gesture handler conflict)

### ✅ Completed Today:
6. **Content Security Policy** (#5) - Environment-aware CSP for web platform
   - Created `utils/csp.ts` with dynamic CSP generation
   - Added CSP meta tag to `app/_layout.tsx` for web platform
   - Supports: local development (localhost), Rork (rork.com), and production domains
   - Uses `AppConfig.env` and `AppConfig.api.baseUrl` for dynamic configuration
   - Allows Google APIs for OAuth and Gmail integration
   - **Deployment configurations added:**
     - `vercel.json` - Vercel headers with full CSP including `frame-ancestors`
     - `netlify.toml` - Netlify headers with full CSP including `frame-ancestors`
     - `public/_headers` - Headers file for Render/Cloudflare Pages
     - `docs/DEPLOYMENT_CSP.md` - Complete deployment guide

### ✅ Completed Today:
7. **Client-side rate limiting** (#6) - Rate limiting with exponential backoff
   - Created `utils/rateLimiter.ts` with comprehensive rate limiting and retry utilities
   - Integrated into `GmailSyncContext` with smart retry logic
   - Prevents API abuse and handles rate limit errors gracefully
   - Automatic cleanup to prevent memory leaks

### ✅ Completed Today:
8. **Token expiration handling** (#7) - Enhanced token expiration handling
   - Token expiration warnings at 5 min and 1 min before expiration
   - Automatic logout after 3 consecutive refresh failures
   - Token validation before use
   - Periodic expiration checks every 30 seconds

9. **Error message sanitization** (#8) - Error messages are sanitized
   - Removes API endpoints, tokens, file paths, and internal structure
   - Shows generic user-friendly messages
   - Prevents information disclosure

10. **Session timeout** (#9) - Session timeout based on inactivity
    - 30-minute inactivity timeout
    - Tracks user activity (mouse, keyboard, touch, scroll)
    - Automatic logout with clear message

---

## 📱 App Store Submission Requirements

**Note:** For submitting to Google Play Store and Apple App Store, see `docs/APP_STORE_SUBMISSION.md` for additional requirements including:
- Privacy Policy (REQUIRED)
- Data collection disclosure
- Privacy labels (iOS) / Data Safety section (Android)
- Network security configuration
- ProGuard/R8 rules (Android)
- Additional security recommendations

---

## 🎉 All Security Enhancements Complete!

All frontend-only security enhancements have been successfully implemented:
- ✅ **Critical**: Secure token storage, deep link validation, input sanitization, HTTPS enforcement
- ✅ **High Priority**: Content Security Policy, client-side rate limiting
- ✅ **Medium Priority**: Token expiration handling, error message sanitization, session timeout

The application is now ready for production with comprehensive frontend security measures in place.

---

**Note:** All recommendations in this document are frontend-only and can be implemented without backend changes.