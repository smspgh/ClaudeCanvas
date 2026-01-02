import React, { useState } from 'react';
import type { ImageComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcImageProps {
  component: ImageComponent;
  dataModel: DataModel;
}

export function CcImage({ component, dataModel }: CcImageProps) {
  const [imageError, setImageError] = useState(false);

  const src = component.src ??
    (component.srcPath ? String(getByPointer(dataModel, component.srcPath) ?? '') : '');
  const fit = component.fit ?? 'cover';
  const alt = component.alt ?? '';
  const componentStyle = component.style as Record<string, unknown> | undefined;

  // Check if dimensions are specified in style
  const hasSize = componentStyle?.width || componentStyle?.height;
  const wrapperStyle: React.CSSProperties = hasSize ? {
    width: typeof componentStyle?.width === 'number' ? `${componentStyle.width}px` : (componentStyle?.width as string) ?? 'auto',
    height: typeof componentStyle?.height === 'number' ? `${componentStyle.height}px` : (componentStyle?.height as string) ?? 'auto',
    borderRadius: typeof componentStyle?.borderRadius === 'number' ? `${componentStyle.borderRadius}px` : (componentStyle?.borderRadius as string) ?? 0,
    overflow: 'hidden',
    display: 'inline-block',
  } : {};

  const renderPlaceholder = (message: string) => (
    <div className="cc-image" style={wrapperStyle}>
      <div className="cc-image-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );

  if (!src) {
    return renderPlaceholder('No image');
  }

  if (imageError) {
    return renderPlaceholder(alt || 'Image not available');
  }

  const imgStyle: React.CSSProperties = hasSize ? {
    width: '100%',
    height: '100%',
    objectFit: fit,
  } : {};

  return (
    <div className="cc-image" style={wrapperStyle}>
      <img
        src={src}
        alt={alt}
        className={hasSize ? '' : fit}
        style={imgStyle}
        loading="lazy"
        onError={() => setImageError(true)}
        onLoad={() => setImageError(false)}
      />
    </div>
  );
}
