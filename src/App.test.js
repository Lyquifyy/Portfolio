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

test('renders the masthead, chapters and title block', () => {
  renderApp();
  expect(screen.getAllByText(/Zander Erwin/i).length).toBeGreaterThan(0);
  expect(screen.getByRole('navigation', { name: /chapters/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /sheets/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/sheet information/i)).toBeInTheDocument();
});

test('renders one project sheet per project and every résumé download', () => {
  renderApp();
  expect(screen.getAllByText(/^A-1\d\d$/).length).toBeGreaterThanOrEqual(2 * 9);
  expect(screen.getAllByRole('link', { name: /download pdf/i })).toHaveLength(2);
});

test('canvases degrade when the context is unavailable', () => {
  renderApp();
  expect(screen.getByRole('img', { name: /massing model/i })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /skill sphere/i })).toBeInTheDocument();
});
