/**
 * Check Supabase Users Table Setup
 * 
 * This script checks if the users and user_actions tables exist
 * and verifies the setup is correct.
 */

const SUPABASE_URL = 'https://kczbtkclzzqvafxnyqly.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_Q4xKJPC2HUjXVVbdNz01zA_YOfSyoNP';

async function checkSupabaseSetup() {
  console.log('🔍 Checking Supabase setup...\n');

  try {
    // Check if users table exists and has data
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,email,name,created_at&limit=5`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('✅ Users table exists!');
      console.log(`   Found ${users.length} user(s):`);
      users.forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.email} (ID: ${user.id}, Created: ${user.created_at})`);
      });
      if (users.length === 0) {
        console.log('   ⚠️  Table is empty - no users have been created yet');
      }
    } else {
      const error = await usersResponse.text();
      if (usersResponse.status === 404 || error.includes('relation "users" does not exist')) {
        console.log('❌ Users table does NOT exist');
        console.log('   Run database/users-schema.sql in Supabase SQL Editor');
      } else {
        console.log(`❌ Error checking users table: ${usersResponse.status}`);
        console.log(`   ${error}`);
      }
    }

    // Check if user_actions table exists
    const actionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_actions?select=id,user_id,action_type,created_at&limit=5`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (actionsResponse.ok) {
      const actions = await actionsResponse.json();
      console.log('\n✅ User actions table exists!');
      console.log(`   Found ${actions.length} action(s)`);
      if (actions.length > 0) {
        actions.forEach((action, i) => {
          console.log(`   ${i + 1}. ${action.action_type} by user ${action.user_id} (${action.created_at})`);
        });
      }
    } else {
      const error = await actionsResponse.text();
      if (actionsResponse.status === 404 || error.includes('relation "user_actions" does not exist')) {
        console.log('\n❌ User actions table does NOT exist');
        console.log('   Run database/users-schema.sql in Supabase SQL Editor');
      } else {
        console.log(`\n❌ Error checking user_actions table: ${actionsResponse.status}`);
        console.log(`   ${error}`);
      }
    }

    // Test inserting a user (will fail if table doesn't exist or RLS is blocking)
    console.log('\n🧪 Testing user creation...');
    const testUserId = `test-${Date.now()}`;
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        id: testUserId,
        email: `test-${testUserId}@example.com`,
        name: 'Test User',
        provider: 'google',
      }),
    });

    if (testResponse.ok || testResponse.status === 201) {
      console.log('✅ User creation test passed!');
      
      // Clean up test user
      await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${testUserId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
      console.log('   Test user cleaned up');
    } else {
      const error = await testResponse.text();
      console.log(`❌ User creation test failed: ${testResponse.status}`);
      console.log(`   ${error}`);
    }

    console.log('\n✨ Check complete!');

  } catch (error) {
    console.error('❌ Error checking Supabase:', error.message);
  }
}

checkSupabaseSetup();

