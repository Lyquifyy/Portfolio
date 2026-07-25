import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SectionHeader from '../components/SectionHeader';
import { PROJECTS } from '../data/content';
import { EASE_OUT, SPRING_SNAPPY, staggerParent, fadeUp } from '../motion/variants';
import { useRevealProps } from '../motion/useReveal';

export default function Projects() {
  const [selected, setSelected] = useState(0);
  const project = PROJECTS[selected];
  const reveal = useRevealProps();

  return (
    <section id="projects" className="section">
      <div className="section__inner">
        <SectionHeader num="02" title="Projects" />

        <div className="projects__split">
          <motion.div
            className="projects__list"
            {...reveal({ opacity: 0, x: -24 }, { opacity: 1, x: 0 })}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            {PROJECTS.map((proj, i) => {
              const active = selected === i;
              return (
                <button
                  key={proj.num}
                  type="button"
                  className={`project-item${active ? ' project-item--active' : ''}`}
                  onClick={() => setSelected(i)}
                  aria-pressed={active}
                >
                  {/* One shared rail slides between entries rather than each
                      item fading its own background in and out. */}
                  {active && (
                    <motion.span
                      layoutId="project-rail"
                      className="project-item__rail"
                      transition={SPRING_SNAPPY}
                    />
                  )}
                  <span className="project-item__num">{proj.num}</span>
                  <span className="project-item__title">{proj.title}</span>
                </button>
              );
            })}
          </motion.div>

          <motion.div
            className="projects__detail"
            {...reveal({ opacity: 0, x: 24 }, { opacity: 1, x: 0 })}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              <motion.article
                key={selected}
                className="project-detail"
                initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                transition={{ duration: 0.38, ease: EASE_OUT }}
              >
                <span className="project-detail__index">{project.num}</span>
                <h3 className="project-detail__title">{project.title}</h3>

                <motion.div
                  className="tags"
                  variants={staggerParent(0.045, 0.1)}
                  initial="hidden"
                  animate="show"
                >
                  {project.techs.map((t) => (
                    <motion.span key={t} className="tag tag--accent" variants={fadeUp}>
                      {t}
                    </motion.span>
                  ))}
                </motion.div>

                <p className="project-detail__desc">{project.description}</p>

                <motion.ul
                  className="bullet-list"
                  variants={staggerParent(0.06, 0.16)}
                  initial="hidden"
                  animate="show"
                >
                  {project.highlights.map((h) => (
                    <motion.li key={h} variants={fadeUp}>
                      {h}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.article>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
