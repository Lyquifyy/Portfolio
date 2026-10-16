import { useEffect, useRef, useState } from 'react';

/** Returns [ref, inView]. `once` keeps it true after the first intersection. */
export default function useInView({ threshold = 0.2, rootMargin = '0px', once = false } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); if (once) io.unobserve(el); }
      else if (!once) setInView(false);
    }, { threshold, rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);
  return [ref, inView];
}
