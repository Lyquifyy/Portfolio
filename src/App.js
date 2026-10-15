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

import Wireframe from './fx/Wireframe';
import Terminal from './fx/Terminal';
import SheetRail from './fx/SheetRail';
import ProjectSheet from './fx/ProjectSheet';
import DineSensePulse from './fx/DineSensePulse';
import DynamicIsland from './fx/DynamicIsland';

import { PROFILE, RESUMES, BACKLOG } from './data/profile';
import { EXPERIENCE } from './data/experience';
import { PROJECTS } from './data/projects';
import { SECURITY, SESSION } from './data/security';

const CHAPTERS = [
  { id: 'top',        label: 'Intro'      },
  { id: 'profile',    label: 'Profile'    },
  { id: 'experience', label: 'Experience' },
  { id: 'projects',   label: 'Work'       },
  { id: 'security',   label: 'Security'   },
  { id: 'github',     label: 'GitHub'     },
  { id: 'resumes',    label: 'Résumés'    },
  { id: 'backlog',    label: 'Backlog'    },
  { id: 'contact',    label: 'Contact'    },
];

const YEAR = new Date().getFullYear();

// Live pieces shown inside a project's sheet.
const DEMOS = {
  dinesense: () => <DineSensePulse />,
  programmed: () => <DynamicIsland />,
};

function Chapter({ id, title, children, className = '', wide = false }) {
  return (
    <section id={id} className={`chapter ${wide ? 'chapter--wide' : ''} ${className}`.trim()}>
      <h2 className="chapter__title reveal">{title}</h2>
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

/* ---- Skills cross-referenced with the work that used them ------------------ */

function tokens(skill) {
  return skill.toLowerCase().replace(/[()]/g, ',').split(/,|\s\/\s/)
    .map(t => t.trim()).filter(Boolean);
}

function techMatches(tech, tok) {
  const t = tech.toLowerCase();
  if (t === tok) return true;
  if (t.startsWith(`${tok} `) && /^\d/.test(t.slice(tok.length + 1))) return true;   // "react 19", ".net 8", "swift 6"
  if ((tok.includes('.') || tok.length >= 6) && t.includes(tok)) return true;        // "asp.net core", "typescript"
  return false;
}

function usedIn(skill) {
  const toks = tokens(skill);
  const hit = (techs) => techs.some(t => toks.some(tok => techMatches(t, tok)));
  return {
    projects: PROJECTS.filter(p => hit(p.techs)),
    jobs: EXPERIENCE.filter(j => hit(j.techs)),
  };
}

function Skills({ onOpen, onJob }) {
  const [active, setActive] = useState(null);
  const groups = useMemo(() => PROFILE.skills.map(g => ({
    ...g,
    items: g.items.map(s => ({ name: s, ...usedIn(s) })),
  })), []);
  const current = active && groups.flatMap(g => g.items).find(s => s.name === active);

  return (
    <div className="skills">
      {groups.map(g => (
        <div className="skills__group" key={g.group}>
          <h3 className="skills__name">{g.group}</h3>
          <div className="skills__chips">
            {g.items.map(s => {
              const n = s.projects.length + s.jobs.length;
              return (
                <button
                  type="button"
                  key={s.name}
                  className={`chip${active === s.name ? ' is-active' : ''}${n ? '' : ' chip--quiet'}`}
                  onClick={() => setActive(a => (a === s.name ? null : s.name))}
                  aria-pressed={active === s.name}
                >
                  {s.name}{n > 0 && <span className="chip__n">{n}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="skills__used" aria-live="polite">
        {!current && <p>Pick a skill to see where it was used.</p>}
        {current && (current.projects.length + current.jobs.length === 0) && (
          <p><strong>{current.name}</strong> is on the résumé but not attached to a project here.</p>
        )}
        {current && (current.projects.length + current.jobs.length > 0) && (
          <>
            <p><strong>{current.name}</strong> shows up in</p>
            <ul>
              {current.jobs.map(j => (
                <li key={j.company}><button type="button" className="link" onClick={onJob}>{j.role}, {j.company}</button></li>
              ))}
              {current.projects.map(p => (
                <li key={p.id}><button type="button" className="link" onClick={(e) => onOpen(p.id, e.currentTarget)}>{p.title}</button> <span className="muted">· {p.kind}</span></li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
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
  const [open, setOpen] = useState(() => {
    const m = typeof window !== 'undefined' && window.location.hash.match(/^#p-([a-z0-9-]+)$/);
    return m && PROJECTS.some(p => p.id === m[1]) ? { id: m[1], from: null } : null;
  });

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const openProject = useCallback((id, el) => {
    const from = el ? el.getBoundingClientRect() : null;
    setOpen({ id, from: from ? { left: from.left, top: from.top, width: from.width, height: from.height } : null });
    try { window.history.replaceState(null, '', `#p-${id}`); } catch {}
  }, []);

  const closeProject = useCallback(() => {
    setOpen(null);
    try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch {}
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
      id: `go-${c.id}`, group: 'Go to', label: c.label, run: () => scrollTo(c.id),
    })),
    ...PROJECTS.map(p => ({
      id: `p-${p.id}`, group: 'Projects', label: p.title, hint: p.kind, run: () => openProject(p.id, null),
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
  ], [dark, setDark, scrollTo, copyEmail, xray, openProject]);

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
  const openProjectData = open && PROJECTS.find(p => p.id === open.id);

  return (
    <div className="app">
      <a className="skip" href="#profile">Skip to content</a>

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
          <button type="button" className="masthead__cmd" onClick={() => setPaletteOpen(true)} aria-haspopup="dialog" title="⌘K / Ctrl+K">Search</button>
          <ThemeSwitch />
        </nav>
      </header>

      <ChapterRail chapters={CHAPTERS} active={active} onSelect={scrollTo} />

      <main className="page">
        {/* ------------------------------------------------ Intro */}
        <section id="top" className="hero">
          <div className="hero__grid">
            <div className="hero__text">
              <h1 className="hero__name reveal">
                <span>Zander</span>
                <span className="hero__name-last">Erwin</span>
              </h1>
              <p className="hero__role reveal">{PROFILE.status}. {PROFILE.based}.</p>
              <p className="hero__thesis reveal">{PROFILE.thesis}</p>
              <div className="hero__actions reveal">
                <button type="button" className="btn btn--solid" onClick={() => scrollTo('projects')}>See the work</button>
                <a className="btn" href={RESUMES[0].file} download>Résumé</a>
              </div>
            </div>
            <div className="hero__model reveal">
              <Wireframe />
              <p className="hero__hint">Drag to orbit</p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ Profile */}
        <Chapter id="profile" title="Profile">
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

          <div className="reveal">
            <h3 className="sub">Skills, and where each one was used</h3>
            <Skills onOpen={openProject} onJob={() => scrollTo('experience')} />
          </div>
        </Chapter>

        {/* ------------------------------------------------ Experience */}
        <Chapter id="experience" title="Experience">
          <ol className="exp">
            {EXPERIENCE.map((job, i) => (
              <li className="exp__item reveal" key={job.company} style={{ transitionDelay: `${i * 0.06}s` }}>
                <p className="exp__when">{job.start} – {job.end}</p>
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

        {/* ------------------------------------------------ Work */}
        <Chapter id="projects" title="Work" wide>
          <SheetRail
            count={PROJECTS.length}
            renderHud={(i) => (
              <div className="rail-hud" aria-hidden="true">
                <span className="rail-hud__num">{i + 1} of {PROJECTS.length}</span>
                <span className="rail-hud__bar"><i /></span>
                <span className="rail-hud__hint">Click a card to open it</span>
              </div>
            )}
          >
            {PROJECTS.map((p) => (
              <article className={`sheet${DEMOS[p.id] ? ' sheet--live' : ''}`} key={p.id}>
                <button
                  type="button"
                  className="sheet__hit"
                  aria-label={`Open ${p.title}`}
                  onClick={(e) => openProject(p.id, e.currentTarget.closest('.sheet'))}
                />
                <h3 className="sheet__title">{p.title}</h3>
                <p className="sheet__tagline">{p.tagline}</p>
                <p className="sheet__desc">{p.description}</p>
                <footer className="sheet__foot">
                  <TechList items={p.techs.slice(0, 4)} />
                  <p className="sheet__links">
                    {DEMOS[p.id] && <span className="sheet__live">Live inside</span>}
                    {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer">Live ↗</a>}
                    {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer">Source ↗</a>}
                    <span className="sheet__year">{p.year}</span>
                  </p>
                </footer>
              </article>
            ))}
          </SheetRail>

          <div className="pindex reveal">
            {PROJECTS.map((p) => (
              <button type="button" className="pindex__row" key={p.id} onClick={(e) => openProject(p.id, e.currentTarget)}>
                <span className="pindex__title">
                  <span>{p.title}</span>
                  <span className="pindex__tagline">{p.tagline}</span>
                </span>
                <span className="pindex__stack">{p.techs.slice(0, 3).join(' · ')}</span>
                <span className="pindex__year">{p.year}</span>
                <span className="pindex__toggle" aria-hidden="true">Open</span>
              </button>
            ))}
          </div>
        </Chapter>

        {/* ------------------------------------------------ Security */}
        <Chapter id="security" title="Security">
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

        {/* ------------------------------------------------ GitHub */}
        <Chapter id="github" title="GitHub">
          <div className="reveal">
            <GitHubLive user={PROFILE.githubUser} profileUrl={PROFILE.github} />
          </div>
        </Chapter>

        {/* ------------------------------------------------ Résumés */}
        <Chapter id="resumes" title="Résumés">
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

        {/* ------------------------------------------------ Backlog */}
        <Chapter id="backlog" title="Backlog">
          <ol className="backlog">
            {BACKLOG.map((b, i) => (
              <li className="backlog__item reveal" key={b.title} style={{ transitionDelay: `${i * 0.05}s` }}>
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

        {/* ------------------------------------------------ Contact */}
        <Chapter id="contact" title="Contact">
          <div className="split split--contact">
            <div className="reveal">
              <p className="contact__lede">Email is fastest. I answer within a day or two.</p>
              <a className="contact__email" href={`mailto:${email}`}>{email}</a>
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
        <p>© {YEAR} Zander Erwin</p>
        <p><a href="https://github.com/Lyquifyy/Portfolio" target="_blank" rel="noopener noreferrer">Source</a></p>
      </footer>

      {openProjectData && (
        <ProjectSheet
          key={openProjectData.id}
          project={openProjectData}
          from={open.from}
          demo={DEMOS[openProjectData.id] ? DEMOS[openProjectData.id]() : null}
          onClose={closeProject}
          techList={TechList}
        />
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={actions} />
    </div>
  );
}
