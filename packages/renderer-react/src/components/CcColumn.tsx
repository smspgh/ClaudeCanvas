import React, { ReactNode } from 'react';
import type { ColumnComponent, DataModel } from '@claude-canvas/core';

export interface CcColumnProps {
  component: ColumnComponent;
  dataModel: DataModel;
  children?: ReactNode;
}

function getFlexAlign(align?: string): string {
  switch (align) {
    case 'start': return 'flex-start';
    case 'end': return 'flex-end';
    case 'center': return 'center';
    case 'stretch': return 'stretch';
    default: return 'stretch';
  }
}

export function CcColumn({ component, children }: CcColumnProps) {
  const style: React.CSSProperties = {
    gap: component.gap ?? 8,
    alignItems: getFlexAlign(component.align),
  };

  return (
    <div className="cc-column" style={style}>
      {children}
    </div>
  );
}
