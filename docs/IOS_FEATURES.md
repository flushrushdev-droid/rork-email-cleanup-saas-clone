# iOS-Specific Features Implementation

## Overview

This document describes the iOS-specific features implemented for the app, including Siri Shortcuts, Spotlight search, Share Extensions, and Widgets.

## ✅ Implemented Features

### 1. Siri Shortcuts Support

**Status:** ✅ Foundation Complete (Requires Development Build for Full Functionality)

**Location:** `utils/ios/shortcuts.ts`, `hooks/useIOSShortcuts.ts`

**Features:**
- Shortcut action definitions for common app actions
- URL scheme handling for deep linking
- Suggested shortcuts for users
- Automatic handling when app opens via shortcut

**Available Shortcuts:**
- **Show Unread Emails** - Opens inbox filtered to unread messages
- **Open Inbox** - Opens the main inbox view
- **Sync Emails** - Triggers email synchronization
- **Search Emails** - Opens search with optional query

**Usage:**
```typescript
import { handleShortcutAction, ShortcutAction } from '@/utils/ios/shortcuts';

// Handle a shortcut action
handleShortcutAction({
  action: ShortcutAction.SHOW_UNREAD,
});
```

**URL Scheme:**
The app uses the `rork-app://` URL scheme for deep linking:
- `rork-app://mail` - Open inbox
- `rork-app://mail?filter=unread` - Show unread emails
- `rork-app://mail?action=sync` - Sync emails
- `rork-app://mail?search=query` - Search emails

**Note:** Full Siri integration requires:
1. Development build (not Expo Go)
2. Native Intent Definition File (`.intentdefinition`)
3. App Groups configuration for data sharing

### 2. Spotlight Search Integration

**Status:** ✅ Foundation Complete (Requires Native Module)

**Location:** `utils/ios/spotlight.ts`

**Features:**
- Email indexing utilities
- Sender indexing utilities
- Batch indexing support
- Index removal utilities

**Usage:**
```typescript
import { indexEmail, indexEmails } from '@/utils/ios/spotlight';

// Index a single email
await indexEmail(email);

// Index multiple emails
await indexEmails(emails);
```

**Note:** Full Spotlight integration requires:
1. Development build (not Expo Go)
2. Native module using Core Spotlight framework
3. CSSearchableItem and CSSearchableIndex APIs
4. App Groups for data sharing between app and extension

**Implementation Steps (Native):**
1. Create native module using `expo-modules-core`
2. Use `CSSearchableItem` to create searchable items
3. Use `CSSearchableIndex` to add items to Spotlight
4. Set up domain identifiers and unique identifiers
5. Handle search result selection in app

### 3. Share Extensions

**Status:** ✅ Foundation Complete (Requires Native Extension)

**Location:** `utils/ios/shareExtension.ts`

**Features:**
- Support for multiple content types (URL, text, image, file)
- Deep linking to compose screen with shared content
- Content type detection and handling

**Supported Content Types:**
- URLs
- Plain text
- Images
- Files

**Usage:**
```typescript
import { handleSharedContent, ShareContentType } from '@/utils/ios/shareExtension';

// Handle shared content
await handleSharedContent({
  type: ShareContentType.URL,
  url: 'https://example.com',
  title: 'Example Page',
});
```

**Note:** Full Share Extension requires:
1. Development build (not Expo Go)
2. Native Share Extension target in Xcode
3. App Groups configuration
4. Share Extension UI (can be native or React Native)
5. Data sharing between extension and main app

**Implementation Steps (Native):**
1. Create Share Extension target in Xcode
2. Configure App Groups for data sharing
3. Implement `SLComposeServiceViewController` or custom UI
4. Handle shared content and pass to main app
5. Use URL scheme or App Groups to communicate with main app

### 4. iOS Widgets

**Status:** ⚠️ Configuration Ready (Requires Native Widget Extension)

**Location:** `app.json` (configuration)

**Features:**
- App Groups configuration (ready)
- Widget extension target setup (requires native code)

**Note:** Widgets require:
1. Development build (not Expo Go)
2. Widget Extension target in Xcode
3. App Groups for data sharing
4. SwiftUI or UIKit for widget UI
5. Timeline provider for widget updates

**Implementation Steps (Native):**
1. Create Widget Extension target in Xcode
2. Configure App Groups
3. Create SwiftUI widget views
4. Implement `TimelineProvider` for data updates
5. Use `WidgetKit` framework
6. Share data between app and widget via App Groups

## 📋 Configuration

### app.json Updates

The following iOS-specific configurations have been added:

```json
{
  "ios": {
    "infoPlist": {
      "NSUserActivityTypes": [
        "INShowInboxIntent",
        "INSendMessageIntent"
      ],
      "NSUserActivityDomain": "app.rork.email-cleanup-saas",
      "NSSupportsLiveActivities": true
    },
    "associatedDomains": [
      "applinks:rork.com"
    ]
  }
}
```

## 🔧 Development Build Requirements

All iOS-specific features (except basic URL scheme handling) require a **Custom Development Build** instead of Expo Go.

### Creating a Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Create development build for iOS
eas build --profile development --platform ios

# Install on device and start development
npm start --dev-client
```

## 📱 Testing

### Testing Shortcuts

1. Open Shortcuts app on iOS
2. Create a new shortcut
3. Add "Open App" action
4. Select your app
5. Add URL parameter: `rork-app://mail?filter=unread`
6. Run the shortcut

### Testing Spotlight Search

1. Index emails using the utility functions
2. Swipe down on home screen
3. Search for email subject or sender
4. Tap result to open in app

### Testing Share Extension

1. Share content from another app (Safari, Photos, etc.)
2. Select your app from share sheet
3. Content should open in compose screen

## 🚀 Next Steps

To fully implement these features:

1. **Create Development Build**
   - Set up EAS Build
   - Create development build for iOS
   - Test on physical device

2. **Implement Native Modules**
   - Create Expo module for Spotlight
   - Create Expo module for Share Extension
   - Create Widget Extension target

3. **Configure App Groups**
   - Set up App Groups in Apple Developer Portal
   - Configure in Xcode project
   - Update app.json with group identifier

4. **Test and Iterate**
   - Test each feature on physical device
   - Handle edge cases
   - Optimize performance

## 📚 Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [iOS Widgets Guide](https://developer.apple.com/documentation/widgetkit)
- [Siri Shortcuts](https://developer.apple.com/documentation/sirikit)
- [Core Spotlight](https://developer.apple.com/documentation/corespotlight)
- [Share Extensions](https://developer.apple.com/documentation/appextensions/sharing_extensions)

## ⚠️ Limitations

- **Expo Go:** Basic URL scheme handling works, but full features require development build
- **Native Code:** Widgets, Share Extensions, and full Spotlight require native Swift/Objective-C code
- **App Groups:** Required for data sharing between app and extensions
- **Apple Developer Account:** Required for App Groups and App Store distribution

