import React from 'react';
import type { CheckboxComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcCheckboxProps {
  component: CheckboxComponent;
  dataModel: DataModel;
  onInput?: (path: string, value: unknown) => void;
}

export function CcCheckbox({ component, dataModel, onInput }: CcCheckboxProps) {
  const checked = Boolean(getByPointer(dataModel, component.valuePath));
  const id = `checkbox-${component.valuePath.replace(/\//g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInput?.(component.valuePath, e.target.checked);
  };

  return (
    <div className={`cc-checkbox ${component.disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={component.disabled}
        onChange={handleChange}
      />
      {component.label && <label htmlFor={id}>{component.label}</label>}
    </div>
  );
}
