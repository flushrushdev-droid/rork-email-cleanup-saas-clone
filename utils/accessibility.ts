/**
 * Accessibility utilities for standardizing accessibility props across the app
 */

export type AccessibilityRole =
  | 'button'
  | 'text'
  | 'header'
  | 'link'
  | 'searchbox'
  | 'image'
  | 'none'
  | 'adjustable'
  | 'alert'
  | 'checkbox'
  | 'combobox'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'scrollbar'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar';

export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    expanded?: boolean;
    busy?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}

/**
 * Get standardized accessibility props for an element
 */
export function getAccessibilityProps(
  label: string,
  options?: {
    hint?: string;
    role?: AccessibilityRole;
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    expanded?: boolean;
    busy?: boolean;
    value?: { min?: number; max?: number; now?: number; text?: string };
  }
): AccessibilityProps {
  const props: AccessibilityProps = {
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: options?.role || 'none',
  };

  if (options?.hint) {
    props.accessibilityHint = options.hint;
  }

  const state: AccessibilityProps['accessibilityState'] = {};
  if (options?.disabled !== undefined) state.disabled = options.disabled;
  if (options?.selected !== undefined) state.selected = options.selected;
  if (options?.checked !== undefined) state.checked = options.checked;
  if (options?.expanded !== undefined) state.expanded = options.expanded;
  if (options?.busy !== undefined) state.busy = options.busy;

  if (Object.keys(state).length > 0) {
    props.accessibilityState = state;
  }

  if (options?.value) {
    props.accessibilityValue = options.value;
  }

  return props;
}

/**
 * Create accessibility label for dynamic content
 * Example: formatAccessibilityLabel("Email from {sender}", { sender: "John Doe" })
 */
export function formatAccessibilityLabel(
  template: string,
  values: Record<string, string | number>
): string {
  let label = template;
  Object.entries(values).forEach(([key, value]) => {
    label = label.replace(`{${key}}`, String(value));
  });
  return label;
}

/**
 * Common accessibility roles
 */
export const ACCESSIBILITY_ROLES = {
  BUTTON: 'button' as AccessibilityRole,
  TEXT: 'text' as AccessibilityRole,
  HEADER: 'header' as AccessibilityRole,
  LINK: 'link' as AccessibilityRole,
  SEARCHBOX: 'searchbox' as AccessibilityRole,
  IMAGE: 'image' as AccessibilityRole,
  NONE: 'none' as AccessibilityRole,
} as const;

/**
 * Helper to create button accessibility props
 */
export function getButtonAccessibilityProps(
  label: string,
  options?: {
    hint?: string;
    disabled?: boolean;
    busy?: boolean;
  }
): AccessibilityProps {
  return getAccessibilityProps(label, {
    role: ACCESSIBILITY_ROLES.BUTTON,
    hint: options?.hint,
    disabled: options?.disabled,
    busy: options?.busy,
  });
}

/**
 * Helper to create text accessibility props
 */
export function getTextAccessibilityProps(
  label: string,
  options?: {
    role?: AccessibilityRole;
  }
): AccessibilityProps {
  return getAccessibilityProps(label, {
    role: options?.role || ACCESSIBILITY_ROLES.TEXT,
  });
}

/**
 * Helper to create input accessibility props
 * Note: TextInput components on Android don't accept custom accessibilityRole values.
 * They have built-in accessibility support, so we only provide label and hint.
 */
export function getInputAccessibilityProps(
  label: string,
  options?: {
    hint?: string;
    placeholder?: string;
    error?: boolean;
    disabled?: boolean;
  }
): AccessibilityProps {
  const hint = options?.hint || (options?.placeholder ? `Enter ${options.placeholder.toLowerCase()}` : undefined);
  const errorHint = options?.error ? 'This field has an error' : undefined;
  
  // Don't set accessibilityRole for TextInput - Android doesn't accept custom roles
  // TextInput has built-in accessibility support
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: errorHint || hint,
    accessibilityState: options?.disabled ? { disabled: options.disabled } : undefined,
  };
}


