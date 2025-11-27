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

### 5. **Content Security Policy (Web Platform)** ⏭️ NEXT TASK
**Current State:** No CSP headers configured
**Risk:** Medium - XSS attacks, unauthorized script execution

**Solution (Frontend Only):**
- Add CSP meta tag to web HTML
- Configure CSP for React Native Web
- Restrict inline scripts and external resources
- **Important:** Must account for:
  - **Local development** (`localhost:8081`) - allow localhost connections
  - **Rork development environment** (`https://rork.com`) - allow Rork domains
  - **Future production** (Vercel/Render/Supabase) - allow production domains dynamically

**Files to Update:**
- `app/_layout.tsx` - Add CSP meta tag for web with environment-aware configuration

**Implementation Notes:**
- Use `AppConfig.env` and `AppConfig.api.baseUrl` to determine which domains to allow
- For **development**: Allow `localhost`, `127.0.0.1`, and Rork domains (`https://rork.com`)
- For **production**: Only allow production domains (from `AppConfig.api.baseUrl`) and Google APIs
- Must allow `'unsafe-inline'` and `'unsafe-eval'` for React/Expo (unavoidable for now)
- Allow Google APIs (`https://*.googleapis.com`, `https://*.google.com`) for OAuth and Gmail integration
- Use `AppConfig.redirectBaseUrl` to determine allowed connect-src domains

**Example CSP for Development:**
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
style-src 'self' 'unsafe-inline'; 
img-src 'self' data: https:; 
font-src 'self' data:; 
connect-src 'self' http://localhost:8081 https://rork.com https://*.googleapis.com https://*.google.com;
```

**Example CSP for Production:**
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
style-src 'self' 'unsafe-inline'; 
img-src 'self' data: https:; 
font-src 'self' data:; 
connect-src 'self' https://your-app.vercel.app https://*.googleapis.com https://*.google.com;
```

**Priority:** 🟡 High - Should be done before production (web only)

---

### 6. **Rate Limiting (Client-Side)**
**Current State:** No client-side rate limiting
**Risk:** Low-Medium - API abuse, excessive retry attempts

**Solution (Frontend Only):**
- Implement client-side rate limiting for API calls
- Add exponential backoff for failed requests
- Limit retry attempts per time window

**Files to Update:**
- Create `utils/rateLimiter.ts` - New utility
- `contexts/GmailSyncContext.tsx` - Add rate limiting wrapper

**Implementation:**
Create `utils/rateLimiter.ts`:pt
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(time => now - time < config.windowMs);
    
    if (recentRequests.length >= config.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter();
**Priority:** 🟡 High - Nice to have

---

## 🟢 Medium Priority Security Enhancements (Frontend Only)

### 7. **Token Expiration Handling**
**Current State:** Token refresh exists but could be more robust
**Risk:** Low-Medium - Token theft, replay attacks

**Solution (Frontend Only):**
- Add token expiration warnings
- Implement automatic logout on multiple refresh failures
- Add token validation before use

**Files to Update:**
- `contexts/AuthContext.tsx` - Enhance token refresh and validation logic

**Priority:** 🟢 Medium - Nice to have

---

### 8. **Error Message Sanitization**
**Current State:** Error messages may expose sensitive information
**Risk:** Low - Information disclosure

**Solution (Frontend Only):**
- Sanitize error messages before displaying to users
- Show generic messages to users, log detailed errors
- Avoid exposing API endpoints, tokens, or internal structure

**Files to Update:**
- `utils/errorHandling.ts` - Sanitize error messages

**Priority:** 🟢 Medium - Nice to have

---

### 9. **Session Timeout (Client-Side)**
**Current State:** Basic session management exists
**Risk:** Low - Session hijacking

**Solution (Frontend Only):**
- Add session timeout based on inactivity
- Track last activity and logout after extended inactivity

**Files to Update:**
- `contexts/AuthContext.tsx` - Add session timeout logic

**Priority:** 🟢 Medium - Nice to have

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
- [ ] Configure Content Security Policy for web (#5) ⏭️ NEXT
- [ ] Implement client-side rate limiting (#6)

### Medium Priority:
- [ ] Enhance token expiration handling (#7)
- [ ] Sanitize error messages (#8)
- [ ] Add session timeout (#9)

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

### ⏭️ Next Session:
- **Content Security Policy** (#5) - Environment-aware CSP for web platform
  - Must support: local development (localhost), Rork (rork.com), and future production domains
  - Use `AppConfig.env` and `AppConfig.api.baseUrl` for dynamic configuration

---

**Note:** All recommendations in this document are frontend-only and can be implemented without backend changes.