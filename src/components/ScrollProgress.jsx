import { motion, useScroll, useSpring } from 'motion/react';
import './ScrollProgress.css';

/** Scroll-linked rail down the left edge. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <div className="scroll-progress" aria-hidden="true">
      <motion.div className="scroll-progress__bar" style={{ scaleY }} />
    </div>
  );
}
