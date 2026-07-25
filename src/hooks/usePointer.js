import { useEffect, useRef } from 'react';

/**
 * Tracks the pointer in normalized viewport space (0..1) on a ref, not state —
 * cursor movement must never trigger a React render. Canvas loops read
 * `ref.current` on their own rAF tick.
 *
 * Returns { x, y, active } where `active` is false until the pointer has moved
 * at least once, so effects can stay centered on touch devices.
 */
export function usePointer() {
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    let frame = null;
    let pending = null;

    const flush = () => {
      frame = null;
      if (!pending) return;
      pointer.current = { x: pending.x, y: pending.y, active: true };
      pending = null;
    };

    const onMove = (e) => {
      pending = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
      if (frame === null) frame = requestAnimationFrame(flush);
    };

    const onLeave = () => {
      pointer.current = { x: 0.5, y: 0.5, active: false };
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return pointer;
}
