import { useEffect, useRef, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#________01';

/**
 * Decodes `target` from random glyphs. Re-runs whenever `target` changes.
 * Returns the string to render.
 */
export default function useScramble(target, { speed = 28, enabled = true } = {}) {
  const [out, setOut] = useState(enabled ? '' : target);
  const frame = useRef(null);
  const prev  = useRef('');

  useEffect(() => {
    if (!enabled) { setOut(target); return undefined; }
    const from = prev.current;
    const to   = target;
    const len  = Math.max(from.length, to.length);
    const queue = Array.from({ length: len }, (_, i) => {
      const start = Math.floor(Math.random() * 10);
      return { from: from[i] || '', to: to[i] || '', start, end: start + Math.floor(Math.random() * 12) + 4, ch: '' };
    });
    let tick = 0;
    let last = 0;

    const step = (t) => {
      frame.current = requestAnimationFrame(step);
      if (t - last < speed) return;
      last = t;
      let done = 0;
      let s = '';
      for (const q of queue) {
        if (tick >= q.end) { done += 1; s += q.to; }
        else if (tick >= q.start) {
          if (!q.ch || Math.random() < 0.28) q.ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          s += q.ch;
        } else s += q.from;
      }
      setOut(s);
      tick += 1;
      if (done === queue.length) { cancelAnimationFrame(frame.current); prev.current = to; setOut(to); }
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, speed, enabled]);

  return out;
}
