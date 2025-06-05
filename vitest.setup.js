// vitest.setup.js
import { vi, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Run cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia which is not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver which is not available in jsdom
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = window.ResizeObserver || ResizeObserverStub;

// Mock IntersectionObserver which is not available in jsdom
class IntersectionObserverStub {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = window.IntersectionObserver || IntersectionObserverStub;

// Mock the customElements.define method
const originalDefine = customElements.define;
customElements.define = function(name, constructor, options) {
  // Skip if already defined
  if (!customElements.get(name)) {
    return originalDefine.call(customElements, name, constructor, options);
  }
  return undefined;
};

// Mock the customElements.get method
const originalGet = customElements.get;
customElements.get = function(name) {
  // Return a basic HTMLElement if the component doesn't exist
  if (!originalGet.call(customElements, name)) {
    return class extends HTMLElement {};
  }
  return originalGet.call(customElements, name);
};

// Mock the console methods to reduce test noise
const consoleMethods = ['error', 'warn', 'log'];

beforeEach(() => {
  // Mock console methods
  consoleMethods.forEach(method => {
    console[method] = vi.fn();
  });
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});
