import React, { ReactNode } from 'react';
import type { RowComponent, DataModel } from '@claude-canvas/core';

export interface CcRowProps {
  component: RowComponent;
  dataModel: DataModel;
  children?: ReactNode;
}

function getFlexAlign(align?: string, defaultValue = 'stretch'): string {
  switch (align) {
    case 'start': return 'flex-start';
    case 'end': return 'flex-end';
    case 'center': return 'center';
    case 'stretch': return 'stretch';
    case 'spaceBetween': return 'space-between';
    case 'spaceAround': return 'space-around';
    default: return defaultValue;
  }
}

export function CcRow({ component, children }: CcRowProps) {
  // Support both component props (justify, align) and CSS-style properties in style object
  const componentStyle = component.style as Record<string, unknown> | undefined;
  const justifyFromStyle = componentStyle?.justifyContent as string | undefined;
  const alignFromStyle = componentStyle?.alignItems as string | undefined;

  const style: React.CSSProperties = {
    gap: component.gap ?? 0,
    alignItems: component.align
      ? getFlexAlign(component.align, 'stretch')
      : (alignFromStyle ?? 'stretch'),
    justifyContent: component.justify
      ? getFlexAlign(component.justify, 'flex-start')
      : (justifyFromStyle ?? 'flex-start'),
  };

  // Support overflow from style object for scrollable layouts
  if (componentStyle?.overflowX) {
    style.overflowX = componentStyle.overflowX as React.CSSProperties['overflowX'];
  }
  if (componentStyle?.overflowY) {
    style.overflowY = componentStyle.overflowY as React.CSSProperties['overflowY'];
  }
  if (componentStyle?.overflow) {
    style.overflow = componentStyle.overflow as React.CSSProperties['overflow'];
  }
  // Support flex for responsive sizing
  if (componentStyle?.flex) {
    style.flex = componentStyle.flex as React.CSSProperties['flex'];
  }
  if (componentStyle?.minWidth) {
    style.minWidth = componentStyle.minWidth as React.CSSProperties['minWidth'];
  }

  return (
    <div className={`cc-row ${component.wrap ? 'wrap' : ''}`} style={style}>
      {children}
    </div>
  );
}
