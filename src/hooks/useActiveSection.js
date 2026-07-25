import { useEffect, useState } from 'react';

/**
 * Reports which section currently owns the viewport midline.
 *
 * Uses a rootMargin that collapses the root to a 1px band across the middle of
 * the screen, so exactly one section can be intersecting at a time. Comparing
 * intersection *ratios* instead would break here: the pinned Cyber Labs
 * section is several viewports tall and can never exceed a ratio of ~0.25,
 * so it would lose to every short section next to it.
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = ids.indexOf(entry.target.id);
          if (idx !== -1) setActive(idx);
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    const observed = ids.map((id) => document.getElementById(id)).filter(Boolean);
    observed.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [ids]);

  return active;
}
