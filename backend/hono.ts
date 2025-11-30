import { Hono } from "hono";
import { cors } from "hono/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./trpc/app-router.js";
import { createContext } from "./trpc/create-context.js";

const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// OAuth callback endpoint for mobile apps
// Google redirects here after authentication, then we redirect back to the app
app.get("/auth/callback", (c) => {
  const code = c.req.query("code");
  const error = c.req.query("error");
  const state = c.req.query("state");
  const errorDescription = c.req.query("error_description");
  
  // App scheme for deep linking back to the app
  const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME || "athenxmail-app";
  
  if (error) {
    // OAuth error - redirect back to app with error
    const errorParams = new URLSearchParams({
      error: error,
      ...(errorDescription && { error_description: errorDescription }),
    });
    const deepLink = `${appScheme}://login?${errorParams.toString()}`;
    return c.redirect(deepLink);
  }
  
  if (code) {
    // Success - redirect back to app with code
    const params = new URLSearchParams({
      code: code,
      ...(state && { state: state }),
    });
    const deepLink = `${appScheme}://auth/callback?${params.toString()}`;
    return c.redirect(deepLink);
  }
  
  // No code or error - redirect to login
  return c.redirect(`${appScheme}://login`);
});

// Mount tRPC server using native fetch adapter
// This handles ALL /api/trpc/* requests
app.all("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

export default app;
