import { render, screen } from '@testing-library/react';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

beforeAll(() => {
  // jsdom does not implement these
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = window.matchMedia || ((q) => ({
    matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }));
  // canvas is not implemented in jsdom; every canvas effect must cope with a null context
  HTMLCanvasElement.prototype.getContext = () => null;
});

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

test('renders the masthead and chapters', () => {
  renderApp();
  expect(screen.getAllByText(/Zander Erwin/i).length).toBeGreaterThan(0);
  expect(screen.getByRole('navigation', { name: /chapters/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /^work$/i })).toBeInTheDocument();
});

test('renders one card per project and every résumé download', () => {
  renderApp();
  expect(document.querySelectorAll('.sheet')).toHaveLength(9);
  expect(screen.getAllByRole('link', { name: /download pdf/i })).toHaveLength(2);
});

test('the canvas degrades when the context is unavailable', () => {
  renderApp();
  expect(screen.getByRole('img', { name: /massing model/i })).toBeInTheDocument();
});
