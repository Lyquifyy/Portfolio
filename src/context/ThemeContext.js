import { createContext, useState, useLayoutEffect } from 'react';

export const ThemeContext = createContext({ dark: false, setDark: () => {} });

function initialDark() {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  } catch {}
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(initialDark);

  // Layout effect so a flushSync() inside a view transition sees the new
  // theme attribute before the transition snapshot is taken.
  useLayoutEffect(() => {
    document.body.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
