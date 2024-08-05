export {} // make this file a module

// Extend the Window interface to include custom properties
declare global {
  interface Window {
    __APOLLO_STATE__?: any;
  }
}