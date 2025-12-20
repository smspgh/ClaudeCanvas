import { ReactNode, CSSProperties } from 'react';
import type { CardComponent, DataModel, ComponentStyle } from '@claude-canvas/core';

export interface CcCardProps {
  component: CardComponent;
  dataModel: DataModel;
  children?: ReactNode;
}

function styleToCSS(style?: ComponentStyle): CSSProperties {
  if (!style) return {};
  const css: CSSProperties = {};

  // Handle padding - could be number or Spacing object
  if (typeof style.padding === 'number') {
    css.padding = style.padding;
  }
  // Handle margin - could be number or Spacing object
  if (typeof style.margin === 'number') {
    css.margin = style.margin;
  }

  if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
  if (style.borderRadius) css.borderRadius = style.borderRadius;
  if (style.borderColor) css.borderColor = style.borderColor;
  if (style.borderWidth) css.borderWidth = style.borderWidth;
  if (style.width) css.width = style.width;
  if (style.height) css.height = style.height;
  if (style.minWidth) css.minWidth = style.minWidth;
  if (style.maxWidth) css.maxWidth = style.maxWidth;
  if (style.flex !== undefined) css.flex = style.flex;
  if (style.opacity !== undefined) css.opacity = style.opacity;

  return css;
}

export function CcCard({ component, children }: CcCardProps) {
  const style = styleToCSS(component.style);

  return (
    <div className={`cc-card ${component.elevated ? 'elevated' : ''}`} style={style}>
      {children}
    </div>
  );
}
