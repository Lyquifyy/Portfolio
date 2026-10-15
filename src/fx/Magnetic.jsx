import { useRef } from 'react';
import { pointer } from '../hooks/usePointer';

/** Pulls its child toward the pointer while hovered. No-op on coarse pointers. */
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);
  const onMove = (e) => {
    if (!pointer.fine) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <span ref={ref} className={`magnet ${className}`.trim()} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </span>
  );
}
