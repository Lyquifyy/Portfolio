import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { PROFILE } from '../data/content';
import { EASE_OUT, EASE_INOUT } from '../motion/variants';
import './Intro.css';

const AUTO_DISMISS_MS = 2000;

/**
 * Staged opening: mono eyebrow types in, the name masks up per word, then the
 * whole overlay wipes away on a clip-path circle to reveal the aurora.
 *
 * Always skippable — any key, click, scroll or wheel dismisses it immediately.
 * Skipped entirely under reduced motion.
 */
export default function Intro() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(!reduced);

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) {
      document.body.classList.remove('is-locked');
      return undefined;
    }

    document.body.classList.add('is-locked');
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);

    window.addEventListener('keydown', dismiss);
    window.addEventListener('pointerdown', dismiss);
    window.addEventListener('wheel', dismiss, { passive: true });
    window.addEventListener('touchstart', dismiss, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', dismiss);
      window.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('touchstart', dismiss);
      document.body.classList.remove('is-locked');
    };
  }, [visible, dismiss]);

  const words = PROFILE.name.split(' ');

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro"
          aria-hidden="true"
          initial={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{
            clipPath: 'circle(0% at 50% 50%)',
            transition: { duration: 0.85, ease: EASE_INOUT },
          }}
        >
          <div className="intro__content">
            <motion.p
              className="intro__eyebrow"
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              animate={{ opacity: 1, letterSpacing: '0.28em' }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
            >
              {PROFILE.role}
            </motion.p>

            <h1 className="intro__name">
              {words.map((word, i) => (
                <span className="intro__word-mask" key={word}>
                  <motion.span
                    className="intro__word"
                    initial={{ y: '105%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.75, ease: EASE_OUT, delay: 0.12 + i * 0.09 }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.span
              className="intro__rule"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.3 }}
            />
          </div>

          <motion.p
            className="intro__skip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            press any key to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
