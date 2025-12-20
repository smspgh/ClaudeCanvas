import React from 'react';
import type { TextFieldComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcTextFieldProps {
  component: TextFieldComponent;
  dataModel: DataModel;
  onInput?: (path: string, value: unknown) => void;
}

export function CcTextField({ component, dataModel, onInput }: CcTextFieldProps) {
  const value = String(getByPointer(dataModel, component.valuePath) ?? '');
  const id = `textfield-${component.valuePath.replace(/\//g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onInput?.(component.valuePath, e.target.value);
  };

  return (
    <div className="cc-text-field">
      {component.label && <label htmlFor={id}>{component.label}</label>}
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
