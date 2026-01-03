import { Injectable, Type } from '@angular/core';

/**
 * Service for registering custom components
 */
@Injectable({
  providedIn: 'root'
})
export class ComponentRegistryService {
  private registry = new Map<string, Type<unknown>>();

  /**
   * Register a custom component
   */
  register(name: string, component: Type<unknown>): void {
    this.registry.set(name, component);
  }

  /**
   * Get a registered component
   */
  get(name: string): Type<unknown> | undefined {
    return this.registry.get(name);
  }

  /**
   * Check if a component is registered
   */
  has(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * Unregister a component
   */
  unregister(name: string): boolean {
    return this.registry.delete(name);
  }

  /**
   * Get all registered component names
   */
  getRegisteredNames(): string[] {
    return Array.from(this.registry.keys());
  }
}
