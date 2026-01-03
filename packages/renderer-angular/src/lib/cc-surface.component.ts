import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Surface,
  DataModel,
  ComponentDefinition,
  UserActionMessage,
  Action,
  AgentToClientMessage,
} from './types';
import { setByPointer } from './utils/json-pointer';
import { CcComponentRendererComponent } from './components/cc-component-renderer.component';

/**
 * Main surface component for rendering ClaudeCanvas UIs
 * Can be used as a standalone component or as a custom element via Angular Elements
 */
@Component({
  selector: 'cc-surface',
  standalone: true,
  imports: [
    CommonModule,
    CcComponentRendererComponent,
  ],
  template: `
    <div class="cc-surface">
      @if (surface?.title) {
        <h2 class="cc-surface-title">{{ surface.title }}</h2>
      }
      @for (component of surface?.components || []; track $index) {
        <cc-component-renderer
          [component]="component"
          [dataModel]="dataModel"
          (inputChange)="handleInput($event.path, $event.value)"
          (action)="handleAction($event)">
        </cc-component-renderer>
      }
    </div>
  `,
  styles: [`
    .cc-surface {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    }
    .cc-surface-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcSurfaceComponent implements OnChanges {
  @Input() surface: Surface | null = null;
  @Input() initialDataModel: DataModel = {};

  @Output() action = new EventEmitter<UserActionMessage>();
  @Output() dataModelChange = new EventEmitter<DataModel>();

  dataModel: DataModel = {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialDataModel']) {
      this.dataModel = { ...this.initialDataModel };
    }
  }

  /**
   * Process messages from the agent
   * This method can be called from outside when using as a custom element
   */
  processMessages(messages: AgentToClientMessage[]): void {
    for (const message of messages) {
      this.processMessage(message);
    }
    this.cdr.markForCheck();
  }

  /**
   * Process a single message from the agent
   */
  processMessage(message: AgentToClientMessage): void {
    switch (message.type) {
      case 'surfaceUpdate':
        this.surface = message.surface;
        break;
      case 'dataModelUpdate':
        this.dataModel = setByPointer(this.dataModel, message.path, message.data);
        this.dataModelChange.emit(this.dataModel);
        break;
      case 'deleteSurface':
        if (this.surface?.id === message.surfaceId) {
          this.surface = null;
        }
        break;
    }
    this.cdr.markForCheck();
  }

  handleInput(path: string, value: unknown): void {
    this.dataModel = setByPointer(this.dataModel, path, value);
    this.dataModelChange.emit(this.dataModel);
    this.cdr.markForCheck();
  }

  handleAction(actionData: Action): void {
    if (!this.surface) return;

    // Handle update/updateData action locally
    if ((actionData.type === 'updateData' || actionData.type === 'update') && actionData.path) {
      this.handleInput(actionData.path, actionData.value);
      return;
    }

    const message: UserActionMessage = {
      type: 'userAction',
      surfaceId: this.surface.id,
      action: actionData,
      dataModel: this.dataModel,
    };

    this.action.emit(message);
  }
}
