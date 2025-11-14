# Rork's Root-Level Swipe-to-Go-Back Gesture Configuration

## Overview
Rork's root-level swipe-to-go-back gesture is **not explicitly configured by Rork**. It's the **default behavior** of Expo Router's `Stack` navigator, which uses React Navigation under the hood.

## Where the Gesture is Configured

### 1. Root Layout (`app/_layout.tsx`)

The root-level gesture is enabled by default in the `Stack` component:

```typescript
// app/_layout.tsx
function RootLayoutNav() {
  const { colors } = useTheme();
  
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.text,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
        // Rork's root-level swipe-to-go-back gesture is enabled by default
        // (gestureEnabled defaults to true - we don't need to set it)
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

**Key Points:**
- The `Stack` component from `expo-router` enables swipe-to-go-back by default
- `gestureEnabled` defaults to `true` if not specified
- This gesture works at the root level for all screens in the Stack

### 2. Gesture Handler Root View (`app/_layout.tsx`)

The `GestureHandlerRootView` wrapper is required for all gestures to work:

```typescript
// app/_layout.tsx
function GestureHandlerWrapper({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      {children}
    </GestureHandlerRootView>
  );
}
```

**Key Points:**
- `GestureHandlerRootView` from `react-native-gesture-handler` must wrap the entire app
- This enables gesture recognition at the native level
- Without this wrapper, gestures won't work

## How It Works

1. **Default Behavior**: When you use `<Stack>` from `expo-router`, the swipe-to-go-back gesture is automatically enabled
2. **Native Implementation**: React Navigation uses native gesture recognizers (iOS UIGestureRecognizer, Android GestureDetector)
3. **Root Level**: The gesture works across all screens in the Stack navigator
4. **Direction**: On iOS, swiping from the left edge triggers the back action. On Android, swiping from either edge can trigger it.

## Disabling the Gesture

To disable the root-level gesture, you would set:

```typescript
<Stack 
  screenOptions={{ 
    gestureEnabled: false,  // Disables swipe-to-go-back
    // ... other options
  }}
>
```

## Current Status

- ✅ **Root-level gesture**: Enabled (default behavior)
- ❌ **Custom email navigation gesture**: Removed (was causing conflicts)
- ✅ **Button navigation**: Active (prev/next buttons in EmailDetailView)

## Files Involved

1. **`app/_layout.tsx`** - Contains the Stack navigator and GestureHandlerRootView wrapper
2. **`components/mail/EmailDetailView.tsx`** - Custom gesture removed, using buttons only

## Notes

- Rork doesn't add any custom gesture configuration - it uses Expo Router's defaults
- The gesture is handled by React Navigation's native gesture system
- Custom gestures using `react-native-gesture-handler` can conflict with the root-level gesture
- The safest approach is to use button navigation for custom actions and rely on the root-level gesture for back navigation

