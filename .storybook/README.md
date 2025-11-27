# Storybook for React Native

This project uses Storybook for React Native to document and test components in isolation.

## Setup

Storybook is configured to run on-device (iOS/Android) or in a web browser. The configuration is located in `.storybook/`.

## Running Storybook

### On Device (iOS/Android/Web)

1. Start your Expo development server:
   ```bash
   npm start
   # or
   npm run start-web
   ```

2. Navigate to the Storybook screen:
   - In the app, go to `/storybook` route
   - Or use Expo's dev menu to navigate there
   - On web: `http://localhost:8081/storybook`

### Accessing Storybook

Storybook is available as a screen in the app. You can:
- Navigate directly to `/storybook` in the app
- Add a dev menu option to toggle Storybook
- Use an environment variable to show Storybook by default in development

## Adding New Stories

Stories are located alongside their components. For example:
- `components/common/AppText.stories.tsx`
- `components/common/StatCard.stories.tsx`

To create a new story:

1. Create a `*.stories.tsx` file next to your component
2. Import the component and necessary dependencies
3. Use the `storiesOf` API
4. Register the story in `.storybook/index.js`

### Example Story

```tsx
import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { MyComponent } from './MyComponent';
import { ThemeProvider } from '@/contexts/ThemeContext';

storiesOf('Category/MyComponent', module)
  .addDecorator((story) => (
    <ThemeProvider>
      {story()}
    </ThemeProvider>
  ))
  .add('Default', () => (
    <MyComponent prop1="value1" prop2="value2" />
  ))
  .add('With Custom Props', () => (
    <MyComponent prop1="custom" prop2="values" />
  ));
```

## Available Addons

- **Controls**: Interactive controls for component props
- **Actions**: Log actions/events triggered by components
- **Notes**: Add documentation notes to stories

## Story Organization

Stories are organized by category:
- `Common/` - Reusable common components
- `Mail/` - Email-related components
- `Calendar/` - Calendar components
- `Stats/` - Statistics components
- etc.

## Tips

1. Always wrap stories with necessary providers (ThemeProvider, etc.)
2. Use decorators for shared setup across multiple stories
3. Document component props and usage in story descriptions
4. Test different states and edge cases in stories

## Troubleshooting

If Storybook doesn't load:
- Make sure all story files are registered in `.storybook/index.js`
- Check that all required providers are included in decorators
- Verify that `@react-native-async-storage/async-storage` is installed
