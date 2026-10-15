import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * Plot sequence. A plotter head sweeps across while the name is wiped in
 * behind it, a counter runs to 100, a stamp drops, and the sheet splits
 * top/bottom to reveal the page. Shown once per session; skipped entirely
 * for reduced-motion users.
 */
const KEY = 'plot-seen';

export default function Preloader({ onDone }) {
  const [phase, setPhase] = useState(() => {
    try { if (sessionStorage.getItem(KEY)) return 'done'; } catch {}
    return prefersReducedMotion() ? 'done' : 'plot';
  });
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (phase === 'done') { onDone?.(); return undefined; }
    document.body.classList.add('is-plotting');
    const t0 = performance.now();
    const DUR = 1500;
    let raf = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / DUR);
      const eased = 1 - Math.pow(1 - p, 3);
      setPct(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const stamp = setTimeout(() => setPhase('stamp'), 1150);
    const open = setTimeout(() => setPhase('open'), 1900);
    const done = setTimeout(() => {
      setPhase('done');
      document.body.classList.remove('is-plotting');
      try { sessionStorage.setItem(KEY, '1'); } catch {}
      onDone?.();
    }, 2700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(stamp); clearTimeout(open); clearTimeout(done);
      document.body.classList.remove('is-plotting');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`plot plot--${phase}`} aria-hidden="true">
      <div className="plot__half plot__half--top" />
      <div className="plot__half plot__half--bottom" />
      <div className="plot__stage">
        <div className="plot__name">
          <span className="plot__ink">ZANDER<br />ERWIN</span>
          <span className="plot__head" />
        </div>
        <div className="plot__meta">
          <span>PLOTTING</span>
          <span className="plot__pct">{String(pct).padStart(3, '0')}%</span>
          <span>SHEET A-000</span>
        </div>
        <div className="plot__stamp">ISSUED FOR REVIEW</div>
      </div>
    </div>
  );
}
