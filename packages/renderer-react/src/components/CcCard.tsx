import { ReactNode } from 'react';
import type { CardComponent, DataModel } from '@claude-canvas/core';

export interface CcCardProps {
  component: CardComponent;
  dataModel: DataModel;
  children?: ReactNode;
}

export function CcCard({ component, children }: CcCardProps) {
  return (
    <div className={`cc-card ${component.elevated ? 'elevated' : ''}`}>
      {children}
    </div>
  );
}
