/**
 * Test Backend Users Route
 * 
 * This script tests if the backend users route is deployed and working.
 */

const BACKEND_URL = 'https://athenxmail-backend.onrender.com';

async function testBackendRoute() {
  console.log('🔍 Testing backend users route...\n');

  // Test 1: Check if backend is up
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Backend is running');
      console.log(`   Status: ${health.status || 'ok'}`);
    } else {
      console.log(`❌ Backend health check failed: ${healthResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Backend is not reachable: ${error.message}`);
    return;
  }

  // Test 2: Try to get a user (should return error for non-existent user, but route should exist)
  try {
    const testUserId = 'test-user-123';
    const response = await fetch(`${BACKEND_URL}/api/trpc/users.getById?input=${encodeURIComponent(JSON.stringify({ id: testUserId }))}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`\n📡 Testing users.getById route...`);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 404) {
      console.log('   ❌ Route not found (404) - backend route not deployed yet');
      console.log('   💡 Check Render dashboard to see if deployment completed');
    } else if (response.status === 200 || response.status === 400 || response.status === 500) {
      // 200 = success, 400/500 = route exists but error (which is fine for testing)
      const data = await response.json();
      console.log('   ✅ Route exists!');
      console.log(`   Response: ${JSON.stringify(data).substring(0, 200)}...`);
    } else {
      const text = await response.text();
      console.log(`   ⚠️  Unexpected status: ${response.status}`);
      console.log(`   Response: ${text.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error testing route: ${error.message}`);
  }

  // Test 3: Try to create a user
  try {
    console.log(`\n📡 Testing users.upsert route...`);
    const testUser = {
      id: `test-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      provider: 'google',
    };

    const response = await fetch(`${BACKEND_URL}/api/trpc/users.upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    console.log(`   Status: ${response.status}`);
    
    if (response.status === 404) {
      console.log('   ❌ Route not found (404) - backend route not deployed yet');
    } else if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Route exists and user creation works!');
      console.log(`   Created user: ${data.result?.data?.email || 'unknown'}`);
    } else {
      const text = await response.text();
      console.log(`   ⚠️  Route exists but returned error: ${response.status}`);
      console.log(`   Response: ${text.substring(0, 300)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error testing route: ${error.message}`);
  }

  console.log('\n✨ Test complete!');
}

testBackendRoute();

