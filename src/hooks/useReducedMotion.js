import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia(QUERY).matches;
}

export default function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange);
    };
  }, []);
  return reduced;
}
