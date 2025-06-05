'use client';

import React, { forwardRef, useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import type { AutoSizeTextarea as AutoSizeTextareaType } from '@/web-components/auto-size-textarea';
import { WebComponentErrorBoundary } from '../../web-components/error-handling';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mce-autosize-textarea': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'min-rows'?: number | string;
          'max-rows'?: number | string;
          value?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface AutoSizeTextareaProps extends React.HTMLAttributes<HTMLElement> {
  minRows?: number;
  maxRows?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * A React wrapper for the auto-size-textarea web component.
 * Provides a familiar React API while using the custom element under the hood.
 */
const AutoSizeTextarea = forwardRef<HTMLTextAreaElement, AutoSizeTextareaProps>(
  ({ 
    minRows = 1, 
    maxRows = 10, 
    value = '', 
    onChange, 
    className = '',
    placeholder = '',
    disabled = false,
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLElement | null>(null);
    const internalTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Update the internal ref when the component mounts or updates
    const updateInternalRef = useCallback(() => {
      if (textareaRef.current && !internalTextareaRef.current) {
        const shadowTextarea = textareaRef.current.shadowRoot?.querySelector('textarea');
        if (shadowTextarea) {
          internalTextareaRef.current = shadowTextarea as HTMLTextAreaElement;
          
          // Forward the ref to the parent component
          if (ref) {
            if (typeof ref === 'function') {
              ref(internalTextareaRef.current);
            } else {
              ref.current = internalTextareaRef.current;
            }
          }
        }
      }
    }, [ref]);

    // Handle value changes
    useEffect(() => {
      if (internalTextareaRef.current && internalTextareaRef.current.value !== value) {
        internalTextareaRef.current.value = value;
      }
    }, [value]);

    // Handle min/max rows changes
    useEffect(() => {
      if (textareaRef.current) {
        if (minRows !== undefined) {
          textareaRef.current.setAttribute('min-rows', minRows.toString());
        }
        if (maxRows !== undefined) {
          textareaRef.current.setAttribute('max-rows', maxRows.toString());
        }
      }
    }, [minRows, maxRows]);

    // Handle disabled state
    useEffect(() => {
      if (internalTextareaRef.current) {
        internalTextareaRef.current.disabled = !!disabled;
      }
    }, [disabled]);

    // Handle change events
    const handleChange = useCallback((e: Event) => {
      if (onChange && e.target) {
        const target = e.target as HTMLTextAreaElement;
        onChange({
          target: {
            ...target,
            value: target.value,
          },
          currentTarget: {
            ...target,
            value: target.value,
          },
          preventDefault: () => e.preventDefault(),
          stopPropagation: () => e.stopPropagation(),
        } as React.ChangeEvent<HTMLTextAreaElement>);
      }
    }, [onChange]);

    // Set up event listeners
    useEffect(() => {
      const currentTextarea = internalTextareaRef.current;
      if (currentTextarea) {
        currentTextarea.addEventListener('input', handleChange);
        return () => {
          currentTextarea.removeEventListener('input', handleChange);
        };
      }
    }, [handleChange]);

    // Set up mutation observer to detect when the shadow DOM is ready
    useEffect(() => {
      const observer = new MutationObserver((mutations, obs) => {
        if (textareaRef.current?.shadowRoot) {
          updateInternalRef();
          obs.disconnect();
        }
      });

      if (textareaRef.current) {
        if (textareaRef.current.shadowRoot) {
          updateInternalRef();
        } else {
          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
        }
      }

      return () => {
        observer.disconnect();
      };
    }, [updateInternalRef]);

    // Forward all props to the custom element
    const elementProps = {
      ...props,
      ref: (el: HTMLElement | null) => {
        textareaRef.current = el;
        if (el) {
          // Use requestAnimationFrame to ensure the element is in the DOM
          requestAnimationFrame(() => {
            updateInternalRef();
          });
        }
      },
      className: `w-full ${className}`,
      'min-rows': minRows,
      'max-rows': maxRows,
      placeholder,
      disabled,
    };

    // Wrap the web component with the error boundary
    return (
      <WebComponentErrorBoundary>
        {/* @ts-ignore - mce-autosize-textarea is a custom element */}
        <mce-autosize-textarea {...elementProps} />
      </WebComponentErrorBoundary>
    );
  }
);

AutoSizeTextarea.displayName = 'AutoSizeTextarea';

export { AutoSizeTextarea };
