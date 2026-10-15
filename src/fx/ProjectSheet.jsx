import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * A project opened full-screen. The panel starts as the card's rectangle
 * and grows into place (a FLIP transform), then the content fades in. Esc,
 * the scrim, or the close button reverse it. `demo` is an optional live
 * element for the project (DineSense's pulse, Programmed's island).
 */
export default function ProjectSheet({ project, from, demo, onClose, techList: TechList }) {
  const panel = useRef(null);
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);

  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return undefined;
    if (!from || prefersReducedMotion()) { setShown(true); return undefined; }
    const to = el.getBoundingClientRect();
    const sx = from.width / to.width, sy = from.height / to.height;
    el.style.transformOrigin = 'top left';
    el.style.transition = 'none';
    el.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`;
    // force layout, then release
    void el.offsetWidth;
    el.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transform = 'translate(0, 0) scale(1, 1)';
    const t = setTimeout(() => setShown(true), 220);
    return () => clearTimeout(t);
  }, [from]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    const el = panel.current;
    if (!el || !from || prefersReducedMotion()) { onClose(); return; }
    const to = el.getBoundingClientRect();
    el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
    setTimeout(onClose, 380);
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const p = project;

  return (
    <div className={`ps${shown ? ' is-shown' : ''}${closing ? ' is-closing' : ''}`} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div ref={panel} className="ps__panel" role="dialog" aria-modal="true" aria-labelledby="ps-title" tabIndex={-1}>
        <button type="button" className="ps__close" onClick={close} aria-label="Close">×</button>
        <div className="ps__body">
          <header className="ps__head">
            <p className="ps__kind">{p.kind}{p.status ? ` · ${p.status}` : ''} · {p.year}</p>
            <h2 id="ps-title" className="ps__title">{p.title}</h2>
            <p className="ps__tagline">{p.tagline}</p>
          </header>
          <div className={`ps__grid${demo ? '' : ' ps__grid--text'}`}>
            <div className="ps__text">
              <p className="ps__desc">{p.description}</p>
              <ul className="bullets">
                {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
              <TechList items={p.techs} />
              <p className="ps__links">
                {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer">Visit {p.live.replace('https://', '')} →</a>}
                {p.repo
                  ? <a href={p.repo} target="_blank" rel="noopener noreferrer">Source on GitHub →</a>
                  : <span className="muted">Private repository</span>}
              </p>
            </div>
            {demo && <div className="ps__demo">{demo}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
