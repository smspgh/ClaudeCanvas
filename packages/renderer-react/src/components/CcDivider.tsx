import type { DividerComponent, DataModel } from '@claude-canvas/core';

export interface CcDividerProps {
  component: DividerComponent;
  dataModel: DataModel;
}

export function CcDivider({ component }: CcDividerProps) {
  return (
    <hr className={`cc-divider ${component.vertical ? 'vertical' : 'horizontal'}`} />
  );
}
