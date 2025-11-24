# Codebase Optimization Analysis Report

## Overview
This report identifies optimization opportunities for refactoring, component extraction, style consolidation, and removing duplicate/old implementations.

---

## Phase 1: Extract Inline Styles to Separate Files

### 1.1 Login Screen Styles
**File**: `app/login.tsx`
- **Status**: Has inline `StyleSheet.create` (lines 177-317)
- **Action**: Create `styles/app/login.ts` with `createLoginStyles` function
- **Priority**: Medium

### 1.2 History Screen Styles
**File**: `app/history.tsx`
- **Status**: Has inline `createHistoryStyles` function (lines 273-445)
- **Action**: Move to `styles/app/history.ts`
- **Priority**: Medium

### 1.3 Not Found Screen Styles
**File**: `app/+not-found.tsx`
- **Status**: Has inline `createNotFoundStyles` function (lines 29-71)
- **Action**: Move to `styles/app/not-found.ts`
- **Priority**: Low

### 1.4 Affected Emails Screen Styles
**File**: `app/affected-emails.tsx`
- **Status**: Has inline `createStyles` function (lines 102-182)
- **Action**: Move to `styles/app/affected-emails.ts` with `createAffectedEmailsStyles` function
- **Priority**: Medium

### 1.5 Auth Callback Screen Styles
**File**: `app/auth/callback.tsx`
- **Status**: Has inline `StyleSheet.create` (lines 24-36)
- **Action**: Move to `styles/app/auth/callback.ts` with `createAuthCallbackStyles` function
- **Priority**: Low

### 1.6 Settings Screen Styles
**File**: `app/(tabs)/settings.tsx`
- **Status**: Has inline `StyleSheet.create` (lines 287-604)
- **Action**: Move to `styles/app/settings.ts` with `createSettingsStyles` function
- **Priority**: High (large file)

### 1.7 Remove Duplicate Styles in Senders
**File**: `app/senders.tsx`
- **Status**: Has duplicate `StyleSheet.create` (lines 232-312) while already using `createSenderStyles` from `styles/app/senders.ts`
- **Action**: Remove the duplicate inline styles
- **Priority**: High (code duplication)

---

## Phase 2: Extract Reusable Components

### 2.1 Extract Rule Card Component
**File**: `app/rules.tsx`
- **Location**: Lines 193-272 (enabled rules) and 280-327 (disabled rules)
- **Issue**: Rule card rendering is duplicated with only minor differences (disabled state)
- **Action**: Create `components/rules/RuleCard.tsx`
- **Props**: `rule`, `onToggle`, `onTest`, `onEdit`, `getConditionText`, `getActionIcon`, `colors`
- **Priority**: High (code duplication)

### 2.2 Extract AI Message Bubble Component
**File**: `app/(tabs)/ai.tsx`
- **Location**: Lines 119-158 (message rendering logic)
- **Issue**: Complex message rendering with multiple part types could be extracted
- **Action**: Create `components/ai/MessageBubble.tsx`
- **Props**: `message`, `colors`, `styles`
- **Priority**: Medium

### 2.3 Extract History Item Card Component
**File**: `app/history.tsx`
- **Location**: `renderHistoryItem` function (lines 102-124)
- **Issue**: History item rendering is complex enough to warrant extraction
- **Action**: Create `components/history/HistoryItemCard.tsx`
- **Props**: `entry`, `getActionColor`, `formatDate`, `colors`
- **Priority**: Medium

### 2.4 Extract Feature Request Modal Component
**File**: `app/(tabs)/settings.tsx`
- **Location**: Feature request modal JSX (approximately lines 142-280)
- **Issue**: Large modal component embedded in settings screen
- **Action**: Create `components/settings/FeatureRequestModal.tsx`
- **Props**: `visible`, `onClose`, `onSubmit`, `colors`
- **Priority**: Medium

### 2.5 Extract AI Suggestions Component
**File**: `app/(tabs)/ai.tsx`
- **Location**: Lines 86-110 (suggestions rendering)
- **Issue**: Suggestions list could be extracted
- **Action**: Create `components/ai/SuggestionsList.tsx`
- **Props**: `suggestions`, `onSelect`, `colors`
- **Priority**: Low

---

## Phase 3: Consolidate Duplicate Utilities

### 3.1 Consolidate Date Formatting Functions
**Files**:
- `app/history.tsx` - Has custom `formatDate` function (lines 61-84)
- `app/sender-emails.tsx` - Has custom `formatDate` function (lines 94-106)
- `utils/dateFormat.ts` - Has `formatDate` function for general use
- `app/notes.tsx` - Uses formatDate from hook (different purpose)

**Issue**: Multiple date formatting functions with different logic:
- `history.tsx`: Formats relative time (e.g., "5m ago", "Yesterday", "2w ago")
- `sender-emails.tsx`: Formats relative time (similar but different logic)
- `utils/dateFormat.ts`: Formats absolute time (e.g., "3:45 PM", "Mon", "Nov 15")

**Action**:
1. Create `utils/relativeDateFormat.ts` with `formatRelativeDate` function
2. Update `history.tsx` and `sender-emails.tsx` to use the consolidated function
3. Consider adding a unified date formatting utility that handles both cases

**Priority**: High (duplicate logic)

### 3.2 Verify categorizeEmail Usage
**Files**:
- `app/(tabs)/folders.tsx` - Uses `categorizeEmail` from `@/utils/emailCategories`
- `app/folder-details.tsx` - Uses `categorizeEmail` from `@/utils/emailCategories`

**Status**: ✅ Already consolidated in `utils/emailCategories.ts`

---

## Phase 4: Extract Modal Components

### 4.1 Extract Feature Request Modal (Already listed in 2.4)
**Priority**: Medium

---

## Phase 5: Component Usage & Cleanup

### 5.1 Check for Unused Extracted Components
**Status**: All extracted components appear to be in use

### 5.2 Remove Orphaned Code
**File**: `app/rules.tsx`
- **Status**: ✅ Fixed in previous session

---

## Phase 6: Hook Extraction Opportunities

### 6.1 Extract History Screen Logic
**File**: `app/history.tsx`
- **Potential**: `formatDate`, `getActionColor`, `renderHistoryItem` logic
- **Action**: Could create `hooks/useHistoryDisplay.ts`
- **Priority**: Low

### 6.2 Extract Settings Screen Logic
**File**: `app/(tabs)/settings.tsx`
- **Potential**: Feature request modal state and handlers
- **Action**: Could create `hooks/useFeatureRequest.ts`
- **Priority**: Low

---

## Summary by Priority

### High Priority
1. ✅ Remove duplicate styles in `app/senders.tsx`
2. ✅ Extract `RuleCard` component from `app/rules.tsx`
3. ✅ Consolidate date formatting functions

### Medium Priority
1. Extract styles from `app/(tabs)/settings.tsx`
2. Extract styles from `app/login.tsx`
3. Extract styles from `app/history.tsx`
4. Extract `HistoryItemCard` component
5. Extract `FeatureRequestModal` component
6. Extract `MessageBubble` component for AI screen

### Low Priority
1. Extract styles from `app/+not-found.tsx`
2. Extract styles from `app/auth/callback.tsx`
3. Extract styles from `app/affected-emails.tsx`
4. Extract `SuggestionsList` component
5. Extract hooks for screen logic

---

## Files to Create

### Style Files
- `styles/app/login.ts`
- `styles/app/history.ts`
- `styles/app/not-found.ts`
- `styles/app/affected-emails.ts`
- `styles/app/auth/callback.ts`
- `styles/app/settings.ts`

### Component Files
- `components/rules/RuleCard.tsx`
- `components/ai/MessageBubble.tsx`
- `components/ai/SuggestionsList.tsx` (optional)
- `components/history/HistoryItemCard.tsx`
- `components/settings/FeatureRequestModal.tsx`

### Utility Files
- `utils/relativeDateFormat.ts` (or enhance `utils/dateFormat.ts`)

---

## Files to Update

1. `app/login.tsx` - Remove inline styles, import from styles file
2. `app/history.tsx` - Remove inline styles, import from styles file, extract component
3. `app/+not-found.tsx` - Remove inline styles, import from styles file
4. `app/affected-emails.tsx` - Remove inline styles, import from styles file
5. `app/auth/callback.tsx` - Remove inline styles, import from styles file
6. `app/(tabs)/settings.tsx` - Remove inline styles, import from styles file, extract modal
7. `app/senders.tsx` - Remove duplicate StyleSheet.create
8. `app/rules.tsx` - Extract RuleCard component
9. `app/(tabs)/ai.tsx` - Extract MessageBubble component (optional)
10. `app/sender-emails.tsx` - Use consolidated date formatting
11. `utils/dateFormat.ts` - Add relative date formatting function

---

## Estimated Impact

- **Style Files to Extract**: 6 files
- **Components to Extract**: 4-5 components
- **Utility Consolidations**: 1 (date formatting)
- **Duplicate Code Removals**: 1 (senders.tsx styles)
- **Total Files to Create**: ~11-12 files
- **Total Files to Update**: ~11 files

---

## Notes

1. The `app/rules.tsx` has significant duplication in rule card rendering that should be addressed first.
2. Date formatting consolidation will improve consistency across the app.
3. Settings screen styles extraction is high priority due to large file size.
4. All style extractions follow the established pattern of `styles/app/*.ts` structure.

