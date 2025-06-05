/**
 * Registry for managing web component registration to prevent duplicate definitions.
 * Provides a singleton pattern for web component registration with safety checks.
 */

// Track registered component names to prevent duplicate registrations
const registeredComponents = new Set<string>();

/**
 * Safely registers a web component if it hasn't been registered already.
 * @param name - The name of the custom element (must contain a hyphen)
 * @param constructor - The custom element constructor
 * @returns boolean - True if registration was successful, false if the component was already registered
 * @throws {Error} If the component name is invalid or registration fails
 */
export function registerWebComponent(
  name: string,
  constructor: CustomElementConstructor
): boolean {
  // Validate component name
  if (!name || typeof name !== 'string') {
    throw new Error('Component name must be a non-empty string');
  }

  // Custom elements must contain a hyphen in their name
  if (!name.includes('-')) {
    throw new Error(
      `Custom element name '${name}' must contain a hyphen`
    );
  }

  // Check if already registered in our Set
  if (registeredComponents.has(name)) {
    console.warn(`[WebComponent] '${name}' is already registered`);
    return false;
  }

  // Check if already defined in the custom elements registry
  if (customElements.get(name)) {
    console.warn(
      `[WebComponent] '${name}' is already defined in the custom elements registry`
    );
    return false;
  }

  try {
    // Register the web component
    customElements.define(name, constructor);
    registeredComponents.add(name);
    console.log(`[WebComponent] Successfully registered '${name}'`);
    return true;
  } catch (error) {
    console.error(`[WebComponent] Failed to register '${name}':`, error);
    throw error;
  }
}

/**
 * Checks if a web component is already registered
 * @param name - The name of the custom element to check
 * @returns boolean - True if the component is registered, false otherwise
 */
export function isWebComponentRegistered(name: string): boolean {
  return registeredComponents.has(name) || !!customElements.get(name);
}

// Handle hot module replacement in development
if (import.meta.hot) {
  // Clean up registered components when hot reloading
  import.meta.hot.dispose(() => {
    console.log('[WebComponent] Cleaning up registered components for HMR');
    // Note: We can't actually unregister custom elements, but we can clear our tracking
    registeredComponents.clear();
  });
}
