import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import WorkoutDemo from './components/WorkoutDemo';

beforeAll(() => {
  global.IntersectionObserver = class { observe() {} disconnect() {} };
});

afterEach(() => { jest.useRealTimers(); });

test('gives hiring teams a résumé, contact, and working section destinations', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('I make the pieces work together.');
  expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  screen.getAllByRole('link').filter(link => link.getAttribute('href')?.startsWith('#')).forEach(link => {
    expect(document.getElementById(link.getAttribute('href').slice(1))).not.toBeNull();
  });
  expect(screen.getByRole('link', { name: 'Résumé PDF' })).toHaveAttribute('href', expect.stringContaining('Zander_Erwin_Software_Resume.pdf'));
  expect(screen.getByRole('link', { name: 'zandererwin2023@gmail.com' })).toHaveAttribute('href', 'mailto:zandererwin2023@gmail.com');
  expect(screen.getByText('Invite-only pilot')).toBeInTheDocument();
  expect(screen.getByText('In development · Private repository')).toBeInTheDocument();
});

test('software stack choices update the explanation and accessible diagram', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Data', exact: true }));
  expect(screen.getByRole('button', { name: 'Data', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Logic', exact: true })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('img', { name: /data layer highlighted/ })).toBeInTheDocument();
  expect(screen.getByText('PostgreSQL · Oracle')).toBeInTheDocument();
});

test('DineSense preview selection updates the real preview image', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Compare options' }));
  expect(screen.getByRole('img', { name: 'DineSense restaurant results preview' })).toHaveAttribute('src', expect.stringContaining('dinesense-results.webp'));
});

test('the navigation can close with Escape and returns focus', () => {
  render(<App />);
  const menu = screen.getByRole('button', { name: /Menu/ });
  fireEvent.click(menu);
  expect(menu).toHaveAttribute('aria-expanded', 'true');
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  expect(menu).toHaveFocus();
});

test('copy failure offers a usable contact fallback', async () => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: jest.fn().mockRejectedValue(new Error('Unavailable')) }, configurable: true });
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Copy email' }));
  expect(await screen.findByText('Copy unavailable. Use the email link to get in touch.')).toBeInTheDocument();
});

test('a skipped rest advances exactly once and the demo can finish and reset', () => {
  render(<WorkoutDemo />);
  for (let set = 1; set <= 4; set++) {
    fireEvent.click(screen.getByRole('button', { name: 'Log set' }));
    expect(screen.getByLabelText(`${set} of 4 sets complete`)).toBeInTheDocument();
    if (set < 4) {
      fireEvent.click(screen.getByRole('button', { name: 'Skip rest' }));
      expect(screen.getByLabelText(`${set} of 4 sets complete`)).toBeInTheDocument();
    }
  }
  expect(screen.getByRole('heading', { name: 'Good work.' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(screen.getByLabelText('0 of 4 sets complete')).toBeInTheDocument();
});

test('the workout rest timer pauses, resumes, and naturally completes without logging an extra set', () => {
  jest.useFakeTimers();
  render(<WorkoutDemo />);
  fireEvent.click(screen.getByRole('button', { name: 'Log set' }));
  expect(screen.getByLabelText('Rest time remaining')).toHaveTextContent('1:30');
  act(() => jest.advanceTimersByTime(1000));
  expect(screen.getByLabelText('Rest time remaining')).toHaveTextContent('1:29');
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  act(() => jest.advanceTimersByTime(5000));
  expect(screen.getByLabelText('Rest time remaining')).toHaveTextContent('1:29');
  fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
  for (let second = 0; second < 89; second++) act(() => jest.advanceTimersByTime(1000));
  expect(screen.getByRole('button', { name: 'Log set' })).toBeInTheDocument();
  expect(screen.getByLabelText('1 of 4 sets complete')).toBeInTheDocument();
});

test('request playback can restart and a manual selection cancels pending steps', () => {
  jest.useFakeTimers();
  render(<App />);
  const run = screen.getByRole('button', { name: 'Run a request through the software stack' });
  fireEvent.click(run);
  expect(screen.getByRole('button', { name: 'Interface', exact: true })).toHaveAttribute('aria-pressed', 'true');
  act(() => jest.advanceTimersByTime(680));
  expect(screen.getByRole('button', { name: 'Logic', exact: true })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(run);
  act(() => jest.advanceTimersByTime(1360));
  expect(screen.getByRole('button', { name: 'Data', exact: true })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Interface', exact: true }));
  act(() => jest.advanceTimersByTime(5000));
  expect(screen.getByRole('button', { name: 'Interface', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('reduced motion provides the completed request explanation without a moving sequence', () => {
  const original = window.matchMedia;
  window.matchMedia = jest.fn().mockReturnValue({ matches: true, addEventListener() {}, removeEventListener() {} });
  try {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Run a request through the software stack' }));
    expect(screen.getByText('Request complete: interface, logic, data, and back.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logic', exact: true })).toHaveAttribute('aria-pressed', 'true');
  } finally { window.matchMedia = original; }
});

test('request animation is cancelled when the browser tab becomes hidden', () => {
  jest.useFakeTimers();
  const original = Object.getOwnPropertyDescriptor(document, 'hidden');
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Run a request through the software stack' }));
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  fireEvent(document, new Event('visibilitychange'));
  act(() => jest.advanceTimersByTime(5000));
  expect(screen.getByRole('button', { name: 'Logic', exact: true })).toHaveAttribute('aria-pressed', 'true');
  if (original) Object.defineProperty(document, 'hidden', original);
  else delete document.hidden;
});
