import { useEffect } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { onFrame } from '../motion/scroll';

/*
 * Buttons lean a few pixels towards a nearby pointer and settle back when
 * it leaves. Fine pointers only; renders nothing.
 */
export default function Magnet() {
  useEffect(() => {
    const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!fine || prefersReducedMotion()) return undefined;
    let tx = -9999, ty = -9999;
    let magnets = [];
    let tick = 0;
    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener('pointermove', onMove, { passive: true });
    const unsub = onFrame(() => {
      if (++tick % 30 === 0) magnets = Array.from(document.querySelectorAll('.btn-magnet'));
      magnets.forEach(b => {
        const r = b.getBoundingClientRect();
        const dx = tx - (r.left + r.width / 2), dy = ty - (r.top + r.height / 2);
        const reach = Math.max(r.width, r.height) * 0.9;
        const d = Math.hypot(dx, dy);
        if (d < reach) {
          const k = (1 - d / reach) * 0.35;
          b.style.transform = `translate(${(dx * k).toFixed(1)}px, ${(dy * k).toFixed(1)}px)`;
          b.classList.add('is-magnet');
        } else if (b.classList.contains('is-magnet')) {
          b.style.transform = '';
          b.classList.remove('is-magnet');
        }
      });
    });
    return () => { unsub(); window.removeEventListener('pointermove', onMove); };
  }, []);
  return null;
}
