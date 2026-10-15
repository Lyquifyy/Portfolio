import { useEffect, useRef, useState } from 'react';
import useInView from '../hooks/useInView';

/*
 * A dimension line that measures its own rendered width, like a drawing
 * annotation. The label is the live pixel width, so it is honest on every
 * viewport. Extension lines and ticks draw in on first view.
 */
export default function Dimension({ label, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.5 });
  const inner = useRef(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const el = inner.current;
    if (!el) return undefined;
    // offsetWidth ignores the scaleX(0) the line starts at; a bounding rect would read 0
    const measure = () => setW(Math.round(el.offsetWidth));
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={`dim ${inView ? 'is-in' : ''} ${className}`.trim()} aria-hidden="true">
      <div ref={inner} className="dim__line">
        <span className="dim__tick dim__tick--l" />
        <span className="dim__tick dim__tick--r" />
        <span className="dim__label">{label ? `${label} · ` : ''}{w.toLocaleString()} px</span>
      </div>
    </div>
  );
}
