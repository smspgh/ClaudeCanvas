import { Injectable, signal, computed } from '@angular/core';
import { DataModel, Surface, AgentToClientMessage } from '../types';
import { setByPointer, getByPointer } from '../utils/json-pointer';

/**
 * Service for managing ClaudeCanvas data model state
 */
@Injectable({
  providedIn: 'root'
})
export class DataModelService {
  private _dataModel = signal<DataModel>({});
  private _surface = signal<Surface | null>(null);

  /** Current data model state */
  readonly dataModel = computed(() => this._dataModel());

  /** Current surface state */
  readonly surface = computed(() => this._surface());

  /**
   * Get a value from the data model using a JSON Pointer path
   */
  get(path: string): unknown {
    return getByPointer(this._dataModel(), path);
  }

  /**
   * Set a value in the data model using a JSON Pointer path
   */
  set(path: string, value: unknown): void {
    this._dataModel.update(dm => setByPointer(dm, path, value));
  }

  /**
   * Set the entire data model
   */
  setDataModel(dataModel: DataModel): void {
    this._dataModel.set(dataModel);
  }

  /**
   * Set the current surface
   */
  setSurface(surface: Surface | null): void {
    this._surface.set(surface);
  }

  /**
   * Process an agent message
   */
  processMessage(message: AgentToClientMessage): void {
    switch (message.type) {
      case 'surfaceUpdate':
        this._surface.set((message as any).surface);
        break;
      case 'dataModelUpdate':
        const updateMsg = message as any;
        this._dataModel.update(dm => setByPointer(dm, updateMsg.path, updateMsg.data));
        break;
      case 'deleteSurface':
        const deleteMsg = message as any;
        if (this._surface()?.id === deleteMsg.surfaceId) {
          this._surface.set(null);
        }
        break;
    }
  }

  /**
   * Process multiple agent messages
   */
  processMessages(messages: AgentToClientMessage[]): void {
    for (const message of messages) {
      this.processMessage(message);
    }
  }

  /**
   * Reset the state
   */
  reset(): void {
    this._dataModel.set({});
    this._surface.set(null);
  }
}
