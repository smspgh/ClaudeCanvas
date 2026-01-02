import React from 'react';
import type { TextComponent, DataModel } from '@claude-canvas/core';
import { getByPointer, evaluateExpression } from '@claude-canvas/core';

export interface CcTextProps {
  component: TextComponent;
  dataModel: DataModel;
}

export function CcText({ component, dataModel }: CcTextProps) {
  let content: string;
  if (component.content != null) {
    content = component.content;
  } else if (component.contentPath) {
    let value = getByPointer(dataModel, component.contentPath);
    if (component.contentExpr) {
      value = evaluateExpression(component.contentExpr, value);
    }
    content = String(value ?? '');
  } else {
    content = '';
  }

  const textStyle = component.textStyle ?? 'body';
  const componentStyle = component.style as Record<string, unknown> | undefined;
  const style: React.CSSProperties = {};

  // Check both component.color and style.color
  const color = component.color ?? componentStyle?.color;
  if (color) {
    style.color = color as string;
  }

  // Apply fontWeight from style
  if (componentStyle?.fontWeight) {
    style.fontWeight = componentStyle.fontWeight as number | string;
  }

  // Apply fontSize from style
  if (componentStyle?.fontSize) {
    style.fontSize = typeof componentStyle.fontSize === 'number'
      ? `${componentStyle.fontSize}px`
      : componentStyle.fontSize as string;
  }

  // Apply textAlign from style
  if (componentStyle?.textAlign) {
    style.textAlign = componentStyle.textAlign as React.CSSProperties['textAlign'];
  }

  return (
    <p className={`cc-text ${textStyle}`} style={style}>
      {content}
    </p>
  );
}
