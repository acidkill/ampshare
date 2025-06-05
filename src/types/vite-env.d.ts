/// <reference types="vite/client" />

// Extend the ImportMeta interface to include Vite's HMR types
interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    dispose(cb: () => void): void;
    accept(cb?: () => void): void;
  };
}

// Environment variables type safety
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
