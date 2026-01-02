/**
 * ClaudeCanvas Component Registry
 * Implements the Smart Wrapper pattern for custom component registration
 */

import type { Component, DataModel } from './types.js';

// =============================================================================
// Component Definition Types
// =============================================================================

/**
 * Props passed to custom component renderers
 */
export interface ComponentRenderProps<T extends Component = Component> {
  /** The component definition */
  component: T;
  /** Current data model */
  dataModel: DataModel;
  /** Render children components */
  renderChildren?: (children: Component[]) => unknown;
  /** Emit an input change */
  onInput?: (path: string, value: unknown) => void;
  /** Emit an action */
  onAction?: (action: T extends { action: infer A } ? A : unknown) => void;
}

/**
 * Custom component renderer function
 */
export type ComponentRenderer<T extends Component = Component> = (
  props: ComponentRenderProps<T>
) => unknown;

/**
 * Component registration entry
 */
export interface ComponentRegistration<T extends Component = Component> {
  /** Unique component type name */
  name: string;
  /** Human-readable description */
  description?: string;
  /** Component renderer */
  render: ComponentRenderer<T>;
  /** Whether this component accepts children */
  hasChildren?: boolean;
  /** Default props */
  defaults?: Partial<T>;
  /** Schema for validation (JSON Schema) */
  schema?: object;
}

// =============================================================================
// Component Registry
// =============================================================================

export class ComponentRegistry {
  private components: Map<string, ComponentRegistration> = new Map();
  private fallbackRenderer?: ComponentRenderer;

  /**
   * Register a custom component
   */
  register<T extends Component>(registration: ComponentRegistration<T>): this {
    if (this.components.has(registration.name)) {
      console.warn(`Component "${registration.name}" is already registered. Overwriting.`);
    }
    this.components.set(registration.name, registration as ComponentRegistration);
    return this;
  }

  /**
   * Unregister a component
   */
  unregister(name: string): boolean {
    return this.components.delete(name);
  }

  /**
   * Check if a component is registered
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Get a component registration
   */
  get(name: string): ComponentRegistration | undefined {
    return this.components.get(name);
  }

  /**
   * Get all registered component names
   */
  getNames(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Get all registrations
   */
  getAll(): ComponentRegistration[] {
    return Array.from(this.components.values());
  }

  /**
   * Set fallback renderer for unknown components
   */
  setFallback(renderer: ComponentRenderer): this {
    this.fallbackRenderer = renderer;
    return this;
  }

  /**
   * Render a component
   */
  render(props: ComponentRenderProps): unknown {
    const registration = this.components.get(props.component.component);

    if (registration) {
      // Merge defaults with component props (use type assertion to avoid type widening)
      const mergedComponent = registration.defaults
        ? ({ ...registration.defaults, ...props.component } as Component)
        : props.component;

      return registration.render({
        ...props,
        component: mergedComponent,
      });
    }

    // Use fallback renderer if available
    if (this.fallbackRenderer) {
      return this.fallbackRenderer(props);
    }

    // Unknown component - return null
    console.warn(`Unknown component type: ${props.component.component}`);
    return null;
  }

  /**
   * Create a wrapped render function that uses this registry
   */
  createRenderer(): (props: ComponentRenderProps) => unknown {
    return (props) => this.render(props);
  }

  /**
   * Merge with another registry (for plugins)
   */
  merge(other: ComponentRegistry): this {
    for (const registration of other.getAll()) {
      this.register(registration);
    }
    return this;
  }

  /**
   * Clone this registry
   */
  clone(): ComponentRegistry {
    const cloned = new ComponentRegistry();
    for (const registration of this.getAll()) {
      cloned.register(registration);
    }
    if (this.fallbackRenderer) {
      cloned.setFallback(this.fallbackRenderer);
    }
    return cloned;
  }
}

// =============================================================================
// Plugin System
// =============================================================================

/**
 * Plugin definition
 */
export interface Plugin {
  /** Unique plugin name */
  name: string;
  /** Plugin version */
  version?: string;
  /** Components to register */
  components?: ComponentRegistration[];
  /** Called when plugin is installed */
  install?: (registry: ComponentRegistry) => void;
}

/**
 * Install a plugin into a registry
 */
export function installPlugin(registry: ComponentRegistry, plugin: Plugin): void {
  // Register components
  if (plugin.components) {
    for (const component of plugin.components) {
      registry.register(component);
    }
  }

  // Call install hook
  if (plugin.install) {
    plugin.install(registry);
  }
}

// =============================================================================
// Default Registry Instance
// =============================================================================

/**
 * Global default registry
 * Can be used directly or cloned for isolated instances
 */
export const defaultRegistry = new ComponentRegistry();

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create a simple component registration
 */
export function defineComponent<T extends Component>(
  name: string,
  render: ComponentRenderer<T>,
  options?: Omit<ComponentRegistration<T>, 'name' | 'render'>
): ComponentRegistration<T> {
  return {
    name,
    render,
    ...options,
  };
}

/**
 * Create a registry with built-in components pre-registered
 */
export function createRegistry(): ComponentRegistry {
  return defaultRegistry.clone();
}
