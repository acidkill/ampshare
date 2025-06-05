// web-components/lazy-registry.ts
import { registerWebComponent } from './registry';

const loadedComponents = new Set<string>();

export function lazyLoadComponent(name: string, importFn: () => Promise<any>) {
  if (loadedComponents.has(name)) return Promise.resolve();
  
  return importFn().then(module => {
    const constructor = module.default || module[name];
    if (constructor) {
      registerWebComponent(name, constructor);
      loadedComponents.add(name);
    }
    return constructor;
  }).catch(error => {
    console.error(`Failed to lazy load component ${name}:`, error);
    return null;
  });
}

// Usage example
export function setupLazyComponents() {
  // Set up intersection observer for elements that need lazy loading
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const componentName = element.getAttribute('data-component');
        if (componentName === 'mce-autosize-textarea') {
          lazyLoadComponent('mce-autosize-textarea', () => import('./autosize-textarea'));
        }
        // Unobserve after loading
        observer.unobserve(element);
      }
    });
  });
  
  // Observe elements that should trigger lazy loading
  document.querySelectorAll('[data-component]').forEach(el => {
    observer.observe(el);
  });
} 