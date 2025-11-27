import React, { useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Swipeable } from 'react-native-gesture-handler';
import { Archive, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import { InboxEmailItem } from './InboxEmailItem';
import { triggerHaptic, triggerActionHaptic } from '@/utils/haptics';

interface SwipeableEmailItemProps {
  email: EmailMessage;
  isSelected: boolean;
  selectionMode: boolean;
  onPress: () => void;
  onStarPress: () => void;
  onToggleSelection: () => void;
  onArchive?: (email: EmailMessage) => void;
  onDelete?: (email: EmailMessage) => void;
}

export const SwipeableEmailItem = React.memo<SwipeableEmailItemProps>(({
  email,
  isSelected,
  selectionMode,
  onPress,
  onStarPress,
  onToggleSelection,
  onArchive,
  onDelete,
}) => {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  // Disable swipe when in selection mode
  if (selectionMode || !onArchive || !onDelete) {
    return (
      <InboxEmailItem
        email={email}
        isSelected={isSelected}
        selectionMode={selectionMode}
        onPress={onPress}
        onStarPress={onStarPress}
        onToggleSelection={onToggleSelection}
      />
    );
  }

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragAnimatedValue: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragAnimatedValue.interpolate({
      inputRange: [0, 60],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const opacity = dragAnimatedValue.interpolate({
      inputRange: [0, 40],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.leftAction, { backgroundColor: colors.primary }]}>
        <Animated.View
          style={[
            styles.actionContent,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <Archive size={24} color={colors.surface} />
          <AppText style={[styles.actionText, { color: colors.surface }]} dynamicTypeStyle="headline">Archive</AppText>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragAnimatedValue: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragAnimatedValue.interpolate({
      inputRange: [-60, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const opacity = dragAnimatedValue.interpolate({
      inputRange: [-40, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.rightAction, { backgroundColor: colors.danger }]}>
        <Animated.View
          style={[
            styles.actionContent,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <Trash2 size={24} color={colors.surface} />
          <AppText style={[styles.actionText, { color: colors.surface }]} dynamicTypeStyle="headline">Delete</AppText>
        </Animated.View>
      </View>
    );
  };

  const handleSwipeableWillOpen = (direction: 'left' | 'right') => {
    // Trigger haptic feedback when swipe starts to reveal action
    triggerHaptic('light');
  };

  const handleArchive = async () => {
    // Close swipeable immediately to prevent visual glitches
    swipeableRef.current?.close();
    
    // Stronger haptic feedback for action
    await triggerActionHaptic();
    
    // Call archive handler
    if (onArchive) {
      onArchive(email);
    }
  };

  const handleDelete = async () => {
    // Close swipeable immediately to prevent visual glitches
    swipeableRef.current?.close();
    
    // Stronger haptic feedback for destructive action
    await triggerActionHaptic();
    
    // Call delete handler
    if (onDelete) {
      onDelete(email);
    }
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={handleSwipeableWillOpen}
      onSwipeableOpen={(direction) => {
        // Only trigger action when fully swiped past threshold
        if (direction === 'left') {
          handleArchive();
        } else if (direction === 'right') {
          handleDelete();
        }
      }}
      friction={2}
      leftThreshold={60}
      rightThreshold={60}
      overshootLeft={false}
      overshootRight={false}
      enabled={!selectionMode}
    >
      <InboxEmailItem
        email={email}
        isSelected={isSelected}
        selectionMode={selectionMode}
        onPress={onPress}
        onStarPress={onStarPress}
        onToggleSelection={onToggleSelection}
      />
    </Swipeable>
  );
});

SwipeableEmailItem.displayName = 'SwipeableEmailItem';

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    marginVertical: 8,
    borderRadius: 12,
    marginRight: 16,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    marginVertical: 8,
    borderRadius: 12,
    marginLeft: 16,
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});

