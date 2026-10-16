import { useEffect, useRef } from 'react';
import { subscribe } from './scroll';

/**
 * Writes the element's scroll progress to --p on it. Returns the ref.
 * `onChange(p, rect)` is optional and always sees the latest closure.
 */
export default function useProgress({ start, end, onChange } = {}) {
  const ref = useRef(null);
  const cbRef = useRef(onChange);
  cbRef.current = onChange;
  const sKey = start ? start.join() : '';
  const eKey = end ? end.join() : '';

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    return subscribe(el, (p, r) => {
      el.style.setProperty('--p', p.toFixed(4));
      cbRef.current?.(p, r);
    }, { start, end });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sKey, eKey]);

  return ref;
}
