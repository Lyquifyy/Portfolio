import { motion } from 'motion/react';
import SectionHeader from '../components/SectionHeader';
import SpotlightCard from '../components/SpotlightCard';
import profileImage from '../images/portfolio_main.jpg';
import { ABOUT } from '../data/content';
import { staggerParent, fadeUp, EASE_OUT } from '../motion/variants';
import { useRevealProps } from '../motion/useReveal';

function TagCloud({ items, variant }) {
  const reveal = useRevealProps();

  return (
    <motion.div className="tags" variants={staggerParent(0.035)} {...reveal('hidden', 'show')}>
      {items.map((item) => (
        <motion.span key={item} className={`tag tag--${variant}`} variants={fadeUp}>
          {item}
        </motion.span>
      ))}
    </motion.div>
  );
}

export default function About() {
  const reveal = useRevealProps();

  return (
    <section id="about" className="section">
      <div className="section__inner">
        <SectionHeader num="01" title="About Me" />

        <div className="about__grid">
          <motion.div
            className="about__photo"
            {...reveal({ opacity: 0, x: -30 }, { opacity: 1, x: 0 })}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <div className="photo-frame">
              <img src={profileImage} alt="Zander Erwin" />
              <span className="photo-frame__sheen" aria-hidden="true" />
            </div>
          </motion.div>

          <SpotlightCard className="about__card" tilt={false} delay={0.1}>
            {ABOUT.paragraphs.map((text) => (
              <p className="about__text" key={text.slice(0, 32)}>
                {text}
              </p>
            ))}

            <div className="about__skills">
              <p className="label">Technical Stack</p>
              <TagCloud items={ABOUT.stack} variant="accent" />
            </div>

            <div className="about__skills">
              <p className="label">Security Tools</p>
              <TagCloud items={ABOUT.security} variant="cyber" />
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
