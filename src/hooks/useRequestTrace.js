import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * A bounded request/response pass (interface → logic → data → back) that
 * runs on its own while the artifact is on screen, rests, and runs again.
 * Touching the artifact holds the loop for a moment, then it resumes.
 * Never runs in a hidden tab or under reduced motion.
 */
const STEPS = [0, 1, 2, 1, 0];
const STEP_MS = 680;
const REST_MS = 2600;
const HOLD_MS = 6000;

const reduced = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function useRequestTrace({ auto = true } = {}) {
  const element = useRef(null);
  const timers = useRef([]);
  const inView = useRef(false);
  const holdUntil = useRef(0);
  const [phase, setPhase] = useState(-1);
  const [hasRun, setHasRun] = useState(false);
  const [cycles, setCycles] = useState(0);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after = (ms, fn) => { timers.current.push(setTimeout(fn, ms)); };

  const play = useCallback(() => {
    clear();
    if (reduced()) { setHasRun(true); return; }
    setPhase(0);
    STEPS.slice(1).forEach((_, i) => after((i + 1) * STEP_MS, () => setPhase(i + 1)));
    after(STEPS.length * STEP_MS, () => {
      clear();
      setPhase(-1);
      setHasRun(true);
      setCycles(c => c + 1);
      if (auto) after(REST_MS, () => loopRef.current());
    });
  }, [auto]);

  // Tries to start a pass; waits politely when it should not.
  const loopRef = useRef(() => {});
  loopRef.current = () => {
    if (!auto || !inView.current || document.hidden || reduced()) return;
    if (Date.now() < holdUntil.current) { clear(); after(500, () => loopRef.current()); return; }
    play();
  };

  /** Stop at once and hold the loop for a while (a person is looking). */
  const stop = useCallback(() => {
    clear();
    setPhase(-1);
    setHasRun(false);
    holdUntil.current = Date.now() + HOLD_MS;
    if (auto) after(500, () => loopRef.current());
  }, [auto]);

  /** Run a pass now. */
  const run = useCallback(() => {
    holdUntil.current = 0;
    play();
  }, [play]);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const observer = window.IntersectionObserver && new IntersectionObserver(entries => {
      entries.forEach(entry => {
        inView.current = entry.isIntersecting;
        if (entry.isIntersecting) loopRef.current();
        else { clear(); setPhase(-1); }
      });
    }, { threshold: 0.45 });
    if (observer && element.current) observer.observe(element.current);
    const onVisibility = () => { if (document.hidden) { clear(); setPhase(-1); } else loopRef.current(); };
    const onPreference = () => { if (preference.matches) { clear(); setPhase(-1); } };
    document.addEventListener('visibilitychange', onVisibility);
    preference?.addEventListener?.('change', onPreference);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      preference?.removeEventListener?.('change', onPreference);
      clear();
    };
  }, []);

  return { element, phase, activeLayer: phase < 0 ? -1 : STEPS[phase], running: phase >= 0, hasRun, cycles, run, stop };
}
