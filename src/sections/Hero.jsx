import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import SkillConstellation from '../components/SkillConstellation';
import MagneticButton from '../components/MagneticButton';
import { PROFILE } from '../data/content';
import { EASE_OUT } from '../motion/variants';

const INTRO_DELAY = 0.55; // clears the intro wipe

export default function Hero({ onNavigate }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Content drifts up and fades as you scroll past — the aurora behind it
  // moves at a fraction of this, which is where the depth comes from.
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section id="hero" className="section hero" ref={ref}>
      <motion.div className="hero__content" style={{ y, opacity }}>
        <div className="hero__left">
          <motion.p
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: INTRO_DELAY }}
          >
            {PROFILE.role}
          </motion.p>

          <h1 className="hero__name">
            {[PROFILE.firstName, PROFILE.lastName].map((word, i) => (
              <span className="hero__word-mask" key={word}>
                <motion.span
                  className={`hero__word${i === 1 ? ' hero__word--accent' : ''}`}
                  initial={{ y: '104%' }}
                  animate={{ y: '0%' }}
                  transition={{
                    duration: 0.9,
                    ease: EASE_OUT,
                    delay: INTRO_DELAY + 0.08 + i * 0.1,
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="hero__bio"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE_OUT, delay: INTRO_DELAY + 0.28 }}
          >
            {PROFILE.bio}
          </motion.p>

          <motion.div
            className="hero__cta"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE_OUT, delay: INTRO_DELAY + 0.4 }}
          >
            <MagneticButton variant="primary" onClick={() => onNavigate('projects')}>
              View Work
            </MagneticButton>
            <MagneticButton variant="ghost" onClick={() => onNavigate('contact')}>
              Get In Touch
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          className="hero__right"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: INTRO_DELAY + 0.15 }}
        >
          <SkillConstellation />
        </motion.div>
      </motion.div>

      {/* Two layers: the outer fades on scroll, the inner handles the entrance.
          Sharing one element would let `style` clobber `animate` on opacity. */}
      <motion.div className="hero__scroll-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
        <motion.div
          className="hero__scroll-inner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: INTRO_DELAY + 0.9, duration: 0.6 }}
        >
          <span className="hero__scroll-text">scroll</span>
          <span className="hero__scroll-line" />
        </motion.div>
      </motion.div>
    </section>
  );
}
