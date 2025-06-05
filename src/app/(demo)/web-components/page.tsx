'use client';

import { useState, useEffect } from 'react';
import { AutoSizeTextarea } from '@/components/ui/auto-size-textarea';

/**
 * Demo page for testing the AutoSizeTextarea web component
 */
export default function WebComponentsDemo() {
  const [value, setValue] = useState('');
  const [minRows, setMinRows] = useState(1);
  const [maxRows, setMaxRows] = useState(5);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we're in the browser before rendering the web component
  useEffect(() => {
    setIsMounted(true);
    
    // Dynamically import the web components module
    import('@/web-components')
      .then(() => console.log('Web components loaded successfully'))
      .catch(err => console.error('Failed to load web components:', err));
  }, []);

  if (!isMounted) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Loading Web Components...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Web Components Demo</h1>
      
      <section className="mb-8 p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">AutoSize Textarea</h2>
        <p className="text-gray-600 mb-4">
          This is a web component that automatically adjusts its height based on content.
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Rows</label>
              <input
                type="number"
                min="1"
                max="10"
                value={minRows}
                onChange={(e) => setMinRows(parseInt(e.target.value) || 1)}
                className="border rounded p-2 w-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Rows</label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxRows}
                onChange={(e) => setMaxRows(parseInt(e.target.value) || 5)}
                className="border rounded p-2 w-20"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Auto-resizing Textarea</label>
            <AutoSizeTextarea
              minRows={minRows}
              maxRows={maxRows}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type something here..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Current Value:</h3>
            <pre className="whitespace-pre-wrap break-words bg-white p-3 rounded border">
              {value || '(empty)'}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
