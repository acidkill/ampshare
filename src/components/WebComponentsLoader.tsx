'use client';

import { useEffect } from 'react';

/**
 * Component that ensures web components are loaded on the client side.
 * This should be placed in the root layout to ensure all web components are registered
 * before they're used anywhere in the application.
 */
export function WebComponentsLoader() {
  useEffect(() => {
    // Import the web components module
    const loadWebComponents = async () => {
      try {
        // Use dynamic import to ensure this only runs on the client
        await import('@/web-components');
        console.log('Web components loaded successfully');
      } catch (error) {
        console.error('Failed to load web components:', error);
      }
    };

    loadWebComponents();
  }, []);

  return null; // This component doesn't render anything
}
