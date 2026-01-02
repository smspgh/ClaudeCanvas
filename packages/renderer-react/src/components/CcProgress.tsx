import type { ProgressComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcProgressProps {
  component: ProgressComponent;
  dataModel: DataModel;
}

export function CcProgress({ component, dataModel }: CcProgressProps) {
  const getValue = (): number | undefined => {
    if (component.valuePath) {
      const val = getByPointer(dataModel, component.valuePath);
      return typeof val === 'number' ? val : undefined;
    }
    return component.value;
  };

  const value = getValue();
  const variant = component.variant ?? 'linear';
  const size = component.size ?? 'medium';
  const isIndeterminate = value === undefined;
  const showLabel = component.showLabel ?? false;

  const sizeMap = {
    small: variant === 'linear' ? 4 : 24,
    medium: variant === 'linear' ? 8 : 40,
    large: variant === 'linear' ? 12 : 56,
  };

  const sizePx = sizeMap[size];
  const color = component.color ?? 'var(--cc-primary, #3b82f6)';
  const trackColor = component.trackColor ?? 'var(--cc-progress-track, #e5e7eb)';

  if (variant === 'circular') {
    const strokeWidth = size === 'small' ? 3 : size === 'large' ? 5 : 4;
    const radius = (sizePx - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = isIndeterminate ? 0 : circumference - (circumference * (value ?? 0)) / 100;

    return (
      <div
        className={`cc-progress cc-progress-circular cc-progress-${size}`}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: sizePx,
          height: sizePx,
          position: 'relative',
        }}
      >
        <svg
          width={sizePx}
          height={sizePx}
          style={{
            transform: 'rotate(-90deg)',
            animation: isIndeterminate ? 'cc-spin 1s linear infinite' : undefined,
          }}
        >
          <circle
            cx={sizePx / 2}
            cy={sizePx / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={sizePx / 2}
            cy={sizePx / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: isIndeterminate ? undefined : 'stroke-dashoffset 0.3s ease',
            }}
          />
        </svg>
        {showLabel && !isIndeterminate && (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: size === 'small' ? '0.5rem' : size === 'large' ? '0.875rem' : '0.625rem',
              fontWeight: 600,
            }}
          >
            {component.label ?? `${Math.round(value ?? 0)}%`}
          </span>
        )}
      </div>
    );
  }

  // Linear variant
  return (
    <div
      className={`cc-progress cc-progress-linear cc-progress-${size}`}
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: '100%',
        height: sizePx,
        backgroundColor: trackColor,
        borderRadius: sizePx / 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: '100%',
          backgroundColor: color,
          borderRadius: sizePx / 2,
          transition: isIndeterminate ? undefined : 'width 0.3s ease',
          width: isIndeterminate ? '30%' : `${value}%`,
          animation: isIndeterminate ? 'cc-indeterminate 1.5s ease-in-out infinite' : undefined,
        }}
      />
      {showLabel && !isIndeterminate && (
        <span
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          {component.label ?? `${Math.round(value ?? 0)}%`}
        </span>
      )}
    </div>
  );
}
