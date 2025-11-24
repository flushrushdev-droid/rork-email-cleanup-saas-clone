import React from 'react';
import { Platform, Text, TextProps } from 'react-native';
import { getTextAccessibilityProps, type AccessibilityRole } from '@/utils/accessibility';

export interface AppTextProps extends TextProps {
	/**
	 * Accessibility label for screen readers (if different from text content)
	 */
	accessibilityLabel?: string;
	/**
	 * Accessibility role for the text element
	 */
	accessibilityRole?: AccessibilityRole;
	/**
	 * Accessibility hint to provide additional context
	 */
	accessibilityHint?: string;
}

export function AppText({ 
	accessibilityLabel, 
	accessibilityRole, 
	accessibilityHint,
	children,
	...props 
}: AppTextProps) {
	// If accessibilityLabel is provided, use it; otherwise use children as label
	const shouldBeAccessible = accessibilityLabel !== undefined || accessibilityRole !== undefined;
	
	const accessibilityProps = shouldBeAccessible
		? getTextAccessibilityProps(
				accessibilityLabel || (typeof children === 'string' ? children : ''),
				{ role: accessibilityRole }
		  )
		: {};

	if (accessibilityHint) {
		accessibilityProps.accessibilityHint = accessibilityHint;
	}

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
			{...accessibilityProps}
			{...props}
		>
			{children}
		</Text>
	);
}



