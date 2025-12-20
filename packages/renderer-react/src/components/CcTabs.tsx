import { ReactNode } from 'react';
import type { TabsComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcTabsProps {
  component: TabsComponent;
  dataModel: DataModel;
  onInput: (path: string, value: unknown) => void;
  renderChildren: (children: TabsComponent['tabs'][0]['children']) => ReactNode;
}

export function CcTabs({ component, dataModel, onInput, renderChildren }: CcTabsProps) {
  const currentValue = getByPointer(dataModel, component.valuePath) as string | undefined;
  const activeTab = currentValue ?? component.tabs[0]?.value;

  const handleTabClick = (value: string, disabled?: boolean) => {
    if (disabled) return;
    onInput(component.valuePath, value);
  };

  const activeTabContent = component.tabs.find(tab => tab.value === activeTab);

  return (
    <div className="cc-tabs">
      <div className="cc-tabs-list" role="tablist">
        {component.tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={tab.value === activeTab}
            aria-controls={`cc-tabpanel-${tab.value}`}
            className={`cc-tab ${tab.value === activeTab ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
            onClick={() => handleTabClick(tab.value, tab.disabled)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="cc-tab-icon">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="cc-tabs-panel"
        role="tabpanel"
        id={`cc-tabpanel-${activeTab}`}
      >
        {activeTabContent && renderChildren(activeTabContent.children)}
      </div>
    </div>
  );
}
