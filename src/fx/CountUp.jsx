import { useEffect, useState } from 'react';
import useInView from '../hooks/useInView';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

export default function CountUp({ to, duration = 1100, format = (n) => String(n), className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.6 });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReducedMotion()) { setN(to); return undefined; }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - p, 4);
      setN(Math.round(to * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref} className={className}>{format(n)}</span>;
}
