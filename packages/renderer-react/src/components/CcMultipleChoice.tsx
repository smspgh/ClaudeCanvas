import type { MultipleChoiceComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcMultipleChoiceProps {
  component: MultipleChoiceComponent;
  dataModel: DataModel;
  onInput?: (path: string, value: unknown) => void;
}

export function CcMultipleChoice({ component, dataModel, onInput }: CcMultipleChoiceProps) {
  const rawValue = getByPointer(dataModel, component.valuePath);
  const selectedValues: string[] = Array.isArray(rawValue)
    ? rawValue.filter((v): v is string => typeof v === 'string')
    : [];

  const options = component.options || [];
  const maxSelections = component.maxSelections;

  const handleOptionClick = (optionValue: string) => {
    if (component.disabled) return;

    const isSelected = selectedValues.includes(optionValue);
    let newValues: string[];

    if (isSelected) {
      newValues = selectedValues.filter(v => v !== optionValue);
    } else {
      if (maxSelections && selectedValues.length >= maxSelections) {
        return;
      }
      newValues = [...selectedValues, optionValue];
    }

    onInput?.(component.valuePath, newValues);
  };

  return (
    <div className="cc-multiple-choice">
      {component.label && (
        <label className="cc-multiple-choice-label">{component.label}</label>
      )}
      {maxSelections && (
        <span className="cc-multiple-choice-info">
          Select up to {maxSelections} options ({selectedValues.length} selected)
        </span>
      )}
      <div className="cc-multiple-choice-options">
        {options.map(option => {
          const isSelected = selectedValues.includes(option.value);
          const isDisabled = component.disabled ||
            (!isSelected && maxSelections !== undefined && selectedValues.length >= maxSelections);

          return (
            <div
              key={option.value}
              className={`cc-multiple-choice-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && handleOptionClick(option.value)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => handleOptionClick(option.value)}
                onClick={e => e.stopPropagation()}
              />
              <span className="cc-multiple-choice-option-label">{option.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
