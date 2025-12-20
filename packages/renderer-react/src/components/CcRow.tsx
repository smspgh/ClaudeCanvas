import React, { ReactNode } from 'react';
import type { RowComponent, DataModel } from '@claude-canvas/core';

export interface CcRowProps {
  component: RowComponent;
  dataModel: DataModel;
  children?: ReactNode;
}

function getFlexAlign(align?: string): string {
  switch (align) {
    case 'start': return 'flex-start';
    case 'end': return 'flex-end';
    case 'center': return 'center';
    case 'stretch': return 'stretch';
    case 'spaceBetween': return 'space-between';
    case 'spaceAround': return 'space-around';
    default: return 'center';
  }
}

export function CcRow({ component, children }: CcRowProps) {
  const style: React.CSSProperties = {
    gap: component.gap ?? 8,
    alignItems: getFlexAlign(component.align),
    justifyContent: getFlexAlign(component.justify),
  };

  return (
    <div className={`cc-row ${component.wrap ? 'wrap' : ''}`} style={style}>
      {children}
    </div>
  );
}
