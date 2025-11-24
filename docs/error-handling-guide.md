# Error Handling Guide

This guide explains how to use the error handling infrastructure in the app.

## Overview

The app provides a comprehensive error handling system with:
- Typed error classes
- Error normalization
- User-friendly error messages
- Retry mechanisms
- Error boundaries
- Toast notifications

## Error Types

### NetworkError

For network/connection issues. Automatically retryable.

```tsx
import { NetworkError } from '@/utils/errorHandling';

throw new NetworkError('Unable to connect to server');
```

### AuthError

For authentication failures. Not retryable (user must sign in).

```tsx
import { AuthError } from '@/utils/errorHandling';

throw new AuthError('Session expired');
```

### ValidationError

For input validation errors. Not retryable.

```tsx
import { ValidationError } from '@/utils/errorHandling';

throw new ValidationError('Email is required', 'email');
```

### APIError

For API/server errors. Can be retryable for 5xx errors.

```tsx
import { APIError } from '@/utils/errorHandling';

throw new APIError('Server error', 500, true); // retryable
throw new APIError('Bad request', 400, false); // not retryable
```

### UnknownError

Catch-all for unexpected errors.

```tsx
import { UnknownError } from '@/utils/errorHandling';

throw new UnknownError('Something went wrong');
```

## useErrorHandler Hook

The main hook for handling errors in components.

### Basic Usage

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError, handleAsync, error, clearError } = useErrorHandler();

  const handleAction = async () => {
    await handleAsync(async () => {
      await someAsyncOperation();
    });
  };

  return (
    <>
      {error && <ErrorDisplay error={error} />}
      <Button onPress={handleAction}>Do Something</Button>
    </>
  );
}
```

### With Alert

```tsx
const { showError } = useErrorHandler({ showAlert: true });

try {
  await someOperation();
} catch (err) {
  showError(err); // Shows Alert dialog
}
```

### Custom Error Formatting

```tsx
const { handleError } = useErrorHandler({
  formatError: (error) => `Custom: ${error.message}`,
  onError: (error) => {
    // Log to analytics
    analytics.track('error', { code: error.code });
  },
});
```

## ErrorDisplay Component

Display errors in the UI with different variants.

### Inline Variant

```tsx
import { ErrorDisplay } from '@/components/common/ErrorDisplay';

<ErrorDisplay
  error={error}
  variant="inline"
  showRetry={true}
  onRetry={handleRetry}
  onDismiss={clearError}
/>
```

### Alert Variant

```tsx
<ErrorDisplay
  error={error}
  variant="alert"
  showRetry={true}
  onRetry={handleRetry}
/>
```

### Toast Variant

```tsx
<ErrorDisplay
  error={error}
  variant="toast"
  onDismiss={clearError}
/>
```

## Error Boundary

Catches React component errors and shows fallback UI.

```tsx
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Component error:', error, errorInfo);
    // Log to error tracking service
  }}
>
  <YourApp />
</ErrorBoundary>
```

## Toast Notifications

For non-blocking error notifications.

```tsx
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/common/Toast';

function MyComponent() {
  const { toast, showToast, hideToast } = useToast();

  const handleAction = async () => {
    try {
      await someOperation();
      showToast('Success!', 'success');
    } catch (err) {
      showToast('Operation failed', 'error');
    }
  };

  return (
    <>
      <Button onPress={handleAction}>Do Something</Button>
      <Toast toast={toast} onDismiss={hideToast} />
    </>
  );
}
```

## Error Normalization

Convert any error to a typed AppError:

```tsx
import { normalizeError, formatErrorMessage } from '@/utils/errorHandling';

try {
  await someOperation();
} catch (err) {
  const appError = normalizeError(err);
  const userMessage = formatErrorMessage(appError);
  console.log('Error code:', appError.code);
  console.log('User message:', userMessage);
}
```

## Retry Logic

### Using useAsyncWithRetry

```tsx
import { useAsyncWithRetry } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { execute, isLoading, retryCount } = useAsyncWithRetry(
    async () => {
      return await syncMailbox();
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      showAlert: false,
    }
  );

  return (
    <>
      <Button onPress={execute} disabled={isLoading}>
        {isLoading ? `Retrying... (${retryCount})` : 'Sync'}
      </Button>
    </>
  );
}
```

### Manual Retry

```tsx
import { isRetryableError } from '@/utils/errorHandling';

const handleAction = async () => {
  try {
    await someOperation();
  } catch (err) {
    if (isRetryableError(err)) {
      // Show retry button
      setShowRetry(true);
    }
  }
};
```

## Best Practices

### 1. Always Normalize Errors

```tsx
// Good
try {
  await operation();
} catch (err) {
  const appError = normalizeError(err);
  handleError(appError);
}

// Bad - don't assume error type
catch (err) {
  handleError(err); // Still works, but less type-safe
}
```

### 2. Provide User-Friendly Messages

```tsx
// Good - uses formatErrorMessage
const message = formatErrorMessage(error);
showError(message);

// Bad - shows technical error
showError(error.message); // "ECONNREFUSED"
```

### 3. Handle Different Error Types Appropriately

```tsx
import { isErrorType, ErrorCode } from '@/utils/errorHandling';

if (isErrorType(error, ErrorCode.AUTH_ERROR)) {
  // Redirect to login
  router.replace('/login');
} else if (isErrorType(error, ErrorCode.NETWORK_ERROR)) {
  // Show retry option
  setShowRetry(true);
}
```

### 4. Log Errors for Debugging

```tsx
const { handleError } = useErrorHandler({
  logErrors: true, // Default: true
  onError: (error) => {
    // Send to error tracking service
    errorTracker.captureException(error);
  },
});
```

### 5. Use Appropriate Display Methods

- **Inline**: For form validation errors
- **Alert**: For critical errors that need attention
- **Toast**: For non-critical notifications
- **ErrorBoundary**: For component crashes

## Common Patterns

### API Calls

```tsx
const { handleAsync } = useErrorHandler();

const syncData = async () => {
  const result = await handleAsync(async () => {
    return await api.sync();
  });
  
  if (result) {
    showToast('Sync successful', 'success');
  }
};
```

### Form Validation

```tsx
import { ValidationError } from '@/utils/errorHandling';

const handleSubmit = () => {
  if (!email.trim()) {
    setError(new ValidationError('Email is required', 'email'));
    return;
  }
  
  // Submit form
};
```

### Network Requests with Retry

```tsx
const { execute } = useAsyncWithRetry(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  {
    maxRetries: 3,
    retryDelay: 1000,
  }
);
```

## Error Codes

```tsx
import { ErrorCode } from '@/utils/errorHandling';

ErrorCode.NETWORK_ERROR    // Connection issues
ErrorCode.AUTH_ERROR       // Authentication failures
ErrorCode.VALIDATION_ERROR  // Input validation
ErrorCode.API_ERROR         // Server errors
ErrorCode.UNKNOWN_ERROR     // Unexpected errors
ErrorCode.TIMEOUT_ERROR     // Request timeouts
ErrorCode.PERMISSION_ERROR  // Permission denied
```

## Testing Error Handling

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NetworkError } from '@/utils/errorHandling';

test('shows error message on network failure', async () => {
  const { getByText } = render(<MyComponent />);
  
  // Simulate network error
  mockApi.mockReject(new NetworkError('Connection failed'));
  
  fireEvent.press(getByText('Sync'));
  
  await waitFor(() => {
    expect(getByText(/unable to connect/i)).toBeTruthy();
  });
});
```

## Resources

- [Error Handling Best Practices](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)


