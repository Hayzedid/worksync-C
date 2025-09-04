// Single entry point for Yjs to avoid multiple copies during HMR
// Re-export the library and provide a default namespace import
import * as Y from 'yjs';

// Re-export all named exports for compatibility
export * from 'yjs';

// Default export so existing code can do `import Y from './singleYjs'`
export default Y;

// Also export the namespace under the name `Y` for convenience
export { Y };
