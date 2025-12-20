import React from 'react';
import type { SliderComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcSliderProps {
  component: SliderComponent;
  dataModel: DataModel;
  onInput?: (path: string, value: unknown) => void;
}

export function CcSlider({ component, dataModel, onInput }: CcSliderProps) {
  const rawValue = getByPointer(dataModel, component.valuePath);
  const value = typeof rawValue === 'number' ? rawValue : (component.min ?? 0);
  const min = component.min ?? 0;
  const max = component.max ?? 100;
  const step = component.step ?? 1;
  const id = `slider-${component.valuePath.replace(/\//g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInput?.(component.valuePath, parseFloat(e.target.value));
  };

  return (
    <div className="cc-slider">
      <div className="cc-slider-header">
        {component.label ? <label htmlFor={id}>{component.label}</label> : <span />}
        <span className="cc-slider-value">{value}</span>
      </div>
      <input
        type="range"
        id={id}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={component.disabled}
        onChange={handleChange}
      />
    </div>
  );
}
