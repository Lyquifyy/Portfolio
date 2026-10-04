import { render, screen } from '@testing-library/react';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

beforeAll(() => {
  // jsdom does not implement IntersectionObserver
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

test('renders the masthead name and chapters', () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
  expect(screen.getAllByText(/Zander/i).length).toBeGreaterThan(0);
  expect(screen.getByRole('navigation', { name: /chapters/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /projects/i })).toBeInTheDocument();
});
