import React, { ReactNode, useState } from 'react';
import { ScrollView, View, ViewProps, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps extends ViewProps {
	children: ReactNode;
	footer?: ReactNode;
	scroll?: boolean;
	topPadding?: number;
}

export function Screen({ children, footer, scroll = false, topPadding = 48, style, ...rest }: ScreenProps) {
	const insets = useSafeAreaInsets();
	const { height } = useWindowDimensions();
	const [footerHeight, setFooterHeight] = useState(0);

	const content = (
		<View
			style={[
				{
					flexGrow: 1,
					minHeight: height - insets.top - insets.bottom - 1,
					paddingTop: topPadding + insets.top,
					// Keep a minimal padding; actual space is provided by an explicit spacer view
					paddingBottom: footer ? 8 : 0,
				},
				style,
			]}
			{...rest}
		>
			{children}
			{/* Explicit spacer to push content above footer */}
			{footer ? <View style={{ height: footerHeight }} /> : null}
		</View>
	);

	return (
		<SafeAreaView style={{ flex: 1 }} edges={['top']}>
			{scroll ? (
				<ScrollView
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{content}
				</ScrollView>
			) : (
				<View style={{ flex: 1 }}>{content}</View>
			)}

			{footer && (
				<View
					onLayout={(e) => {
						// Use the actual footer container height (including its paddings)
						const h = e.nativeEvent.layout.height;
						// Only update when it changes meaningfully to avoid layout thrash
						if (Math.abs(h - footerHeight) > 2) setFooterHeight(h);
					}}
					style={{
						paddingHorizontal: (style as any)?.paddingHorizontal ?? 0,
						paddingTop: 4,
						// Minimal padding - just the raw inset without extra cushion
						paddingBottom: insets.bottom,
					}}
				>
					{footer}
				</View>
			)}
		</SafeAreaView>
	);
}


