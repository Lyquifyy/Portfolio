import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { SPRING_MAGNETIC } from '../motion/variants';
import './MagneticButton.css';

const PULL = 0.32;   // fraction of the offset the element travels
const RADIUS = 1.6;  // activation radius, relative to element size

/**
 * A button that leans toward the cursor and springs back on exit.
 *
 * Renders as <a> when `href` is passed, <button> otherwise, so the magnetic
 * treatment works for both CTAs and downloads without duplicating markup.
 */
export default function MagneticButton({
  children,
  variant = 'primary',
  className = '',
  href,
  ...rest
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING_MAGNETIC);
  const sy = useSpring(y, SPRING_MAGNETIC);

  const handleMove = (e) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);

    // Only pull once the cursor is genuinely near, so it doesn't twitch.
    if (Math.abs(mx) > rect.width * RADIUS || Math.abs(my) > rect.height * RADIUS) return;

    x.set(mx * PULL);
    y.set(my * PULL);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const Tag = href ? motion.a : motion.button;

  return (
    <Tag
      ref={ref}
      href={href}
      className={`magnetic btn btn--${variant} ${className}`.trim()}
      style={{ x: sx, y: sy }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onBlur={reset}
      whileTap={{ scale: 0.96 }}
      {...rest}
    >
      <span className="magnetic__label">{children}</span>
    </Tag>
  );
}
