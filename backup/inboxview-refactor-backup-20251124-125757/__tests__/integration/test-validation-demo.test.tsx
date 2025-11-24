/**
 * Test Validation Demo
 * 
 * This file demonstrates that tests actually work by showing:
 * 1. A test that should pass
 * 2. A test that should fail (commented out)
 * 
 * Run: npm test -- test-validation-demo.test.tsx
 */

describe('Test Validation Demo', () => {
  test('✅ This test should PASS - demonstrates tests work', () => {
    // Simple assertion that should always pass
    expect(2 + 2).toBe(4);
    expect('hello').toBe('hello');
    expect(true).toBeTruthy();
  });

  // Uncomment the test below to see it FAIL - proving tests catch errors!
  /*
  test('❌ This test should FAIL - uncomment to see tests catch errors', () => {
    expect(2 + 2).toBe(5); // This is wrong, test should fail
  });
  */

  test('✅ Tests verify actual behavior, not just that code runs', () => {
    const data = { name: 'Test', value: 42 };
    
    // Good: Actually checks the value
    expect(data.value).toBe(42);
    expect(data.name).toBe('Test');
    
    // Bad example (commented): This would always pass
    // expect(true).toBe(true); // Useless!
  });

  test('✅ Tests can catch when things are missing', () => {
    const array = [1, 2, 3];
    
    // This should pass
    expect(array).toContain(2);
    expect(array.length).toBe(3);
    
    // Uncomment below to see test fail:
    // expect(array).toContain(99); // Should fail - 99 is not in array
  });
});

