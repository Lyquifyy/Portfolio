import { useEffect, useState } from 'react';
import useInView from '../hooks/useInView';
import useReducedMotion from '../hooks/useReducedMotion';

/*
 * A session transcript that types itself when scrolled into view. Commands
 * are typed character by character; output lands line by line. Runs once.
 */
export default function Terminal({ script, host = 'zander@lab' }) {
  const [ref, inView] = useInView({ threshold: 0.35 });
  const reduced = useReducedMotion();
  const [lines, setLines] = useState([]);   // { type, text }
  const [typing, setTyping] = useState('');  // partial command
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduced) { setLines(script); setDone(true); return undefined; }
    let cancelled = false;
    const timers = [];
    const wait = (ms) => new Promise(res => { const t = setTimeout(res, ms); timers.push(t); });

    (async () => {
      for (const line of script) {
        if (cancelled) return;
        if (line.type === 'cmd') {
          await wait(260);
          for (let i = 1; i <= line.text.length; i++) {
            if (cancelled) return;
            setTyping(line.text.slice(0, i));
            await wait(14 + Math.random() * 30);
          }
          await wait(180);
          setTyping('');
          setLines(l => [...l, line]);
        } else {
          await wait(45 + Math.random() * 90);
          setLines(l => [...l, line]);
        }
      }
      if (!cancelled) setDone(true);
    })();

    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [inView, reduced, script]);

  return (
    <div ref={ref} className="term" role="log" aria-live="off">
      <div className="term__bar" aria-hidden="true">
        <span /><span /><span />
        <span className="term__title">{host} — bash</span>
      </div>
      <pre className="term__body">
        {lines.map((l, i) => (
          <div key={i} className={`term__line term__line--${l.type}`}>
            {l.type === 'cmd' && <span className="term__ps">{host}:~$ </span>}
            {l.text}
          </div>
        ))}
        {!done && (
          <div className="term__line term__line--cmd">
            <span className="term__ps">{host}:~$ </span>{typing}<span className="term__caret" />
          </div>
        )}
        {done && (
          <div className="term__line term__line--cmd">
            <span className="term__ps">{host}:~$ </span><span className="term__caret" />
          </div>
        )}
      </pre>
    </div>
  );
}
