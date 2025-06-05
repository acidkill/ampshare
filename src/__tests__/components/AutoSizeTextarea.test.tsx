import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { AutoSizeTextarea } from '@/components/ui/auto-size-textarea';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';

  // Mock the web component
class MockAutoSizeTextarea extends HTMLElement {
  declare shadowRoot: ShadowRoot;
  textarea: HTMLTextAreaElement;
  private _testId: string | null = null;
  private _attrs: Record<string, string> = {};
  private _classList = new Set<string>();
  
  // Add index signature to allow dynamic property access
  [key: string]: any;
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.textarea = document.createElement('textarea');
    this.shadowRoot.appendChild(this.textarea);
    
    // Store the original methods
    const originalSetAttribute = this.setAttribute.bind(this);
    const originalGetAttribute = this.getAttribute.bind(this);
    
    // Create a custom classList implementation
    const classList: DOMTokenList & {
      value: string[];
      _classList: Set<string>;
      add: (...tokens: string[]) => void;
      remove: (...tokens: string[]) => void;
      contains: (token: string) => boolean;
      toggle: (token: string, force?: boolean) => boolean;
      replace: (oldToken: string, newToken: string) => boolean;
    } = {
      _classList: this._classList,
      get value() {
        return Array.from(this._classList);
      },
      get length() {
        return this._classList.size;
      },
      item: (index: number) => Array.from(this._classList)[index] || null,
      contains: (token: string) => this._classList.has(token),
      add: (...tokens: string[]) => {
        tokens.forEach(token => this._classList.add(token));
        this.textarea.classList.add(...tokens);
      },
      remove: (...tokens: string[]) => {
        tokens.forEach(token => this._classList.delete(token));
        this.textarea.classList.remove(...tokens);
      },
      toggle: (token: string, force?: boolean) => {
        const result = force !== undefined 
          ? force 
          : !this._classList.has(token);
          
        if (result) {
          this._classList.add(token);
        } else {
          this._classList.delete(token);
        }
        
        this.textarea.classList.toggle(token, result);
        return result;
      },
      replace: (oldToken: string, newToken: string) => {
        if (this._classList.has(oldToken)) {
          this._classList.delete(oldToken);
          this._classList.add(newToken);
          this.textarea.classList.replace(oldToken, newToken);
          return true;
        }
        return false;
      },
      forEach: (callbackfn: (value: string, index: number, list: DOMTokenList) => void, thisArg?: any) => {
        Array.from(this._classList).forEach((token, index) => {
          callbackfn.call(thisArg || this, token, index, this as unknown as DOMTokenList);
        });
      },
      entries: function() { return Array.from(this._classList.entries()) as any; },
      keys: function() { return Array.from(this._classList.keys()) as any; },
      values: function() { return Array.from(this._classList.values()) as any; },
      [Symbol.iterator]: function() { return this._classList[Symbol.iterator](); },
      toString: function() { return Array.from(this._classList).join(' '); }
    } as DOMTokenList;
    
    // Override setAttribute
    this.setAttribute = (name: string, value: string) => {
      this._attrs[name] = String(value);
      this.textarea.setAttribute(name, String(value));
      
      // Special handling for class
      if (name === 'class') {
        this._classList = new Set(value.split(/\s+/).filter(Boolean));
      }
      
      // Trigger attribute change for test ID
      if (name === 'data-testid') {
        this._testId = String(value);
      }
      
      return originalSetAttribute(name, value);
    };
    
    // Override getAttribute
    this.getAttribute = (name: string) => {
      if (name === 'data-testid') {
        return this._testId || null;
      }
      return this._attrs[name] ?? this.textarea.getAttribute(name);
    };
    
    // Assign the custom classList
    Object.defineProperty(this, 'classList', {
      value: classList,
      writable: false,
      configurable: true
    });
    
    // Handle event listeners
    this.addEventListener = vi.fn((type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => {
      if (listener) {
        this.textarea.addEventListener(type, listener as EventListener, options);
      }
    });
    
    this.removeEventListener = vi.fn((type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) => {
      if (listener) {
        this.textarea.removeEventListener(type, listener as EventListener, options);
      }
    });
  }
  
  // Mock the shadowRoot.querySelector
  querySelector(selector: string) {
    if (selector === 'textarea') {
      return this.textarea;
    }
    return null;
  }
  
  // Add getter for test id
  get testId() {
    return this._testId;
  }
  
  // Add hasAttribute for testing
  hasAttribute(name: string): boolean {
    return name in this._attrs || this.textarea.hasAttribute(name);
  }
  
  // Add getBoundingClientRect for testing
  getBoundingClientRect(): DOMRect {
    return this.textarea.getBoundingClientRect();
  }
}

// Import jest-dom matchers for better assertions
import '@testing-library/jest-dom';

// Mock the custom elements registry
beforeAll(() => {
  // Clean up any existing definitions by replacing the customElements.get method
  const originalGet = customElements.get;
  
  // @ts-ignore - Override for testing
  customElements.get = (name: string) => {
    if (name === 'mce-autosize-textarea') {
      return undefined;
    }
    return originalGet.call(customElements, name);
  };
  
  // Mock the customElements.define to register our mock component
  customElements.define('mce-autosize-textarea', MockAutoSizeTextarea);
  
  // Restore the original get method
  customElements.get = originalGet;
  
  // Mock console methods
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

// Custom test ID getter for our mock component
const getByTestId = (container: HTMLElement, testId: string) => {
  // Find our custom element with the test ID
  const elements = container.querySelectorAll('mce-autosize-textarea');
  return Array.from(elements).find(
    (el) => (el as any).testId === testId || el.getAttribute('data-testid') === testId
  );
};

describe('AutoSizeTextarea', () => {
  const mockOnChange = vi.fn();
  let container: HTMLElement;
  
  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    cleanup();
    document.body.removeChild(container);
  });

  it('renders the web component with default props', () => {
    const { container } = render(
      <AutoSizeTextarea onChange={mockOnChange} data-testid="autosize-textarea" />,
      { container: document.body.appendChild(document.createElement('div')) }
    );
    
    const textarea = getByTestId(container, 'autosize-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('min-rows', '1');
    expect(textarea).toHaveAttribute('max-rows', '10');
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    const { container } = render(
      <AutoSizeTextarea 
        className={customClass} 
        onChange={mockOnChange} 
        data-testid="autosize-textarea" 
      />,
      { container: document.body.appendChild(document.createElement('div')) }
    );
    
    const textarea = getByTestId(container, 'autosize-textarea');
    expect(textarea).toHaveClass(customClass);
  });

  it('handles value changes', async () => {
    const testValue = 'Test value';
    const { container } = render(
      <AutoSizeTextarea 
        value={testValue} 
        onChange={mockOnChange} 
        data-testid="autosize-textarea" 
      />,
      { container: document.body.appendChild(document.createElement('div')) }
    );
    
    const textarea = getByTestId(container, 'autosize-textarea');
    expect(textarea).toHaveAttribute('value', testValue);
    
    // Simulate a change event
    const newValue = 'Updated value';
    fireEvent.change(textarea as Element, { target: { value: newValue } });
    
    // Verify the onChange handler was called
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: newValue,
        }),
      })
    );
  });

  it('handles minRows and maxRows props', () => {
    const minRows = 2;
    const maxRows = 5;
    
    const { container } = render(
      <AutoSizeTextarea 
        minRows={minRows} 
        maxRows={maxRows} 
        onChange={mockOnChange}
        data-testid="autosize-textarea"
      />,
      { container: document.body.appendChild(document.createElement('div')) }
    );
    
    const textarea = getByTestId(container, 'autosize-textarea');
    expect(textarea).toHaveAttribute('min-rows', minRows.toString());
    expect(textarea).toHaveAttribute('max-rows', maxRows.toString());
  });

  it('handles disabled state', () => {
    const { container } = render(
      <AutoSizeTextarea 
        disabled 
        onChange={mockOnChange} 
        data-testid="autosize-textarea" 
      />,
      { container: document.body.appendChild(document.createElement('div')) }
    );
    
    const textarea = getByTestId(container, 'autosize-textarea');
    expect(textarea).toHaveAttribute('disabled', '');
    
    // Verify the textarea is actually disabled in the shadow DOM
    const shadowTextarea = (textarea as any).querySelector('textarea');
    expect(shadowTextarea).toHaveAttribute('disabled', '');
  });

  it('forwards ref to the underlying textarea', async () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    
    const { container } = render(
      <AutoSizeTextarea 
        ref={ref} 
        onChange={mockOnChange}
        data-testid="autosize-textarea"
      />,
      { container: document.body.appendChild(document.createElement('div')) }
    );
    
    // The ref should be forwarded to the underlying textarea
    const textarea = getByTestId(container, 'autosize-textarea');
    const shadowTextarea = (textarea as any).querySelector('textarea');
    
    // The ref should point to the actual textarea in the shadow DOM
    expect(ref.current).toBe(shadowTextarea);
  });
  
  it('handles placeholder prop', () => {
    const placeholderText = 'Enter your text here';
    const { container } = render(
      <AutoSizeTextarea 
        placeholder={placeholderText} 
        onChange={mockOnChange}
        data-testid="autosize-textarea"
      />,
      { container: document.body.appendChild(document.createElement('div')) }
    );
    
    const textarea = getByTestId(container, 'autosize-textarea');
    const shadowTextarea = (textarea as any).querySelector('textarea');
    expect(shadowTextarea).toHaveAttribute('placeholder', placeholderText);
  });
});
