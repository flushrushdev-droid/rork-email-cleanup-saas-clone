import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { AppText } from './AppText';
import { WifiOff, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useNetwork } from '@/contexts/NetworkContext';

/**
 * OfflineIndicator - Shows a banner when the device is offline
 * 
 * Displays at the top of the screen when network connectivity is lost
 * 
 * @example
 * <OfflineIndicator />
 */
export function OfflineIndicator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isOffline } = useNetwork();
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isOffline) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: -100,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOffline, translateY, opacity]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.danger,
          paddingTop: insets.top + 8,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel="No internet connection. Some features may be unavailable."
    >
      <View style={styles.content}>
        <WifiOff size={18} color="#FFFFFF" />
        <AppText style={styles.text} dynamicTypeStyle="caption">No internet connection</AppText>
        <AlertCircle size={18} color="#FFFFFF" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

