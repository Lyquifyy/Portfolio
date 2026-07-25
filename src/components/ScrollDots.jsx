import { motion } from 'motion/react';
import { SPRING_SNAPPY } from '../motion/variants';
import './ScrollDots.css';

/**
 * Right-edge section navigation. The active indicator is a single element
 * animated between dots with a shared layoutId, so it slides rather than
 * fading in and out.
 */
export default function ScrollDots({ sections, activeSection, onDotClick }) {
  return (
    <nav className="scroll-dots" aria-label="Section navigation">
      {sections.map((label, i) => {
        const active = i === activeSection;
        return (
          <button
            key={label}
            type="button"
            className={`scroll-dot${active ? ' scroll-dot--active' : ''}`}
            onClick={() => onDotClick(i)}
            aria-label={`Go to ${label}`}
            aria-current={active ? 'true' : undefined}
          >
            <span className="scroll-dot__label">{label}</span>
            <span className="scroll-dot__marker">
              {active && (
                <motion.span
                  layoutId="scroll-dot-active"
                  className="scroll-dot__halo"
                  transition={SPRING_SNAPPY}
                />
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
