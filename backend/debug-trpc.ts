/**
 * Debug script to verify tRPC routing
 */

import app from './hono.js';

console.log('=== tRPC Debug Information ===');
console.log('\n1. App object:', typeof app);
console.log('2. App.fetch:', typeof app.fetch);

// Try to fetch from the app directly
const testRequest = new Request('http://localhost:10000/api/trpc/users.getById?input=%7B%22json%22%3A%7B%22id%22%3A%22test%22%7D%7D', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('\n3. Testing app.fetch with tRPC request...');
app.fetch(testRequest)
  .then(async (response: Response) => {
    console.log('   Status:', response.status);
    const text = await response.text();
    console.log('   Response:', text.substring(0, 200));
  })
  .catch((error: Error) => {
    console.error('   Error:', error.message);
  });

// Check environment variables
console.log('\n4. Environment variables:');
console.log('   PORT:', process.env.PORT || '(not set)');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

// Import appRouter to check its structure
import { appRouter } from './trpc/app-router.js';
console.log('\n5. App Router:');
console.log('   Type:', typeof appRouter);
console.log('   Keys:', Object.keys(appRouter._def || {}));

