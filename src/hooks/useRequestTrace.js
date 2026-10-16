import { useCallback, useEffect, useRef, useState } from 'react';

// A bounded request/response sequence. Never loops or runs in a hidden tab.
const STEPS = [0, 1, 2, 1, 0];
const STEP_MS = 680;

export default function useRequestTrace() {
  const element = useRef(null);
  const timers = useRef([]);
  const [phase, setPhase] = useState(-1);
  const [hasRun, setHasRun] = useState(false);

  const stop = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase(-1);
    setHasRun(false);
  }, []);

  const run = useCallback(() => {
    stop();
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setHasRun(true);
      return;
    }
    setPhase(0);
    STEPS.slice(1).forEach((_, index) => {
      timers.current.push(setTimeout(() => setPhase(index + 1), (index + 1) * STEP_MS));
    });
    timers.current.push(setTimeout(() => { stop(); setHasRun(true); }, STEPS.length * STEP_MS));
  }, [stop]);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let played = false;
    const observer = window.IntersectionObserver && new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) stop();
        else if (!played) {
          played = true;
          if (!preference?.matches && !document.hidden) run();
        }
      });
    }, { threshold: 0.45 });
    if (observer && element.current) observer.observe(element.current);
    const onVisibility = () => { if (document.hidden) stop(); };
    const onPreference = () => { if (preference.matches) stop(); };
    document.addEventListener('visibilitychange', onVisibility);
    preference?.addEventListener?.('change', onPreference);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      preference?.removeEventListener?.('change', onPreference);
      timers.current.forEach(clearTimeout);
    };
  }, [run, stop]);

  return { element, phase, activeLayer: phase < 0 ? -1 : STEPS[phase], running: phase >= 0, hasRun, run, stop };
}
