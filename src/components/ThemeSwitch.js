import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export function ThemeSwitch() {
  const { dark, setDark } = useContext(ThemeContext);
  return (
    <button onClick={() => setDark(!dark)} className="theme-switch">
      {dark ? '🌞 Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
