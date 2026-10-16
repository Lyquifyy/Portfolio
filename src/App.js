import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import portrait from './images/portrait-sm.jpg';
import SystemSketch from './components/SystemSketch';
import WorkoutDemo from './components/WorkoutDemo';
import ArchitecturePreview from './components/ArchitecturePreview';
import { PROFILE, RESUMES } from './data/profile';
import { EXPERIENCE } from './data/experience';
import { PROJECTS } from './data/projects';
import { onFrame, scrollToEl } from './motion/scroll';
import useProgress from './motion/useProgress';
import Scrub from './motion/Scrub';
import useTilt from './hooks/useTilt';
import useInView from './hooks/useInView';
import { prefersReducedMotion } from './hooks/useReducedMotion';
import Title from './fx/Title';
import Words from './fx/Words';
import SignalRail from './fx/SignalRail';

const ASSET = process.env.PUBLIC_URL;
const SOFTWARE_RESUME = RESUMES.find(resume => resume.id === 'software');
const NAV = [{ id: 'projects', label: 'Work' }, { id: 'experience', label: 'Experience' }, { id: 'skills', label: 'Skills' }, { id: 'about', label: 'About' }];
const STATIONS = [{ id: 'top', label: 'Intro' }, { id: 'projects', label: 'Work' }, { id: 'experience', label: 'Experience' }, { id: 'skills', label: 'Skills' }, { id: 'about', label: 'About' }, { id: 'contact', label: 'Contact' }];
// Reference designators for the skill modules on the schematic board.
const REF = { Languages: 'LANG', Frameworks: 'FWK', Data: 'DATA', 'Tools & platforms': 'PLAT', 'Security & networking': 'SEC' };
const projectById = id => PROJECTS.find(project => project.id === id);
const merge = (...refs) => (node) => refs.forEach(r => { if (typeof r === 'function') r(node); else if (r) r.current = node; });

function Arrow({ direction = 'up', className = '' }) {
  return <svg className={`arrow-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{direction === 'down' ? <path d="M12 4v16m-7-7 7 7 7-7" /> : <path d="M5 19 19 5M5 5h14v14" />}</svg>;
}

function ExternalLink({ href, children, className = '' }) {
  return <a className={`text-link ${className}`} href={href} target="_blank" rel="noopener noreferrer">{children}<Arrow /></a>;
}

function Tags({ items }) {
  return <ul className="tech-tags" aria-label="Technologies">{items.map((item, i) => <li key={item} style={{ '--j': i }}>{item}</li>)}</ul>;
}

function EngineeringNotes({ project, children }) {
  return <details className="engineering-notes"><summary>Under the hood<span className="details-toggle" aria-hidden="true" /></summary><div>{children || <ul>{project.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>}</div></details>;
}

/* DineSense's real screens, cycling on their own while on screen. The two
   phones drift at different rates with the scroll. Choosing a screen holds
   the cycle for a while. */
const SCREENS = [
  { id: 'target', label: 'Set a target', alt: 'DineSense meal target preview' },
  { id: 'results', label: 'Compare options', alt: 'DineSense restaurant results preview' },
  { id: 'order', label: 'Make it yours', alt: 'DineSense customized order preview' },
];

function DineSensePreview() {
  const [screen, setScreen] = useState('order');
  const [wrap, inView] = useInView({ threshold: 0.5 });
  const progress = useProgress({ start: ['top', 1], end: ['bottom', 0] });
  const hold = useRef(0);

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return undefined;
    const t = setInterval(() => {
      if (Date.now() < hold.current) return;
      setScreen(s => SCREENS[(SCREENS.findIndex(x => x.id === s) + 1) % SCREENS.length].id);
    }, 3400);
    return () => clearInterval(t);
  }, [inView]);

  const pick = (id) => { hold.current = Date.now() + 10000; setScreen(id); };
  const index = SCREENS.findIndex(item => item.id === screen);
  const current = SCREENS[index];
  const behind = SCREENS[(index + 2) % SCREENS.length];

  return <div className="dinesense-preview project-stage" ref={merge(wrap, progress)}>
    <div className="dinesense-preview__wordmark">DineSense<span>A little clarity<br />on the menu.</span></div>
    <div className="dinesense-preview__phones">
      <span className="preview-slot preview-slot--back"><img key={behind.id} className="preview-phone preview-phone--back" src={`${ASSET}/images/dinesense-${behind.id}.webp`} alt="" width={behind.id === 'order' ? '880' : '440'} height={behind.id === 'order' ? '1912' : '956'} loading="lazy" /></span>
      <span className="preview-slot preview-slot--front"><img key={screen} className="preview-phone preview-phone--front" src={`${ASSET}/images/dinesense-${screen}.webp`} alt={current.alt} width={screen === 'order' ? '880' : '440'} height={screen === 'order' ? '1912' : '956'} loading="lazy" /></span>
    </div>
    <div className="preview-controls"><div className="preview-selector" role="group" aria-label="DineSense app previews">{SCREENS.map(item => <button key={item.id} type="button" aria-pressed={screen === item.id} onClick={() => pick(item.id)}>{item.label}<i className="preview-selector__bar" aria-hidden="true" /></button>)}</div>
    <p className="preview-credit">App previews from dinesense.app · screens change on their own</p></div>
  </div>;
}

function Stage({ children }) {
  const tilt = useTilt({ max: 4 });
  return <div className="project-feature__visual scrub__i stage-in" style={{ '--i': 0 }} ref={tilt}>{children}</div>;
}

function ProjectFeature({ id, title, description, note, children }) {
  const project = projectById(id);
  let i = 1;
  const next = () => ({ '--i': i++ });
  return <Scrub as="article" className={`project-feature project-feature--${id}`} id={`p-${id}`} n={9} k={0.7} start={['top', 0.9]} end={['top', 0.3]}>
    <Stage>{children}</Stage>
    <div className="project-feature__copy">
      <h3 className="scrub__i rise" style={next()}>{project.title}</h3>
      <div className="project-meta scrub__i rise" style={next()}><span>{project.kind}</span><span>{project.year}</span></div>
      <p className="project-thesis scrub__i rise" style={next()}>{title}</p>
      <Words className="project-description" text={description} />
      <div className="scrub__i rise" style={next()}><Tags items={id === 'dinesense' ? ['Swift', 'Supabase', 'PostgreSQL'] : id === 'programmed' ? ['SwiftUI', 'SwiftData', 'HealthKit', 'Supabase'] : ['C# / .NET 8', 'React', 'PostgreSQL']} /></div>
      <p className="project-status scrub__i rise" style={next()}><span className="status-dot" />{note}</p>
      <div className="scrub__i rise" style={next()}><EngineeringNotes project={project} /></div>
      <div className="project-links scrub__i rise" style={next()}>{project.live && <ExternalLink href={project.live}>Visit DineSense</ExternalLink>}{project.repo && <ExternalLink href={project.repo}>{id === 'dinesense' ? 'Website source' : 'Explore the code'}</ExternalLink>}{!project.repo && <a className="text-link" href={`mailto:${PROFILE.email}?subject=Let's%20talk%20about%20Programmed`}>Let’s talk about the build<Arrow /></a>}</div>
    </div>
  </Scrub>;
}

export default function App() {
  const [active, setActive] = useState('top');
  const [menuOpen, setMenuOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const copyTimer = useRef(null);
  const menuButton = useRef(null);
  const header = useRef(null);
  const hero = useProgress({ start: ['top', 0], end: ['bottom', 0.2] });
  const portraitRef = useProgress({ start: ['top', 1], end: ['bottom', 0] });
  const contactRef = useProgress({ start: ['top', 1], end: ['top', 0.2] });

  useEffect(() => {
    if (!window.IntersectionObserver) return undefined;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-15% 0px -55% 0px' });
    STATIONS.forEach(s => { const element = document.getElementById(s.id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  // The header rides along: it tucks away while you scroll down, comes back
  // on the way up, and turns to paper once the cobalt intro has passed.
  useEffect(() => {
    const el = header.current;
    const heroEl = hero.current;
    if (!el) return undefined;
    let hidden = false, floating = false;
    return onFrame((s) => {
      const max = Math.max(1, document.documentElement.scrollHeight - s.vh);
      el.style.setProperty('--sp', (s.y / max).toFixed(4));
      const past = heroEl ? heroEl.getBoundingClientRect().bottom < 80 : s.y > 600;
      if (past !== floating) { floating = past; el.classList.toggle('is-floating', past); }
      const want = s.y > 480 && s.v > 1.5 && !menuOpen;
      const show = s.v < -1.5 || s.y < 200;
      if (want && !hidden) { hidden = true; el.classList.add('is-hidden'); }
      else if (show && hidden) { hidden = false; el.classList.remove('is-hidden'); }
    });
  }, [menuOpen, hero]);

  useEffect(() => {
    document.body.classList.toggle('on-blue', active === 'top' || active === 'contact');
    return () => document.body.classList.remove('on-blue');
  }, [active]);

  useEffect(() => {
    function closeMenu(event) {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
    }
    window.addEventListener('keydown', closeMenu);
    return () => window.removeEventListener('keydown', closeMenu);
  }, [menuOpen]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const go = useCallback((event, id) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setMenuOpen(false);
    scrollToEl(target, id === 'top' ? 0 : 90);
  }, []);

  async function copyEmail() {
    clearTimeout(copyTimer.current);
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(PROFILE.email);
      setCopyStatus('Email copied.');
    } catch {
      setCopyStatus('Copy unavailable. Use the email link to get in touch.');
    }
    copyTimer.current = setTimeout(() => setCopyStatus(''), 5000);
  }

  return <div className="portfolio">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header" ref={header}>
      <a className="identity" href="#top" aria-label="Zander Erwin, back to top" onClick={e => go(e, 'top')}><span className="identity__mark" aria-hidden="true">ze.</span><span>Zander Erwin<small>Software Engineer</small></span></a>
      <button className="menu-button" type="button" ref={menuButton} aria-expanded={menuOpen} aria-controls="primary-nav" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? 'Close' : 'Menu'}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12" />{!menuOpen && <path d="M10 4v12" />}</svg></button>
      <nav id="primary-nav" className={`primary-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
        {NAV.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} onClick={e => go(e, item.id)}>{item.label}</a>)}
        <a className="nav-contact" href="#contact" onClick={e => go(e, 'contact')}>Let’s talk<Arrow /></a>
      </nav>
      <i className="site-header__progress" aria-hidden="true" />
    </header>

    <SignalRail stations={STATIONS} active={active} />

    <main id="main">
      <section className="hero" id="top" aria-labelledby="hero-title" ref={hero}>
        <div className="hero__main page-width">
          <div className="hero__copy">
            <Title as="h1" id="hero-title" load k={0.5} lines={['I make the', 'pieces work', { text: 'together.', accent: true }]} />
            <p className="load" style={{ '--i': 3 }}>I’m Zander, a software engineer connecting complex systems and building products from the first idea to the last detail.</p>
            <div className="hero__actions load" style={{ '--i': 4 }}><a className="button button--light" href="#projects" onClick={e => go(e, 'projects')}>Explore my work<Arrow direction="down" /></a><a className="hero__resume" href={SOFTWARE_RESUME.file} target="_blank" rel="noopener noreferrer">Résumé <span>PDF</span><Arrow /></a></div>
          </div>
          <SystemSketch />
        </div>
        <div className="hero__cue load" style={{ '--i': 6 }} aria-hidden="true"><i /><span>Scroll</span></div>
      </section>

      <section className="work-section page-width" id="projects" aria-labelledby="work-title">
        <header className="section-heading">
          <Title id="work-title" lines={['Built with', { text: 'purpose.', muted: true }]} />
          <Scrub as="p" end={['top', 0.6]}><span className="scrub__i rise" style={{ '--i': 0 }}>Products I care about.<br />Engineering I can walk you through.</span></Scrub>
        </header>
        <ProjectFeature id="dinesense" title="A better answer to “what should I order?”" description="A native iOS app that brings your daily nutrition budget to the restaurant menu. Set a target, compare dishes, and bring your choice back into the day’s totals." note="Invite-only pilot">
          <DineSensePreview />
        </ProjectFeature>
        <ProjectFeature id="programmed" title="The training plan, and everything around it." description="An offline-first training and nutrition app connecting coaches and athletes. Programs, workout logging, nutrition, and weekly check-ins—with a rest timer that stays on the lock screen." note="In development · Private repository">
          <WorkoutDemo />
        </ProjectFeature>
        <ProjectFeature id="expense-tracker" title="Simple on the surface. Considered underneath." description="A full-stack expense tracker built around clear boundaries: a typed React client, a layered .NET API, and a PostgreSQL database with versioned migrations." note="Full-stack project · Source available">
          <ArchitecturePreview />
        </ProjectFeature>
        <Scrub className="more-work" n={5} k={0.7} end={['top', 0.45]}>
          <h3 className="scrub__i rise" style={{ '--i': 0 }}>A little further down the rabbit hole.</h3>
          <div className="more-work__list">
            {['sentinel', 'senior-project', 'email-summarizer'].map((id, i) => { const p = projectById(id); return <details key={id} className="project-row scrub__i rise" style={{ '--i': i + 1 }} id={`p-${id}`}><summary><span>{p.title}</span><span className="project-row__kind">{p.kind}</span><span className="details-toggle" aria-hidden="true" /></summary><div className="project-row__body"><p>{p.description}</p><Tags items={p.techs.slice(0, 4)} /><div className="project-links">{p.repo ? <ExternalLink href={p.repo}>Explore the code</ExternalLink> : <span>{p.status} · In development</span>}</div></div></details>; })}
          </div>
          <div className="scrub__i rise" style={{ '--i': 4 }}><ExternalLink href={PROFILE.github}>More on GitHub</ExternalLink></div>
        </Scrub>
      </section>

      <section className="experience-section" id="experience" aria-labelledby="experience-title"><div className="page-width experience-layout">
        <header className="experience-intro">
          <Title id="experience-title" lines={['Real systems.', { text: 'Real stakes.', muted: true }]} />
          <Words text="From semiconductor operations to engineering workflows, I build software that other people’s work depends on." />
          <a className="text-link" href={SOFTWARE_RESUME.file} target="_blank" rel="noopener noreferrer">The full résumé<Arrow /></a>
        </header>
        <Scrub className="experience-list" n={3} k={0.5} start={['top', 0.85]} end={['bottom', 0.55]}>
          {EXPERIENCE.slice(0, 3).map((job, index) => <article className="job scrub__i rise" key={job.company} style={{ '--i': index }}>
            <h3>{job.company}</h3>
            <div className="job__date">{job.start} — {job.end}{index === 0 && <span><i className="live-dot is-on" aria-hidden="true" />Current</span>}</div>
            <p className="job__role">{job.role}</p>
            <p className="job__impact">{index === 0 ? 'Replaced a third-party BIM analytics subscription with an in-house integration, delivering five-figure annual savings.' : index === 1 ? 'Modernized .NET applications serving 100+ internal users across accounting platforms.' : 'Built and supported Oracle ERP systems used by 200+ people across the business.'}</p>
            <details className="job-details"><summary>What I worked on<span className="details-toggle" aria-hidden="true" /></summary><ul>{job.bullets.filter((_, i) => index === 0 ? [0, 1, 3].includes(i) : index === 1 ? [1, 2, 3].includes(i) : [0, 2].includes(i)).map(bullet => <li key={bullet}>{bullet}</li>)}</ul></details>
            <p className="job__stack">{index === 0 ? 'C# / .NET · Autodesk APIs · TypeScript · Azure' : index === 1 ? 'C# / .NET · Node.js · AWS Lambda · Docker' : 'PL/SQL · Oracle APEX · Oracle Forms'}</p>
          </article>)}
        </Scrub>
      </div></section>

      <section className="skills-section page-width" id="skills" aria-labelledby="skills-title">
        <header className="section-heading">
          <Title id="skills-title" lines={['Tools of', { text: 'the trade.', muted: true }]} />
          <Scrub as="p" end={['top', 0.6]}><span className="scrub__i rise" style={{ '--i': 0 }}>Every tool on the résumé, wired to its group. <br />One board, nothing to click.</span></Scrub>
        </header>
        <Scrub className="board" n={PROFILE.skills.length} k={0.6} start={['top', 0.92]} end={['top', 0.4]}>
          <div className="board__bus" aria-hidden="true"><i className="board__line" /><i className="board__packet" /></div>
          <div className="board__grid">
            {PROFILE.skills.map((group, gi) => <div className="module scrub__i rise" key={group.group} style={{ '--i': gi }}>
              <i className="module__tap" aria-hidden="true" />
              <div className="module__head"><h3>{group.group}</h3><span>{REF[group.group]}</span></div>
              <ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul>
            </div>)}
          </div>
        </Scrub>
      </section>

      <section className="about-section page-width" id="about" aria-labelledby="about-title">
        <figure className="portrait" ref={portraitRef}><span className="portrait__frame"><img src={portrait} alt="Zander Erwin" width="426" height="640" loading="lazy" /></span><figcaption>Based in Wichita. Curious everywhere.</figcaption></figure>
        <div className="about-copy">
          <Title id="about-title" lines={['Engineer by trade.', { text: 'Builder by default.', muted: true }]} />
          <Words text="I like understanding the whole thing: the interface someone touches, the service behind it, and the data that makes it useful." />
          <Words text="At PEC, that means Revit add-ins, cloud automation, and integrations between business systems. Outside work, it means turning ideas into products—and maintaining a Linux homelab that keeps me honest about reliability and security." />
          <Scrub n={2} k={0.5} end={['top', 0.7]}>
            <div className="about-education scrub__i rise" style={{ '--i': 0 }}><span>Wichita State University · 2026</span><strong>B.S. Computer Science</strong><span>Minor in Mathematics</span></div>
            <div className="about-links scrub__i rise" style={{ '--i': 1 }}><ExternalLink href={PROFILE.github}>GitHub</ExternalLink><ExternalLink href={PROFILE.linkedin}>LinkedIn</ExternalLink></div>
          </Scrub>
        </div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title" ref={contactRef}><div className="page-width">
        <div className="contact-heading">
          <Title id="contact-title" lines={['Good things start', 'with a conversation.']} k={0.6} />
          <a className="contact-arrow" href={`mailto:${PROFILE.email}`} aria-label="Email Zander"><Arrow /></a>
        </div>
        <Scrub className="contact-bottom" n={4} k={0.6} end={['top', 0.7]}>
          <div>
            <p className="scrub__i rise" style={{ '--i': 0 }}>Have a role, a project, or a good technical rabbit hole?</p>
            <a className="contact-email scrub__i rise" style={{ '--i': 1 }} href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
            <div className="copy-row scrub__i rise" style={{ '--i': 2 }}><button type="button" onClick={copyEmail}>Copy email<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></svg></button><span role="status">{copyStatus}</span></div>
          </div>
          <div className="contact-links scrub__i rise" style={{ '--i': 3 }}><ExternalLink href={PROFILE.linkedin}>LinkedIn</ExternalLink><ExternalLink href={PROFILE.github}>GitHub</ExternalLink><a className="text-link" href={SOFTWARE_RESUME.file} target="_blank" rel="noopener noreferrer">Résumé<Arrow /></a></div>
        </Scrub>
        <footer className="site-footer"><a href="#top" onClick={e => go(e, 'top')}>Zander Erwin<span>© {new Date().getFullYear()}</span></a><span>Thoughtfully built. Always a work in progress.</span><a href="#top" onClick={e => go(e, 'top')}>Back to top<Arrow /></a></footer>
      </div></section>
    </main>
  </div>;
}
