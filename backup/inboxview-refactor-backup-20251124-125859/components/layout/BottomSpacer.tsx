import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BottomSpacer({ extra = 16 }: { extra?: number }) {
	const insets = useSafeAreaInsets();
	const height = (Platform.OS === 'ios' || Platform.OS === 'android') ? insets.bottom + extra : extra;
	return <View style={{ height }} />;
}



