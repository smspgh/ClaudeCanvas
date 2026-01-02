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

/**
 * Interpolate path templates with item data
 * Replaces {item.fieldName} patterns with actual values
 * Example: "/selectedItems/{item.id}" with item {id: "123"} -> "/selectedItems/123"
 */
export function interpolatePath(path: string, item: unknown, index: number): string {
  return path.replace(/\{item\.(\w+)\}/g, (_, field) => {
    if (item && typeof item === 'object') {
      const value = (item as Record<string, unknown>)[field];
      return String(value ?? '');
    }
    return '';
  }).replace(/\{index\}/g, String(index));
}

/**
 * Evaluate a computed expression on a value
 */
export function evaluateExpression(expr: string, value: unknown): unknown {
  switch (expr) {
    case 'length':
      if (Array.isArray(value)) return value.length;
      if (typeof value === 'string') return value.length;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length;
      return 0;

    case 'count':
      // Count truthy values in object or array
      if (Array.isArray(value)) return value.filter(Boolean).length;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).filter(Boolean).length;
      }
      return value ? 1 : 0;

    case 'any':
      // Check if any value is truthy
      if (Array.isArray(value)) return value.some(Boolean);
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(Boolean);
      }
      return Boolean(value);

    case 'all':
      // Check if all values are truthy
      if (Array.isArray(value)) return value.length > 0 && value.every(Boolean);
      if (typeof value === 'object' && value !== null) {
        const vals = Object.values(value);
        return vals.length > 0 && vals.every(Boolean);
      }
      return Boolean(value);

    case 'none':
      // Check if no values are truthy
      if (Array.isArray(value)) return !value.some(Boolean);
      if (typeof value === 'object' && value !== null) {
        return !Object.values(value).some(Boolean);
      }
      return !value;

    case 'sum':
      // Sum numeric values
      if (Array.isArray(value)) {
        return value.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).reduce((acc: number, v) => acc + (typeof v === 'number' ? v : 0), 0);
      }
      return typeof value === 'number' ? value : 0;

    default:
      return value;
  }
}
