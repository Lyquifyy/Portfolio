import { useContext } from 'react';
import { flushSync } from 'react-dom';
import { ThemeContext } from '../context/ThemeContext';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import './ThemeSwitch.css';

/*
 * Theme flip as a circular wipe from the button, using the View Transitions
 * API where it exists. Browsers without it just swap.
 */
export function ThemeSwitch() {
  const { dark, setDark } = useContext(ThemeContext);

  const toggle = (e) => {
    const next = !dark;
    if (!document.startViewTransition || prefersReducedMotion()) { setDark(next); return; }
    const x = e.clientX || window.innerWidth - 40;
    const y = e.clientY || 28;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const vt = document.startViewTransition(() => flushSync(() => setDark(next)));
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-switch"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Paper' : 'Blueprint'}
    >
      <span className="theme-switch__dot" aria-hidden="true" />
      <span className="theme-switch__label">{dark ? 'Paper' : 'Blueprint'}</span>
    </button>
  );
}
