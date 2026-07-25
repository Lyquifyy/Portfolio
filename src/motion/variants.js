/* ==========================================================================
   SHARED MOTION LANGUAGE
   One place for easings, springs and reveal variants so every section moves
   with the same physics.
   ========================================================================== */

export const EASE_OUT = [0.22, 1, 0.36, 1];
export const EASE_INOUT = [0.65, 0, 0.35, 1];

export const SPRING_SOFT = { type: 'spring', stiffness: 120, damping: 20, mass: 0.9 };
export const SPRING_SNAPPY = { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 };
export const SPRING_MAGNETIC = { type: 'spring', stiffness: 260, damping: 18, mass: 0.6 };

/* Shared viewport config — reveal once, slightly before fully in frame. */
export const VIEWPORT = { once: true, amount: 0.15, margin: '0px 0px -60px 0px' };

/* Parent that staggers its children. */
export const staggerParent = (stagger = 0.06, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
};

export const slideFrom = (x = -30) => ({
  hidden: { opacity: 0, x },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT } },
});

/* Per-character reveal used by SplitText. */
export const charVariant = {
  hidden: { opacity: 0, y: '0.55em', rotateX: -55 },
  show: {
    opacity: 1,
    y: '0em',
    rotateX: 0,
    transition: { duration: 0.62, ease: EASE_OUT },
  },
};
