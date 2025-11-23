# Testing Guide - Integration Tests

## Test Types Overview

### Integration Tests (Current - 41 tests passing ✅)

**What they test:**
- Component rendering and behavior
- State management
- User interactions (clicks, inputs)
- Data flow and logic
- Mock data handling

**Location:** `__tests__/integration/`

**Run:** `npm run test:demo`

**Report:** `test-results/demo-qa-report.html`

---

## Why Integration Tests

Integration tests use `react-test-renderer` which:
- Renders components in isolation
- Tests logic and behavior
- Fast execution (~12 seconds)
- 100% pass rate
- Detailed HTML report

**Example:** An integration test verifies that clicking a button calls a function and updates state correctly.

---

## Running Tests

### Integration Tests
```bash
npm run test:demo        # Run all demo tests
npm run test:report      # Generate HTML report
npm run test:integration # Run all integration tests
npm run test:coverage    # Run with coverage report
npm run test:watch       # Watch mode for development
```

---

## Current Status

✅ **Integration Tests:** 41/41 passing (100%)

---

## Test Suites

- `auth.demo.test.tsx` - Authentication and demo mode
- `email.demo.test.tsx` - Email operations (archive, delete, star, filter)
- `compose.demo.test.tsx` - Email composition and attachments
- `folders.demo.test.tsx` - Custom folder management
- `rules.demo.test.tsx` - Automation rules CRUD
- `notes.demo.test.tsx` - Notes creation and management
- `calendar.demo.test.tsx` - Calendar event creation
- `sync.demo.test.tsx` - Sync functionality in demo mode

---

## Best Practices

- Run integration tests frequently during development
- Use `test:watch` for TDD workflow
- Check HTML report for detailed results
- All tests verify demo mode functionality and non-persistence
