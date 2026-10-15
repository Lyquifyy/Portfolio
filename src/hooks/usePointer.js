import { useEffect } from 'react';

/** Shared pointer state so every effect reads the same values without extra listeners. */
export const pointer = {
  x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  nx: 0, // -1..1
  ny: 0,
  down: false,
  fine: typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: fine)').matches : false,
};

let bound = false;
let users = 0;

function onMove(e) {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
}
function onDown() { pointer.down = true; }
function onUp()   { pointer.down = false; }

export default function usePointer() {
  useEffect(() => {
    users += 1;
    if (!bound) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
      bound = true;
    }
    return () => {
      users -= 1;
      if (users === 0 && bound) {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        bound = false;
      }
    };
  }, []);
  return pointer;
}
