import { useEffect, useRef, useState } from 'react';
import './App.css';
import portrait from './images/portrait-sm.jpg';
import SystemSketch from './components/SystemSketch';
import WorkoutDemo from './components/WorkoutDemo';
import ArchitecturePreview from './components/ArchitecturePreview';
import { PROFILE, RESUMES } from './data/profile';
import { EXPERIENCE } from './data/experience';
import { PROJECTS } from './data/projects';

const ASSET = process.env.PUBLIC_URL;
const SOFTWARE_RESUME = RESUMES.find(resume => resume.id === 'software');
const NAV = [{ id: 'projects', label: 'Work' }, { id: 'experience', label: 'Experience' }, { id: 'about', label: 'About' }];
const projectById = id => PROJECTS.find(project => project.id === id);

function Arrow({ direction = 'up', className = '' }) {
  return <svg className={`arrow-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{direction === 'down' ? <path d="M12 4v16m-7-7 7 7 7-7" /> : <path d="M5 19 19 5M5 5h14v14" />}</svg>;
}

function ExternalLink({ href, children, className = '' }) {
  return <a className={`text-link ${className}`} href={href} target="_blank" rel="noopener noreferrer">{children}<Arrow /></a>;
}

function Tags({ items }) {
  return <ul className="tech-tags" aria-label="Technologies">{items.map(item => <li key={item}>{item}</li>)}</ul>;
}

function EngineeringNotes({ project, children }) {
  return <details className="engineering-notes"><summary>Under the hood<span className="details-toggle" aria-hidden="true" /></summary><div>{children || <ul>{project.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>}</div></details>;
}

function DineSensePreview() {
  const [screen, setScreen] = useState('order');
  const screens = [
    { id: 'target', label: 'Set a target', alt: 'DineSense meal target preview' },
    { id: 'results', label: 'Compare options', alt: 'DineSense restaurant results preview' },
    { id: 'order', label: 'Make it yours', alt: 'DineSense customized order preview' },
  ];
  return <div className="dinesense-preview project-stage">
    <div className="dinesense-preview__wordmark">DineSense<span>A little clarity<br />on the menu.</span></div>
    <div className="dinesense-preview__phones">
      <img className="preview-phone preview-phone--back" src={`${ASSET}/images/dinesense-target.webp`} alt="" width="440" height="956" loading="lazy" />
      <img key={screen} className="preview-phone preview-phone--front" src={`${ASSET}/images/dinesense-${screen}.webp`} alt={screens.find(item => item.id === screen).alt} width={screen === 'order' ? '880' : '440'} height={screen === 'order' ? '1912' : '956'} loading="lazy" />
    </div>
    <div className="preview-controls"><div className="preview-selector" role="group" aria-label="DineSense app previews">{screens.map(item => <button key={item.id} type="button" aria-pressed={screen === item.id} onClick={() => setScreen(item.id)}>{item.label}</button>)}</div>
    <p className="preview-credit">App previews from dinesense.app</p></div>
  </div>;
}

function ProjectFeature({ id, title, description, note, children }) {
  const project = projectById(id);
  return <article className={`project-feature project-feature--${id}`} id={`p-${id}`}>
    <div className="project-feature__visual">{children}</div>
    <div className="project-feature__copy">
      <h3>{project.title}</h3>
      <div className="project-meta"><span>{project.kind}</span><span>{project.year}</span></div>
      <p className="project-thesis">{title}</p>
      <p className="project-description">{description}</p>
      <Tags items={id === 'dinesense' ? ['Swift', 'Supabase', 'PostgreSQL'] : id === 'programmed' ? ['SwiftUI', 'SwiftData', 'HealthKit', 'Supabase'] : ['C# / .NET 8', 'React', 'PostgreSQL']} />
      <p className="project-status"><span className="status-dot" />{note}</p>
      <EngineeringNotes project={project} />
      <div className="project-links">{project.live && <ExternalLink href={project.live}>Visit DineSense</ExternalLink>}{project.repo && <ExternalLink href={project.repo}>{id === 'dinesense' ? 'Website source' : 'Explore the code'}</ExternalLink>}{!project.repo && <a className="text-link" href={`mailto:${PROFILE.email}?subject=Let's%20talk%20about%20Programmed`}>Let’s talk about the build<Arrow /></a>}</div>
    </div>
  </article>;
}

export default function App() {
  const [active, setActive] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const copyTimer = useRef(null);
  const menuButton = useRef(null);

  useEffect(() => {
    if (!window.IntersectionObserver) return undefined;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-15% 0px -55% 0px' });
    ['top', ...NAV.map(item => item.id), 'contact'].forEach(id => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function closeMenu(event) {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
    }
    window.addEventListener('keydown', closeMenu);
    return () => window.removeEventListener('keydown', closeMenu);
  }, [menuOpen]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

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
    <header className="site-header">
      <a className="identity" href="#top" aria-label="Zander Erwin, back to top"><span className="identity__mark" aria-hidden="true">ze.</span><span>Zander Erwin<small>Software Engineer</small></span></a>
      <button className="menu-button" type="button" ref={menuButton} aria-expanded={menuOpen} aria-controls="primary-nav" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? 'Close' : 'Menu'}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12" />{!menuOpen && <path d="M10 4v12" />}</svg></button>
      <nav id="primary-nav" className={`primary-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
        {NAV.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
        <a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>Let’s talk<Arrow /></a>
      </nav>
    </header>

    <main id="main">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero__main page-width">
          <div className="hero__copy">
            <h1 id="hero-title">I make the <br />pieces work <br /><span>together.</span></h1>
            <p>I’m Zander, a software engineer connecting complex systems and building products from the first idea to the last detail.</p>
            <div className="hero__actions"><a className="button button--light" href="#projects">Explore my work<Arrow direction="down" /></a><a className="hero__resume" href={SOFTWARE_RESUME.file} target="_blank" rel="noopener noreferrer">Résumé <span>PDF</span><Arrow /></a></div>
          </div>
          <SystemSketch />
        </div>
        </section>

      <section className="work-section page-width" id="projects" aria-labelledby="work-title">
        <header className="section-heading"><h2 id="work-title">Built with <br /><span>purpose.</span></h2><p>Products I care about.<br />Engineering I can walk you through.</p></header>
        <ProjectFeature id="dinesense" title="A better answer to “what should I order?”" description="A native iOS app that brings your daily nutrition budget to the restaurant menu. Set a target, compare dishes, and bring your choice back into the day’s totals." note="Invite-only pilot">
          <DineSensePreview />
        </ProjectFeature>
        <ProjectFeature id="programmed" title="The training plan, and everything around it." description="An offline-first training and nutrition app connecting coaches and athletes. Programs, workout logging, nutrition, and weekly check-ins—with a rest timer that stays on the lock screen." note="In development · Private repository">
          <WorkoutDemo />
        </ProjectFeature>
        <ProjectFeature id="expense-tracker" title="Simple on the surface. Considered underneath." description="A full-stack expense tracker built around clear boundaries: a typed React client, a layered .NET API, and a PostgreSQL database with versioned migrations." note="Full-stack project · Source available">
          <ArchitecturePreview />
        </ProjectFeature>
        <div className="more-work"><h3>A little further down the rabbit hole.</h3><div className="more-work__list">
          {['sentinel', 'senior-project', 'email-summarizer'].map(id => { const p = projectById(id); return <details key={id} className="project-row" id={`p-${id}`}><summary><span>{p.title}</span><span className="project-row__kind">{p.kind}</span><span className="details-toggle" aria-hidden="true" /></summary><div className="project-row__body"><p>{p.description}</p><Tags items={p.techs.slice(0, 4)} /><div className="project-links">{p.repo ? <ExternalLink href={p.repo}>Explore the code</ExternalLink> : <span>{p.status} · In development</span>}</div></div></details>; })}
        </div><ExternalLink href={PROFILE.github}>More on GitHub</ExternalLink></div>
      </section>

      <section className="experience-section" id="experience" aria-labelledby="experience-title"><div className="page-width experience-layout">
        <header className="experience-intro"><h2 id="experience-title">Real systems. <br /><span>Real stakes.</span></h2><p>From semiconductor operations to engineering workflows, I build software that other people’s work depends on.</p><a className="text-link" href={SOFTWARE_RESUME.file} target="_blank" rel="noopener noreferrer">The full résumé<Arrow /></a></header>
        <div className="experience-list">{EXPERIENCE.slice(0, 3).map((job, index) => <article className="job" key={job.company}>
          <h3>{job.company}</h3>
          <div className="job__date">{job.start} — {job.end}{index === 0 && <span>Current</span>}</div>
          <p className="job__role">{job.role}</p>
          <p className="job__impact">{index === 0 ? 'Replaced a third-party BIM analytics subscription with an in-house integration, delivering five-figure annual savings.' : index === 1 ? 'Modernized .NET applications serving 100+ internal users across accounting platforms.' : 'Built and supported Oracle ERP systems used by 200+ people across the business.'}</p>
          <details className="job-details"><summary>What I worked on<span className="details-toggle" aria-hidden="true" /></summary><ul>{job.bullets.filter((_, i) => index === 0 ? [0, 1, 3].includes(i) : index === 1 ? [1, 2, 3].includes(i) : [0, 2].includes(i)).map(bullet => <li key={bullet}>{bullet}</li>)}</ul></details>
          <p className="job__stack">{index === 0 ? 'C# / .NET · Autodesk APIs · TypeScript · Azure' : index === 1 ? 'C# / .NET · Node.js · AWS Lambda · Docker' : 'PL/SQL · Oracle APEX · Oracle Forms'}</p>
        </article>)}</div>
      </div></section>

      <section className="about-section page-width" id="about" aria-labelledby="about-title">
        <figure className="portrait"><img src={portrait} alt="Zander Erwin" width="426" height="640" loading="lazy" /><figcaption>Based in Wichita. Curious everywhere.</figcaption></figure>
        <div className="about-copy"><h2 id="about-title">Engineer by trade. <br /><span>Builder by default.</span></h2><p>I like understanding the whole thing: the interface someone touches, the service behind it, and the data that makes it useful.</p><p>At PEC, that means Revit add-ins, cloud automation, and integrations between business systems. Outside work, it means turning ideas into products—and maintaining a Linux homelab that keeps me honest about reliability and security.</p><div className="about-education"><span>Wichita State University · 2026</span><strong>B.S. Computer Science</strong><span>Minor in Mathematics</span></div><div className="about-links"><ExternalLink href={PROFILE.github}>GitHub</ExternalLink><ExternalLink href={PROFILE.linkedin}>LinkedIn</ExternalLink></div></div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title"><div className="page-width">
        <div className="contact-heading"><h2 id="contact-title">Good things start <br />with a conversation.</h2><a className="contact-arrow" href={`mailto:${PROFILE.email}`} aria-label="Email Zander"><Arrow /></a></div>
        <div className="contact-bottom"><div><p>Have a role, a project, or a good technical rabbit hole?</p><a className="contact-email" href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a><div className="copy-row"><button type="button" onClick={copyEmail}>Copy email<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></svg></button><span role="status">{copyStatus}</span></div></div><div className="contact-links"><ExternalLink href={PROFILE.linkedin}>LinkedIn</ExternalLink><ExternalLink href={PROFILE.github}>GitHub</ExternalLink><a className="text-link" href={SOFTWARE_RESUME.file} target="_blank" rel="noopener noreferrer">Résumé<Arrow /></a></div></div>
        <footer className="site-footer"><a href="#top">Zander Erwin<span>© {new Date().getFullYear()}</span></a><span>Thoughtfully built. Always a work in progress.</span><a href="#top">Back to top<Arrow /></a></footer>
      </div></section>
    </main>
  </div>;
}
