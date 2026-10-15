import { useEffect, useRef } from 'react';
import usePointer, { pointer } from '../hooks/usePointer';

/*
 * Drawing title block, pinned bottom-right. Reports the active sheet,
 * scroll depth as a scale, pointer coordinates and the local clock. DOM is
 * written directly on a throttled frame so React never re-renders for it.
 */
export default function TitleBlock({ chapters, active }) {
  const pctRef = useRef(null);
  const xyRef = useRef(null);
  const clockRef = useRef(null);
  usePointer();

  useEffect(() => {
    let raf = 0, last = 0;
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 100) return;
      last = t;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.round((window.scrollY / max) * 100);
      if (pctRef.current) pctRef.current.textContent = `${String(p).padStart(3, '0')}%`;
      if (xyRef.current) xyRef.current.textContent = `${String(Math.round(pointer.x)).padStart(4, '0')}, ${String(Math.round(pointer.y)).padStart(4, '0')}`;
      if (clockRef.current) {
        const d = new Date();
        clockRef.current.textContent = d.toLocaleTimeString([], { hour12: false });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const ch = chapters[active] || chapters[0];

  return (
    <aside className="tb" aria-label="Sheet information">
      <div className="tb__row"><span>Project</span><strong>Zander Erwin</strong></div>
      <div className="tb__row"><span>Sheet</span><strong>A-{ch.num}</strong><em>{ch.label}</em></div>
      <div className="tb__row"><span>Depth</span><strong ref={pctRef}>000%</strong></div>
      <div className="tb__row tb__row--xy"><span>Cursor</span><strong ref={xyRef}>0000, 0000</strong></div>
      <div className="tb__row"><span>Time</span><strong ref={clockRef}>--:--:--</strong><em>local</em></div>
      <div className="tb__row"><span>Rev</span><strong>{new Date().getFullYear()}</strong><em>issued for review</em></div>
    </aside>
  );
}
