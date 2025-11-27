# Storybook Setup Information

## Current Status
⚠️ **INCOMPLETE** - Storybook has compatibility issues with React Native

## Installed Packages & Versions

### Core Storybook Packages
- `@storybook/react-native`: `^9.1.4`
- `storybook`: `^9.1.16`

### Peer Dependencies (Required by Storybook)
- `@gorhom/bottom-sheet`: `^5.2.7`
- `@gorhom/portal`: `^1.0.14`
- `react-native-reanimated`: `^4.1.5`
- `react-native-worklets`: `^0.6.1`
- `react-native-worklets-core`: `^1.6.2`

### React Native & Expo Versions
- `react-native`: `0.81.5`
- `expo`: `^54.0.20`
- `expo-router`: `~6.0.13`

## Configuration Files

### Storybook Configuration
- `.storybook/index.native.js` - Native platform entry point
- `.storybook/index.web.js` - Web platform (disabled)
- `.storybook/rn-addons.js` - Addon configuration (currently disabled)

### Metro Configuration
- `metro.config.js` - Custom Metro config with Node.js polyfills
- `metro-polyfills/` - Directory containing polyfills for:
  - `tty.js` - Terminal interface stub
  - `fs.js` - File system stub
  - `path.js` - Path utilities
  - `stream.js` - Streams stub
  - `util.js` - Utility functions
  - `buffer.js` - Buffer support
  - `process.js` - Process object with env proxy
  - `os.js` - OS utilities

### Story Files Created
- `components/common/AppText.stories.tsx`
- `components/common/StatCard.stories.tsx`
- `components/common/EmptyState.stories.tsx`
- `components/common/Avatar.stories.tsx`

### App Integration
- `app/storybook.tsx` - Storybook screen component
- `app/(tabs)/settings.tsx` - Storybook button (dev-only)

## Babel Configuration
- `babel.config.js` - Includes `react-native-reanimated/plugin` (must be last)

## Error Encountered

```
TypeError: Cannot read property 'indexOf' of undefined
```

**Location:** `node_modules/storybook/dist/test/index.cjs`

**Root Cause:** The core `storybook` package (v9.1.16) uses Node.js-specific modules and APIs that are fundamentally incompatible with React Native. Even with polyfills, the package attempts to use features that don't exist in the React Native runtime.

**Specific Issues:**
1. `storybook/dist/test/index.cjs` imports `os` and `tty` modules
2. Code tries to access `process.env.FORCE_COLOR.length` which can be undefined
3. Various Node.js-specific utilities are used throughout the package

## Attempted Solutions

1. ✅ Created Metro polyfills for Node.js modules
2. ✅ Updated `process.env` to use Proxy to ensure all properties return strings
3. ✅ Improved polyfills to match Node.js API more closely
4. ❌ Still encountering runtime errors due to fundamental incompatibilities

## Recommendations

1. **Wait for Compatible Version:** Monitor `@storybook/react-native` for a version that doesn't depend on the core `storybook` package
2. **Use Alternative:** Consider component playground screens or manual testing instead
3. **Try Older Version:** `@storybook/react-native@5.3.27` doesn't require core `storybook`, but may not work with React Native 0.81.5

## Files to Remove if Abandoning Storybook

If you decide to remove Storybook completely:
- Remove packages: `@storybook/react-native`, `storybook`
- Remove directory: `.storybook/`
- Remove file: `app/storybook.tsx`
- Remove Storybook button from `app/(tabs)/settings.tsx`
- Remove `metro-polyfills/` directory (if not needed for other purposes)
- Revert `metro.config.js` to default Expo config
- Remove story files: `components/**/*.stories.tsx`

