import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { onFrame } from '../motion/scroll';

/*
 * A strip of items that never stops: it drifts on its own and the page's
 * scroll pushes it along, faster when you scroll faster. Content is
 * duplicated so the loop is seamless.
 */
export default function Ticker({ items, speed = 40, className = '' }) {
  const track = useRef(null);
  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    const reduced = prefersReducedMotion();
    let pos = 0;
    return onFrame((state, dt) => {
      const half = el.scrollWidth / 2;
      if (!half) return;
      if (!reduced) pos += (speed + Math.min(600, Math.abs(state.v)) * 6) * (dt / 1000);
      const push = reduced ? 0 : state.y * 0.35;
      const x = -((((pos + push) % half) + half) % half);
      el.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0) skewX(${(Math.max(-40, Math.min(40, state.v)) * -0.12).toFixed(2)}deg)`;
    });
  }, [speed]);
  const set = (ghost) => (
    <span className="ticker__set" aria-hidden={ghost || undefined}>
      {items.map((it, i) => <span className="ticker__item" key={i}>{it}<i aria-hidden="true" /></span>)}
    </span>
  );
  return (
    <div className={`ticker ${className}`.trim()} aria-label={items.join(', ')}>
      <div className="ticker__track" ref={track}>{set(false)}{set(true)}</div>
    </div>
  );
}
