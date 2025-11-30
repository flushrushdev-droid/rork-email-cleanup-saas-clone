/**
 * Server Entry Point for Render/Production
 * 
 * This file starts the Hono server for production deployment.
 * Render will run this file to start the server.
 */

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

import app from './hono.js';
import { serve } from '@hono/node-server';

// Get port from environment or default to 10000 (Render's default)
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 10000;

// Start the server
serve({
  fetch: app.fetch,
  port,
}, (info: { address: string; port: number }) => {
  console.log(`🚀 Server running on http://${info.address}:${info.port}`);
});

