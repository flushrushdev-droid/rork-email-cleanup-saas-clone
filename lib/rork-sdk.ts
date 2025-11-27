/**
 * Rork SDK Wrapper
 * 
 * This file conditionally imports the real Rork SDK when available (in Rork.ai)
 * or falls back to the mock implementation for local development.
 * 
 * This file CAN be pushed to GitHub - it's smart enough to work in both environments.
 */

import { createScopedLogger } from '@/utils/logger';

const sdkLogger = createScopedLogger('Rork SDK');

// Try to import the real Rork SDK, fall back to mock if not available
let useRorkAgent: any;
let createRorkTool: any;

try {
  // Try to load the real SDK (only available in Rork.ai environment)
  const rorkSdk = require('@rork-ai/toolkit-sdk');
  useRorkAgent = rorkSdk.useRorkAgent;
  createRorkTool = rorkSdk.createRorkTool;
  sdkLogger.debug('Using real Rork SDK');
} catch (error) {
  // Fall back to mock implementation for local development
  const mockSdk = require('./rork-sdk-mock');
  useRorkAgent = mockSdk.useRorkAgent;
  createRorkTool = mockSdk.createRorkTool;
  sdkLogger.debug('Using mock SDK for local development');
}

export { useRorkAgent, createRorkTool };

