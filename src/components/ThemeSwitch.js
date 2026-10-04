import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './ThemeSwitch.css';

export function ThemeSwitch() {
  const { dark, setDark } = useContext(ThemeContext);
  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      className="theme-switch"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light' : 'Dark'}
    >
      <span className="theme-switch__dot" aria-hidden="true" />
      <span className="theme-switch__label">{dark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
