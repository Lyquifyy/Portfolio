import { useEffect, useRef, useState } from 'react';
import { subscribe } from './scrollVar';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * Scroll-driven horizontal rail. The section is tall; a sticky viewport
 * inside it translates the track sideways as the page scrolls, so native
 * scrolling drives the gallery and nothing is hijacked. Below the wide
 * breakpoint it degrades to a plain scroll-snap row.
 */
export default function SheetRail({ count, renderHud, children }) {
  const wrap = useRef(null);
  const stick = useRef(null);
  const track = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !track.current) return undefined;
    const mq = window.matchMedia ? window.matchMedia('(max-width: 899px)') : { matches: false };
    const reduced = prefersReducedMotion();
    let lastIdx = -1;
    const unsub = subscribe(el, (p) => {
      if (mq.matches) { track.current.style.transform = ''; return; }
      const max = track.current.scrollWidth - stick.current.clientWidth;
      const x = -p * Math.max(0, max);
      track.current.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      el.style.setProperty('--p', p.toFixed(4));
      const idx = Math.min(count - 1, Math.round(p * (count - 1)));
      if (idx !== lastIdx) { lastIdx = idx; setIndex(idx); }
    }, { lead: window.innerHeight, trail: window.innerHeight });
    if (reduced) track.current.style.transition = 'none';
    return unsub;
  }, [count]);

  return (
    <div ref={wrap} className="rail-wrap" style={{ '--count': count }}>
      <div ref={stick} className="rail-stick">
        {renderHud && renderHud(index)}
        <div ref={track} className="rail-track">
          {children}
        </div>
      </div>
    </div>
  );
}
