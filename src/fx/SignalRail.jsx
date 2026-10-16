import { useEffect, useRef, useState } from 'react';
import { onFrame, scrollToEl } from '../motion/scroll';

/*
 * The page as a request path. A thin rail down the left gutter maps the
 * whole document; a lime packet rides it as you scroll, and each section is
 * a station that lights when the packet reaches it. Wide screens only.
 */
export default function SignalRail({ stations, active }) {
  const root = useRef(null);
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    let lastH = 0, tick = 0;
    const measure = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      lastH = doc.scrollHeight;
      setMarks(stations.map(s => {
        const t = document.getElementById(s.id);
        const top = t ? t.getBoundingClientRect().top + window.scrollY : 0;
        return { ...s, y: Math.min(1, Math.max(0, (top - 120) / max)) };
      }));
    };
    measure();
    let lastSp = -1;
    const unsub = onFrame((state) => {
      const max = Math.max(1, document.documentElement.scrollHeight - state.vh);
      const sp = Math.min(1, state.y / max).toFixed(4);
      if (sp !== lastSp) { lastSp = sp; el.style.setProperty('--sp', sp); }
      if (++tick % 60 === 0) {
        el.style.setProperty('--rail-px', `${el.clientHeight}px`);
        if (document.documentElement.scrollHeight !== lastH) measure();
      }
    });
    el.style.setProperty('--rail-px', `${el.clientHeight}px`);
    window.addEventListener('resize', measure);
    return () => { unsub(); window.removeEventListener('resize', measure); };
  }, [stations]);

  return (
    <nav className="rail" ref={root} aria-label="Page sections">
      <span className="rail__line" aria-hidden="true"><i /></span>
      {marks.map(m => (
        <button
          type="button"
          key={m.id}
          className={`rail__station${active === m.id ? ' is-active' : ''}`}
          style={{ '--y': m.y }}
          onClick={() => scrollToEl(document.getElementById(m.id), 90)}
          aria-current={active === m.id ? 'location' : undefined}
        >
          <span className="rail__dot" aria-hidden="true" />
          <span className="rail__label">{m.label}</span>
        </button>
      ))}
      <span className="rail__packet" aria-hidden="true" />
    </nav>
  );
}
