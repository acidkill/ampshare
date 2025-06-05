/**
 * Centralized web component registration and exports.
 * Import and register all web components here.
 */

export * from './registry';

// Import and register web components
import AutoSizeTextarea from './auto-size-textarea';
import { registerWebComponent } from './registry';

// Register web components
const registerComponents = () => {
  // Register the auto-size-textarea component
  registerWebComponent('mce-autosize-textarea', AutoSizeTextarea);
  
  // Add more component registrations here
};

// Initialize web components when this module is imported
if (typeof window !== 'undefined') {
  // Register components in the browser context
  registerComponents();
  console.log('[WebComponents] Web components module loaded and components registered');
}

// Handle hot module replacement
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('[WebComponents] Hot module replacement update');
    // Re-register components on hot reload
    registerComponents();
  });
}
