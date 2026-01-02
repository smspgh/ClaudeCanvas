import type { AlertComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcAlertProps {
  component: AlertComponent;
  dataModel: DataModel;
  onInput: (path: string, value: unknown) => void;
}

export function CcAlert({ component, dataModel, onInput }: CcAlertProps) {
  const variant = component.variant ?? 'info';
  const showIcon = component.showIcon ?? true;
  const dismissible = component.dismissible ?? false;

  const getMessage = (): string => {
    if (component.messagePath) {
      const value = getByPointer(dataModel, component.messagePath);
      return String(value ?? '');
    }
    return component.message ?? '';
  };

  const isOpen = (): boolean => {
    if (component.openPath) {
      return Boolean(getByPointer(dataModel, component.openPath));
    }
    return true;
  };

  const handleDismiss = () => {
    if (component.openPath) {
      onInput(component.openPath, false);
    }
  };

  if (!isOpen()) return null;

  const variantStyles: Record<string, { bg: string; border: string; text: string }> = {
    info: { bg: 'var(--cc-alert-info-bg, #dbeafe)', border: 'var(--cc-alert-info-border, #93c5fd)', text: 'var(--cc-alert-info-text, #1e40af)' },
    success: { bg: 'var(--cc-alert-success-bg, #d1fae5)', border: 'var(--cc-alert-success-border, #6ee7b7)', text: 'var(--cc-alert-success-text, #065f46)' },
    warning: { bg: 'var(--cc-alert-warning-bg, #fef3c7)', border: 'var(--cc-alert-warning-border, #fcd34d)', text: 'var(--cc-alert-warning-text, #92400e)' },
    error: { bg: 'var(--cc-alert-error-bg, #fee2e2)', border: 'var(--cc-alert-error-border, #fca5a5)', text: 'var(--cc-alert-error-text, #991b1b)' },
  };

  const icons: Record<string, string> = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
  };

  const styles = variantStyles[variant] ?? variantStyles.info;
  const message = getMessage();

  return (
    <div
      className={`cc-alert cc-alert-${variant}`}
      role="alert"
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 8,
        border: `1px solid ${styles.border}`,
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      {showIcon && (
        <span className="cc-alert-icon material-icons" style={{ fontSize: '1.25rem', flexShrink: 0 }}>
          {icons[variant]}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {component.title && (
          <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: '0 0 4px' }}>
            {component.title}
          </p>
        )}
        <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
          {message}
        </p>
      </div>
      {dismissible && (
        <button
          className="cc-alert-close"
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.6,
            fontSize: '1.25rem',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
