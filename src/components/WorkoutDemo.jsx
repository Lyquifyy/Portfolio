import { useEffect, useState } from 'react';

const REST_SECONDS = 90;
const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function WorkoutDemo() {
  const [completed, setCompleted] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const finished = completed === 4;

  useEffect(() => {
    if (!remaining || paused) return undefined;
    const timer = setTimeout(() => setRemaining(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [remaining, paused]);

  function logSet() {
    const next = completed + 1;
    setCompleted(next);
    setRemaining(next === 4 ? 0 : REST_SECONDS);
    setPaused(false);
    setAnnouncement(next === 4 ? 'All four sets complete.' : `Set ${next} logged. Rest timer started.`);
  }

  function reset() {
    setCompleted(0);
    setRemaining(0);
    setPaused(false);
    setAnnouncement('Demo reset. Ready for set one.');
  }

  return (
    <div className="workout-demo project-stage">
      <div className="workout-demo__top"><span>Programmed</span><span>From app to lock screen</span></div>
      <img className="programmed-screen" src={`${process.env.PUBLIC_URL}/images/programmed-workout.png`} width="1206" height="2622" alt="Programmed’s actual workout screen, with a bone-colored active set, condensed type, and lit progress indicators" loading="lazy" />
      <div className="workout-live">
        <p className="workout-live__label">Try the Live Activity</p>
        <div className={`workout-widget${remaining ? ' is-resting' : ''}`}>
          <div className="workout-widget__status">
            <div className="workout-sets" aria-label={`${completed} of 4 sets complete`}>
              {[1, 2, 3, 4].map(n => <span key={n} className={n <= completed ? 'is-done' : ''} />)}
            </div>
            <span>{finished ? 'Workout complete' : 'Lower body'}</span><span>Programmed</span>
          </div>
          <div className="workout-widget__main">
            <div><h4>{finished ? 'Good work.' : 'Back Squat'}</h4><p>{finished ? '4 sets logged' : `${remaining ? 'Rest · next up' : 'Now'} · Set ${Math.min(completed + 1, 4)} of 4`}</p></div>
            {remaining > 0 ? <output className="workout-timer" aria-label="Rest time remaining" aria-live="off">{formatTime(remaining)}</output> : <span className="workout-prescription">{finished ? '4 / 4' : '8–12'}<span>{finished ? 'sets' : 'reps'}</span></span>}
          </div>
          <div className="workout-track" aria-hidden="true"><span style={{ transform: `scaleX(${remaining ? (REST_SECONDS - remaining) / REST_SECONDS : completed / 4})` }} /></div>
          <div className="workout-controls">
            {remaining > 0 ? <><button type="button" onClick={() => setPaused(value => !value)}>{paused ? 'Resume' : 'Pause'}</button><button type="button" className="workout-log" onClick={() => { setRemaining(0); setAnnouncement(`Ready for set ${completed + 1}.`); }}>Skip rest</button></> : <button type="button" className="workout-log" onClick={finished ? reset : logSet}>{finished ? 'Try again' : 'Log set'}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-9" /></svg></button>}
          </div>
        </div>
      </div>
      <p className="workout-demo__caption">Actual app screen + interactive Live Activity adaptation.</p>
      <p className="sr-only" role="status">{announcement}</p>
    </div>
  );
}
