import { safeRegisterWebComponent, WebComponentErrorBoundary } from '../../web-components/error-handling';
import { registerWebComponent } from '../../web-components/registry';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the original registerWebComponent to simulate errors
vi.mock('../../web-components/registry', () => ({
  registerWebComponent: vi.fn(),
}));

describe('safeRegisterWebComponent', () => {
  let consoleErrorSpy: vi.SpyInstance;

  beforeEach(() => {
    // Spy on console.error before each test
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('should register the component if no error occurs', () => {
    // Ensure the mock does not throw for this test case
    (registerWebComponent as vi.Mock).mockImplementation(() => {});

    const mockConstructor = class extends HTMLElement {};
    const success = safeRegisterWebComponent('test-component-success', mockConstructor);

    expect(success).toBe(true);
    expect(registerWebComponent).toHaveBeenCalledWith('test-component-success', mockConstructor);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should catch and log errors during registration', () => {
    const registrationError = new Error('Failed to register component');
    // Configure the mock to throw an error
    (registerWebComponent as vi.Mock).mockImplementation(() => {
      throw registrationError;
    });

    const mockConstructor = class extends HTMLElement {};
    const success = safeRegisterWebComponent('test-component-fail', mockConstructor);

    expect(success).toBe(false);
    expect(registerWebComponent).toHaveBeenCalledWith('test-component-fail', mockConstructor);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to register web component test-component-fail:',
      registrationError
    );
  });

  it('should return false if an error occurs', () => {
    (registerWebComponent as vi.Mock).mockImplementation(() => {
      throw new Error('Another registration error');
    });

    const mockConstructor = class extends HTMLElement {};
    const success = safeRegisterWebComponent('test-component-return', mockConstructor);

    expect(success).toBe(false);
  });
});

describe.skip('WebComponentErrorBoundary', () => {
  let consoleErrorSpy: vi.SpyInstance;

  beforeEach(() => {
    // Spy on console.error and component errors
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore mocks and cleanup DOM
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
    cleanup();
  });

  it('should render children when no error occurs', () => {
    render(
      <WebComponentErrorBoundary>
        <div data-testid="child-content">Normal content</div>
      </WebComponentErrorBoundary>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByText('Component failed to load')).not.toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should render fallback UI when a child component throws an error', () => {
    const FailingComponent = (): JSX.Element => {
      throw new Error('Component failed to render');
    };

    render(
      <WebComponentErrorBoundary>
        <FailingComponent />
      </WebComponentErrorBoundary>
    );

    // Check that the fallback UI is rendered
    expect(screen.getByText('Component failed to load')).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();

    // Verify that the error was logged
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // React logs error and errorInfo
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Web component error:',
      expect.any(Error), // Expecting an Error object
      expect.any(Object) // Expecting error info object
    );
  });

  it('should log the error and error info when a child component throws an error', () => {
    const FailingComponent = (): JSX.Element => {
      throw new Error('Component logging test');
    };

    render(
      <WebComponentErrorBoundary>
        <FailingComponent />
      </WebComponentErrorBoundary>
    );

    // Verify that the error and error info were logged
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // React logs error and errorInfo
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Web component error:',
      expect.any(Error), // Expecting an Error object
      expect.any(Object) // Expecting error info object
    );
  });
});

// TODO: Add tests for WebComponentErrorBoundary 