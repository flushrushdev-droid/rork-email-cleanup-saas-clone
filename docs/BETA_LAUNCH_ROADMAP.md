# Beta Launch Roadmap - Friends & Family Testing

## Overview
This document outlines the steps needed to move from the current development state to a beta version ready for friends and family testing.

**Goal:** Get the app into the hands of real users for feedback, while maintaining a manageable scope and avoiding production-level complexity.

**Timeline Estimate:** 2-4 weeks depending on backend complexity

---

## 🎯 Current State Assessment

### ✅ What's Already Done
- **Frontend Security**: CSP, rate limiting, token handling, error sanitization, Sentry integration
- **Gmail API Integration**: Direct API calls from frontend (no backend needed for basic email sync)
- **OAuth Authentication**: Google OAuth flow implemented
- **Error Handling**: Comprehensive error handling with retry logic
- **UI/UX**: Complete interface with all major features
- **Type Safety**: Strong TypeScript implementation
- **Code Quality**: Refactored, maintainable codebase

### ⚠️ What Needs Work
- **Gmail Operations "Brain"**: Actual email operations (delete, send, archive, star, etc.) - **CRITICAL GAP**
- **Backend Infrastructure**: For features requiring persistence and cross-device sync (rules, custom folders, user preferences)
- **Build & Distribution**: Android/iOS build setup
- **User Onboarding**: First-time user experience
- **Data Persistence**: Rules, folders, and user settings
- **Feedback Mechanism**: Way for users to report issues
- **Legal**: Terms of Service

---

## 📋 Phase 0: Gmail Operations "Brain" (3-5 days) - **CRITICAL - DO FIRST**

**Problem:** We have UI and read operations, but actions like delete, send, archive don't actually modify Gmail yet.

### What to Build:
1. **Delete/Trash Operations**
   - Trash message (move to trash)
   - Permanently delete message
   - Batch delete

2. **Send Email**
   - Send new email
   - Create/update/delete drafts
   - Send draft

3. **Star/Unstar**
   - Add/remove star label

4. **Mark as Unread**
   - Mark message as unread

5. **Label Operations**
   - Apply/remove labels
   - Move to folder

6. **Bulk Operations**
   - Batch modify (archive, delete, label multiple emails)

### Implementation Approach:
- **Frontend First** (for beta): Direct Gmail API calls from frontend
- **Backend Later** (for production): Move to backend for security, queue, audit logging

### Files to Update:
- `contexts/GmailSyncContext.tsx` - Add mutation operations
- `hooks/useEmailActions.ts` - Wire up real operations
- `utils/mimeMessage.ts` - Create MIME message utility (new file)

### Testing:
- Test with real Gmail account
- Verify operations actually modify Gmail
- Test error handling (network errors, API errors)

**See:** `docs/GMAIL_OPERATIONS_BRAIN.md` for detailed implementation plan

---

## 📋 Phase 1: Essential Backend (1-2 weeks) - **REQUIRED**

**Note:** Backend is **mandatory** for cross-device sync. Rules, custom folders, and user preferences must be stored server-side to sync across devices.

### Minimal Backend (Recommended for Beta)
**Goal:** Only build what's absolutely necessary for core functionality and cross-device sync

#### What to Build:
1. **User Authentication Backend**
   - Store user accounts (email, OAuth tokens)
   - Token refresh endpoint
   - User session management
   - **Tech Stack**: Node.js/Express or Hono (you already have Hono in dependencies)

2. **Data Persistence (Required for Cross-Device Sync)**
   - Rules storage (create, read, update, delete) - **MUST sync across devices**
   - Custom folders storage - **MUST sync across devices**
   - User preferences (theme, settings) - **MUST sync across devices**
   - **Database**: PostgreSQL (recommended for scalability and sync)
   - **ORM**: Prisma or Drizzle (type-safe)

3. **API Endpoints**
   ```
   POST   /api/auth/refresh-token
   GET    /api/user/profile
   GET    /api/rules              # Fetch user's rules (synced across devices)
   POST   /api/rules              # Create rule (syncs to all devices)
   PUT    /api/rules/:id          # Update rule (syncs to all devices)
   DELETE /api/rules/:id          # Delete rule (syncs to all devices)
   GET    /api/folders             # Fetch user's custom folders (synced)
   POST   /api/folders             # Create folder (syncs to all devices)
   PUT    /api/folders/:id         # Update folder (syncs to all devices)
   DELETE /api/folders/:id         # Delete folder (syncs to all devices)
   PUT    /api/user/preferences   # Update preferences (syncs to all devices)
   ```

#### What NOT to Build (Yet):
- Email processing backend (use Gmail API directly from frontend)
- Complex analytics
- Multi-user features
- Payment processing
- Advanced AI features

#### Quick Start Options:
- **Supabase** (Recommended): Backend-as-a-Service (PostgreSQL + Auth + Storage)
  - Fastest setup (1-2 days)
  - Built-in real-time sync capabilities
  - Free tier sufficient for beta
  - TypeScript SDK available
  
- **Firebase**: Google's BaaS (Firestore + Auth)
  - Good real-time sync
  - Free tier available
  
- **Self-hosted**: Hono + PostgreSQL on Railway/Render
  - Full control
  - More setup time (1-2 weeks)

---

## 📋 Phase 2: Build & Distribution Setup (3-5 days)

### Android Build

#### 1. Configure App Identity
- Update `app.json` with:
  - App name, bundle ID, version
  - App icon and splash screen
  - Permissions

#### 2. Generate Signing Key
```bash
# Generate keystore
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Store securely (never commit to git)
```

#### 3. Configure Build
- Update `android/app/build.gradle` with signing config
- Set version code and version name
- Configure ProGuard (already done)

#### 4. Build APK/AAB
```bash
# Development build
eas build --platform android --profile development

# Production build (for Play Store later)
eas build --platform android --profile production
```

#### 5. Distribution Options
- **Direct APK**: Share APK file directly (easiest for beta)
- **Google Play Internal Testing**: Upload to Play Console (requires $25 one-time fee)
- **Firebase App Distribution**: Free, easy beta distribution

### iOS Build (If Applicable)

#### Requirements:
- Apple Developer Account ($99/year)
- Mac computer for building

#### Steps:
1. Configure in Xcode
2. Build with EAS:
   ```bash
   eas build --platform ios --profile development
   ```
3. Distribute via TestFlight (included with Apple Developer)

**Recommendation**: Start with Android only for beta, add iOS later if needed.

---

## 📋 Phase 3: User Onboarding & Experience (2-3 days)

### 1. First Launch Experience
- **Welcome Screen**: Brief intro to the app
- **Permissions**: Request necessary permissions with explanations
- **OAuth Setup**: Clear instructions for Google sign-in
- **Demo Mode Toggle**: Allow users to try without connecting Gmail

### 2. Onboarding Flow
```
Welcome → Permissions → Sign In → First Sync → Quick Tutorial → Ready
```

### 3. Help & Documentation
- In-app help section
- FAQ screen
- Contact support option
- Link to privacy policy (already created)

### 4. Error Messages
- User-friendly error messages (already implemented)
- Clear instructions for common issues
- "Contact Support" option in error states

---

## 📋 Phase 4: Feedback & Monitoring (1-2 days)

### 1. In-App Feedback
- **Simple Feedback Form**: 
  - Rating (1-5 stars)
  - Text feedback
  - Screenshot attachment (optional)
  - Submit to backend or email

### 2. Crash Reporting
- **Sentry**: Already integrated ✅
- Monitor crashes and errors
- Set up alerts for critical issues

### 3. Analytics (Optional)
- **Expo Analytics**: Built-in, privacy-focused
- Track:
  - Feature usage
  - Error rates
  - User retention
  - Screen navigation

### 4. User Communication
- **Email List**: Collect emails for updates
- **Beta Testers Group**: Discord/Slack for quick feedback
- **Update Notifications**: In-app update prompts

---

## 📋 Phase 5: Legal & Compliance (1 day)

### 1. Terms of Service
- Create ToS document (similar to Privacy Policy)
- Link in app settings
- Cover:
  - Service usage
  - User responsibilities
  - Limitation of liability
  - Beta disclaimer

### 2. Beta Disclaimer
- Clear messaging that this is beta software
- May have bugs
- Data may be reset
- Feedback is appreciated

### 3. Data Handling
- Privacy Policy: ✅ Already created
- GDPR compliance (if EU users)
- Data retention policy

---

## 📋 Phase 6: Testing Checklist (2-3 days)

### Pre-Beta Testing
- [ ] Test with real Gmail account
- [ ] Test OAuth flow end-to-end
- [ ] Test email sync with large inbox (1000+ emails)
- [ ] **Test cross-device sync:**
  - [ ] Create rule on Device A, verify appears on Device B
  - [ ] Update rule on Device A, verify update syncs to Device B
  - [ ] Delete rule on Device A, verify deletion syncs to Device B
  - [ ] Create custom folder on Device A, verify appears on Device B
  - [ ] Update preferences on Device A, verify syncs to Device B
  - [ ] Test sync with devices offline/online scenarios
  - [ ] Test conflict resolution (simultaneous edits)
- [ ] Test rules creation and execution
- [ ] Test custom folders
- [ ] Test offline functionality (with sync when back online)
- [ ] Test error scenarios (no internet, API errors)
- [ ] Test on multiple Android devices (minimum 2 for sync testing)
- [ ] Test app updates (install new version over old)
- [ ] Test data persistence (close app, reopen)
- [ ] Performance testing (large email lists)
- [ ] Memory leak testing (use app for extended period)

### Beta Tester Checklist
Provide testers with:
- [ ] Installation instructions
- [ ] What to test (specific features)
- [ ] How to report bugs
- [ ] Expected behavior vs bugs
- [ ] Known issues list

---

## 🚀 Recommended Launch Sequence

### Week 1: Gmail Operations + Backend Setup
1. **Implement Gmail operations** (delete, send, star, etc.) - **CRITICAL**
2. Test with real Gmail account
3. Choose backend solution (Supabase recommended for speed)
4. Set up database schema
5. Create API endpoints for sync (rules, folders, preferences)

### Week 2: Build & Polish
1. Configure Android build
2. Create signing key
3. Build first APK
4. Set up feedback mechanism
5. Create onboarding flow
6. Write Terms of Service

### Week 3: Testing & Launch
1. Internal testing (yourself)
2. Fix critical bugs
3. Build beta APK
4. Distribute to 3-5 close friends/family
5. Collect initial feedback
6. Iterate quickly

### Week 4: Expand & Iterate
1. Add more beta testers (10-20 people)
2. Monitor Sentry for crashes
3. Collect and prioritize feedback
4. Release updates weekly
5. Document common issues

---

## 🛠️ Technical Decisions

### Backend Recommendation: Supabase
**Why:**
- Fastest to set up (1-2 days vs 1-2 weeks)
- PostgreSQL database (scalable)
- Built-in authentication (can use or bypass)
- Row Level Security for data isolation
- **Built-in real-time sync** - Perfect for cross-device synchronization
- Free tier sufficient for beta
- TypeScript SDK available
- Automatic conflict resolution for sync

**Setup:**
```bash
# 1. Create Supabase project
# 2. Install Supabase client
npm install @supabase/supabase-js

# 3. Create tables with updated_at for sync
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  conditions JSONB,
  actions JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE custom_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  rule TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  theme TEXT,
  settings JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

# 4. Set up Row Level Security (for cross-device sync, user_id must match)
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own rules"
  ON rules FOR ALL
  USING (user_id = current_setting('app.user_id', true));

ALTER TABLE custom_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own folders"
  ON custom_folders FOR ALL
  USING (user_id = current_setting('app.user_id', true));

# 5. Enable real-time subscriptions for sync
ALTER PUBLICATION supabase_realtime ADD TABLE rules;
ALTER PUBLICATION supabase_realtime ADD TABLE custom_folders;
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;
```

**Cross-Device Sync Implementation:**
```typescript
// In frontend, subscribe to changes
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to rules changes
supabase
  .channel('rules-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'rules', filter: `user_id=eq.${userId}` },
    (payload) => {
      // Update local state when rules change on another device
      handleRuleChange(payload);
    }
  )
  .subscribe();

// Similar subscriptions for folders and preferences
```

### Alternative: Self-Hosted (Hono + PostgreSQL)
**Why:**
- Full control
- No vendor lock-in
- You already have Hono in dependencies

**Setup:**
- Deploy to Railway/Render (free tier available)
- Use Prisma for database management
- More setup time but more control

---

## 📊 Success Metrics

### Beta Goals
- **Stability**: < 5% crash rate
- **User Satisfaction**: Average 4+ star rating
- **Feature Usage**: At least 50% of users try core features
- **Feedback Quality**: 10+ detailed feedback reports

### What to Measure
- Daily active users
- Feature adoption rates
- Error rates (via Sentry)
- User retention (day 1, day 7)
- Feedback sentiment

---

## 🎯 Post-Beta: Production Readiness

After successful beta, consider:
1. **App Store Submission**: Google Play & Apple App Store
2. **Payment Integration**: If planning monetization
3. **Advanced Features**: AI suggestions, advanced analytics
4. **Scaling**: Handle more users, optimize performance
5. **Marketing**: Website, landing page, app store listings

---

## 📝 Quick Start Checklist

### Minimum Viable Beta (Can launch in 2-3 weeks)
- [ ] **Gmail operations working** - Delete, send, archive, star actually modify Gmail - **CRITICAL**
- [ ] **Backend with rules & folders storage (Supabase)** - **REQUIRED for cross-device sync**
- [ ] **Cross-device sync working** - Test rules/folders sync between devices
- [ ] Android APK build working
- [ ] Basic onboarding (welcome + sign in)
- [ ] Feedback form in app
- [ ] Terms of Service
- [ ] Test with 1-2 real Gmail accounts (verify operations work)
- [ ] Test sync across 2+ devices
- [ ] Fix critical bugs

### Enhanced Beta (2-3 weeks)
- [ ] All of above, plus:
- [ ] Polished onboarding flow
- [ ] Help documentation
- [ ] Analytics integration
- [ ] TestFlight/iOS build (if applicable)
- [ ] Beta tester communication channel
- [ ] Update mechanism

---

## 💡 Tips for Beta Success

1. **Start Small**: 5-10 beta testers initially
2. **Communicate Clearly**: Set expectations about beta status
3. **Respond Quickly**: Fix bugs and respond to feedback within 24-48 hours
4. **Iterate Fast**: Release updates weekly during beta
5. **Document Everything**: Keep track of issues and feedback
6. **Be Patient**: Beta testing will reveal unexpected issues
7. **Focus on Core**: Don't add new features during beta, focus on stability

---

**Last Updated:** 2024-12-30

