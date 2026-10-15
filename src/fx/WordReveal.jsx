import { useEffect, useRef } from 'react';
import { subscribe } from './scrollVar';
import useInView from '../hooks/useInView';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * Words brighten one after another. In `scroll` mode progress is a CSS
 * variable driven by the paragraph's position (starts as it enters, done by
 * the time its bottom passes 60% of the viewport). In `enter` mode, for copy
 * that is on screen at load, the words simply stagger in once.
 */
export default function WordReveal({ text, as: Tag = 'p', className = '', mode = 'scroll' }) {
  const ref = useRef(null);
  const [inRef, inView] = useInView({ threshold: 0.2 });
  const words = text.split(' ');

  useEffect(() => {
    const el = ref.current;
    if (!el || mode !== 'scroll') return undefined;
    if (prefersReducedMotion()) { el.style.setProperty('--p', '1'); return undefined; }
    return subscribe(el, (_, r) => {
      const vh = window.innerHeight;
      const p = (vh * 0.92 - r.top) / (vh * 0.32 + r.height);
      el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
    });
  }, [mode]);

  const setRefs = (node) => { ref.current = node; inRef.current = node; };

  return (
    <Tag
      ref={setRefs}
      className={`wr ${mode === 'enter' ? 'wr--enter' : ''} ${inView ? 'is-in' : ''} ${className}`.trim()}
      style={{ '--n': words.length }}
    >
      {words.map((w, i) => (
        <span key={i} className="wr__w" style={{ '--i': i }}>{w}{i < words.length - 1 ? ' ' : ''}</span>
      ))}
    </Tag>
  );
}
