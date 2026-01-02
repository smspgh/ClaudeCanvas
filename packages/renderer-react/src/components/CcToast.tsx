import { useEffect, useCallback } from 'react';
import type { ToastComponent, DataModel, Action } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcToastProps {
  component: ToastComponent;
  dataModel: DataModel;
  onInput: (path: string, value: unknown) => void;
  onAction?: (action: Action) => void;
}

export function CcToast({ component, dataModel, onInput, onAction }: CcToastProps) {
  const isOpen = Boolean(getByPointer(dataModel, component.openPath));
  const variant = component.variant ?? 'info';
  const position = component.position ?? 'bottom-right';
  const duration = component.duration ?? 5000;
  const dismissible = component.dismissible ?? true;

  const getMessage = (): string => {
    if (component.messagePath) {
      const val = getByPointer(dataModel, component.messagePath);
      return String(val ?? '');
    }
    return component.message ?? '';
  };

  const handleDismiss = useCallback(() => {
    onInput(component.openPath, false);
  }, [onInput, component.openPath]);

  const handleActionClick = useCallback(() => {
    if (component.action && onAction) {
      onAction(component.action);
    }
    handleDismiss();
  }, [component.action, onAction, handleDismiss]);

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(handleDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, handleDismiss]);

  if (!isOpen) return null;

  const variantStyles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: 'info' },
    success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', icon: 'check_circle' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: 'warning' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: 'error' },
  };

  const icons: Record<string, string> = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
  };

  const styles = variantStyles[variant] ?? variantStyles.info;

  const positionStyles: Record<string, React.CSSProperties> = {
    'top': { top: 16, left: '50%', transform: 'translateX(-50%)' },
    'top-left': { top: 16, left: 16 },
    'top-right': { top: 16, right: 16 },
    'bottom': { bottom: 16, left: '50%', transform: 'translateX(-50%)' },
    'bottom-left': { bottom: 16, left: 16 },
    'bottom-right': { bottom: 16, right: 16 },
  };

  return (
    <div
      className={`cc-toast cc-toast-${variant}`}
      role="alert"
      style={{
        position: 'fixed',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        color: styles.text,
        minWidth: 280,
        maxWidth: 400,
        animation: 'cc-toast-slide-in 0.3s ease',
        ...positionStyles[position],
      }}
    >
      <span className="cc-toast-icon material-icons" style={{ fontSize: 20 }}>
        {icons[variant]}
      </span>
      <span className="cc-toast-message" style={{ flex: 1, fontSize: '0.875rem' }}>
        {getMessage()}
      </span>
      {component.actionLabel && (
        <button
          className="cc-toast-action"
          onClick={handleActionClick}
          style={{
            background: 'transparent',
            border: 'none',
            color: styles.border,
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          {component.actionLabel}
        </button>
      )}
      {dismissible && (
        <button
          className="cc-toast-close"
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            background: 'transparent',
            border: 'none',
            color: styles.text,
            fontSize: 18,
            cursor: 'pointer',
            padding: 4,
            opacity: 0.6,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
