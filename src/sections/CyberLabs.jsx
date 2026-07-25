import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';
import SectionHeader from '../components/SectionHeader';
import SpotlightCard from '../components/SpotlightCard';
import { CYBER_PROJECTS } from '../data/content';
import { EASE_OUT } from '../motion/variants';
import { useRevealProps } from '../motion/useReveal';

function LabCard({ lab, index }) {
  return (
    <article className="lab-card">
      <div className="lab-card__head">
        <span className="lab-card__index">{String(index + 1).padStart(2, '0')}</span>
        <span className="pill pill--cyber">{lab.category}</span>
      </div>

      <h3 className="lab-card__title">{lab.title}</h3>
      <p className="lab-card__desc">{lab.description}</p>

      <ul className="bullet-list bullet-list--cyber">
        {lab.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <div className="tags">
        {lab.techs.map((t) => (
          <span key={t} className="tag tag--muted">
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

/**
 * The one pinned sequence on the site: the section holds while the lab cards
 * advance horizontally, driven by vertical scroll.
 *
 * Deliberately isolated to a single section — scroll-jacking everywhere reads
 * as a gimmick, once reads as intentional. Degrades to a plain responsive grid
 * under reduced motion.
 */
export default function CyberLabs() {
  const reduced = useReducedMotion();
  const reveal = useRevealProps();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const rawX = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const x = useSpring(rawX, { stiffness: 220, damping: 38, restDelta: 0.5 });

  // Measure how far the track actually has to travel, so the pin length and
  // the horizontal distance always agree regardless of viewport width.
  useEffect(() => {
    if (reduced) return undefined;

    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - track.clientWidth));
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section id="cyber" className="section">
        <div className="section__inner">
          <SectionHeader num="04" title="Cyber Labs" />
          <p className="section__intro">
            Hands-on security projects, CTF competitions, and lab environments where I sharpen
            offensive and defensive skills.
          </p>
          <div className="cyber__grid">
            {CYBER_PROJECTS.map((lab, i) => (
              <SpotlightCard key={lab.title} tilt={false} className="lab-card-wrap">
                <LabCard lab={lab} index={i} />
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="cyber"
      className="section section--pinned"
      ref={sectionRef}
      /* Pin length scales with the number of cards: one extra viewport of
         scroll per card beyond the first, plus a viewport for the pin itself. */
      style={{ height: `${CYBER_PROJECTS.length * 85 + 100}vh` }}
    >
      <div className="cyber__sticky">
        <div className="section__inner cyber__head">
          <SectionHeader num="04" title="Cyber Labs" />
          <p className="section__intro">
            Hands-on security projects, CTF competitions, and lab environments where I sharpen
            offensive and defensive skills.
          </p>
        </div>

        <motion.div
          className="cyber__track"
          ref={trackRef}
          style={{ x }}
          {...reveal({ opacity: 0 }, { opacity: 1 })}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          {CYBER_PROJECTS.map((lab, i) => (
            <div className="cyber__slide" key={lab.title}>
              <LabCard lab={lab} index={i} />
            </div>
          ))}
          {/* A real element, not padding: a flex container's *trailing* padding
              is excluded from scrollWidth, which would clip the last card at
              the end of the pin. */}
          <div className="cyber__tail" aria-hidden="true" />
        </motion.div>

        <div className="cyber__progress" aria-hidden="true">
          <motion.span className="cyber__progress-bar" style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}
