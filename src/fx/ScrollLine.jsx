import { useEffect, useRef } from 'react';
import { subscribe } from './scrollVar';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/**
 * Writes the wrapped element's viewport progress to `--p` and toggles
 * `.is-past` on each child matching `itemSelector` once the line passes it.
 */
export default function ScrollLine({ children, className = '', itemSelector = '[data-rev]', as: Tag = 'div' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion()) {
      el.style.setProperty('--p', '1');
      el.querySelectorAll(itemSelector).forEach(i => i.classList.add('is-past'));
      return undefined;
    }
    const items = Array.from(el.querySelectorAll(itemSelector));
    return subscribe(el, (p, r) => {
      el.style.setProperty('--p', p.toFixed(4));
      const lineY = r.top + r.height * p;
      items.forEach(i => {
        const ir = i.getBoundingClientRect();
        i.classList.toggle('is-past', ir.top + 24 <= lineY);
      });
    }, { lead: window.innerHeight * 0.35, trail: window.innerHeight * 0.5 });
  }, [itemSelector]);
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
