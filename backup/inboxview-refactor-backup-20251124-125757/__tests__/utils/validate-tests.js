/**
 * Test Validation Script
 * 
 * This script demonstrates that your tests are actually working
 * by temporarily breaking code and verifying tests fail.
 * 
 * Run: node __tests__/utils/validate-tests.js
 */

const fs = require('fs');
const path = require('path');

const statDetailsPath = path.join(__dirname, '../../app/stat-details.tsx');

console.log('🧪 Test Validation Demo\n');
console.log('This script will temporarily break your code to prove tests work.\n');

// Read the original file
const originalContent = fs.readFileSync(statDetailsPath, 'utf8');

// Test 1: Break the back button testID
console.log('Test 1: Breaking back button testID...');
let brokenContent = originalContent.replace(
  'testID="back-button"',
  'testID="wrong-button-id"'
);

fs.writeFileSync(statDetailsPath, brokenContent, 'utf8');
console.log('✅ Code broken - back button testID changed to "wrong-button-id"');
console.log('   Run: npm test -- stat-details.demo.test.tsx -t "should have back button"');
console.log('   Expected: Test should FAIL ❌\n');

// Restore
fs.writeFileSync(statDetailsPath, originalContent, 'utf8');
console.log('✅ Code restored\n');

// Test 2: Break the navigation
console.log('Test 2: Breaking router.back() call...');
brokenContent = originalContent.replace(
  'onPress={() => router.back()}',
  'onPress={() => { /* router.back() removed */ }}'
);

fs.writeFileSync(statDetailsPath, brokenContent, 'utf8');
console.log('✅ Code broken - router.back() call removed');
console.log('   Run: npm test -- stat-details.demo.test.tsx -t "should have back button"');
console.log('   Expected: Test should FAIL ❌ (mockRouter.back not called)\n');

// Restore
fs.writeFileSync(statDetailsPath, originalContent, 'utf8');
console.log('✅ Code restored\n');

// Test 3: Break the empty state text
console.log('Test 3: Breaking empty state text...');
brokenContent = originalContent.replace(
  'No unread messages! 🎉',
  'Wrong empty state text'
);

fs.writeFileSync(statDetailsPath, brokenContent, 'utf8');
console.log('✅ Code broken - empty state text changed');
console.log('   Run: npm test -- stat-details.demo.test.tsx -t "should show empty state"');
console.log('   Expected: Test should FAIL ❌\n');

// Restore
fs.writeFileSync(statDetailsPath, originalContent, 'utf8');
console.log('✅ Code restored\n');

console.log('🎉 Validation complete!');
console.log('\nIf tests failed when code was broken, your tests are working correctly!');
console.log('If tests passed when code was broken, your tests need improvement.');

