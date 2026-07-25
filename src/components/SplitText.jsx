import { motion } from 'motion/react';
import { charVariant, VIEWPORT } from '../motion/variants';
import { useRevealEnabled } from '../motion/useReveal';
import './SplitText.css';

/**
 * Per-character reveal.
 *
 * Splits on words first so wrapping stays natural, then on characters within
 * each word. The full string is exposed to assistive tech via aria-label and
 * the split spans are hidden, so screen readers never hear it letter by letter.
 */
export default function SplitText({
  text,
  as: Tag = 'span',
  className = '',
  stagger = 0.028,
  delay = 0,
  once = true,
}) {
  const MotionTag = motion.create(Tag);
  const reveal = useRevealEnabled();
  const words = String(text).split(' ');

  let charIndex = 0;

  return (
    <MotionTag
      className={`split-text ${className}`.trim()}
      aria-label={text}
      initial={reveal ? 'hidden' : false}
      whileInView={reveal ? 'show' : undefined}
      viewport={{ ...VIEWPORT, once }}
    >
      {words.map((word, w) => (
        <span className="split-text__word" key={`${word}-${w}`} aria-hidden="true">
          {Array.from(word).map((char, c) => {
            const i = charIndex++;
            return (
              <motion.span
                className="split-text__char"
                key={`${char}-${c}`}
                variants={charVariant}
                transition={{ delay: delay + i * stagger }}
              >
                {char}
              </motion.span>
            );
          })}
          {w < words.length - 1 && <span className="split-text__space">&nbsp;</span>}
        </span>
      ))}
    </MotionTag>
  );
}
