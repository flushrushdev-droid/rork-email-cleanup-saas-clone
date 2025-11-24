import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UndoToastProps {
  message: string;
  onUndo?: () => void;
  timer?: number;
  maxTimer?: number;
  colors: any;
  insets?: ReturnType<typeof useSafeAreaInsets>;
}

export function UndoToast({ 
  message, 
  onUndo, 
  timer = 5, 
  maxTimer = 5, 
  colors,
  insets 
}: UndoToastProps) {
  const safeInsets = useSafeAreaInsets();
  const effectiveInsets = insets || safeInsets;
  const progress = Math.max(0, Math.min(1, timer / maxTimer));
  const circumference = 2 * Math.PI * 8;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: effectiveInsets.bottom + 8,
        backgroundColor: colors.surface,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#10B98155',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#10B98122',
            borderWidth: 1,
            borderColor: '#10B98155',
          }}
        >
          <Check size={18} color="#10B981" strokeWidth={3} />
        </View>
        <Text style={{ color: colors.text, flex: 1 }}>{message}</Text>
      </View>
      {onUndo && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Circular Timer */}
          <View style={{ width: 20, height: 20 }}>
            <Svg width={20} height={20} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle
                cx={10}
                cy={10}
                r={8}
                stroke="#10B98133"
                strokeWidth={2}
                fill="none"
              />
              <Circle
                cx={10}
                cy={10}
                r={8}
                stroke="#10B981"
                strokeWidth={2}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <TouchableOpacity
            onPress={onUndo}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

