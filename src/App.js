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

import Cursor from './fx/Cursor';
import SplitReveal from './fx/SplitReveal';
import Magnetic from './fx/Magnetic';
import Tilt from './fx/Tilt';
import Wireframe from './fx/Wireframe';
import Terminal from './fx/Terminal';
import SheetRail from './fx/SheetRail';

import { PROFILE, RESUMES, BACKLOG } from './data/profile';
import { EXPERIENCE } from './data/experience';
import { PROJECTS } from './data/projects';
import { SECURITY, SESSION } from './data/security';

const CHAPTERS = [
  { id: 'top',        num: '00', label: 'Intro'      },
  { id: 'profile',    num: '01', label: 'Profile'    },
  { id: 'experience', num: '02', label: 'Experience' },
  { id: 'projects',   num: '03', label: 'Work'       },
  { id: 'security',   num: '04', label: 'Security'   },
  { id: 'github',     num: '05', label: 'GitHub'     },
  { id: 'resumes',    num: '06', label: 'Résumés'    },
  { id: 'backlog',    num: '07', label: 'Backlog'    },
  { id: 'contact',    num: '08', label: 'Contact'    },
];

const YEAR = new Date().getFullYear();

function Chapter({ id, num, title, children, className = '', wide = false }) {
  return (
    <section id={id} className={`chapter ${wide ? 'chapter--wide' : ''} ${className}`.trim()}>
      <header className="chapter__head reveal">
        <span className="chapter__num" aria-hidden="true">{num}</span>
        <h2 className="chapter__title"><SplitReveal text={title} /></h2>
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
  const [xray, setXray] = useState(false);

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
    { id: 'theme', group: 'View', label: dark ? 'Switch to light' : 'Switch to dark', hint: 'theme', run: () => setDark(!dark) },
    { id: 'xray', group: 'View', label: xray ? 'Leave X-ray view' : 'X-ray view', hint: 'outline every box', run: () => setXray(x => !x) },
  ], [dark, setDark, scrollTo, copyEmail, xray]);

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
    <div className="app">
      <a className="skip" href="#profile">Skip to content</a>

      <Cursor />

      {/* ------------------------------------------------ Masthead bar */}
      <header className="masthead">
        <button type="button" className="masthead__brand" onClick={() => scrollTo('top')}>
          <span className="masthead__mark" aria-hidden="true">ZE</span>
          <span className="masthead__name">Zander Erwin</span>
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

      <main className="page">
        {/* ------------------------------------------------ 00 Intro */}
        <section id="top" className="hero">
          <div className="hero__grid">
            <div className="hero__text">
              <h1 className="hero__name">
                <SplitReveal text="Zander" as="span" className="hero__line" delay={0.1} threshold={0.1} />
                <SplitReveal text="Erwin" as="span" className="hero__line hero__line--last" delay={0.25} threshold={0.1} />
              </h1>
              <p className="hero__role reveal">{PROFILE.status}. {PROFILE.based}.</p>
              <p className="hero__thesis reveal">{PROFILE.thesis}</p>
              <div className="hero__actions reveal">
                <Magnetic><button type="button" className="btn btn--solid" onClick={() => scrollTo('projects')}>See the work</button></Magnetic>
                <Magnetic><a className="btn" href={RESUMES[0].file} download>Résumé</a></Magnetic>
              </div>
            </div>
            <div className="hero__model reveal">
              <Wireframe />
              <p className="hero__hint">Drag to orbit</p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ 01 Profile */}
        <Chapter id="profile" num="01" title="Profile">
          <div className="split">
            <div className="prose">
              {PROFILE.about.map((p, i) => <p key={i} className="reveal">{p}</p>)}
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
            <figure className="portrait reveal">
              <img
                src={portrait}
                alt="Studio portrait of Zander Erwin smiling, wearing a light collared shirt"
                width="1066" height="1600"
                loading="lazy"
              />
            </figure>
          </div>

          <div className="index reveal" aria-label="Skills">
            {PROFILE.skills.map(g => (
              <div className="index__row" key={g.group}>
                <span className="index__key">{g.group}</span>
                <span className="index__val">{g.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </Chapter>

        {/* ------------------------------------------------ 02 Experience */}
        <Chapter id="experience" num="02" title="Experience">
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

        {/* ------------------------------------------------ 03 Work */}
        <Chapter id="projects" num="03" title="Work" wide>
          <SheetRail
            count={PROJECTS.length}
            renderHud={(i) => (
              <div className="rail-hud" aria-hidden="true">
                <span className="rail-hud__num">{String(i + 1).padStart(2, '0')} <em>/ {String(PROJECTS.length).padStart(2, '0')}</em></span>
                <span className="rail-hud__bar"><i /></span>
              </div>
            )}
          >
            {PROJECTS.map((p, i) => (
              <Tilt as="article" className="sheet" key={p.id} data-snap="">
                <span className="sheet__no">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="sheet__title">{p.title}</h3>
                <p className="sheet__tagline">{p.tagline}</p>
                <p className="sheet__desc">{p.description}</p>
                <footer className="sheet__foot">
                  <TechList items={p.techs.slice(0, 4)} />
                  <p className="sheet__links">
                    {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer">Live ↗</a>}
                    {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer">Source ↗</a>}
                    <span className="sheet__year">{p.year}</span>
                  </p>
                </footer>
              </Tilt>
            ))}
          </SheetRail>

          <div className="pindex reveal">
            {PROJECTS.map((p, i) => (
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
                  <p className="links">
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
        <Chapter id="security" num="04" title="Security">
          <div className="sec__top reveal">
            <Terminal script={SESSION} />
            <p className="sec__note">
              A replay of real sessions: the NAS over a mesh VPN, the lab range from CS&nbsp;352, and the
              traffic and hash work from the National Cyber League. Hostnames and addresses are from the lab.
            </p>
          </div>
          <div className="sec">
            {SECURITY.map((s, i) => (
              <article className="sec__cell reveal" key={s.title} style={{ transitionDelay: `${i * 0.05}s` }}>
                <p className="sec__meta">{s.label} · {s.when}</p>
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

        {/* ------------------------------------------------ 05 GitHub */}
        <Chapter id="github" num="05" title="GitHub">
          <div className="reveal">
            <GitHubLive user={PROFILE.githubUser} profileUrl={PROFILE.github} />
          </div>
        </Chapter>

        {/* ------------------------------------------------ 06 Résumés */}
        <Chapter id="resumes" num="06" title="Résumés">
          <div className="resumes">
            {RESUMES.map((r, i) => (
              <article className="resume reveal" key={r.id} style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3 className="resume__title">{r.title}</h3>
                <p className="resume__summary">{r.summary}</p>
                <Magnetic><a className="btn" href={r.file} download>Download PDF</a></Magnetic>
              </article>
            ))}
          </div>
        </Chapter>

        {/* ------------------------------------------------ 07 Backlog */}
        <Chapter id="backlog" num="07" title="Backlog">
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
        <Chapter id="contact" num="08" title="Contact">
          <div className="split split--contact">
            <div className="reveal">
              <p className="contact__lede">Email is fastest. I answer within a day or two.</p>
              <a className="contact__email" href={`mailto:${email}`}>{email}</a>
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
        <p>© {YEAR} Zander Erwin</p>
        <p><a href="https://github.com/Lyquifyy/Portfolio" target="_blank" rel="noopener noreferrer">Source</a></p>
      </footer>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={actions} />
    </div>
  );
}
