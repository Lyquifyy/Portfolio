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
  expect(document.querySelectorAll('.sheet')).toHaveLength(12);
  expect(screen.getAllByRole('link', { name: /download pdf/i })).toHaveLength(2);
  expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
});

test('the canvas degrades when the context is unavailable', () => {
  renderApp();
  expect(screen.getByRole('img', { name: /code brackets/i })).toBeInTheDocument();
});

test('a project opens into a sheet and closes with Escape', async () => {
  const { fireEvent } = require('@testing-library/react');
  renderApp();
  fireEvent.click(screen.getByRole('button', { name: /^open dinesense$/i }));
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toHaveTextContent(/dinesense/i);
  expect(screen.getByText(/chains with published figures/i)).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
  await new Promise(r => setTimeout(r, 450));
  expect(screen.queryByRole('dialog')).toBeNull();
});
