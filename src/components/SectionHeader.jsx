import { motion } from 'motion/react';
import SplitText from './SplitText';
import { EASE_OUT } from '../motion/variants';
import { useRevealProps } from '../motion/useReveal';

/** Mono numeral + display title, used at the top of every section. */
export default function SectionHeader({ num, title }) {
  const reveal = useRevealProps();

  return (
    <div className="section__header">
      <motion.span
        className="section__num"
        {...reveal({ opacity: 0, x: -12 }, { opacity: 1, x: 0 })}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        {num}
      </motion.span>

      <SplitText as="h2" className="section__title" text={title} />

      <motion.span
        className="section__rule"
        {...reveal({ scaleX: 0 }, { scaleX: 1 })}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 }}
      />
    </div>
  );
}
