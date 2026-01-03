/**
 * JSON Pointer (RFC 6901) implementation for ClaudeCanvas
 */

import { DataModel } from '../types';

/**
 * Get a value from a data model using a JSON Pointer path
 */
export function getByPointer(dataModel: DataModel, path: string): unknown {
  if (!path || path === '/') {
    return dataModel;
  }

  const segments = path.split('/').filter(s => s.length > 0);
  let current: unknown = dataModel;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }

    // Unescape JSON Pointer special characters
    const key = segment.replace(/~1/g, '/').replace(/~0/g, '~');

    if (typeof current === 'object') {
      if (Array.isArray(current)) {
        const index = parseInt(key, 10);
        if (!isNaN(index) && index >= 0 && index < current.length) {
          current = current[index];
        } else {
          return undefined;
        }
      } else {
        current = (current as Record<string, unknown>)[key];
      }
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Set a value in a data model using a JSON Pointer path
 * Returns a new data model with the value set (immutable update)
 */
export function setByPointer(dataModel: DataModel, path: string, value: unknown): DataModel {
  if (!path || path === '/') {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value as DataModel;
    }
    return dataModel;
  }

  const segments = path.split('/').filter(s => s.length > 0);
  return setByPointerRecursive(dataModel, segments, 0, value);
}

function setByPointerRecursive(
  current: DataModel,
  segments: string[],
  index: number,
  value: unknown
): DataModel {
  if (index >= segments.length) {
    return current;
  }

  const key = segments[index].replace(/~1/g, '/').replace(/~0/g, '~');
  const result = { ...current };

  if (index === segments.length - 1) {
    // Last segment - set the value
    result[key] = value;
  } else {
    // Intermediate segment - recurse
    const next = current[key];
    if (typeof next === 'object' && next !== null && !Array.isArray(next)) {
      result[key] = setByPointerRecursive(next as DataModel, segments, index + 1, value);
    } else {
      // Create intermediate object if needed
      result[key] = setByPointerRecursive({}, segments, index + 1, value);
    }
  }

  return result;
}

/**
 * Interpolate path patterns like {item.field} or {index}
 */
export function interpolatePath(path: string, item: unknown, index: number): string {
  let result = path;

  // Replace {index}
  result = result.replace(/\{index\}/g, index.toString());

  // Replace {item} references
  const itemPattern = /\{item\.([^}]+)\}/g;
  result = result.replace(itemPattern, (_, field) => {
    if (typeof item === 'object' && item !== null) {
      return ((item as Record<string, unknown>)[field] ?? '').toString();
    }
    return '';
  });

  // Replace {item} with the whole item
  if (result.includes('{item}')) {
    result = result.replace(/\{item\}/g, item?.toString() ?? '');
  }

  return result;
}

/**
 * Evaluate a computed expression on a value
 */
export function evaluateExpression(expr: string, value: unknown): unknown {
  switch (expr) {
    case 'count':
    case 'length':
      if (Array.isArray(value)) return value.length;
      if (typeof value === 'string') return value.length;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length;
      return 0;

    case 'sum':
      if (Array.isArray(value)) {
        return value.reduce((sum, item) => {
          if (typeof item === 'number') return sum + item;
          return sum;
        }, 0);
      }
      return 0;

    case 'any':
      if (Array.isArray(value)) {
        return value.some(item => item === true || (item !== null && item !== 0));
      }
      return false;

    case 'all':
      if (Array.isArray(value)) {
        return value.every(item => item === true || (item !== null && item !== 0));
      }
      return false;

    case 'none':
      if (Array.isArray(value)) {
        return !value.some(item => item === true || (item !== null && item !== 0));
      }
      return true;

    default:
      return value;
  }
}

let idCounter = 0;

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `cc-${Date.now()}-${idCounter++}`;
}
