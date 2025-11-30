# Users Table Setup Guide

## Quick Start

1. **Run the schema**: Copy and paste `database/users-schema.sql` into your Supabase SQL Editor and run it.

2. **Verify tables**: Check that `users` and `user_actions` tables were created:
   ```sql
   SELECT * FROM users LIMIT 1;
   SELECT * FROM user_actions LIMIT 1;
   ```

3. **Test**: Log in to your app - a user record should be automatically created!

## What Gets Tracked

### Automatic Tracking (No Code Changes Needed)
- ✅ User registration (first login)
- ✅ Login times
- ✅ Logout times
- ✅ Login count

### Manual Tracking (Use `useUserTracking` Hook)
- Rule creation/deletion
- Folder creation/deletion
- Email sync events
- Screen views
- Custom actions

## Database Tables

### `users` Table
Tracks:
- Basic info (email, name, picture)
- Registration and login history
- Subscription status
- Feature flags and limits
- Analytics metadata

### `user_actions` Table
Tracks:
- All user actions (login, logout, create rule, etc.)
- Action context (screen, device, app version)
- Flexible JSONB data for different action types

## Next Steps

1. Run the schema in Supabase
2. Test login - user should auto-create
3. Add tracking throughout app using `useUserTracking` hook
4. Query analytics data for insights

See `docs/USER_TRACKING_SETUP.md` for detailed usage.

