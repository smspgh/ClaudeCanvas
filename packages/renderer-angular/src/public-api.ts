/**
 * ClaudeCanvas Angular Renderer
 *
 * Angular implementation of the ClaudeCanvas declarative UI framework.
 * Renders AI-generated UIs from JSON specifications with full component support.
 *
 * @packageDocumentation
 */

// Module
export * from './lib/claude-canvas.module';

// Main surface component
export * from './lib/cc-surface.component';

// Services
export * from './lib/services/data-model.service';
export * from './lib/services/component-registry.service';

// Types
export * from './lib/types';

// Utilities
export * from './lib/utils/json-pointer';

// Layout Components
export * from './lib/components/cc-row.component';
export * from './lib/components/cc-column.component';
export * from './lib/components/cc-card.component';
export * from './lib/components/cc-divider.component';
export * from './lib/components/cc-modal.component';
export * from './lib/components/cc-tabs.component';
export * from './lib/components/cc-accordion.component';

// Display Components
export * from './lib/components/cc-text.component';
export * from './lib/components/cc-image.component';
export * from './lib/components/cc-icon.component';
export * from './lib/components/cc-badge.component';
export * from './lib/components/cc-avatar.component';
export * from './lib/components/cc-code-block.component';
export * from './lib/components/cc-markdown.component';
export * from './lib/components/cc-link.component';

// Form/Input Components
export * from './lib/components/cc-text-field.component';
export * from './lib/components/cc-text-area.component';
export * from './lib/components/cc-select.component';
export * from './lib/components/cc-checkbox.component';
export * from './lib/components/cc-radio-group.component';
export * from './lib/components/cc-switch.component';
export * from './lib/components/cc-slider.component';
export * from './lib/components/cc-date-picker.component';
export * from './lib/components/cc-file-upload.component';

// Interactive Components
export * from './lib/components/cc-button.component';
export * from './lib/components/cc-button-group.component';
export * from './lib/components/cc-chip.component';

// Media Components
export * from './lib/components/cc-video.component';
export * from './lib/components/cc-audio.component';

// Data Visualization Components
export * from './lib/components/cc-chart.component';
export * from './lib/components/cc-data-table.component';
export * from './lib/components/cc-list.component';

// Recursive component renderer
export * from './lib/components/cc-component-renderer.component';

// Angular Elements (custom element support)
export { initAngularElement } from './elements';

// Feedback Components
export * from './lib/components/cc-progress.component';
export * from './lib/components/cc-skeleton.component';
export * from './lib/components/cc-alert.component';
export * from './lib/components/cc-toast.component';
