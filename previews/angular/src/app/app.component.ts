import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CcSurfaceComponent } from '@claude-canvas/renderer-angular';

// Define types locally to avoid cross-package type incompatibility
interface Surface {
  id: string;
  title?: string;
  components: Array<{ component: string; [key: string]: unknown }>;
}

type DataModel = Record<string, unknown>;

interface AgentToClientMessage {
  type: 'surfaceUpdate' | 'dataModelUpdate' | 'deleteSurface' | 'beginRendering';
  surface?: Surface | null;
  path?: string;
  data?: unknown;
  surfaceId?: string;
}

/**
 * Angular Preview App
 * Receives UI specifications via postMessage and renders using the Angular renderer
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CcSurfaceComponent],
  template: `
    <div class="preview-container">
      @if (surface) {
        <cc-surface
          [surface]="$any(surface)"
          [initialDataModel]="dataModel"
          (action)="handleAction($event)"
          (dataModelChange)="handleDataModelChange($event)">
        </cc-surface>
      } @else {
        <div class="empty-state">
          Waiting for UI specification...
        </div>
      }
    </div>
  `,
  styles: [`
    .preview-container {
      min-height: 100vh;
      padding: 16px;
    }
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(100vh - 32px);
      color: rgba(0, 0, 0, 0.54);
      font-size: 14px;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  surface: Surface | null = null;
  dataModel: DataModel = {};

  private messageHandler: (event: MessageEvent) => void;

  constructor(private cdr: ChangeDetectorRef) {
    this.messageHandler = this.handleMessage.bind(this);
  }

  ngOnInit(): void {
    // Listen for postMessage from parent frame
    window.addEventListener('message', this.messageHandler);

    // Notify parent that we're ready (with small delay to ensure iframe is fully loaded)
    setTimeout(() => {
      window.parent.postMessage({ type: 'angular-preview-ready' }, '*');
      console.log('[Angular Preview] Ready and listening for messages');
    }, 100);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
  }

  private handleMessage(event: MessageEvent): void {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    // Handle batch messages
    if (data.type === 'claude-canvas-messages' && Array.isArray(data.messages)) {
      console.log('[Angular Preview] Received messages:', data.messages.length);
      this.processMessages(data.messages);
      return;
    }

    // Handle single message (surfaceUpdate, dataModelUpdate, deleteSurface)
    if (data.type === 'surfaceUpdate' || data.type === 'dataModelUpdate' || data.type === 'deleteSurface') {
      console.log('[Angular Preview] Received single message:', data.type);
      this.processMessages([data]);
    }
  }

  private processMessages(messages: AgentToClientMessage[]): void {
    for (const message of messages) {
      switch (message.type) {
        case 'surfaceUpdate':
          this.surface = message.surface ?? null;
          break;
        case 'dataModelUpdate':
          const path = message.path ?? '/';
          if (path === '/') {
            this.dataModel = message.data as DataModel;
          } else {
            // Use setByPointer for nested updates
            this.dataModel = this.setByPointer(this.dataModel, path, message.data);
          }
          break;
        case 'deleteSurface':
          if (this.surface?.id === message.surfaceId) {
            this.surface = null;
          }
          break;
      }
    }
    this.cdr.detectChanges();
  }

  private setByPointer(obj: DataModel, path: string, value: unknown): DataModel {
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
  }

  handleAction(event: unknown): void {
    console.log('[Angular Preview] Action:', event);
    // Forward action to parent
    window.parent.postMessage({
      type: 'angular-preview-action',
      action: event
    }, '*');
  }

  handleDataModelChange(dataModel: DataModel): void {
    this.dataModel = dataModel;
    // Forward data model changes to parent
    window.parent.postMessage({
      type: 'angular-preview-data-model-change',
      dataModel
    }, '*');
  }
}
