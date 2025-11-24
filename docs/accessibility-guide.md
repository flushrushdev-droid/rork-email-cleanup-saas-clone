# Accessibility Guide

This guide explains how to use the accessibility components and utilities in the app.

## Overview

All interactive elements in the app should be accessible to screen readers and assistive technologies. We provide reusable components and utilities to make this easy.

## Components

### AccessibleButton

A button component with built-in accessibility support.

```tsx
import { AccessibleButton } from '@/components/common/AccessibleButton';

<AccessibleButton
  accessibilityLabel="Sync mailbox"
  accessibilityHint="Synchronizes your Gmail inbox with the app"
  onPress={handleSync}
  disabled={isSyncing}
  loading={isSyncing}
>
  <Text>Sync</Text>
</AccessibleButton>
```

**Props:**
- `accessibilityLabel` (required): Label for screen readers
- `accessibilityHint` (optional): Additional context
- `loading`: Shows loading state and sets `busy` accessibility state
- `disabled`: Automatically sets `disabled` accessibility state
- All other `TouchableOpacity` props are supported

### AccessibleTextInput

A text input component with built-in accessibility and error handling.

```tsx
import { AccessibleTextInput } from '@/components/common/AccessibleTextInput';

<AccessibleTextInput
  accessibilityLabel="Folder name"
  accessibilityHint="Enter a name for your new folder"
  placeholder="Folder name"
  value={folderName}
  onChangeText={setFolderName}
  error={hasError}
  errorMessage="Folder name is required"
  label="Folder Name"
/>
```

**Props:**
- `accessibilityLabel` (optional): Auto-generated from placeholder if not provided
- `accessibilityHint` (optional): Additional context
- `error`: Shows error state
- `errorMessage`: Error message to display
- `label`: Optional label text above input
- All other `TextInput` props are supported

### AppText (Extended)

The existing `AppText` component now supports accessibility props.

```tsx
import { AppText } from '@/components/common/AppText';

<AppText
  accessibilityLabel="Inbox health score: 85 percent"
  accessibilityRole="text"
>
  {health.score}%
</AppText>
```

**Props:**
- `accessibilityLabel`: Override the label (useful for dynamic content)
- `accessibilityRole`: Set the role (default: "text")
- `accessibilityHint`: Additional context

## Utilities

### getAccessibilityProps

Get standardized accessibility props for any element.

```tsx
import { getAccessibilityProps } from '@/utils/accessibility';

const props = getAccessibilityProps('Sync button', {
  hint: 'Synchronizes your inbox',
  role: 'button',
  disabled: false,
});

<TouchableOpacity {...props} onPress={handleSync}>
  <Text>Sync</Text>
</TouchableOpacity>
```

### formatAccessibilityLabel

Create dynamic accessibility labels.

```tsx
import { formatAccessibilityLabel } from '@/utils/accessibility';

const label = formatAccessibilityLabel(
  'Unread messages: {count}',
  { count: unreadCount.toString() }
);
// Result: "Unread messages: 15"
```

### Helper Functions

```tsx
import {
  getButtonAccessibilityProps,
  getTextAccessibilityProps,
  getInputAccessibilityProps,
} from '@/utils/accessibility';

// For buttons
const buttonProps = getButtonAccessibilityProps('Save', {
  hint: 'Saves your changes',
  disabled: false,
});

// For text
const textProps = getTextAccessibilityProps('Score: 85');

// For inputs
const inputProps = getInputAccessibilityProps('Email address', {
  hint: 'Enter your email address',
  placeholder: 'email@example.com',
});
```

## Best Practices

### 1. Always Provide Labels

Every interactive element needs an `accessibilityLabel`:

```tsx
// Good
<AccessibleButton accessibilityLabel="Delete email" onPress={handleDelete}>
  <Trash2 />
</AccessibleButton>

// Bad - no label
<TouchableOpacity onPress={handleDelete}>
  <Trash2 />
</TouchableOpacity>
```

### 2. Use Descriptive Labels

Labels should be clear and specific:

```tsx
// Good
accessibilityLabel="Sync mailbox"

// Bad - too vague
accessibilityLabel="Button"
```

### 3. Include Context in Hints

Use `accessibilityHint` for additional context:

```tsx
<AccessibleButton
  accessibilityLabel="Archive email"
  accessibilityHint="Moves this email to the archive folder"
  onPress={handleArchive}
>
  <Archive />
</AccessibleButton>
```

### 4. Announce Dynamic Content

For dynamic content, use `formatAccessibilityLabel`:

```tsx
<Text
  accessible={true}
  accessibilityRole="text"
  accessibilityLabel={formatAccessibilityLabel(
    'Inbox health score: {score} percent',
    { score: health.score.toString() }
  )}
>
  {health.score}%
</Text>
```

### 5. Handle Disabled States

Always communicate disabled states:

```tsx
<AccessibleButton
  accessibilityLabel="Sync mailbox"
  disabled={isSyncing}
  // Automatically sets accessibilityState.disabled
>
  <Text>Sync</Text>
</AccessibleButton>
```

### 6. Use Progress Indicators

For progress bars, use `accessibilityRole="progressbar"`:

```tsx
<View
  accessible={true}
  accessibilityRole="progressbar"
  accessibilityLabel={formatAccessibilityLabel(
    'Syncing: {current} of {total} messages',
    { current: current.toString(), total: total.toString() }
  )}
  accessibilityValue={{
    min: 0,
    max: total,
    now: current,
  }}
>
  {/* Progress bar UI */}
</View>
```

## Testing Accessibility

### Using React Native Testing Library

```tsx
import { render } from '@testing-library/react-native';

const { getByLabelText } = render(<YourComponent />);
const button = getByLabelText('Sync mailbox');
expect(button).toBeTruthy();
```

### Screen Reader Testing

1. **iOS**: Enable VoiceOver in Settings > Accessibility
2. **Android**: Enable TalkBack in Settings > Accessibility
3. Test all interactive elements
4. Verify labels are clear and helpful
5. Check that disabled states are announced

## Common Patterns

### Stat Cards

```tsx
<AccessibleButton
  accessibilityLabel={formatAccessibilityLabel(
    'Unread messages: {count}',
    { count: unreadCount.toString() }
  )}
  accessibilityHint="Opens detailed view of unread messages"
  onPress={() => router.push('/stat-details')}
>
  <Mail />
  <Text>{unreadCount}</Text>
  <Text>Unread</Text>
</AccessibleButton>
```

### Form Inputs

```tsx
<AccessibleTextInput
  accessibilityLabel="Folder name"
  accessibilityHint="Enter a name for your new folder"
  placeholder="Folder name"
  value={folderName}
  onChangeText={setFolderName}
  error={!!error}
  errorMessage={error?.message}
/>
```

### Loading States

```tsx
<AccessibleButton
  accessibilityLabel="Sync mailbox"
  loading={isSyncing}
  // Automatically sets busy state
>
  <Text>Sync</Text>
</AccessibleButton>
```

## Resources

- [React Native Accessibility Docs](https://reactnative.dev/docs/accessibility)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Accessibility](https://developer.apple.com/accessibility/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)


