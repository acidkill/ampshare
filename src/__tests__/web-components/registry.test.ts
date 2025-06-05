import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { registerWebComponent, isWebComponentRegistered } from '@/web-components/registry';

// Mock the custom elements registry
class MockCustomElementRegistry {
  private registry = new Map<string, CustomElementConstructor>();
  
  define(name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) {
    if (this.registry.has(name)) {
      throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': the name "${name}" has already been used with this registry`);
    }
    this.registry.set(name, constructor);
  }
  
  get(name: string): CustomElementConstructor | undefined {
    return this.registry.get(name);
  }
  
  whenDefined(name: string): Promise<void> {
    return Promise.resolve();
  }
  
  clear() {
    this.registry.clear();
  }
}

describe('Web Component Registry', () => {
  let mockCustomElements: MockCustomElementRegistry;
  
  beforeAll(() => {
    // Create a mock custom elements registry
    mockCustomElements = new MockCustomElementRegistry();
    
    // Mock the global customElements
    Object.defineProperty(window, 'customElements', {
      value: {
        define: (name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) => 
          mockCustomElements.define(name, constructor, options),
        get: (name: string) => mockCustomElements.get(name),
        whenDefined: (name: string) => mockCustomElements.whenDefined(name),
      },
      writable: true,
    });
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  beforeEach(() => {
    // Clear the registry before each test
    mockCustomElements.clear();
  });

  it('should register a new web component', () => {
    // Arrange
    const componentName = 'test-component';
    const constructor = class extends HTMLElement {};
    
    // Spy on the define method
    const defineSpy = vi.spyOn(mockCustomElements, 'define');
    
    // Act
    const result = registerWebComponent(componentName, constructor);

    // Assert
    expect(result).toBe(true);
    expect(defineSpy).toHaveBeenCalledWith(componentName, constructor, undefined);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(`Successfully registered '${componentName}'`)
    );
  });

  it('should not register a duplicate web component', () => {
    // Arrange
    const componentName = 'duplicate-component';
    const constructor1 = class extends HTMLElement {};
    const constructor2 = class extends HTMLElement {};
    
    // Spy on the define method before any registrations
    const defineSpy = vi.spyOn(mockCustomElements, 'define');
    
    // Spy on console.warn
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    // First registration should succeed
    const firstResult = registerWebComponent(componentName, constructor1);
    expect(firstResult).toBe(true);
    expect(defineSpy).toHaveBeenCalledTimes(1);
    
    // Reset the spy to only track the second registration
    defineSpy.mockClear();

    // Act - Try to register the same component again
    const secondResult = registerWebComponent(componentName, constructor2);

    // Assert
    expect(secondResult).toBe(false);
    expect(defineSpy).not.toHaveBeenCalled(); // Shouldn't call define again
    // Check that the warning was logged with the correct format
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `[WebComponent] '${componentName}' is already registered`
    );
  });

  it('should validate component name format', () => {
    // Arrange
    const invalidName = 'invalidName';
    const constructor = class extends HTMLElement {};
    
    // Spy on the define method
    const defineSpy = vi.spyOn(mockCustomElements, 'define');

    // Act & Assert
    expect(() => registerWebComponent(invalidName, constructor)).toThrow(
      /must contain a hyphen/
    );
    expect(defineSpy).not.toHaveBeenCalled();
  });

  it('should handle registration errors', () => {
    // Arrange
    const componentName = 'error-component';
    const errorMessage = 'Registration failed';
    const constructor = class extends HTMLElement {};
    
    // Mock the define method to throw an error
    const error = new Error(errorMessage);
    const defineSpy = vi.spyOn(mockCustomElements, 'define').mockImplementationOnce(() => {
      throw error;
    });
    
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error');

    // Act & Assert
    expect(() => registerWebComponent(componentName, constructor)).toThrow(errorMessage);
    
    // Check that the error was logged correctly
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[WebComponent] Failed to register '${componentName}':`,
      error
    );
  });

  it('should check if a web component is registered', () => {
    // Arrange
    const componentName = 'test-check';
    const constructor = class extends HTMLElement {};
    
    // Register a component
    mockCustomElements.define(componentName, constructor);

    // Act & Assert
    expect(isWebComponentRegistered(componentName)).toBe(true);
    expect(isWebComponentRegistered('non-existent')).toBe(false);
  });
});
