# AthenXMail Backend

This is the backend API for AthenXMail, built with Hono and tRPC.

## Structure

- `server.ts` - Server entry point
- `hono.ts` - Hono app configuration
- `trpc/` - tRPC routes and configuration
- `lib/` - Backend utilities (Supabase client, etc.)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Dependencies

This backend has its own `package.json` with minimal dependencies:
- `hono` - Web framework
- `@hono/trpc-server` - tRPC adapter for Hono
- `@trpc/server` - tRPC server
- `@supabase/supabase-js` - Supabase client
- `zod` - Schema validation
- `superjson` - Serialization

## Deployment

The backend is deployed separately on Render. See `render.yaml` in the root directory for deployment configuration.

**Note:** Render is configured to use only the `backend/` directory, so it doesn't need to install frontend dependencies.

