import { useState, useRef, useCallback, type ReactNode } from 'react';
import type { TooltipComponent, DataModel } from '@claude-canvas/core';

export interface CcTooltipProps {
  component: TooltipComponent;
  dataModel: DataModel;
  children?: ReactNode;
}

export function CcTooltip({ component, children }: CcTooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const position = component.position ?? 'top';
  const delay = component.delay ?? 200;

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  }, []);

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
      padding: '6px 10px',
      background: 'var(--cc-tooltip-bg, #1f2937)',
      color: 'var(--cc-tooltip-text, #fff)',
      fontSize: '0.75rem',
      borderRadius: 4,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.2s ease',
    };

    switch (position) {
      case 'top':
        return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 };
      case 'bottom':
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 };
      case 'left':
        return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 };
      case 'right':
        return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 };
      default:
        return base;
    }
  };

  const getArrowStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      content: '""',
      position: 'absolute',
      border: '6px solid transparent',
    };

    switch (position) {
      case 'top':
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', borderTopColor: 'var(--cc-tooltip-bg, #1f2937)' };
      case 'bottom':
        return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderBottomColor: 'var(--cc-tooltip-bg, #1f2937)' };
      case 'left':
        return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', borderLeftColor: 'var(--cc-tooltip-bg, #1f2937)' };
      case 'right':
        return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', borderRightColor: 'var(--cc-tooltip-bg, #1f2937)' };
      default:
        return base;
    }
  };

  return (
    <div
      className="cc-tooltip-wrapper"
      style={{ display: 'inline-block', position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div className={`cc-tooltip cc-tooltip-${position}`} style={getPositionStyles()}>
        {component.content}
        <span style={getArrowStyles()} />
      </div>
    </div>
  );
}
