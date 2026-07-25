import { useCallback } from 'react';
import { MotionConfig, motion, useScroll, useSpring } from 'motion/react';

import './App.css';

import AuroraBackdrop from './components/AuroraBackdrop';
import ScrollProgress from './components/ScrollProgress';
import ScrollDots from './components/ScrollDots';
import Intro from './components/Intro';

import Hero from './sections/Hero';
import About from './sections/About';
import Projects from './sections/Projects';
import Experience from './sections/Experience';
import CyberLabs from './sections/CyberLabs';
import Resumes from './sections/Resumes';
import Ideas from './sections/Ideas';
import Contact from './sections/Contact';

import { usePointer } from './hooks/usePointer';
import { useActiveSection } from './hooks/useActiveSection';
import { SECTIONS, SECTION_IDS, PROFILE } from './data/content';

const SECTION_LABELS = SECTIONS.map((s) => s.label);

export default function App() {
  const pointerRef = usePointer();
  const activeSection = useActiveSection(SECTION_IDS);

  const { scrollYProgress } = useScroll();
  const headerGlow = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    /* reducedMotion="user" disables every Motion animation site-wide when the
       OS asks for it — the canvas components branch on it separately. */
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      <AuroraBackdrop pointerRef={pointerRef} />
      <Intro />
      <ScrollProgress />

      <header className="header">
        <motion.span className="header__progress" style={{ scaleX: headerGlow }} aria-hidden="true" />
        <a className="header__logo" href="#hero" aria-label="Back to top">
          {PROFILE.initials}
        </a>
        <nav className="header__actions" aria-label="External links">
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="header__link"
          >
            GitHub
          </a>
          <a
            href={PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="header__link"
          >
            LinkedIn
          </a>
        </nav>
      </header>

      <ScrollDots
        sections={SECTION_LABELS}
        activeSection={activeSection}
        onDotClick={(i) => scrollTo(SECTION_IDS[i])}
      />

      <main className="app">
        <Hero onNavigate={scrollTo} />
        <About />
        <Projects />
        <Experience />
        <CyberLabs />
        <Resumes />
        <Ideas />
        <Contact />
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} {PROFILE.name}. Built with React.</p>
      </footer>
    </MotionConfig>
  );
}
