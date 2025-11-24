# Test Validation Guide

## How to Verify Your Tests Are Actually Working

### 1. **Intentionally Break Things** (The "Red Test" Principle)

A good test should FAIL when the code is broken. Let's verify:

#### Example: Break the Back Button Test
1. Temporarily remove or break the back button functionality in `app/stat-details.tsx`
2. Run the test - it should FAIL
3. Restore the code - test should PASS again

This proves the test is actually checking something!

### 2. **Check Test Coverage**

Run coverage to see what code is actually being tested:
```bash
npm test -- stat-details.demo.test.tsx --coverage --collectCoverageFrom="app/stat-details.tsx"
```

Look for:
- **Statements**: % of code statements executed
- **Branches**: % of if/else branches tested
- **Functions**: % of functions called
- **Lines**: % of lines executed

Low coverage = tests might be missing important code paths!

### 3. **Verify Assertions Are Meaningful**

Bad test (always passes):
```javascript
test('should render component', () => {
  render(<Component />);
  expect(true).toBe(true); // This always passes!
});
```

Good test (actually checks something):
```javascript
test('should render component', () => {
  const { getByText } = render(<Component />);
  expect(getByText('Expected Text')).toBeTruthy(); // Actually checks output
});
```

### 4. **Mutation Testing** (Advanced)

Temporarily break your code in small ways and see if tests catch it:
- Change a function return value
- Remove a conditional check
- Change a string constant
- Remove error handling

If tests still pass, they're not testing that code path!

### 5. **Inspect What Tests Actually Do**

Look at your test assertions:
- ✅ `expect(getByText('text')).toBeTruthy()` - Actually checks rendered output
- ✅ `expect(mockRouter.back).toHaveBeenCalled()` - Verifies function was called
- ✅ `expect(getByTestId('button')).toBeTruthy()` - Checks element exists
- ❌ `expect(true).toBe(true)` - Useless, always passes

### 6. **Test Edge Cases**

Your tests should cover:
- ✅ Happy path (normal operation)
- ✅ Empty states (no data)
- ✅ Error states (invalid data)
- ✅ Boundary conditions (min/max values)

### 7. **Run Tests in Isolation**

Make sure tests don't depend on each other:
```bash
# Run tests in random order
npm test -- --shuffle

# Run a single test
npm test -- -t "should render unread messages list"
```

### 8. **Check Test Output**

When a test fails, it should give you:
- Clear error message
- What was expected vs what was received
- Stack trace pointing to the problem

If tests fail silently or with unclear errors, they're not helpful!

## Quick Validation Checklist

- [ ] Can I break the code and see tests fail?
- [ ] Do tests check actual behavior, not just that code runs?
- [ ] Is test coverage > 80% for critical paths?
- [ ] Do tests verify both success and failure cases?
- [ ] Are assertions specific and meaningful?
- [ ] Do tests run independently (no shared state)?

## Example: Validating the Back Button Test

```javascript
// Test expects this to exist
test('should have back button', () => {
  const { getByTestId } = render(<StatDetailsScreen />);
  const backButton = getByTestId('back-button');
  expect(backButton).toBeTruthy();
});

// Validation: Break the code temporarily
// In app/stat-details.tsx, change:
// testID="back-button" → testID="wrong-id"
// Test should FAIL - proving it's actually checking!
```

