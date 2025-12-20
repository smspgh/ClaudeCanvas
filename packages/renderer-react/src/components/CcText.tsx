import React from 'react';
import type { TextComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcTextProps {
  component: TextComponent;
  dataModel: DataModel;
}

export function CcText({ component, dataModel }: CcTextProps) {
  const content = component.content ??
    (component.contentPath ? String(getByPointer(dataModel, component.contentPath) ?? '') : '');

  const textStyle = component.textStyle ?? 'body';
  const style: React.CSSProperties = {};

  if (component.color) {
    style.color = component.color;
  }

  return (
    <p className={`cc-text ${textStyle}`} style={style}>
      {content}
    </p>
  );
}
