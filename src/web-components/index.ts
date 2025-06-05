/**
 * Centralized web component registration and exports.
 * Import and register all web components here.
 */

export * from './registry';
export * from './error-handling'; // Export the new error handling functions/components

// Import necessary functions and components
import AutoSizeTextarea from './auto-size-textarea';
import { safeRegisterWebComponent } from './error-handling'; // Import safeRegisterWebComponent

// Register web components using safe registration
const registerComponents = () => {
  // Register the auto-size-textarea component
  safeRegisterWebComponent('mce-autosize-textarea', AutoSizeTextarea);
  
  // Add more component registrations here
};

// Initialize web components when this module is imported
if (typeof window !== 'undefined') {
  // Register components in the browser context
  registerComponents();
  console.log('[WebComponents] Web components module loaded and components registered (with error handling)'); // Update log message
}

// Handle hot module replacement
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('[WebComponents] Hot module replacement update');
    // Re-register components on hot reload using safe registration
    registerComponents(); // The function now uses safeRegisterWebComponent internally
  });
}
