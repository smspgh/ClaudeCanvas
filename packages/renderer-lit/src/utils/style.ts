/**
 * Style utilities for Lit components
 */

import type { ComponentStyle } from '@claude-canvas/core';

/**
 * Convert a style object to a CSS string
 * Handles camelCase to kebab-case conversion
 */
export function styleToString(style: ComponentStyle): string {
  return Object.entries(style)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      // Handle numeric values that need units
      const cssValue = typeof value === 'number' && !unitlessProperties.has(key)
        ? `${value}px`
        : String(value);
      return `${cssKey}: ${cssValue}`;
    })
    .join('; ');
}

/**
 * CSS properties that don't need a unit suffix
 */
const unitlessProperties = new Set([
  'flex',
  'flexGrow',
  'flexShrink',
  'fontWeight',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'widows',
  'zIndex',
  'zoom',
]);
