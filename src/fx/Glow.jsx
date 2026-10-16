import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * Three large, very soft green glows that drift slowly behind the whole
 * page and ease a little with scroll. Blur is done by the compositor
 * (CSS filter on three elements), so the cost is tiny. One of them starts
 * behind the </> in the intro. Reduced motion leaves them still.
 */
const BLOBS = [
  { x: 0.72, y: 0.42, r: 520, speed: 0.045, phase: 0.0, drift: 0.16 },
  { x: 0.18, y: 0.85, r: 440, speed: 0.032, phase: 2.1, drift: 0.14 },
  { x: 0.55, y: 1.25, r: 600, speed: 0.026, phase: 4.2, drift: 0.12 },
];

export default function Glow() {
  const refs = useRef([]);

  useEffect(() => {
    const els = refs.current.filter(Boolean);
    if (!els.length) return undefined;
    const reduced = prefersReducedMotion();
    let raf = 0, running = true;
    const t0 = performance.now();
    const place = (t) => {
      const w = window.innerWidth, h = window.innerHeight;
      const sy = window.scrollY || 0;
      els.forEach((el, i) => {
        const b = BLOBS[i];
        const a = t * b.speed + b.phase;
        const dx = Math.sin(a) * w * b.drift + Math.cos(a * 0.7) * w * b.drift * 0.4;
        const dy = Math.cos(a * 0.8) * h * b.drift + Math.sin(a * 0.5) * h * b.drift * 0.3;
        // each glow scrolls at its own slow rate so the page feels layered
        const parallax = -sy * (0.06 + i * 0.03);
        const x = b.x * w + dx - b.r / 2;
        const y = b.y * h + dy + parallax - b.r / 2;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
    };
    const frame = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      place((now - t0) / 1000);
    };
    if (reduced) { place(0); return undefined; }
    raf = requestAnimationFrame(frame);
    const onVis = () => { if (document.hidden) { running = false; cancelAnimationFrame(raf); } else if (!running) { running = true; raf = requestAnimationFrame(frame); } };
    document.addEventListener('visibilitychange', onVis);
    return () => { running = false; cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  return (
    <div className="glow" aria-hidden="true">
      {BLOBS.map((b, i) => (
        <span key={i} ref={el => { refs.current[i] = el; }} className="glow__b" style={{ width: b.r, height: b.r }} />
      ))}
    </div>
  );
}
