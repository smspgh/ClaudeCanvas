import type { BadgeComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcBadgeProps {
  component: BadgeComponent;
  dataModel: DataModel;
}

export function CcBadge({ component, dataModel }: CcBadgeProps) {
  const getContent = (): string => {
    if (component.contentPath) {
      const val = getByPointer(dataModel, component.contentPath);
      return String(val ?? '');
    }
    return component.content ?? '';
  };

  const content = getContent();
  const variant = component.variant ?? 'default';
  const size = component.size ?? 'medium';
  const pill = component.pill ?? false;
  const dot = component.dot ?? false;

  const variantColors: Record<string, { bg: string; text: string }> = {
    default: { bg: 'var(--cc-badge-default-bg, #e5e7eb)', text: 'var(--cc-badge-default-text, #374151)' },
    success: { bg: 'var(--cc-badge-success-bg, #d1fae5)', text: 'var(--cc-badge-success-text, #065f46)' },
    warning: { bg: 'var(--cc-badge-warning-bg, #fef3c7)', text: 'var(--cc-badge-warning-text, #92400e)' },
    error: { bg: 'var(--cc-badge-error-bg, #fee2e2)', text: 'var(--cc-badge-error-text, #991b1b)' },
    info: { bg: 'var(--cc-badge-info-bg, #dbeafe)', text: 'var(--cc-badge-info-text, #1e40af)' },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: { fontSize: '0.625rem', padding: dot ? '4px' : '2px 6px' },
    medium: { fontSize: '0.75rem', padding: dot ? '6px' : '4px 8px' },
    large: { fontSize: '0.875rem', padding: dot ? '8px' : '6px 12px' },
  };

  const colors = variantColors[variant] ?? variantColors.default;
  const backgroundColor = component.color ?? colors.bg;
  const color = component.textColor ?? colors.text;

  return (
    <span
      className={`cc-badge cc-badge-${variant} cc-badge-${size}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor,
        color,
        borderRadius: pill ? '9999px' : '4px',
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
      }}
    >
      {component.icon && <span className="cc-badge-icon">{component.icon}</span>}
      {!dot && content}
    </span>
  );
}
