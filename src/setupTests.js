// jest-dom adds custom jest matchers for asserting on DOM nodes.
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

/* --------------------------------------------------------------------------
   jsdom shims.

   The design leans on browser APIs jsdom does not implement. Each of these is
   stubbed rather than mocked with behaviour — the components already handle
   the "not available" path (canvas returns null, WebGL falls back to the CSS
   gradient), so the tests exercise exactly the degraded path a browser
   without these features would take.
   -------------------------------------------------------------------------- */

window.matchMedia = window.matchMedia || ((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
}));

class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

global.IntersectionObserver = global.IntersectionObserver || MockObserver;
global.ResizeObserver = global.ResizeObserver || MockObserver;

// jsdom logs a noisy "Not implemented" error for getContext; returning null
// is the same signal a context-less browser gives, and the components guard
// for it.
HTMLCanvasElement.prototype.getContext = () => null;

Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
