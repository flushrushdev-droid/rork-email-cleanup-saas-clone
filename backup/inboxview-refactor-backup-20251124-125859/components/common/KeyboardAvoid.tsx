import React, { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = { children: ReactNode; extraOffset?: number };

export function KeyboardAvoid({ children, extraOffset = 0 }: Props) {
	const insets = useSafeAreaInsets();
	const keyboardVerticalOffset = (insets.top || 0) + 16 + extraOffset;

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardVerticalOffset : 0}
			style={{ flex: 1 }}
		>
			{children}
		</KeyboardAvoidingView>
	);
}


