import React from 'react';
import type { TextFieldComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcTextFieldProps {
  component: TextFieldComponent;
  dataModel: DataModel;
  onInput?: (path: string, value: unknown) => void;
}

export function CcTextField({ component, dataModel, onInput }: CcTextFieldProps) {
  const rawValue = getByPointer(dataModel, component.valuePath);
  // Handle null, undefined, and objects (avoid [object Object])
  const value = (rawValue === null || rawValue === undefined || typeof rawValue === 'object')
    ? ''
    : String(rawValue);
  const id = `textfield-${component.valuePath.replace(/\//g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onInput?.(component.valuePath, e.target.value);
  };

  // Support labelStyle for custom label styling
  const comp = component as TextFieldComponent & { labelStyle?: React.CSSProperties };
  const labelStyle: React.CSSProperties = comp.labelStyle ?? {};

  return (
    <div className="cc-text-field">
      {component.label && <label htmlFor={id} style={labelStyle}>{component.label}</label>}
      {component.multiline ? (
        <textarea
          id={id}
          value={value}
          placeholder={component.placeholder}
          disabled={component.disabled}
          required={component.required}
          rows={component.rows ?? 3}
          onChange={handleChange}
        />
      ) : (
        <input
          id={id}
          type={component.inputType ?? 'text'}
          value={value}
          placeholder={component.placeholder}
          disabled={component.disabled}
          required={component.required}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
