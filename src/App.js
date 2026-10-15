import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import emailjs from 'emailjs-com';
import './App.css';
import './fx/fx.css';

import portrait from './images/portrait.jpg';
import { ThemeContext } from './context/ThemeContext';
import { ThemeSwitch } from './components/ThemeSwitch';
import ChapterRail from './components/ChapterRail';
import CommandPalette from './components/CommandPalette';
import GitHubLive from './components/GitHubLive';

import ShaderField from './fx/ShaderField';
import Cursor from './fx/Cursor';
import Preloader from './fx/Preloader';
import { Cycler } from './fx/Scramble';
import SplitReveal from './fx/SplitReveal';
import Magnetic from './fx/Magnetic';
import Tilt from './fx/Tilt';
import Wireframe from './fx/Wireframe';
import SkillCloud from './fx/SkillCloud';
import Terminal from './fx/Terminal';
import Dimension from './fx/Dimension';
import TitleBlock from './fx/TitleBlock';
import CountUp from './fx/CountUp';
import WordReveal from './fx/WordReveal';
import ScrollLine from './fx/ScrollLine';
import SheetRail from './fx/SheetRail';

import { PROFILE, RESUMES, BACKLOG } from './data/profile';
import { EXPERIENCE } from './data/experience';
import { PROJECTS } from './data/projects';
import { SECURITY, SESSION } from './data/security';

const CHAPTERS = [
  { id: 'top',        num: '00', label: 'Cover'      },
  { id: 'profile',    num: '01', label: 'Profile'    },
  { id: 'experience', num: '02', label: 'Experience' },
  { id: 'projects',   num: '03', label: 'Sheets'     },
  { id: 'security',   num: '04', label: 'Security'   },
  { id: 'github',     num: '05', label: 'Live'       },
  { id: 'resumes',    num: '06', label: 'Résumés'    },
  { id: 'backlog',    num: '07', label: 'Backlog'    },
  { id: 'contact',    num: '08', label: 'Contact'    },
];

const ROLES = [
  'Software Engineer',
  'Automation Developer',
  'Revit API · APS',
  '.NET & TypeScript',
  'Security-minded',
];

const CLOUD = [
  ...PROFILE.skills[0].items,
  ...PROFILE.skills[1].items.map(s => s.split(' / ')[0]),
  ...PROFILE.skills[3].items.filter(s => s.length < 16),
  ...PROFILE.skills[4].items.slice(0, 5),
];

const YEAR = new Date().getFullYear();

function Chapter({ id, num, title, dek, children, className = '', wide = false }) {
  return (
    <section id={id} className={`chapter ${wide ? 'chapter--wide' : ''} ${className}`.trim()}>
      <header className="chapter__head reveal">
        <span className="chapter__num" aria-hidden="true">
          <span className="chapter__cut">{num}</span>
        </span>
        <h2 className="chapter__title"><SplitReveal text={title} /></h2>
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

function Corners() {
  return (
    <span className="corners" aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}

export default function App() {
  const { dark, setDark } = useContext(ThemeContext);
  const [active, setActive] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle');
  const [copied, setCopied] = useState(false);
  const [xray, setXray] = useState(false);
  const [plotKey, setPlotKey] = useState(0);
  const [plotted, setPlotted] = useState(false);

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

  useEffect(() => {
    document.body.classList.toggle('xray', xray);
    return () => document.body.classList.remove('xray');
  }, [xray]);

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText(PROFILE.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }, []);

  const replot = useCallback(() => {
    try { sessionStorage.removeItem('plot-seen'); } catch {}
    window.scrollTo({ top: 0, behavior: 'auto' });
    setPlotted(false);
    setPlotKey(k => k + 1);
  }, []);

  const actions = useMemo(() => [
    ...CHAPTERS.map(c => ({
      id: `go-${c.id}`, group: 'Go to', label: c.label, hint: `A-${c.num}`, run: () => scrollTo(c.id),
    })),
    { id: 'open-github', group: 'Open', label: 'GitHub profile', hint: 'Lyquifyy', run: () => window.open(PROFILE.github, '_blank', 'noopener') },
    { id: 'open-linkedin', group: 'Open', label: 'LinkedIn', hint: 'zander-erwin', run: () => window.open(PROFILE.linkedin, '_blank', 'noopener') },
    { id: 'open-dinesense', group: 'Open', label: 'DineSense', hint: 'dinesense.app', run: () => window.open('https://dinesense.app', '_blank', 'noopener') },
    ...RESUMES.map(r => ({
      id: `dl-${r.id}`, group: 'Download', label: `${r.title} résumé`, hint: 'PDF', run: () => window.open(r.file, '_blank', 'noopener'),
    })),
    { id: 'copy-email', group: 'Contact', label: 'Copy email address', hint: PROFILE.email, run: copyEmail },
    { id: 'mail', group: 'Contact', label: 'Compose an email', hint: 'mailto', run: () => { window.location.href = `mailto:${PROFILE.email}`; } },
    { id: 'theme', group: 'View', label: dark ? 'Switch to paper' : 'Switch to blueprint', hint: 'theme', run: () => setDark(!dark) },
    { id: 'xray', group: 'View', label: xray ? 'Leave X-ray view' : 'X-ray view', hint: 'wireframe the page', run: () => setXray(x => !x) },
    { id: 'replot', group: 'View', label: 'Replay the plot sequence', hint: 'intro', run: replot },
  ], [dark, setDark, scrollTo, copyEmail, xray, replot]);

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

  const email = PROFILE.email;

  return (
    <div className={`app${plotted ? ' is-plotted' : ''}`}>
      <a className="skip" href="#profile">Skip to content</a>

      <ShaderField />
      <Cursor />
      <Preloader key={plotKey} onDone={() => setPlotted(true)} />

      {/* ------------------------------------------------ Masthead bar */}
      <header className="masthead">
        <button type="button" className="masthead__brand" onClick={() => scrollTo('top')}>
          <span className="masthead__mark" aria-hidden="true">ZE</span>
          <span className="masthead__name">Zander Erwin</span>
          <span className="masthead__issue">Sheet set · Rev {YEAR}</span>
        </button>
        <nav className="masthead__links" aria-label="External links">
          <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={`mailto:${email}`}>Email</a>
          <button type="button" className="masthead__cmd" onClick={() => setPaletteOpen(true)} aria-haspopup="dialog" aria-label="Open command palette">
            <kbd>⌘</kbd><kbd>K</kbd>
          </button>
          <ThemeSwitch />
        </nav>
      </header>

      <ChapterRail chapters={CHAPTERS} active={active} onSelect={scrollTo} />
      <TitleBlock chapters={CHAPTERS} active={active} />

      <main className="page">
        {/* ------------------------------------------------ 00 Cover */}
        <section id="top" className="hero">
          <div className="hero__grid">
            <div className="hero__text">
              <p className="eyebrow hero__eyebrow">
                <span>Sheet A-00</span>
                <span className="eyebrow__sep">/</span>
                <Cycler items={ROLES} className="hero__role" />
              </p>
              <div className="hero__namewrap">
                <h1 className="hero__name">
                  <SplitReveal text="Zander" as="span" className="hero__line" delay={0.15} threshold={0.1} />
                  <SplitReveal text="Erwin" as="span" className="hero__line hero__line--last" delay={0.32} threshold={0.1} />
                </h1>
                <Dimension label="overall" />
              </div>
              <WordReveal text={PROFILE.thesis} className="hero__thesis" mode="enter" />
              <dl className="facts reveal">
                <div><dt>Now</dt><dd>{PROFILE.status}</dd></div>
                <div><dt>Based</dt><dd>{PROFILE.based}</dd></div>
                <div><dt>Education</dt><dd>{PROFILE.education[0].degree}, {PROFILE.education[0].school}, {PROFILE.education[0].period.split(' – ')[1]}</dd></div>
                <div><dt>Shipping</dt><dd>DineSense, invite-only pilot</dd></div>
              </dl>
              <div className="hero__actions reveal">
                <Magnetic><button type="button" className="btn btn--solid" onClick={() => scrollTo('projects')}>Open the sheets</button></Magnetic>
                <Magnetic><a className="btn" href={RESUMES[0].file} download>Résumé (PDF)</a></Magnetic>
                <span className="hero__hint">or press <kbd>⌘</kbd><kbd>K</kbd></span>
              </div>
            </div>
            <figure className="hero__model reveal">
              <Corners />
              <Wireframe />
              <figcaption>
                <span>Fig. 1</span> Massing study, five volumes. Drag to orbit.
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
                  <span>Stack — C# · .NET · TypeScript · Swift · Supabase · Azure</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ 01 Profile */}
        <Chapter id="profile" num="01" title="Profile" dek="Who is drawing this, and what they actually do.">
          <div className="split">
            <div className="prose">
              <WordReveal text={PROFILE.about[0]} />
              {PROFILE.about.slice(1).map((p, i) => <p key={i} className="reveal">{p}</p>)}
              <dl className="edu reveal">
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
            <div className="profile__side">
              <figure className="portrait reveal">
                <Corners />
                <img
                  src={portrait}
                  alt="Studio portrait of Zander Erwin smiling, wearing a light collared shirt"
                  width="1066" height="1600"
                  loading="lazy"
                />
                <span className="portrait__scan" aria-hidden="true" />
                <figcaption><span>Fig. 2</span> Zander Erwin, {YEAR}. Wichita, Kansas.</figcaption>
              </figure>
              <dl className="numbers reveal">
                <div><dd><CountUp to={EXPERIENCE.length} /></dd><dt>Engineering roles</dt></div>
                <div><dd><CountUp to={PROJECTS.length} /></dd><dt>Projects on the sheets</dt></div>
                <div><dd><CountUp to={PROFILE.skills[0].items.length} /></dd><dt>Languages in use</dt></div>
                <div><dd>Top&nbsp;1000</dd><dt>NCL, Fall 2025</dt></div>
              </dl>
            </div>
          </div>

          <div className="skills reveal">
            <div className="skills__cloud">
              <Corners />
              <SkillCloud words={CLOUD} />
              <p className="skills__cap"><span>Fig. 3</span> Index of skills. Drag to spin.</p>
            </div>
            <aside className="index" aria-label="Skills index">
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
        <Chapter id="experience" num="02" title="Experience" dek="Two and a half years of engineering alongside a degree. Read as a revision history.">
          <ScrollLine as="ol" className="exp" itemSelector=".exp__item">
            <span className="exp__line" aria-hidden="true" />
            {EXPERIENCE.map((job, i) => (
              <li className="exp__item reveal" key={job.company} style={{ transitionDelay: `${i * 0.06}s` }}>
                <div className="exp__when">
                  <span className="exp__rev" aria-hidden="true">
                    <svg viewBox="0 0 20 20"><path d="M10 2 L18 17 L2 17 Z" /></svg>
                    <b>{EXPERIENCE.length - i}</b>
                  </span>
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
          </ScrollLine>
        </Chapter>

        {/* ------------------------------------------------ 03 Sheets */}
        <Chapter id="projects" num="03" title="Sheets" dek="One sheet per project. Scroll to leaf through the set, then open any row in the index." wide>
          <SheetRail
            count={PROJECTS.length}
            renderHud={(i) => (
              <div className="rail-hud" aria-hidden="true">
                <span className="rail-hud__num">Sheet {String(i + 1).padStart(2, '0')} <em>/ {String(PROJECTS.length).padStart(2, '0')}</em></span>
                <span className="rail-hud__title">{PROJECTS[i].title}</span>
                <span className="rail-hud__bar"><i /></span>
                <span className="rail-hud__hint">scroll ↓ to leaf →</span>
              </div>
            )}
          >
            {PROJECTS.map((p, i) => (
              <Tilt as="article" className="sheet" key={p.id} data-snap="">
                <Corners />
                <header className="sheet__head">
                  <span className="sheet__no">A-1{String(i + 1).padStart(2, '0')}</span>
                  <span className="sheet__kind">{p.kind}{p.status && <em> · {p.status}</em>}</span>
                </header>
                <h3 className="sheet__title">{p.title}</h3>
                <p className="sheet__tagline">{p.tagline}</p>
                <p className="sheet__desc">{p.description}</p>
                <TechList items={p.techs.slice(0, 5)} className="sheet__techs" />
                <footer className="sheet__tb">
                  <span><small>Drawn by</small>Z. Erwin</span>
                  <span><small>Date</small>{p.year}</span>
                  <span><small>Scale</small>NTS</span>
                  <span className="sheet__links">
                    {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer">Live ↗</a>}
                    {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer">Source ↗</a>}
                    {!p.repo && !p.live && <small>Private</small>}
                  </span>
                </footer>
              </Tilt>
            ))}
          </SheetRail>

          <div className="pindex reveal">
            <div className="pindex__head" aria-hidden="true">
              <span>No.</span><span>Title</span><span>Stack</span><span>Year</span><span />
            </div>
            {PROJECTS.map((p, i) => (
              <details className="pindex__row" key={p.id}>
                <summary className="pindex__summary">
                  <span className="pindex__num">A-1{String(i + 1).padStart(2, '0')}</span>
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
          <div className="sec__top">
            <div className="sec__term reveal">
              <Terminal script={SESSION} />
            </div>
            <div className="sec__note reveal">
              <p className="eyebrow">Session log</p>
              <p>
                Every command on the left maps to something real: the NAS reachable only over a mesh VPN,
                the lab range from CS&nbsp;352, and the traffic and hash work from the National Cyber League.
                Hostnames and addresses are from the lab, not production.
              </p>
            </div>
          </div>
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
        <Chapter id="github" num="05" title="Live" dek="Pulled from the public GitHub API when this sheet loads.">
          <div className="reveal">
            <GitHubLive user={PROFILE.githubUser} profileUrl={PROFILE.github} />
          </div>
        </Chapter>

        {/* ------------------------------------------------ 06 Résumés */}
        <Chapter id="resumes" num="06" title="Résumés" dek="One for each kind of role. Both are current.">
          <div className="resumes">
            {RESUMES.map((r, i) => (
              <Tilt as="article" className="resume reveal" key={r.id} max={4} style={{ transitionDelay: `${i * 0.06}s` }}>
                <Corners />
                <span className="stamp" aria-hidden="true">Current · {YEAR}</span>
                <p className="eyebrow"><span>Document {String(i + 1).padStart(2, '0')}</span><span className="eyebrow__sep">/</span><span>PDF</span></p>
                <h3 className="resume__title">{r.title}</h3>
                <p className="resume__summary">{r.summary}</p>
                <Magnetic><a className="btn" href={r.file} download>Download PDF</a></Magnetic>
              </Tilt>
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
              <a className="contact__email" href={`mailto:${email}`} aria-label={email}>
                {Array.from(email).map((ch, i) => (
                  <span key={i} className="contact__ch" style={{ '--i': i }} aria-hidden="true">{ch}</span>
                ))}
              </a>
              <div className="contact__row">
                <Magnetic><button type="button" className="btn" onClick={copyEmail}>{copied ? 'Copied' : 'Copy address'}</button></Magnetic>
                <Magnetic><a className="btn" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></Magnetic>
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
                <Magnetic>
                  <button type="submit" className="btn btn--solid" disabled={formStatus === 'sending'}>
                    {formStatus === 'sending' ? 'Sending…' : 'Send'}
                  </button>
                </Magnetic>
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
        <p>Set in Big Shoulders Display and IBM Plex. React, raw WebGL, no animation library.</p>
        <p><a href="https://github.com/Lyquifyy/Portfolio" target="_blank" rel="noopener noreferrer">Source →</a></p>
        <button type="button" className="totop" onClick={() => scrollTo('top')} aria-label="Back to the cover">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs><path id="totop-ring" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" /></defs>
            <text><textPath href="#totop-ring">BACK TO COVER · SHEET A-00 · BACK TO COVER · </textPath></text>
          </svg>
          <span>↑</span>
        </button>
      </footer>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={actions} />
    </div>
  );
}
