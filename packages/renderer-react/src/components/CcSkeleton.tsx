import type { SkeletonComponent, DataModel } from '@claude-canvas/core';

export interface CcSkeletonProps {
  component: SkeletonComponent;
  dataModel: DataModel;
}

export function CcSkeleton({ component }: CcSkeletonProps) {
  const variant = component.variant ?? 'rectangular';
  const animation = component.animation ?? 'pulse';
  const lines = component.lines ?? 1;

  const getWidth = (): string => {
    const width = component.width;
    if (width === undefined) return '100%';
    return typeof width === 'number' ? `${width}px` : width;
  };

  const getHeight = (): string => {
    const height = component.height;
    if (height !== undefined) {
      return typeof height === 'number' ? `${height}px` : height;
    }
    switch (variant) {
      case 'text': return '1em';
      case 'circular': return getWidth();
      default: return '100px';
    }
  };

  const width = getWidth();
  const height = getHeight();

  const baseStyle: React.CSSProperties = {
    background: 'var(--cc-skeleton-bg, #e5e7eb)',
    position: 'relative',
    overflow: 'hidden',
  };

  const animationStyle: React.CSSProperties = animation === 'pulse'
    ? { animation: 'cc-skeleton-pulse 1.5s ease-in-out infinite' }
    : {};

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className="cc-skeleton-lines" style={{ display: 'flex', flexDirection: 'column', gap: 8, width }}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`cc-skeleton cc-skeleton-text cc-skeleton-${animation}`}
            style={{
              ...baseStyle,
              ...animationStyle,
              height,
              borderRadius: 4,
              width: i === lines - 1 ? '60%' : '100%',
            }}
          >
            {animation === 'wave' && <div className="cc-skeleton-wave" />}
          </div>
        ))}
      </div>
    );
  }

  const variantStyle: React.CSSProperties = {
    ...(variant === 'text' && { borderRadius: 4 }),
    ...(variant === 'circular' && { borderRadius: '50%' }),
    ...(variant === 'rectangular' && { borderRadius: 4 }),
  };

  return (
    <div
      className={`cc-skeleton cc-skeleton-${variant} cc-skeleton-${animation}`}
      style={{
        ...baseStyle,
        ...animationStyle,
        ...variantStyle,
        width,
        height,
      }}
    >
      {animation === 'wave' && (
        <div
          className="cc-skeleton-wave"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation: 'cc-skeleton-wave 1.5s linear infinite',
          }}
        />
      )}
    </div>
  );
}
