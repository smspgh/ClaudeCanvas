import React, { ReactNode, useEffect, useCallback } from 'react';
import type { ModalComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcModalProps {
  component: ModalComponent;
  dataModel: DataModel;
  onInput: (path: string, value: unknown) => void;
  children?: ReactNode;
}

export function CcModal({ component, dataModel, onInput, children }: CcModalProps) {
  const isOpen = Boolean(getByPointer(dataModel, component.openPath));
  const size = component.size ?? 'medium';
  const dismissible = component.dismissible ?? true;

  const handleBackdropClick = useCallback(() => {
    if (dismissible) {
      onInput(component.openPath, false);
    }
  }, [dismissible, onInput, component.openPath]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && dismissible) {
      onInput(component.openPath, false);
    }
  }, [dismissible, onInput, component.openPath]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="cc-modal-backdrop" onClick={handleBackdropClick}>
      <div
        className={`cc-modal cc-modal-${size}`}
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={component.title ? 'cc-modal-title' : undefined}
      >
        {component.title && (
          <div className="cc-modal-header">
            <h3 id="cc-modal-title" className="cc-modal-title">{component.title}</h3>
            {dismissible && (
              <button
                className="cc-modal-close"
                onClick={() => onInput(component.openPath, false)}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="cc-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}
