import { useRef } from 'react';
import { pointer } from '../hooks/usePointer';

/** Perspective tilt with a specular sweep, driven by CSS custom properties. */
export default function Tilt({ children, max = 7, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    if (!pointer.fine) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return (
    <Tag ref={ref} className={`tilt ${className}`.trim()} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
    </Tag>
  );
}
