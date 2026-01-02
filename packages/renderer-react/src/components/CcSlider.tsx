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
  const showValue = component.showValue ?? true;
  const id = `slider-${component.valuePath.replace(/\//g, '-')}`;

  // Calculate percentage for gradient fill
  const percentage = ((value - min) / (max - min)) * 100;
  const trackColor = component.trackColor ?? 'var(--cc-border, #d1d5db)';
  const fillColor = component.fillColor ?? 'var(--cc-primary, #6366f1)';

  // Create gradient background to show filled portion
  const sliderStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${percentage}%, ${trackColor} ${percentage}%, ${trackColor} 100%)`,
  };

  // Custom CSS variable for thumb color + flex from style
  const componentStyle = component.style as Record<string, unknown> | undefined;
  const wrapperStyle: React.CSSProperties = {
    ...(component.fillColor ? { '--slider-thumb-color': fillColor } as React.CSSProperties : {}),
    ...(componentStyle?.flex ? { flex: componentStyle.flex as number } : {}),
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInput?.(component.valuePath, parseFloat(e.target.value));
  };

  const hasHeader = component.label || showValue;

  return (
    <div className="cc-slider" style={wrapperStyle}>
      {hasHeader && (
        <div className="cc-slider-header">
          {component.label ? <label htmlFor={id}>{component.label}</label> : <span />}
          {showValue && <span className="cc-slider-value">{value}</span>}
        </div>
      )}
      <input
        type="range"
        id={id}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={component.disabled}
        onChange={handleChange}
        style={sliderStyle}
      />
    </div>
  );
}
