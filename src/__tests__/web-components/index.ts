import { registerWebComponent } from './registry';

// Import all component constructors
import { AutosizeTextarea } from './autosize-textarea';
import { OtherComponent } from './other-component';
// ... import other components as needed

// Register all components at once
export function registerAllComponents() {
  registerWebComponent('mce-autosize-textarea', AutosizeTextarea);
  registerWebComponent('mce-other-component', OtherComponent);
  // ... register other components
}

// For hot module replacement support
if (module.hot) {
  module.hot.dispose(() => {
    // Any cleanup needed for HMR
    console.log('HMR: Web components module disposed');
  });
  
  module.hot.accept(() => {
    console.log('HMR: Web components module updated');
  });
}

// Register all components by default
registerAllComponents();