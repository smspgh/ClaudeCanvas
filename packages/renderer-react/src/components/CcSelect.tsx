import React from 'react';
import type { SelectComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcSelectProps {
  component: SelectComponent;
  dataModel: DataModel;
  onInput?: (path: string, value: unknown) => void;
}

export function CcSelect({ component, dataModel, onInput }: CcSelectProps) {
  const value = String(getByPointer(dataModel, component.valuePath) ?? '');
  const id = `select-${component.valuePath.replace(/\//g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onInput?.(component.valuePath, e.target.value);
  };

  return (
    <div className="cc-select">
      {component.label && <label htmlFor={id}>{component.label}</label>}
      <select
        id={id}
        value={value}
        disabled={component.disabled}
        onChange={handleChange}
      >
        {component.placeholder && (
          <option value="" disabled>
            {component.placeholder}
          </option>
        )}
        {component.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
