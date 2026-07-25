import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { VIEWPORT, EASE_OUT } from '../motion/variants';
import { useRevealEnabled } from '../motion/useReveal';
import './SpotlightCard.css';

const TILT_MAX = 5; // degrees — subtle; anything more feels like a gimmick

/**
 * The surface primitive that replaced the old .glass-card.
 *
 * A low-opacity solid panel with a hairline border, a cursor-tracked spotlight
 * and a slight 3D tilt. No backdrop-filter: blurring every card muddied the
 * aurora behind it, so blur is now reserved for the header alone.
 */
export default function SpotlightCard({
  children,
  className = '',
  tilt = true,
  delay = 0,
  as: Tag = 'div',
  ...rest
}) {
  const ref = useRef(null);
  const MotionTag = motion.create(Tag);
  const reveal = useRevealEnabled();

  // Raw 0..1 pointer position within the card.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const sx = useSpring(px, { stiffness: 220, damping: 26 });
  const sy = useSpring(py, { stiffness: 220, damping: 26 });

  const rotateY = useTransform(sx, [0, 1], [-TILT_MAX, TILT_MAX]);
  const rotateX = useTransform(sy, [0, 1], [TILT_MAX, -TILT_MAX]);

  const spotX = useTransform(px, (v) => `${v * 100}%`);
  const spotY = useTransform(py, (v) => `${v * 100}%`);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <MotionTag
      ref={ref}
      className={`spotlight-card ${className}`.trim()}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      initial={reveal ? { opacity: 0, y: 26 } : false}
      whileInView={reveal ? { opacity: 1, y: 0 } : undefined}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
      style={tilt ? { rotateX, rotateY, transformPerspective: 1200 } : undefined}
      {...rest}
    >
      <motion.span
        className="spotlight-card__glow"
        aria-hidden="true"
        style={{ '--spot-x': spotX, '--spot-y': spotY }}
      />
      <span className="spotlight-card__content">{children}</span>
    </MotionTag>
  );
}
