import React from 'react';
import { Platform, Text, TextProps } from 'react-native';

export function AppText(props: TextProps) {
	return (
		<Text
			allowFontScaling
			maxFontSizeMultiplier={1.25}
			{...(Platform.OS === 'android' ? { includeFontPadding: false, textBreakStrategy: 'simple' as any } : {})}
			// Keep a reasonable default lineHeight to avoid glyph clipping; allow overrides via props.style
			style={[
				{ lineHeight: 1.25 * ((props.style as any)?.fontSize ?? 16) },
				props.style,
			]}
			{...props}
		/>
	);
}



