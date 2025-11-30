# Credentials Template

**⚠️ DO NOT COMMIT THIS FILE WITH REAL CREDENTIALS!**

This is a template for storing your infrastructure credentials locally.

## Supabase Credentials

```
Email: flushrushdev@gmail.com
Password: +}-eu2,G{KqDBB>z
```

### Project Details
- **Project Name**: [Your project name]
- **Project URL**: https://[your-project-id].supabase.co
- **Anon Key**: [Your anon key from Supabase dashboard]
- **Service Role Key**: [Your service role key - KEEP SECRET!]

### How to Get Your Keys:
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings > API
4. Copy the Project URL, anon/public key, and service_role key

---

## Render Credentials

- **Account**: [Your Render account email]
- **Backend URL**: https://[your-service-name].onrender.com

---

## Environment Variables

### Frontend (.env file)
```env
EXPO_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
EXPO_PUBLIC_API_BASE_URL=https://[your-backend].onrender.com
```

### Backend (Render Environment Variables)
```
SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
NODE_ENV=production
PORT=10000
CORS_ORIGINS=https://your-frontend-url.com
```

---

## Security Notes

- ✅ Never commit credentials to Git
- ✅ Use environment variables for all secrets
- ✅ Rotate keys if they're ever exposed
- ✅ Use different keys for development and production
- ✅ Keep service role key secret (never expose to frontend)

