/**
 * Test Supabase Connection
 * 
 * Run this script to verify your Supabase credentials are working:
 * node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://kczbtkclzzqvafxnyqly.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rB-5H1AWygxxSMEefNYC6Q_qj7Jqdhp';

console.log('🔍 Testing Supabase connection...\n');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...\n');

try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Test 1: Check if we can connect
  console.log('Test 1: Checking connection...');
  
  // Test 2: Try to query rules table
  console.log('Test 2: Querying rules table...');
  supabase
    .from('rules')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error querying rules:', error.message);
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('\n💡 Tip: Make sure you\'ve run the database schema!');
          console.log('   See: setup-database.md');
        }
        process.exit(1);
      } else {
        console.log('✅ Successfully queried rules table');
      }

      // Test 3: Try to query custom_folders table
      console.log('Test 3: Querying custom_folders table...');
      return supabase
        .from('custom_folders')
        .select('count')
        .limit(1);
    })
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error querying custom_folders:', error.message);
        process.exit(1);
      } else {
        console.log('✅ Successfully queried custom_folders table');
      }

      // Test 4: Try to query user_preferences table
      console.log('Test 4: Querying user_preferences table...');
      return supabase
        .from('user_preferences')
        .select('count')
        .limit(1);
    })
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error querying user_preferences:', error.message);
        process.exit(1);
      } else {
        console.log('✅ Successfully queried user_preferences table');
      }

      console.log('\n🎉 All tests passed! Supabase connection is working.');
      console.log('\n✅ Your database is set up correctly.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error.message);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Failed to create Supabase client:', error.message);
  process.exit(1);
}

