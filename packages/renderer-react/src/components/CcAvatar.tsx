import { useState } from 'react';
import type { AvatarComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcAvatarProps {
  component: AvatarComponent;
  dataModel: DataModel;
}

export function CcAvatar({ component, dataModel }: CcAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const getSrc = (): string | undefined => {
    if (component.srcPath) {
      const val = getByPointer(dataModel, component.srcPath);
      return typeof val === 'string' ? val : undefined;
    }
    return component.src;
  };

  const getInitials = (): string => {
    if (component.initialsPath) {
      const val = getByPointer(dataModel, component.initialsPath);
      return String(val ?? '').slice(0, 2).toUpperCase();
    }
    return (component.initials ?? '').slice(0, 2).toUpperCase();
  };

  const src = getSrc();
  const initials = getInitials();
  const size = component.size ?? 'medium';
  const shape = component.shape ?? 'circle';
  const status = component.status;
  const color = component.color ?? 'var(--cc-avatar-bg, #9ca3af)';

  const sizeMap: Record<string, number> = {
    small: 32,
    medium: 40,
    large: 56,
  };

  const sizePx = typeof size === 'number' ? size : sizeMap[size] ?? 40;

  const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? '8px' : '0';

  const statusColors: Record<string, string> = {
    online: '#22c55e',
    offline: '#9ca3af',
    busy: '#ef4444',
    away: '#f59e0b',
  };

  const statusSize = sizePx * 0.3;

  return (
    <div
      className={`cc-avatar cc-avatar-${typeof size === 'string' ? size : 'custom'}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: sizePx,
        height: sizePx,
      }}
    >
      <div
        style={{
          width: sizePx,
          height: sizePx,
          borderRadius,
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          color: 'white',
          fontWeight: 600,
          fontSize: sizePx * 0.4,
        }}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={component.alt ?? ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          initials || (
            <svg
              width={sizePx * 0.6}
              height={sizePx * 0.6}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )
        )}
      </div>
      {status && (
        <span
          className={`cc-avatar-status cc-avatar-status-${status}`}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: statusSize,
            height: statusSize,
            borderRadius: '50%',
            backgroundColor: statusColors[status] ?? statusColors.offline,
            border: '2px solid white',
          }}
        />
      )}
    </div>
  );
}
