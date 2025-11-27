# Android-Specific Features Implementation

## Overview

This document describes the Android-specific features implemented for the app, including Share Intents, App Shortcuts, and Widgets.

## ✅ Implemented Features

### 1. Share Intents Support

**Status:** ✅ Foundation Complete (Requires Native Code for Full Functionality)

**Location:** `utils/android/shareIntents.ts`, `hooks/useAndroidIntents.ts`

**Features:**
- Intent filter configuration in `app.json`
- Support for multiple content types (text, images, URLs, files)
- Deep linking to compose screen with shared content
- Content type detection and handling

**Supported Content Types:**
- Plain text (`text/plain`)
- Images (`image/*`)
- URLs (`text/uri-list`)
- Files (`*/*`)

**Configuration:**
Intent filters are configured in `app.json`:
```json
{
  "android": {
    "intentFilters": [
      {
        "action": "android.intent.action.SEND",
        "category": ["android.intent.category.DEFAULT"],
        "data": {
          "mimeType": "text/plain"
        }
      },
      // ... more filters
    ]
  }
}
```

**Usage:**
```typescript
import { handleSharedContent, ShareContentType } from '@/utils/android/shareIntents';

// Handle shared content
await handleSharedContent({
  type: ShareContentType.TEXT,
  text: 'Shared text content',
});
```

**Note:** Full share intent handling requires:
1. Native code to extract intent extras
2. Handling of content URIs
3. File provider configuration for file sharing

### 2. App Shortcuts / Quick Actions

**Status:** ✅ Foundation Complete (Static Shortcuts Configured)

**Location:** `utils/android/shortcuts.ts`, `app.json`

**Features:**
- Static shortcuts configured in `app.json`
- Shortcut action definitions
- URL scheme handling for deep linking
- Dynamic shortcut update utilities (requires native code)

**Available Shortcuts:**
- **Unread Emails** - Opens inbox filtered to unread messages
- **Inbox** - Opens the main inbox view
- **Sync Emails** - Triggers email synchronization

**Configuration:**
Static shortcuts are configured in `app.json`:
```json
{
  "android": {
    "shortcuts": [
      {
        "shortcutId": "unread",
        "shortcutLabel": "Unread Emails",
        "shortcutLongLabel": "View unread emails",
        "intent": {
          "action": "android.intent.action.VIEW",
          "data": "rork-app://mail?filter=unread"
        }
      }
      // ... more shortcuts
    ]
  }
}
```

**Usage:**
```typescript
import { handleShortcutAction, ShortcutAction } from '@/utils/android/shortcuts';

// Handle a shortcut action
handleShortcutAction({
  action: ShortcutAction.SHOW_UNREAD,
});
```

**Note:** Dynamic shortcuts require:
1. Development build (not Expo Go)
2. Native module using ShortcutManager API
3. ShortcutInfo.Builder to create shortcuts programmatically

### 3. Android Widgets

**Status:** ✅ Foundation Complete (Requires Native Widget Provider)

**Location:** `utils/android/widgets.ts`

**Features:**
- Widget data management utilities
- Widget types: Unread Count, Recent Emails, Stats
- Widget size definitions (small, medium, large)
- Widget refresh utilities

**Widget Types:**
- **Unread Count** - Shows number of unread emails (small/medium)
- **Recent Emails** - Shows list of recent emails (medium/large)
- **Stats** - Shows email statistics (medium/large)

**Usage:**
```typescript
import { updateWidgetData, WidgetType } from '@/utils/android/widgets';

// Update widget data
await updateWidgetData(WidgetType.UNREAD_COUNT, {
  count: 5,
  lastUpdated: new Date(),
});
```

**Note:** Widgets require:
1. Development build (not Expo Go)
2. App Widget Provider in native code
3. RemoteViews for widget UI
4. AppWidgetManager to update widgets
5. SharedPreferences or Room database for data storage

### 4. Android Auto (Optional)

**Status:** ⚠️ Not Implemented (Optional Feature)

**Note:** Android Auto integration is optional and requires:
1. Android Auto app in Google Play Console
2. Car App Library
3. Native implementation for car-optimized UI
4. Voice command handling

## 📋 Configuration

### app.json Updates

The following Android-specific configurations have been added:

```json
{
  "android": {
    "intentFilters": [
      // Share intent filters for text, images, files
    ],
    "shortcuts": [
      // Static app shortcuts
    ]
  }
}
```

## 🔧 Development Build Requirements

Full Android-specific features (dynamic shortcuts, widgets) require a **Custom Development Build** instead of Expo Go.

### Creating a Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Create development build for Android
eas build --profile development --platform android

# Install on device and start development
npm start --dev-client
```

## 📱 Testing

### Testing Share Intents

1. Open any app with shareable content (Chrome, Photos, etc.)
2. Tap the share button
3. Select your app from the share sheet
4. Content should open in compose screen

### Testing App Shortcuts

1. Long-press the app icon on home screen
2. Shortcuts menu should appear
3. Tap a shortcut to open the app with that action
4. App should navigate to the correct screen

### Testing Widgets

1. Long-press on home screen
2. Select "Widgets"
3. Find your app's widgets
4. Add widget to home screen
5. Widget should display current data

## 🚀 Next Steps

To fully implement these features:

1. **Create Development Build**
   - Set up EAS Build
   - Create development build for Android
   - Test on physical device

2. **Implement Native Modules**
   - Create Expo module for share intent handling
   - Create Expo module for dynamic shortcuts
   - Create App Widget Provider

3. **Configure File Provider**
   - Set up FileProvider for secure file sharing
   - Configure file paths in AndroidManifest.xml

4. **Test and Iterate**
   - Test each feature on physical device
   - Handle edge cases
   - Optimize performance

## 📚 Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android App Widgets](https://developer.android.com/develop/ui/views/appwidgets)
- [App Shortcuts](https://developer.android.com/develop/ui/views/launch/shortcuts)
- [Share Intents](https://developer.android.com/training/sharing/receive)
- [Android Auto](https://developer.android.com/training/cars)

## ⚠️ Limitations

- **Expo Go:** Basic URL scheme handling works, but full features require development build
- **Native Code:** Widgets, dynamic shortcuts, and full share intent handling require native Java/Kotlin code
- **File Provider:** Required for secure file sharing between apps
- **Google Play Console:** Required for Android Auto (if implemented)

## 🔄 Comparison with iOS

| Feature | iOS | Android |
|---------|-----|---------|
| Share Extensions/Intents | ✅ Foundation | ✅ Foundation |
| App Shortcuts | ✅ Foundation | ✅ Static Shortcuts |
| Widgets | ⚠️ Requires Native | ⚠️ Requires Native |
| Deep Linking | ✅ Works | ✅ Works |
| Dynamic Updates | ⚠️ Requires Native | ⚠️ Requires Native |

