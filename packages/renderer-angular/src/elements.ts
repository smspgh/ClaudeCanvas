/**
 * Angular Elements entry point for ClaudeCanvas
 * This file creates a custom element <cc-surface-angular> that can be used in any HTML page
 */

import 'zone.js';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { ApplicationRef } from '@angular/core';
import { CcSurfaceComponent } from './lib/cc-surface.component';

// Export types for consumers
export * from './lib/types';
export { CcSurfaceComponent } from './lib/cc-surface.component';

/**
 * Initialize the Angular custom element
 * Call this function to register <cc-surface-angular> as a custom element
 */
export async function initAngularElement(): Promise<void> {
  // Check if already registered
  if (customElements.get('cc-surface-angular')) {
    console.log('cc-surface-angular already registered');
    return;
  }

  try {
    // Create a minimal Angular application
    const appRef: ApplicationRef = await createApplication({
      providers: [],
    });

    // Create the custom element from the Angular component
    const CcSurfaceElement = createCustomElement(CcSurfaceComponent, {
      injector: appRef.injector,
    });

    // Register the custom element
    customElements.define('cc-surface-angular', CcSurfaceElement);

    console.log('cc-surface-angular custom element registered');
  } catch (error) {
    console.error('Failed to initialize Angular element:', error);
    throw error;
  }
}

// Note: Auto-initialization removed to prevent conflicts when importing
// the package in Angular applications. Call initAngularElement() manually
// when using as a custom element in non-Angular contexts.
