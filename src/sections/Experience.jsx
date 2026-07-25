import { motion } from 'motion/react';
import SectionHeader from '../components/SectionHeader';
import SpotlightCard from '../components/SpotlightCard';
import { EXPERIENCES } from '../data/content';
import { staggerParent, fadeUp, EASE_OUT } from '../motion/variants';
import { useRevealProps } from '../motion/useReveal';

export default function Experience() {
  const reveal = useRevealProps();

  return (
    <section id="experience" className="section">
      <div className="section__inner">
        <SectionHeader num="03" title="Experience" />

        <div className="timeline">
          {/* Vertical spine that draws itself as the section enters. */}
          <motion.span
            className="timeline__spine"
            aria-hidden="true"
            {...reveal({ scaleY: 0 }, { scaleY: 1 })}
            transition={{ duration: 1.1, ease: EASE_OUT }}
          />

          {EXPERIENCES.map((exp, i) => (
            <div className="timeline__row" key={exp.company}>
              <motion.span
                className="timeline__node"
                aria-hidden="true"
                {...reveal({ scale: 0, opacity: 0 }, { scale: 1, opacity: 1 })}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.2 + i * 0.12 }}
              />

              <SpotlightCard className="exp-card" tilt={false} delay={i * 0.12}>
                <div className="exp-card__header">
                  <div>
                    <h3 className="exp-card__role">{exp.role}</h3>
                    <p className="exp-card__company">{exp.company}</p>
                  </div>
                  <span className="pill pill--accent">{exp.period}</span>
                </div>

                <p className="exp-card__desc">{exp.description}</p>

                <motion.ul
                  className="bullet-list"
                  variants={staggerParent(0.05)}
                  {...reveal('hidden', 'show')}
                >
                  {exp.responsibilities.map((r) => (
                    <motion.li key={r} variants={fadeUp}>
                      {r}
                    </motion.li>
                  ))}
                </motion.ul>

                <div className="tags">
                  {exp.techs.map((t) => (
                    <span key={t} className="tag tag--muted">
                      {t}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
