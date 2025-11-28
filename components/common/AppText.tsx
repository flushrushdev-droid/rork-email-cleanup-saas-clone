import React from 'react';
import { Platform, Text, TextProps } from 'react-native';
import { getTextAccessibilityProps, type AccessibilityRole } from '@/utils/accessibility';
import { 
	getMaxFontSizeMultiplier, 
	type MaxFontSizeMultiplierKey,
	getLineHeight,
	type FontSizeKey,
	getScaledFontSize,
} from '@/utils/typography';

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
	/**
	 * Maximum font size multiplier for this text element
	 * Controls how much the font can scale with Dynamic Type
	 * Can be a predefined type or a custom number
	 */
	maxFontSizeMultiplier?: MaxFontSizeMultiplierKey | number;
	/**
	 * Whether to allow font scaling (default: true)
	 * Set to false only for UI elements that must maintain exact size (logos, icons)
	 */
	allowFontScaling?: boolean;
	/**
	 * Dynamic Type style category (iOS)
	 * Maps to iOS UIFontTextStyle categories for better Dynamic Type support
	 */
	dynamicTypeStyle?: FontSizeKey;
}

/**
 * AppText - Enhanced Text component with full Dynamic Type support
 * 
 * Features:
 * - iOS Dynamic Type support with configurable max scaling
 * - Android font scaling via allowFontScaling
 * - Automatic line height calculation for readability
 * - Accessibility built-in
 * 
 * @example
 * <AppText dynamicTypeStyle="body" maxFontSizeMultiplier="body">
 *   This text will scale with user's accessibility settings
 * </AppText>
 */
export function AppText({ 
	accessibilityLabel, 
	accessibilityRole, 
	accessibilityHint,
	children,
	maxFontSizeMultiplier = 'default',
	allowFontScaling = true,
	dynamicTypeStyle,
	style,
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

	// Determine max font size multiplier
	const maxMultiplier = typeof maxFontSizeMultiplier === 'string'
		? getMaxFontSizeMultiplier(maxFontSizeMultiplier)
		: maxFontSizeMultiplier;

	// Extract fontSize from style if provided
	const styleObj = Array.isArray(style) ? Object.assign({}, ...style) : (style || {});
	const fontSize = (styleObj && typeof styleObj === 'object' && 'fontSize' in styleObj && typeof styleObj.fontSize === 'number')
		? styleObj.fontSize
		: undefined;

	// Calculate line height - use provided lineHeight or calculate from fontSize
	const baseFontSize = fontSize || (dynamicTypeStyle ? getScaledFontSize(dynamicTypeStyle) : 16);
	const hasLineHeight = styleObj && typeof styleObj === 'object' && 'lineHeight' in styleObj && typeof styleObj.lineHeight === 'number';
	const lineHeightMultiplier = fontSize && hasLineHeight ? undefined : 
		(dynamicTypeStyle === 'title1' || dynamicTypeStyle === 'title2' || dynamicTypeStyle === 'title3' || dynamicTypeStyle === 'largeTitle' ? 1.2 : 1.4);
	
	const defaultLineHeight = lineHeightMultiplier ? getLineHeight(baseFontSize, lineHeightMultiplier) : undefined;

	// Apply dynamic type style if specified
	const dynamicStyle = dynamicTypeStyle && !fontSize ? {
		fontSize: getScaledFontSize(dynamicTypeStyle),
	} : {};

	return (
		<Text
			allowFontScaling={allowFontScaling}
			maxFontSizeMultiplier={maxMultiplier}
			{...(Platform.OS === 'android' ? { includeFontPadding: false, textBreakStrategy: 'simple' as 'simple' } : {})}
			style={[
				defaultLineHeight && { lineHeight: defaultLineHeight },
				dynamicStyle,
				style,
			]}
			{...accessibilityProps}
			{...props}
		>
			{children}
		</Text>
	);
}



