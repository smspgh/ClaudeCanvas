import React, { useState, useCallback, useEffect } from 'react';
import type {
  Surface,
  Component,
  DataModel,
  AgentToClientMessage,
  UserActionMessage,
  Action,
} from '@claude-canvas/core';
import { setByPointer, getByPointer, generateId } from '@claude-canvas/core';

import { CcText } from './components/CcText.js';
import { CcButton } from './components/CcButton.js';
import { CcTextField } from './components/CcTextField.js';
import { CcCheckbox } from './components/CcCheckbox.js';
import { CcSelect } from './components/CcSelect.js';
import { CcSlider } from './components/CcSlider.js';
import { CcDateTimeInput } from './components/CcDateTimeInput.js';
import { CcVideo } from './components/CcVideo.js';
import { CcAudioPlayer } from './components/CcAudioPlayer.js';
import { CcMultipleChoice } from './components/CcMultipleChoice.js';
import { CcChart } from './components/CcChart.js';
import { CcDataTable } from './components/CcDataTable.js';
import { CcRichTextEditor } from './components/CcRichTextEditor.js';
import { CcImage } from './components/CcImage.js';
import { CcIcon } from './components/CcIcon.js';
import { CcRow } from './components/CcRow.js';
import { CcColumn } from './components/CcColumn.js';
import { CcCard } from './components/CcCard.js';
import { CcDivider } from './components/CcDivider.js';
import { CcModal } from './components/CcModal.js';
import { CcTabs } from './components/CcTabs.js';

export interface CcSurfaceProps {
  /** The surface definition to render */
  surface?: Surface | null;
  /** Initial data model state */
  initialDataModel?: DataModel;
  /** Called when a user performs an action (button click, etc.) */
  onAction?: (message: UserActionMessage) => void;
  /** Called when the data model changes (input changes) */
  onDataModelChange?: (dataModel: DataModel) => void;
  /** Children to render when no surface is provided */
  children?: React.ReactNode;
}

export function CcSurface({
  surface,
  initialDataModel = {},
  onAction,
  onDataModelChange,
  children,
}: CcSurfaceProps) {
  const [dataModel, setDataModel] = useState<DataModel>(initialDataModel);

  // Update data model when initial changes
  useEffect(() => {
    setDataModel(initialDataModel);
  }, [initialDataModel]);

  const handleInput = useCallback((path: string, value: unknown) => {
    setDataModel(prev => {
      const next = setByPointer(prev, path, value);
      onDataModelChange?.(next);
      return next;
    });
  }, [onDataModelChange]);

  const handleAction = useCallback((action: Action) => {
    if (!surface) return;

    // Handle update/updateData action locally - used for modal open/close, etc.
    if ((action.type === 'updateData' || action.type === 'update') && action.path !== undefined) {
      handleInput(action.path, action.value);
      return;
    }

    const message: UserActionMessage = {
      type: 'userAction',
      surfaceId: surface.id,
      action,
      dataModel,
    };

    onAction?.(message);
  }, [surface, dataModel, onAction, handleInput]);

  const isVisible = (component: Component): boolean => {
    if (!component.visibleIf) return true;
    const value = getByPointer(dataModel, component.visibleIf);
    return Boolean(value);
  };

  const renderComponent = (component: Component, key?: string | number): React.ReactNode => {
    if (!isVisible(component)) return null;

    const id = component.id ?? generateId();
    const componentKey = key ?? id;

    switch (component.component) {
      case 'Text':
        return <CcText key={componentKey} component={component} dataModel={dataModel} />;

      case 'Button':
        return (
          <CcButton
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onAction={handleAction}
          />
        );

      case 'TextField':
        return (
          <CcTextField
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onInput={handleInput}
          />
        );

      case 'Checkbox':
        return (
          <CcCheckbox
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onInput={handleInput}
          />
        );

      case 'Select':
        return (
          <CcSelect
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onInput={handleInput}
          />
        );

      case 'Slider':
        return (
          <CcSlider
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onInput={handleInput}
          />
        );

      case 'DateTimeInput':
        return (
          <CcDateTimeInput
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onInput={handleInput}
          />
        );

      case 'Video':
        return <CcVideo key={componentKey} component={component} dataModel={dataModel} />;

      case 'AudioPlayer':
        return <CcAudioPlayer key={componentKey} component={component} dataModel={dataModel} />;

      case 'MultipleChoice':
        return (
          <CcMultipleChoice
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onInput={handleInput}
          />
        );

      case 'Chart':
        return <CcChart key={componentKey} component={component} dataModel={dataModel} />;

      case 'DataTable':
        return (
          <CcDataTable
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onInput={handleInput}
          />
        );

      case 'RichTextEditor':
        return (
          <CcRichTextEditor
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onInput={handleInput}
          />
        );

      case 'Image':
        return <CcImage key={componentKey} component={component} dataModel={dataModel} />;

      case 'Icon':
        return <CcIcon key={componentKey} component={component} dataModel={dataModel} />;

      case 'Row':
        return (
          <CcRow key={componentKey} component={component} dataModel={dataModel}>
            {component.children.map((child, i) => renderComponent(child, i))}
          </CcRow>
        );

      case 'Column':
        return (
          <CcColumn key={componentKey} component={component} dataModel={dataModel}>
            {component.children.map((child, i) => renderComponent(child, i))}
          </CcColumn>
        );

      case 'Card':
        return (
          <CcCard key={componentKey} component={component} dataModel={dataModel}>
            {component.children.map((child, i) => renderComponent(child, i))}
          </CcCard>
        );

      case 'Divider':
        return <CcDivider key={componentKey} component={component} dataModel={dataModel} />;

      case 'Modal':
        return (
          <CcModal
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onInput={handleInput}
          >
            {component.children.map((child, i) => renderComponent(child, i))}
          </CcModal>
        );

      case 'Tabs':
        return (
          <CcTabs
            key={componentKey}
            component={component}
            dataModel={dataModel}
            onInput={handleInput}
            renderChildren={(children) => children.map((child, i) => renderComponent(child, i))}
          />
        );

      default:
        console.warn(`Unknown component type: ${(component as Component).component}`);
        return null;
    }
  };

  if (!surface) {
    return <div className="cc-surface">{children}</div>;
  }

  return (
    <div className="cc-surface">
      {surface.title && <h2 className="cc-surface-title">{surface.title}</h2>}
      {surface.components.map((component, i) => renderComponent(component, i))}
    </div>
  );
}

/**
 * Hook to manage surface state with message processing
 */
export function useCcSurface(initialSurface?: Surface | null, initialDataModel?: DataModel) {
  const [surface, setSurface] = useState<Surface | null>(initialSurface ?? null);
  const [dataModel, setDataModel] = useState<DataModel>(initialDataModel ?? {});

  const processMessage = useCallback((message: AgentToClientMessage) => {
    switch (message.type) {
      case 'surfaceUpdate':
        setSurface(message.surface);
        break;
      case 'dataModelUpdate':
        setDataModel(prev => setByPointer(prev, message.path, message.data));
        break;
      case 'deleteSurface':
        setSurface(prev => (prev?.id === message.surfaceId ? null : prev));
        break;
    }
  }, []);

  const processMessages = useCallback((messages: AgentToClientMessage[]) => {
    for (const message of messages) {
      processMessage(message);
    }
  }, [processMessage]);

  const updateDataModel = useCallback((path: string, value: unknown) => {
    setDataModel(prev => setByPointer(prev, path, value));
  }, []);

  return {
    surface,
    dataModel,
    setSurface,
    setDataModel,
    processMessage,
    processMessages,
    updateDataModel,
  };
}
