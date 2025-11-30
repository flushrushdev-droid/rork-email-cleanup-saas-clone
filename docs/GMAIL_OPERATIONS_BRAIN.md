# Gmail Operations "Brain" - Implementation Plan

## Overview
This document outlines the **actual Gmail API operations** needed to make the app functional with real mailboxes. Currently, we have UI and read operations, but we're missing the write operations that actually modify Gmail.

**Critical Gap Identified:** We have the UI, but actions like delete, send, archive, etc. need to actually call Gmail API to modify the mailbox.

---

## ✅ What's Already Implemented

### Read Operations (Frontend - Direct Gmail API)
- ✅ **Read Emails**: `GET /messages` - Fetching inbox messages
- ✅ **Read Profile**: `GET /profile` - Getting user profile
- ✅ **Read Message Details**: `GET /messages/{id}` - Getting full message

### Write Operations (Frontend - Direct Gmail API)
- ✅ **Archive Email**: `POST /messages/{id}/modify` - Remove INBOX label
- ✅ **Mark as Read**: `POST /messages/{id}/modify` - Remove UNREAD label

---

## ❌ What's Missing (The "Brain")

### Critical Operations Needed:

1. **Delete/Trash Email**
   - `POST /messages/{id}/trash` - Move to trash
   - `POST /messages/{id}/untrash` - Restore from trash
   - `DELETE /messages/{id}` - Permanently delete

2. **Send Email**
   - `POST /messages/send` - Send email
   - `POST /messages` - Create draft
   - `PUT /messages/{id}` - Update draft
   - `DELETE /messages/{id}` - Delete draft

3. **Star/Unstar**
   - `POST /messages/{id}/modify` - Add/remove STARRED label

4. **Apply Labels**
   - `POST /messages/{id}/modify` - Add/remove labels
   - `POST /threads/{id}/modify` - Modify entire thread

5. **Move to Folder**
   - `POST /messages/{id}/modify` - Remove INBOX, add label (folder)

6. **Mark as Unread**
   - `POST /messages/{id}/modify` - Add UNREAD label

7. **Bulk Operations**
   - `POST /messages/batchModify` - Modify multiple messages at once
   - `POST /messages/batchDelete` - Delete multiple messages

8. **Rules Execution**
   - Apply rules automatically (archive, delete, label based on conditions)

---

## 🤔 Where Should This Live?

### Option A: Frontend (Direct Gmail API) - Current Approach

**Pros:**
- ✅ Faster to implement (no backend needed)
- ✅ Already have infrastructure (`makeGmailRequest`)
- ✅ Simpler architecture
- ✅ Works for beta testing

**Cons:**
- ❌ OAuth tokens exposed in frontend (security concern)
- ❌ Harder to batch operations efficiently
- ❌ Harder to retry failed operations
- ❌ No operation queue (if offline, operations fail)
- ❌ No audit logging
- ❌ Client-side rate limiting only (not centralized)
- ❌ Can't handle complex rules execution efficiently

**Implementation:**
```typescript
// In GmailSyncContext.tsx
const deleteMessageMutation = useMutation({
  mutationFn: async (messageId: string) => {
    return makeGmailRequest(`/messages/${messageId}/trash`, {
      method: 'POST',
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.MESSAGES });
  },
});

const sendMessageMutation = useMutation({
  mutationFn: async (message: { to: string; subject: string; body: string }) => {
    // Create MIME message
    const raw = createMimeMessage(message);
    return makeGmailRequest('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ raw }),
    });
  },
});
```

---

### Option B: Backend (Recommended for Production)

**Pros:**
- ✅ **More Secure**: OAuth tokens stored on server, not exposed to client
- ✅ **Better Rate Limiting**: Centralized, can handle Gmail's quotas better
- ✅ **Batch Operations**: Can efficiently batch multiple operations
- ✅ **Operation Queue**: Can queue operations if offline, retry later
- ✅ **Audit Logging**: Track all operations for debugging/security
- ✅ **Rules Engine**: Can execute rules server-side efficiently
- ✅ **Error Handling**: Better retry logic, error recovery
- ✅ **Scalability**: Can handle more users without hitting client limits

**Cons:**
- ❌ More complex (need backend infrastructure)
- ❌ Takes longer to implement (1-2 weeks vs 3-5 days)
- ❌ Requires backend hosting costs

**Implementation:**
```typescript
// Backend API (Hono/Express)
POST /api/gmail/delete
POST /api/gmail/trash
POST /api/gmail/send
POST /api/gmail/star
POST /api/gmail/label
POST /api/gmail/batch-modify

// Frontend calls backend
const deleteMessage = async (messageId: string) => {
  await fetch('/api/gmail/delete', {
    method: 'POST',
    body: JSON.stringify({ messageId }),
    headers: { Authorization: `Bearer ${sessionToken}` }
  });
};
```

---

## 🎯 Recommendation: Hybrid Approach

### Phase 1: Frontend Implementation (Beta - 3-5 days)
**Implement critical operations in frontend for beta testing:**
- Delete/Trash
- Send email
- Star/unstar
- Mark as unread
- Basic label operations

**Why:** Get to beta faster, validate the app works with real mailboxes

### Phase 2: Backend Migration (Post-Beta - 1-2 weeks)
**Move operations to backend before production:**
- Better security
- Better error handling
- Rules engine
- Audit logging
- Operation queue

**Why:** Production-ready, scalable, secure

---

## 📋 Implementation Checklist

### Phase 1: Frontend Operations (Beta)

#### Delete Operations
- [ ] `trashMessage(messageId)` - Move to trash
- [ ] `untrashMessage(messageId)` - Restore from trash
- [ ] `deleteMessage(messageId)` - Permanently delete
- [ ] `batchDeleteMessages(messageIds[])` - Delete multiple

#### Send Operations
- [ ] `sendMessage({ to, cc, bcc, subject, body, attachments })` - Send email
- [ ] `createDraft({ to, subject, body })` - Create draft
- [ ] `updateDraft(draftId, { to, subject, body })` - Update draft
- [ ] `deleteDraft(draftId)` - Delete draft
- [ ] `sendDraft(draftId)` - Send existing draft

#### Label Operations
- [ ] `starMessage(messageId)` - Add star
- [ ] `unstarMessage(messageId)` - Remove star
- [ ] `addLabel(messageId, labelId)` - Add label
- [ ] `removeLabel(messageId, labelId)` - Remove label
- [ ] `applyLabels(messageId, { add: [], remove: [] })` - Batch label operations

#### Read/Unread Operations
- [ ] `markAsUnread(messageId)` - Mark as unread
- [ ] `batchMarkAsRead(messageIds[])` - Mark multiple as read
- [ ] `batchMarkAsUnread(messageIds[])` - Mark multiple as unread

#### Folder Operations
- [ ] `moveToFolder(messageId, folderLabel)` - Move to folder
- [ ] `moveToInbox(messageId)` - Move back to inbox

#### Bulk Operations
- [ ] `batchModifyMessages(messageIds[], { addLabels, removeLabels })` - Bulk modify
- [ ] `batchDeleteMessages(messageIds[])` - Bulk delete
- [ ] `batchArchiveMessages(messageIds[])` - Bulk archive

### Phase 2: Backend Operations (Production)

#### Backend API Endpoints
- [ ] `POST /api/gmail/trash` - Trash message
- [ ] `POST /api/gmail/delete` - Delete message
- [ ] `POST /api/gmail/send` - Send email
- [ ] `POST /api/gmail/star` - Star/unstar
- [ ] `POST /api/gmail/label` - Apply labels
- [ ] `POST /api/gmail/batch-modify` - Bulk operations
- [ ] `POST /api/gmail/rules/execute` - Execute rules

#### Backend Features
- [ ] Operation queue (for offline support)
- [ ] Retry logic for failed operations
- [ ] Audit logging
- [ ] Rate limiting (centralized)
- [ ] Rules engine (server-side execution)

---

## 🔧 Technical Details

### Gmail API Endpoints Needed

#### Delete/Trash
```typescript
// Trash message
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/{messageId}/trash

// Untrash message
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/{messageId}/untrash

// Permanently delete
DELETE https://gmail.googleapis.com/gmail/v1/users/me/messages/{messageId}
```

#### Send Email
```typescript
// Send message
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
Body: {
  raw: base64EncodedMimeMessage,
  threadId?: string // For replies
}

// Create draft
POST https://gmail.googleapis.com/gmail/v1/users/me/drafts
Body: {
  message: {
    raw: base64EncodedMimeMessage
  }
}
```

#### Modify Message
```typescript
// Modify labels
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/{messageId}/modify
Body: {
  addLabelIds: ['STARRED', 'IMPORTANT'],
  removeLabelIds: ['UNREAD', 'INBOX']
}
```

#### Batch Operations
```typescript
// Batch modify
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify
Body: {
  ids: ['messageId1', 'messageId2'],
  addLabelIds: ['STARRED'],
  removeLabelIds: ['UNREAD']
}

// Batch delete
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/batchDelete
Body: {
  ids: ['messageId1', 'messageId2']
}
```

---

## 🚀 Implementation Priority

### Must Have for Beta (Week 1)
1. **Delete/Trash** - Core functionality
2. **Send Email** - Core functionality
3. **Star/Unstar** - Core functionality
4. **Mark as Unread** - Core functionality

### Should Have for Beta (Week 2)
5. **Apply Labels** - Useful feature
6. **Move to Folder** - Useful feature
7. **Bulk Operations** - Efficiency

### Nice to Have (Post-Beta)
8. **Rules Execution** - Can be backend-only
9. **Advanced Label Management** - Can be backend-only
10. **Operation Queue** - Backend feature

---

## 📝 Code Structure

### Frontend Implementation (GmailSyncContext.tsx)

```typescript
// Add to GmailSyncContext.tsx

// Delete operations
const trashMessageMutation = useMutation({
  mutationFn: async (messageId: string) => {
    return makeGmailRequest(`/messages/${messageId}/trash`, {
      method: 'POST',
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.MESSAGES });
  },
});

const deleteMessageMutation = useMutation({
  mutationFn: async (messageId: string) => {
    return makeGmailRequest(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.MESSAGES });
  },
});

// Send operations
const sendMessageMutation = useMutation({
  mutationFn: async (message: SendMessageParams) => {
    const raw = createMimeMessage(message);
    return makeGmailRequest('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ raw }),
    });
  },
});

// Star operations
const starMessageMutation = useMutation({
  mutationFn: async ({ messageId, starred }: { messageId: string; starred: boolean }) => {
    return makeGmailRequest(`/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        [starred ? 'addLabelIds' : 'removeLabelIds']: ['STARRED'],
      }),
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GMAIL.MESSAGES });
  },
});

// Export in context
return {
  // ... existing
  trashMessage: trashMessageMutation.mutateAsync,
  deleteMessage: deleteMessageMutation.mutateAsync,
  sendMessage: sendMessageMutation.mutateAsync,
  starMessage: starMessageMutation.mutateAsync,
};
```

### MIME Message Creation Utility

```typescript
// utils/mimeMessage.ts
export function createMimeMessage({
  to,
  cc,
  bcc,
  subject,
  body,
  replyTo,
  inReplyTo,
  references,
}: SendMessageParams): string {
  const lines: string[] = [];
  
  lines.push(`To: ${to}`);
  if (cc) lines.push(`Cc: ${cc}`);
  if (bcc) lines.push(`Bcc: ${bcc}`);
  lines.push(`Subject: ${subject}`);
  lines.push(`Content-Type: text/plain; charset=UTF-8`);
  if (inReplyTo) lines.push(`In-Reply-To: ${inReplyTo}`);
  if (references) lines.push(`References: ${references}`);
  lines.push(''); // Empty line before body
  lines.push(body);
  
  const message = lines.join('\r\n');
  return btoa(message).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
```

---

## 🎯 Next Steps

1. **Update Beta Roadmap** - Add Gmail operations as Phase 1
2. **Implement Frontend Operations** - Start with delete, send, star
3. **Test with Real Gmail Account** - Verify operations work
4. **Plan Backend Migration** - Design API for Phase 2

---

**Last Updated:** 2024-12-30

