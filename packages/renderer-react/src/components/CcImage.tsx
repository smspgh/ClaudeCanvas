import { useState } from 'react';
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

  const renderPlaceholder = (message: string) => (
    <div className="cc-image">
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

  return (
    <div className="cc-image">
      <img
        src={src}
        alt={alt}
        className={fit}
        loading="lazy"
        onError={() => setImageError(true)}
        onLoad={() => setImageError(false)}
      />
    </div>
  );
}
