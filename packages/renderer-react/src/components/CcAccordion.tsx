import { useState, useCallback, type ReactNode } from 'react';
import type { AccordionComponent, AccordionItem, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcAccordionProps {
  component: AccordionComponent;
  dataModel: DataModel;
  onInput: (path: string, value: unknown) => void;
  renderChildren?: (children: AccordionItem['children']) => ReactNode[];
}

export function CcAccordion({ component, dataModel, onInput, renderChildren }: CcAccordionProps) {
  const [localExpanded, setLocalExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    component.items.forEach(item => {
      if (item.defaultExpanded) initial.add(item.id);
    });
    return initial;
  });

  const getExpanded = useCallback((): Set<string> => {
    if (component.expandedPath) {
      const value = getByPointer(dataModel, component.expandedPath);
      if (Array.isArray(value)) return new Set(value);
    }
    return localExpanded;
  }, [component.expandedPath, dataModel, localExpanded]);

  const toggleItem = useCallback((itemId: string) => {
    const expanded = getExpanded();
    const allowMultiple = component.allowMultiple ?? false;

    let newExpanded: Set<string>;
    if (expanded.has(itemId)) {
      newExpanded = new Set(expanded);
      newExpanded.delete(itemId);
    } else {
      newExpanded = allowMultiple ? new Set(expanded) : new Set();
      newExpanded.add(itemId);
    }

    if (component.expandedPath) {
      onInput(component.expandedPath, Array.from(newExpanded));
    } else {
      setLocalExpanded(newExpanded);
    }
  }, [getExpanded, component.allowMultiple, component.expandedPath, onInput]);

  const variant = component.variant ?? 'default';
  const expanded = getExpanded();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    ...(variant === 'bordered' && {
      border: '1px solid var(--cc-border, #e5e7eb)',
      borderRadius: 8,
      overflow: 'hidden',
    }),
    ...(variant === 'separated' && {
      gap: 8,
    }),
  };

  const renderItem = (item: AccordionItem, index: number) => {
    const isExpanded = expanded.has(item.id);

    const itemStyle: React.CSSProperties = {
      borderBottom: variant !== 'separated' ? '1px solid var(--cc-border, #e5e7eb)' : undefined,
      ...(variant === 'separated' && {
        border: '1px solid var(--cc-border, #e5e7eb)',
        borderRadius: 8,
        overflow: 'hidden',
      }),
    };

    // Remove border from last item in bordered variant
    if (variant === 'bordered' && index === component.items.length - 1) {
      itemStyle.borderBottom = 'none';
    }

    return (
      <div key={item.id} className="cc-accordion-item" style={itemStyle}>
        <button
          className="cc-accordion-header"
          disabled={item.disabled}
          onClick={() => toggleItem(item.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            opacity: item.disabled ? 0.5 : 1,
          }}
        >
          {item.icon && (
            <span className="cc-accordion-icon" style={{ fontSize: '1.25rem' }}>
              {item.icon}
            </span>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>{item.title}</p>
            {item.subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--cc-text-secondary, #6b7280)' }}>
                {item.subtitle}
              </p>
            )}
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--cc-text-secondary, #6b7280)',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}
          >
            ▼
          </span>
        </button>
        <div
          className="cc-accordion-content"
          style={{
            maxHeight: isExpanded ? 1000 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-out',
          }}
        >
          <div style={{ padding: '0 16px 16px' }}>
            {renderChildren ? renderChildren(item.children) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`cc-accordion cc-accordion-${variant}`} style={containerStyle}>
      {component.items.map((item, i) => renderItem(item, i))}
    </div>
  );
}
