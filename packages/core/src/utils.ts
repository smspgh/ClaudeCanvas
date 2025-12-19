/**
 * Utility functions for ClaudeCanvas
 */

import type { JsonPointer, DataModel } from './types.js';

/**
 * Get a value from a data model using a JSON pointer
 */
export function getByPointer(data: DataModel, pointer: JsonPointer): unknown {
  if (pointer === '/') return data;

  const parts = pointer.split('/').filter(Boolean);
  let current: unknown = data;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Set a value in a data model using a JSON pointer
 * Returns a new data model (immutable update)
 */
export function setByPointer(data: DataModel, pointer: JsonPointer, value: unknown): DataModel {
  if (pointer === '/') {
    return value as DataModel;
  }

  const parts = pointer.split('/').filter(Boolean);
  const result = { ...data };
  let current: Record<string, unknown> = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const existing = current[part];
    current[part] = typeof existing === 'object' && existing !== null
      ? { ...existing as Record<string, unknown> }
      : {};
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
  return result;
}

/**
 * Validate that a component type is supported
 */
export function isValidComponentType(type: string): boolean {
  const validTypes = [
    'Row', 'Column', 'Card', 'Divider',
    'Text', 'Image', 'Icon',
    'TextField', 'Checkbox', 'Select', 'Slider',
    'Button', 'Link', 'List'
  ];
  return validTypes.includes(type);
}

/**
 * Generate a unique ID for components
 */
export function generateId(prefix = 'cc'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
