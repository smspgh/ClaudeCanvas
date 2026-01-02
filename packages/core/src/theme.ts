/**
 * ClaudeCanvas Theme Token System
 * Provides a standardized way to define and apply themes across renderers
 */

// =============================================================================
// Color Tokens
// =============================================================================

export interface ColorTokens {
  // Primary brand colors
  primary: string;
  primaryHover: string;
  primaryLight: string;

  // Secondary/neutral colors
  secondary: string;
  secondaryHover: string;

  // Semantic colors
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceHover: string;

  // Border colors
  border: string;
  borderLight: string;
  borderFocus: string;

  // Overlay/backdrop
  overlay: string;
}

// =============================================================================
// Typography Tokens
// =============================================================================

export interface TypographyTokens {
  fontFamily: string;
  fontFamilyMono: string;

  // Font sizes
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeMd: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSize2xl: string;
  fontSize3xl: string;

  // Font weights
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightSemibold: number;
  fontWeightBold: number;

  // Line heights
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;
}

// =============================================================================
// Spacing Tokens
// =============================================================================

export interface SpacingTokens {
  space0: string;
  space1: string;  // 4px
  space2: string;  // 8px
  space3: string;  // 12px
  space4: string;  // 16px
  space5: string;  // 20px
  space6: string;  // 24px
  space8: string;  // 32px
  space10: string; // 40px
  space12: string; // 48px
  space16: string; // 64px
}

// =============================================================================
// Border Radius Tokens
// =============================================================================

export interface RadiusTokens {
  radiusNone: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;
  radiusFull: string;
}

// =============================================================================
// Shadow Tokens
// =============================================================================

export interface ShadowTokens {
  shadowNone: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
}

// =============================================================================
// Transition Tokens
// =============================================================================

export interface TransitionTokens {
  transitionFast: string;
  transitionNormal: string;
  transitionSlow: string;
  easeDefault: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
}

// =============================================================================
// Complete Theme
// =============================================================================

export interface Theme {
  name: string;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  transitions: TransitionTokens;
}

// =============================================================================
// Default Light Theme
// =============================================================================

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryLight: 'rgba(99, 102, 241, 0.1)',

    secondary: '#f1f5f9',
    secondaryHover: '#e2e8f0',

    success: '#22c55e',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#3b82f6',
    infoLight: '#dbeafe',

    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',

    background: '#f8fafc',
    backgroundSecondary: '#f1f5f9',
    surface: '#ffffff',
    surfaceHover: '#f8fafc',

    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderFocus: '#6366f1',

    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    fontFamilyMono: "'SF Mono', 'Fira Code', 'Fira Mono', Consolas, monospace",

    fontSizeXs: '0.75rem',
    fontSizeSm: '0.875rem',
    fontSizeMd: '1rem',
    fontSizeLg: '1.125rem',
    fontSizeXl: '1.25rem',
    fontSize2xl: '1.5rem',
    fontSize3xl: '2rem',

    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,

    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
  },
  spacing: {
    space0: '0',
    space1: '0.25rem',
    space2: '0.5rem',
    space3: '0.75rem',
    space4: '1rem',
    space5: '1.25rem',
    space6: '1.5rem',
    space8: '2rem',
    space10: '2.5rem',
    space12: '3rem',
    space16: '4rem',
  },
  radius: {
    radiusNone: '0',
    radiusSm: '0.25rem',
    radiusMd: '0.5rem',
    radiusLg: '0.75rem',
    radiusXl: '1rem',
    radiusFull: '9999px',
  },
  shadows: {
    shadowNone: 'none',
    shadowSm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    shadowMd: '0 4px 6px rgba(0, 0, 0, 0.1)',
    shadowLg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    shadowXl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },
  transitions: {
    transitionFast: '150ms',
    transitionNormal: '200ms',
    transitionSlow: '300ms',
    easeDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// =============================================================================
// Default Dark Theme
// =============================================================================

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#818cf8',
    primaryHover: '#6366f1',
    primaryLight: 'rgba(129, 140, 248, 0.15)',

    secondary: '#374151',
    secondaryHover: '#4b5563',

    success: '#34d399',
    successLight: 'rgba(52, 211, 153, 0.15)',
    warning: '#fbbf24',
    warningLight: 'rgba(251, 191, 36, 0.15)',
    error: '#f87171',
    errorLight: 'rgba(248, 113, 113, 0.15)',
    info: '#60a5fa',
    infoLight: 'rgba(96, 165, 250, 0.15)',

    text: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    textInverse: '#1f2937',

    background: '#111827',
    backgroundSecondary: '#1f2937',
    surface: '#1f2937',
    surfaceHover: '#374151',

    border: '#374151',
    borderLight: '#4b5563',
    borderFocus: '#818cf8',

    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  radius: lightTheme.radius,
  shadows: {
    shadowNone: 'none',
    shadowSm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    shadowMd: '0 4px 6px rgba(0, 0, 0, 0.4)',
    shadowLg: '0 10px 15px rgba(0, 0, 0, 0.4)',
    shadowXl: '0 20px 25px rgba(0, 0, 0, 0.5)',
  },
  transitions: lightTheme.transitions,
};

// =============================================================================
// Theme Utilities
// =============================================================================

/**
 * Convert theme tokens to CSS custom properties
 */
export function themeToCssVariables(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars[`--cc-${camelToKebab(key)}`] = value;
  });

  // Typography
  vars['--cc-font'] = theme.typography.fontFamily;
  vars['--cc-font-mono'] = theme.typography.fontFamilyMono;
  vars['--cc-font-size-xs'] = theme.typography.fontSizeXs;
  vars['--cc-font-size-sm'] = theme.typography.fontSizeSm;
  vars['--cc-font-size-md'] = theme.typography.fontSizeMd;
  vars['--cc-font-size-lg'] = theme.typography.fontSizeLg;
  vars['--cc-font-size-xl'] = theme.typography.fontSizeXl;
  vars['--cc-font-size-2xl'] = theme.typography.fontSize2xl;
  vars['--cc-font-size-3xl'] = theme.typography.fontSize3xl;

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    vars[`--cc-${camelToKebab(key)}`] = value;
  });

  // Radius
  Object.entries(theme.radius).forEach(([key, value]) => {
    vars[`--cc-${camelToKebab(key)}`] = value;
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    vars[`--cc-${camelToKebab(key)}`] = value;
  });

  // Transitions
  vars['--cc-transition-fast'] = theme.transitions.transitionFast;
  vars['--cc-transition-normal'] = theme.transitions.transitionNormal;
  vars['--cc-transition-slow'] = theme.transitions.transitionSlow;

  return vars;
}

/**
 * Generate CSS string from theme
 */
export function themeToCSS(theme: Theme, selector = ':root'): string {
  const vars = themeToCssVariables(theme);
  const properties = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  return `${selector} {\n${properties}\n}`;
}

/**
 * Apply theme to an element
 */
export function applyTheme(element: HTMLElement, theme: Theme): void {
  const vars = themeToCssVariables(theme);
  Object.entries(vars).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

/**
 * Create a custom theme by merging with defaults
 */
export function createTheme(
  overrides: Partial<Theme> & { colors?: Partial<ColorTokens> },
  base: Theme = lightTheme
): Theme {
  return {
    name: overrides.name ?? base.name,
    colors: { ...base.colors, ...overrides.colors },
    typography: { ...base.typography, ...overrides.typography },
    spacing: { ...base.spacing, ...overrides.spacing },
    radius: { ...base.radius, ...overrides.radius },
    shadows: { ...base.shadows, ...overrides.shadows },
    transitions: { ...base.transitions, ...overrides.transitions },
  };
}

// Helper: Convert camelCase to kebab-case
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
