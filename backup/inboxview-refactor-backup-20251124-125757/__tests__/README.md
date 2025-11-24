# Demo Mode QA Test Suite

This directory contains comprehensive automated tests for validating demo mode functionality.

## Test Structure

### Integration Tests (`integration/`)
- **auth.demo.test.tsx** - Authentication and demo mode entry
- **email.demo.test.tsx** - Email operations (archive, delete, star, filter, search)
- **compose.demo.test.tsx** - Email composition and attachments
- **folders.demo.test.tsx** - Custom folder creation and management
- **rules.demo.test.tsx** - Automation rule creation, editing, and management
- **notes.demo.test.tsx** - Notes creation, editing, and deletion
- **calendar.demo.test.tsx** - Calendar event management
- **sync.demo.test.tsx** - Sync disabled verification

### E2E Tests (`../e2e/`)
- **demo-complete-flow.e2e.ts** - Complete user journey
- **email-management.e2e.ts** - Email management flows
- **rules-management.e2e.ts** - Rules management flows

## Running Tests

### Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Run only demo mode tests
npm run test:demo

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### E2E Tests
```bash
# Run E2E tests (requires Detox setup)
npm run test:e2e

# Run on iOS simulator
npm run test:e2e:ios

# Run on Android emulator
npm run test:e2e:android
```

### Generate HTML Report
```bash
npm run test:report
```

The HTML report will be generated at `test-results/demo-qa-report.html`

## Test Principles

1. **Tests Only Verify** - Tests never attempt to fix issues, only report them
2. **Detailed Logging** - All test steps are logged with timestamps
3. **Error Capture** - Full error messages and stack traces are captured
4. **Isolation** - Each test suite runs independently
5. **Demo Mode Focus** - All tests run in demo mode context

## Test Coverage

- Authentication: Demo mode entry and persistence
- Email Operations: All email actions with toast/undo
- Rules Management: Full CRUD operations
- Folders: Creation and non-persistence
- Notes: Creation and non-persistence
- Calendar: Event creation and non-persistence
- Sync: Verification that sync is disabled
- Navigation: All screen transitions
- Toasts: All notification types

## Test Results

Test results are output to:
- Console: Standard Jest output
- HTML Report: `test-results/demo-qa-report.html`
- Coverage: `coverage/` directory (if coverage enabled)

## Notes

- Tests use mocked AsyncStorage to verify non-persistence
- All API calls are mocked to prevent real network requests
- Tests are designed to run in CI/CD pipelines
- E2E tests require device/simulator setup

