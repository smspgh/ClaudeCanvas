import React from 'react';
import type { DateTimeInputComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcDateTimeInputProps {
  component: DateTimeInputComponent;
  dataModel: DataModel;
  onInput?: (path: string, value: unknown) => void;
}

export function CcDateTimeInput({ component, dataModel, onInput }: CcDateTimeInputProps) {
  const rawValue = getByPointer(dataModel, component.valuePath);
  const value = typeof rawValue === 'string' ? rawValue : '';

  const enableDate = component.enableDate ?? true;
  const enableTime = component.enableTime ?? false;
  const id = `datetime-${component.valuePath.replace(/\//g, '-')}`;

  const getDateValue = (): string => {
    if (!value) return '';
    return value.split('T')[0] || '';
  };

  const getTimeValue = (): string => {
    if (!value) return '';
    const timePart = value.split('T')[1];
    if (timePart) {
      return timePart.substring(0, 5);
    }
    return '';
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    const timeValue = getTimeValue() || '00:00';
    const newValue = enableTime ? `${dateValue}T${timeValue}` : dateValue;
    onInput?.(component.valuePath, newValue);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    const dateValue = getDateValue() || new Date().toISOString().split('T')[0];
    const newValue = `${dateValue}T${timeValue}`;
    onInput?.(component.valuePath, newValue);
  };

  return (
    <div className="cc-datetime-input">
      {component.label && <label htmlFor={id}>{component.label}</label>}
      <div className="cc-datetime-inputs">
        {enableDate && (
          <input
            type="date"
            id={id}
            value={getDateValue()}
            min={component.minDate || ''}
            max={component.maxDate || ''}
            disabled={component.disabled}
            onChange={handleDateChange}
          />
        )}
        {enableTime && (
          <input
            type="time"
            id={enableDate ? `${id}-time` : id}
            value={getTimeValue()}
            disabled={component.disabled}
            onChange={handleTimeChange}
          />
        )}
      </div>
    </div>
  );
}
