# User Tracking and Analytics Setup

This guide explains how to set up user tracking and analytics in AthenXMail.

## Database Setup

### 1. Run the Users Schema

Run the `database/users-schema.sql` file in your Supabase SQL Editor. This creates:

- **`users` table**: Tracks user registration, login/logout times, subscriptions, and metadata
- **`user_actions` table**: Tracks all user actions for analytics

### 2. Schema Features

**Users Table:**
- Registration tracking (`registered_at`, `first_login_at`)
- Session tracking (`last_login_at`, `last_logout_at`, `login_count`)
- Subscription info (`plan_type`, `plan_status`, `subscription_id`, etc.)
- Feature flags and limits (`features`, `limits` JSONB fields)
- Analytics metadata (`metadata` JSONB field)

**User Actions Table:**
- Action type and category
- Flexible JSONB `action_data` for different action types
- Device type and app version tracking
- Screen name tracking

## Backend Setup

The backend tRPC routes are already set up in `backend/trpc/routes/users/route.ts`:

- `users.upsert` - Create or update user
- `users.getById` - Get user by ID
- `users.getByEmail` - Get user by email
- `users.update` - Update user fields
- `users.trackAction` - Track user action
- `users.getActions` - Get user's action history

## Frontend Integration

### Automatic Tracking

The following are automatically tracked:

1. **Login**: Tracked when user successfully logs in
2. **Logout**: Tracked when user logs out
3. **User Creation**: User record is created/updated on first login

### Manual Tracking

Use the `useUserTracking` hook to track custom actions:

```typescript
import { useUserTracking } from '@/hooks/useUserTracking';

function MyComponent() {
  const { trackAction, trackRuleCreated, trackFolderCreated } = useUserTracking();

  const handleCreateRule = async () => {
    // ... create rule logic ...
    
    // Track the action
    await trackRuleCreated(ruleId, ruleName);
  };
}
```

### Available Tracking Methods

- `trackAction(actionType, options)` - Generic action tracking
- `trackLogin()` - Track login (usually automatic)
- `trackLogout()` - Track logout (usually automatic)
- `trackScreenView(screenName)` - Track screen views
- `trackRuleCreated(ruleId, ruleName)` - Track rule creation
- `trackRuleDeleted(ruleId)` - Track rule deletion
- `trackFolderCreated(folderId, folderName)` - Track folder creation
- `trackSyncStarted(messageCount?)` - Track sync start
- `trackSyncCompleted(messageCount, durationMs)` - Track sync completion

## Example Usage

### Track a Custom Action

```typescript
const { trackAction } = useUserTracking();

await trackAction('email_archived', {
  category: 'email',
  data: { email_id: '123', folder: 'Archive' },
  screenName: 'inbox',
});
```

### Track Screen Views

```typescript
const { trackScreenView } = useUserTracking();

useEffect(() => {
  trackScreenView('rules');
}, []);
```

## Analytics Queries

### Get User Stats

```sql
SELECT 
  id,
  email,
  plan_type,
  login_count,
  last_login_at,
  registered_at
FROM users
WHERE is_active = true;
```

### Get User Activity

```sql
SELECT 
  action_type,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM user_actions
WHERE user_id = 'user_id'
GROUP BY action_type
ORDER BY count DESC;
```

### Get Active Users (last 30 days)

```sql
SELECT * FROM active_users;
```

### Get User Activity Summary

```sql
SELECT * FROM user_activity_summary WHERE id = 'user_id';
```

## Subscription Management

Update user subscription when they upgrade/downgrade:

```typescript
await trpc.users.update.mutate({
  id: userId,
  plan_type: 'pro',
  plan_status: 'active',
  subscription_id: 'sub_123',
  subscription_started_at: new Date().toISOString(),
  subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
});
```

## Next Steps

1. Run `database/users-schema.sql` in Supabase
2. Test login - user should be automatically created
3. Add tracking calls throughout the app using `useUserTracking`
4. Set up analytics dashboards using the `user_actions` table
5. Configure subscription webhooks to update `plan_status` automatically

