import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Surface, Component, DataModel, Action, AgentToClientMessage } from '@claude-canvas/core';
import { ComponentRenderer } from './ComponentRenderer';

declare global {
  interface Window {
    parent: Window;
  }
}

export default function App() {
  const [surface, setSurface] = useState<Surface | null>(null);
  const [dataModel, setDataModel] = useState<DataModel>({});

  const setByPointer = useCallback((obj: DataModel, path: string, value: unknown): DataModel => {
    const parts = path.split('/').filter(p => p);
    if (parts.length === 0) return value as DataModel;

    const result = { ...obj };
    let current: Record<string, unknown> = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current[part] = { ...(current[part] as Record<string, unknown>) };
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
    return result;
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    // Handle batch messages
    if (data.type === 'claude-canvas-messages' && Array.isArray(data.messages)) {
      console.log('[Android Preview] Received messages:', data.messages.length);
      for (const msg of data.messages as AgentToClientMessage[]) {
        processMessage(msg);
      }
      return;
    }

    // Handle single messages
    if (data.type === 'surfaceUpdate' || data.type === 'dataModelUpdate' || data.type === 'deleteSurface') {
      console.log('[Android Preview] Received single message:', data.type);
      processMessage(data as AgentToClientMessage);
    }
  }, []);

  const processMessage = useCallback((message: AgentToClientMessage) => {
    switch (message.type) {
      case 'surfaceUpdate':
        setSurface(message.surface);
        break;
      case 'dataModelUpdate':
        if (message.path === '/') {
          setDataModel(message.data as DataModel);
        } else {
          setDataModel(prev => setByPointer(prev, message.path, message.data));
        }
        break;
      case 'deleteSurface':
        setSurface(prev => (prev?.id === message.surfaceId ? null : prev));
        break;
    }
  }, [setByPointer]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'android-preview-ready' }, '*');
    console.log('[Android Preview] Ready and listening for messages');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  const handleInput = useCallback((path: string, value: unknown) => {
    setDataModel(prev => {
      const next = setByPointer(prev, path, value);
      window.parent.postMessage({
        type: 'android-preview-data-model-change',
        dataModel: next,
      }, '*');
      return next;
    });
  }, [setByPointer]);

  const handleAction = useCallback((action: Action) => {
    console.log('[Android Preview] Action:', action);

    // Handle updateData action locally
    if ((action.type === 'updateData' || action.type === 'update') && action.path !== undefined) {
      handleInput(action.path, action.value);
      return;
    }

    window.parent.postMessage({
      type: 'android-preview-action',
      action,
    }, '*');
  }, [handleInput]);

  if (!surface) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'rgba(0, 0, 0, 0.54)',
        }}
      >
        <Typography variant="body1">Waiting for UI specification...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {surface.title && (
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 400 }}>
          {surface.title}
        </Typography>
      )}
      {surface.components.map((component, index) => (
        <ComponentRenderer
          key={component.id || index}
          component={component}
          dataModel={dataModel}
          onInput={handleInput}
          onAction={handleAction}
        />
      ))}
    </Box>
  );
}
