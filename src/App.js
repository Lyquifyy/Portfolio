import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import emailjs from 'emailjs-com';
import './App.css';

import portrait from './images/portrait.jpg';
import { ThemeContext } from './context/ThemeContext';
import { ThemeSwitch } from './components/ThemeSwitch';
import ChapterRail from './components/ChapterRail';
import CommandPalette from './components/CommandPalette';
import GitHubLive from './components/GitHubLive';

import { PROFILE, RESUMES, BACKLOG } from './data/profile';
import { EXPERIENCE } from './data/experience';
import { PROJECTS } from './data/projects';
import { SECURITY } from './data/security';

const CHAPTERS = [
  { id: 'top',        num: '00', label: 'Masthead' },
  { id: 'profile',    num: '01', label: 'Profile' },
  { id: 'experience', num: '02', label: 'Experience' },
  { id: 'projects',   num: '03', label: 'Projects' },
  { id: 'security',   num: '04', label: 'Security' },
  { id: 'github',     num: '05', label: 'Live' },
  { id: 'resumes',    num: '06', label: 'Résumés' },
  { id: 'backlog',    num: '07', label: 'Backlog' },
  { id: 'contact',    num: '08', label: 'Contact' },
];

const YEAR = new Date().getFullYear();

function Chapter({ id, num, title, dek, children, className = '' }) {
  return (
    <section id={id} className={`chapter ${className}`.trim()}>
      <header className="chapter__head reveal">
        <span className="chapter__num" aria-hidden="true">{num}</span>
        <h2 className="chapter__title">{title}</h2>
        {dek && <p className="chapter__dek">{dek}</p>}
      </header>
      {children}
    </section>
  );
}

function TechList({ items, className = '' }) {
  return (
    <p className={`techs ${className}`.trim()}>
      {items.map((t, i) => (
        <React.Fragment key={t}>
          {i > 0 && <span className="techs__sep" aria-hidden="true"> · </span>}
          <span>{t}</span>
        </React.Fragment>
      ))}
    </p>
  );
}

export default function App() {
  const { dark, setDark } = useContext(ThemeContext);
  const [active, setActive] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle');
  const [copied, setCopied] = useState(false);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Scroll reveals. Anything already on screen is shown at once; the observer
  // handles the rest as it scrolls into view. A scroll/resize fallback covers
  // environments where IntersectionObserver is throttled or missing.
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.reveal'));
    const showVisible = () => {
      const vh = window.innerHeight;
      nodes.forEach(el => {
        if (el.classList.contains('revealed')) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh - 20 && r.bottom > 0) el.classList.add('revealed');
      });
    };
    showVisible();

    let io = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );
      nodes.forEach(el => io.observe(el));
    }
    window.addEventListener('scroll', showVisible, { passive: true });
    window.addEventListener('resize', showVisible);
    return () => {
      io?.disconnect();
      window.removeEventListener('scroll', showVisible);
      window.removeEventListener('resize', showVisible);
    };
  }, []);

  // Active chapter tracking
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = CHAPTERS.findIndex(c => c.id === e.target.id);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    CHAPTERS.forEach(c => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock scroll while the palette is open
  useEffect(() => {
    document.body.style.overflow = paletteOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [paletteOpen]);

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText(PROFILE.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }, []);

  const actions = useMemo(() => [
    ...CHAPTERS.map(c => ({
      id: `go-${c.id}`, group: 'Go to', label: c.label, hint: c.num, run: () => scrollTo(c.id),
    })),
    { id: 'open-github', group: 'Open', label: 'GitHub profile', hint: 'Lyquifyy', run: () => window.open(PROFILE.github, '_blank', 'noopener') },
    { id: 'open-linkedin', group: 'Open', label: 'LinkedIn', hint: 'zander-erwin', run: () => window.open(PROFILE.linkedin, '_blank', 'noopener') },
    { id: 'open-dinesense', group: 'Open', label: 'DineSense', hint: 'dinesense.app', run: () => window.open('https://dinesense.app', '_blank', 'noopener') },
    ...RESUMES.map(r => ({
      id: `dl-${r.id}`, group: 'Download', label: `${r.title} résumé`, hint: 'PDF', run: () => window.open(r.file, '_blank', 'noopener'),
    })),
    { id: 'copy-email', group: 'Contact', label: 'Copy email address', hint: PROFILE.email, run: copyEmail },
    { id: 'mail', group: 'Contact', label: 'Compose an email', hint: 'mailto', run: () => { window.location.href = `mailto:${PROFILE.email}`; } },
    { id: 'theme', group: 'Appearance', label: dark ? 'Switch to light theme' : 'Switch to dark theme', hint: '⇄', run: () => setDark(!dark) },
  ], [dark, setDark, scrollTo, copyEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    emailjs
      .send('service_urtbt14', 'template_8sfqyrn', {
        from_name: form.name, from_email: form.email, message: form.message,
      }, 'PTuqiFviGAOMEb1v5')
      .then(() => { setFormStatus('success'); setForm({ name: '', email: '', message: '' }); })
      .catch(() => setFormStatus('error'));
  };

  const featured = PROJECTS.filter(p => p.featured);
  const indexed = PROJECTS;

  return (
    <div className="app">
      <a className="skip" href="#profile">Skip to content</a>

      {/* ------------------------------------------------ Masthead bar */}
      <header className="masthead">
        <button type="button" className="masthead__brand" onClick={() => scrollTo('top')}>
          <span className="masthead__name">Zander Erwin</span>
          <span className="masthead__issue">Dossier · Vol. {YEAR}</span>
        </button>
        <nav className="masthead__links" aria-label="External links">
          <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={`mailto:${PROFILE.email}`}>Email</a>
          <button type="button" className="masthead__cmd" onClick={() => setPaletteOpen(true)} aria-haspopup="dialog">
            <kbd>⌘</kbd><kbd>K</kbd>
          </button>
          <ThemeSwitch />
        </nav>
      </header>

      <ChapterRail chapters={CHAPTERS} active={active} onSelect={scrollTo} />

      <main className="page">
        {/* ------------------------------------------------ 00 Hero */}
        <section id="top" className="hero">
          <div className="hero__grid">
            <div className="hero__text">
              <p className="eyebrow reveal">{PROFILE.role} <span className="eyebrow__sep">/</span> {PROFILE.focus}</p>
              <h1 className="hero__name reveal">
                <span>Zander</span>
                <span className="hero__name-last">Erwin</span>
              </h1>
              <p className="hero__thesis reveal">{PROFILE.thesis}</p>
              <dl className="facts reveal">
                <div><dt>Now</dt><dd>{PROFILE.status}</dd></div>
                <div><dt>Based</dt><dd>{PROFILE.based}</dd></div>
                <div><dt>Education</dt><dd>{PROFILE.education[0].degree}, {PROFILE.education[0].school}, {PROFILE.education[0].period.split(' – ')[1]}</dd></div>
                <div><dt>Shipping</dt><dd>DineSense</dd></div>
              </dl>
              <div className="hero__actions reveal">
                <button type="button" className="btn btn--solid" onClick={() => scrollTo('projects')}>Read the work</button>
                <a className="btn" href={RESUMES[0].file} download>Résumé (PDF)</a>
              </div>
            </div>
            <figure className="hero__figure reveal">
              <img
                src={portrait}
                alt="Studio portrait of Zander Erwin smiling, wearing a light collared shirt"
                width="1066" height="1600"
                fetchPriority="high"
              />
              <figcaption>
                <span>Fig. 1</span> Zander Erwin, {YEAR}. Wichita, Kansas.
              </figcaption>
            </figure>
          </div>
          <div className="ticker" aria-hidden="true">
            <div className="ticker__track">
              {[0, 1].map(k => (
                <span key={k} className="ticker__run">
                  <span>Now — {PROFILE.status}</span>
                  <span>Education — B.S. Computer Science, Wichita State, 2026</span>
                  <span>Latest — DineSense invite-only pilot</span>
                  <span>Security — National Cyber League, Fall 2025</span>
                  <span>Based — {PROFILE.based}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ 01 Profile */}
        <Chapter id="profile" num="01" title="Profile" dek="Who is writing this, and what they actually do.">
          <div className="split">
            <div className="prose reveal">
              {PROFILE.about.map((p, i) => <p key={i}>{p}</p>)}
              <dl className="edu">
                {PROFILE.education.map(e => (
                  <div key={e.degree}>
                    <dt>{e.period}</dt>
                    <dd>
                      <strong>{e.degree}</strong>, {e.school}
                      {e.note && <span className="edu__note">{e.note}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <aside className="index reveal" aria-label="Skills index">
              <p className="eyebrow">Index of skills</p>
              {PROFILE.skills.map(g => (
                <div className="index__row" key={g.group}>
                  <span className="index__key">{g.group}</span>
                  <span className="index__val">{g.items.join(', ')}</span>
                </div>
              ))}
            </aside>
          </div>
        </Chapter>

        {/* ------------------------------------------------ 02 Experience */}
        <Chapter id="experience" num="02" title="Experience" dek="Two and a half years of engineering alongside a degree.">
          <ol className="exp">
            {EXPERIENCE.map((job, i) => (
              <li className="exp__item reveal" key={job.company} style={{ transitionDelay: `${i * 0.06}s` }}>
                <div className="exp__when">
                  <span>{job.start}</span>
                  <span className="exp__arrow" aria-hidden="true">↓</span>
                  <span>{job.end}</span>
                </div>
                <div className="exp__body">
                  <h3 className="exp__role">{job.role}</h3>
                  <p className="exp__company">
                    {job.company}
                    {job.org && <span className="exp__org"> · {job.org}</span>}
                    <span className="exp__loc"> · {job.location}</span>
                  </p>
                  <p className="exp__summary">{job.summary}</p>
                  <ul className="bullets">
                    {job.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                  <TechList items={job.techs} />
                </div>
              </li>
            ))}
          </ol>
        </Chapter>

        {/* ------------------------------------------------ 03 Projects */}
        <Chapter id="projects" num="03" title="Projects" dek="Two featured spreads, then the full index.">
          {featured.map((p, i) => (
            <article className={`spread reveal${i % 2 ? ' spread--alt' : ''}`} key={p.id}>
              <div className="spread__lead">
                <p className="eyebrow">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span className="eyebrow__sep">/</span>
                  <span>{p.kind}</span>
                  {p.status && <><span className="eyebrow__sep">/</span><span className="status">{p.status}</span></>}
                </p>
                <h3 className="spread__title">{p.title}</h3>
                <p className="spread__tagline">{p.tagline}</p>
                <p className="spread__year">{p.year}</p>
              </div>
              <div className="spread__body">
                <p className="prose__p">{p.description}</p>
                <ul className="bullets">
                  {p.highlights.map((h, j) => <li key={j}>{h}</li>)}
                </ul>
                <TechList items={p.techs} />
                <p className="spread__links">
                  {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer">Visit {p.live.replace('https://', '')} →</a>}
                  {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer">Source →</a>}
                </p>
              </div>
            </article>
          ))}

          <div className="pindex reveal">
            <div className="pindex__head" aria-hidden="true">
              <span>No.</span><span>Title</span><span>Stack</span><span>Year</span><span />
            </div>
            {indexed.map((p, i) => (
              <details className="pindex__row" key={p.id}>
                <summary className="pindex__summary">
                  <span className="pindex__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pindex__title">
                    <span>{p.title}</span>
                    <span className="pindex__tagline">{p.tagline}</span>
                  </span>
                  <span className="pindex__stack">{p.techs.slice(0, 3).join(' · ')}</span>
                  <span className="pindex__year">{p.year}</span>
                  <span className="pindex__toggle" aria-hidden="true">+</span>
                </summary>
                <div className="pindex__detail">
                  <p>{p.description}</p>
                  <ul className="bullets">
                    {p.highlights.map((h, j) => <li key={j}>{h}</li>)}
                  </ul>
                  <TechList items={p.techs} />
                  <p className="spread__links">
                    {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer">Visit →</a>}
                    {p.repo
                      ? <a href={p.repo} target="_blank" rel="noopener noreferrer">Source on GitHub →</a>
                      : <span className="muted">Private repository</span>}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </Chapter>

        {/* ------------------------------------------------ 04 Security */}
        <Chapter id="security" num="04" title="Security" dek="Not a separate hobby. It changes how I write the application code.">
          <div className="sec">
            {SECURITY.map((s, i) => (
              <article className="sec__cell reveal" key={s.title} style={{ transitionDelay: `${i * 0.05}s` }}>
                <p className="eyebrow"><span>{s.label}</span><span className="eyebrow__sep">/</span><span>{s.when}</span></p>
                <h3 className="sec__title">{s.title}</h3>
                <p className="sec__desc">{s.description}</p>
                <ul className="bullets">
                  {s.highlights.map((h, j) => <li key={j}>{h}</li>)}
                </ul>
                <TechList items={s.techs} />
              </article>
            ))}
          </div>
        </Chapter>

        {/* ------------------------------------------------ 05 Live */}
        <Chapter id="github" num="05" title="Live from GitHub" dek="Pulled from the public API when this page loads.">
          <div className="reveal">
            <GitHubLive user={PROFILE.githubUser} profileUrl={PROFILE.github} />
          </div>
        </Chapter>

        {/* ------------------------------------------------ 06 Résumés */}
        <Chapter id="resumes" num="06" title="Résumés" dek="One for each kind of role. Both are current.">
          <div className="resumes">
            {RESUMES.map((r, i) => (
              <article className="resume reveal" key={r.id} style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3 className="resume__title">{r.title}</h3>
                <p className="resume__summary">{r.summary}</p>
                <a className="btn" href={r.file} download>Download PDF</a>
              </article>
            ))}
          </div>
        </Chapter>

        {/* ------------------------------------------------ 07 Backlog */}
        <Chapter id="backlog" num="07" title="Backlog" dek="Things I intend to build, with honest time estimates.">
          <ol className="backlog">
            {BACKLOG.map((b, i) => (
              <li className="backlog__item reveal" key={b.title} style={{ transitionDelay: `${i * 0.05}s` }}>
                <span className="backlog__num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="backlog__title">{b.title}</h3>
                  <p className="backlog__desc">{b.description}</p>
                  <TechList items={b.techs} />
                </div>
                <span className="backlog__horizon">{b.horizon}</span>
              </li>
            ))}
          </ol>
        </Chapter>

        {/* ------------------------------------------------ 08 Contact */}
        <Chapter id="contact" num="08" title="Contact" dek="A project, a role, or a question. Write to me.">
          <div className="split split--contact">
            <div className="reveal">
              <p className="contact__lede">
                The fastest route is email. I answer within a day or two.
              </p>
              <a className="contact__email" href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
              <div className="contact__row">
                <button type="button" className="btn" onClick={copyEmail}>{copied ? 'Copied' : 'Copy address'}</button>
                <a className="btn" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </div>
            <form className="form reveal" onSubmit={handleSubmit}>
              <div className="form__row">
                <label className="field">
                  <span>Name</span>
                  <input type="text" name="name" value={form.name} required autoComplete="name"
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input type="email" name="email" value={form.email} required autoComplete="email"
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </label>
              </div>
              <label className="field">
                <span>Message</span>
                <textarea name="message" rows={5} value={form.message} required
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </label>
              <div className="form__foot">
                <button type="submit" className="btn btn--solid" disabled={formStatus === 'sending'}>
                  {formStatus === 'sending' ? 'Sending…' : 'Send'}
                </button>
                <p className="form__status" role="status" aria-live="polite">
                  {formStatus === 'success' && 'Sent. I will reply soon.'}
                  {formStatus === 'error' && 'That did not go through. Email me directly instead.'}
                </p>
              </div>
            </form>
          </div>
        </Chapter>
      </main>

      <footer className="colophon">
        <p>© {YEAR} Zander Erwin.</p>
        <p>Set in Instrument Serif and IBM Plex. Built with React, no framework beyond that.</p>
        <p><a href="https://github.com/Lyquifyy/Portfolio" target="_blank" rel="noopener noreferrer">Source →</a></p>
      </footer>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={actions} />
    </div>
  );
}
