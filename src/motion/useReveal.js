import { useReducedMotion } from 'motion/react';
import { VIEWPORT } from './variants';

/* whileInView is driven by IntersectionObserver. If it is missing, the
   observer never fires, and anything with a hidden `initial` would stay
   hidden forever. Checked once at module scope — it cannot change. */
const IO_SUPPORTED = typeof window !== 'undefined' && 'IntersectionObserver' in window;

/**
 * Whether scroll-triggered reveals should run at all.
 *
 * Returns false when the user asked for reduced motion, or when there is no
 * IntersectionObserver to drive the reveal. Callers pass `initial={false}` in
 * that case, which renders the element in its final state with no inline
 * styles — so content is never gated behind an animation that may not run.
 */
export function useRevealEnabled() {
  const reduced = useReducedMotion();
  return !reduced && IO_SUPPORTED;
}

/**
 * Builds the initial/whileInView/viewport props for a scroll reveal, collapsing
 * to a plain visible render when reveals are disabled.
 *
 *   const reveal = useRevealProps();
 *   <motion.div {...reveal({ opacity: 0, y: 20 }, { opacity: 1, y: 0 })} />
 *
 * Also accepts variant names: reveal('hidden', 'show').
 */
export function useRevealProps() {
  const enabled = useRevealEnabled();

  return (hidden, shown, viewport = VIEWPORT) => ({
    initial: enabled ? hidden : false,
    whileInView: enabled ? shown : undefined,
    viewport,
  });
}
