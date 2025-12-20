import type { ButtonComponent, DataModel, Action } from '@claude-canvas/core';

export interface CcButtonProps {
  component: ButtonComponent;
  dataModel: DataModel;
  onAction?: (action: Action) => void;
}

export function CcButton({ component, onAction }: CcButtonProps) {
  const variant = component.variant ?? 'primary';

  const handleClick = () => {
    if (component.disabled || component.loading) return;
    onAction?.(component.action);
  };

  return (
    <button
      className={`cc-button ${variant}`}
      onClick={handleClick}
      disabled={component.disabled || component.loading}
    >
      {component.loading ? 'Loading...' : component.label}
    </button>
  );
}
