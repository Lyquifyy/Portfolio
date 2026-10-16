import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './useReducedMotion';
import { onFrame } from '../motion/scroll';

/*
 * Leans an element a few degrees towards the pointer and lets it settle
 * back. Writes --rx / --ry (degrees) and --gx / --gy (percent) on the
 * element; the CSS decides what to do with them. Fine pointers only.
 */
export default function useTilt({ max = 6 } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!fine || prefersReducedMotion()) return undefined;
    let tx = 0, ty = 0, cx = 0, cy = 0, inside = false;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      inside = true;
      el.style.setProperty('--gx', `${((tx + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${((ty + 0.5) * 100).toFixed(1)}%`);
    };
    const leave = () => { inside = false; tx = 0; ty = 0; };
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    const unsub = onFrame((_, dt) => {
      const k = 1 - Math.pow(0.88, dt / 16.7);
      cx += (tx - cx) * k; cy += (ty - cy) * k;
      if (!inside && Math.abs(cx) < 0.001 && Math.abs(cy) < 0.001) return;
      el.style.setProperty('--rx', (-cy * max).toFixed(2));
      el.style.setProperty('--ry', (cx * max).toFixed(2));
    });
    return () => { unsub(); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [max]);
  return ref;
}
