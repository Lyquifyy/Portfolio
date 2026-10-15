import { useEffect, useRef, useState } from 'react';

/*
 * A working recreation of Programmed's Live Activity: the workout as it sits
 * in the Dynamic Island and on the lock screen. Set done starts the rest
 * timer; +15s extends it; Skip ends it. Elapsed time runs from mount.
 */
const SESSION = [
  { name: 'Back squat', sets: 4, reps: '6–8', rest: 150 },
  { name: 'Romanian deadlift', sets: 3, reps: '8–10', rest: 120 },
  { name: 'Leg press', sets: 3, reps: '10–12', rest: 90 },
];

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function DynamicIsland() {
  const [ex, setEx] = useState(0);
  const [set, setSet] = useState(1);
  const [rest, setRest] = useState(0);        // seconds left; 0 = not resting
  const [restTotal, setRestTotal] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [done, setDone] = useState(false);
  const t0 = useRef(Date.now());
  const current = SESSION[ex];

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - t0.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (rest <= 0) return undefined;
    const id = setTimeout(() => setRest(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [rest]);

  const advance = () => {
    if (set < current.sets) { setSet(s => s + 1); return; }
    if (ex < SESSION.length - 1) { setEx(e => e + 1); setSet(1); return; }
    setDone(true);
  };

  const setDone_ = () => {
    if (done) return;
    setRest(current.rest); setRestTotal(current.rest);
  };
  const skip = () => { setRest(0); advance(); };
  const plus = () => setRest(r => r + 15);

  useEffect(() => {
    if (restTotal && rest === 0) { setRestTotal(0); advance(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rest]);

  const restP = restTotal ? 1 - rest / restTotal : 0;
  const R = 15, C = 2 * Math.PI * R;

  return (
    <div className="di">
      <div className="di__phone" aria-hidden="true">
        <button type="button" className={`di__island${expanded ? ' is-open' : ''}`} onClick={() => setExpanded(o => !o)} aria-expanded={expanded}>
          {!expanded && (
            <span className="di__compact">
              <span className="di__dot" />
              <span>{rest > 0 ? mmss(rest) : mmss(elapsed)}</span>
            </span>
          )}
          {expanded && (
            <span className="di__open">
              <span className="di__head">
                <span className="di__app">Programmed</span>
                <span className="di__elapsed">{mmss(elapsed)}</span>
              </span>
              <span className="di__main">
                <span className="di__ex">
                  <strong>{done ? 'Session complete' : current.name}</strong>
                  <em>{done ? `${SESSION.reduce((n, e) => n + e.sets, 0)} sets logged` : `Set ${set} of ${current.sets} · ${current.reps} reps · RIR 2`}</em>
                </span>
                <span className="di__ring">
                  <svg viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r={R} className="di__track" />
                    <circle cx="18" cy="18" r={R} className="di__fill" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - restP) }} />
                  </svg>
                  <span>{rest > 0 ? mmss(rest) : 'rest'}</span>
                </span>
              </span>
            </span>
          )}
        </button>
        {expanded && !done && (
          <div className="di__actions" role="group" aria-label="Workout controls">
            {rest > 0 ? (
              <>
                <button type="button" onClick={plus}>+15s</button>
                <button type="button" onClick={skip}>Skip</button>
              </>
            ) : (
              <button type="button" className="di__primary" onClick={setDone_}>Set done</button>
            )}
          </div>
        )}
        <div className="di__clock" aria-hidden="true">
          <span>{new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <strong>{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong>
        </div>
      </div>
      <p className="di__caption">
        The Live Activity as it runs on the phone: rest counts down on the lock screen and in the Dynamic Island, with Set done, +15s and Skip reachable without unlocking. Tap the island to collapse it.
      </p>
    </div>
  );
}
