import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Main Surface Component
import { CcSurfaceComponent } from './cc-surface.component';

// Layout Components
import { CcRowComponent } from './components/cc-row.component';
import { CcColumnComponent } from './components/cc-column.component';
import { CcCardComponent } from './components/cc-card.component';
import { CcDividerComponent } from './components/cc-divider.component';
import { CcModalComponent } from './components/cc-modal.component';
import { CcTabsComponent } from './components/cc-tabs.component';
import { CcAccordionComponent } from './components/cc-accordion.component';

// Display Components
import { CcTextComponent } from './components/cc-text.component';
import { CcImageComponent } from './components/cc-image.component';
import { CcIconComponent } from './components/cc-icon.component';
import { CcBadgeComponent } from './components/cc-badge.component';
import { CcAvatarComponent } from './components/cc-avatar.component';
import { CcCodeBlockComponent } from './components/cc-code-block.component';
import { CcMarkdownComponent } from './components/cc-markdown.component';
import { CcLinkComponent } from './components/cc-link.component';

// Form/Input Components
import { CcTextFieldComponent } from './components/cc-text-field.component';
import { CcTextAreaComponent } from './components/cc-text-area.component';
import { CcSelectComponent } from './components/cc-select.component';
import { CcCheckboxComponent } from './components/cc-checkbox.component';
import { CcRadioGroupComponent } from './components/cc-radio-group.component';
import { CcSwitchComponent } from './components/cc-switch.component';
import { CcSliderComponent } from './components/cc-slider.component';
import { CcDatePickerComponent } from './components/cc-date-picker.component';
import { CcFileUploadComponent } from './components/cc-file-upload.component';

// Interactive Components
import { CcButtonComponent } from './components/cc-button.component';
import { CcButtonGroupComponent } from './components/cc-button-group.component';
import { CcChipComponent } from './components/cc-chip.component';

// Media Components
import { CcVideoComponent } from './components/cc-video.component';
import { CcAudioComponent } from './components/cc-audio.component';

// Data Visualization Components
import { CcChartComponent } from './components/cc-chart.component';
import { CcDataTableComponent } from './components/cc-data-table.component';
import { CcListComponent } from './components/cc-list.component';

// Feedback Components
import { CcProgressComponent } from './components/cc-progress.component';
import { CcSkeletonComponent } from './components/cc-skeleton.component';
import { CcAlertComponent } from './components/cc-alert.component';
import { CcToastComponent } from './components/cc-toast.component';

// Services
import { DataModelService } from './services/data-model.service';
import { ComponentRegistryService } from './services/component-registry.service';

const COMPONENTS = [
  // Main Surface
  CcSurfaceComponent,

  // Layout (7)
  CcRowComponent,
  CcColumnComponent,
  CcCardComponent,
  CcDividerComponent,
  CcModalComponent,
  CcTabsComponent,
  CcAccordionComponent,

  // Display (8)
  CcTextComponent,
  CcImageComponent,
  CcIconComponent,
  CcBadgeComponent,
  CcAvatarComponent,
  CcCodeBlockComponent,
  CcMarkdownComponent,
  CcLinkComponent,

  // Form/Input (9)
  CcTextFieldComponent,
  CcTextAreaComponent,
  CcSelectComponent,
  CcCheckboxComponent,
  CcRadioGroupComponent,
  CcSwitchComponent,
  CcSliderComponent,
  CcDatePickerComponent,
  CcFileUploadComponent,

  // Interactive (3)
  CcButtonComponent,
  CcButtonGroupComponent,
  CcChipComponent,

  // Media (2)
  CcVideoComponent,
  CcAudioComponent,

  // Data Visualization (3)
  CcChartComponent,
  CcDataTableComponent,
  CcListComponent,

  // Feedback (4)
  CcProgressComponent,
  CcSkeletonComponent,
  CcAlertComponent,
  CcToastComponent,
];

/**
 * ClaudeCanvasModule - Angular module for ClaudeCanvas declarative UI components
 *
 * This module provides all 31 ClaudeCanvas components for Angular applications.
 * Components are standalone and can also be imported individually.
 *
 * @example
 * ```typescript
 * import { ClaudeCanvasModule } from '@anthropic/claude-canvas-renderer-angular';
 *
 * @NgModule({
 *   imports: [ClaudeCanvasModule]
 * })
 * export class AppModule { }
 * ```
 *
 * Or import components individually:
 * ```typescript
 * import { CcSurfaceComponent, CcTextComponent } from '@anthropic/claude-canvas-renderer-angular';
 *
 * @Component({
 *   standalone: true,
 *   imports: [CcSurfaceComponent, CcTextComponent]
 * })
 * export class MyComponent { }
 * ```
 */
@NgModule({
  imports: [
    CommonModule,
    ...COMPONENTS,
  ],
  exports: COMPONENTS,
  providers: [
    DataModelService,
    ComponentRegistryService,
  ],
})
export class ClaudeCanvasModule { }

/**
 * Standalone component exports for Angular 17+ applications
 * Use these when working with standalone components
 */
export const CLAUDE_CANVAS_COMPONENTS = COMPONENTS;
