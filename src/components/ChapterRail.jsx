import { useLayoutEffect, useRef } from 'react';
import './ChapterRail.css';

export default function ChapterRail({ chapters, active, onSelect }) {
  const list = useRef(null);

  // The line runs from the first item's centre to the last; the fill ends at
  // the active item's centre, where that item's dash branches off it.
  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    const items = el.querySelectorAll('.rail__item');
    if (!items.length) return;
    const mid = (b) => b.offsetTop + b.offsetHeight / 2;
    const top = mid(items[0]);
    const bottom = mid(items[items.length - 1]);
    const fill = mid(items[Math.min(active, items.length - 1)]);
    el.style.setProperty('--rail-top', `${top}px`);
    el.style.setProperty('--rail-height', `${bottom - top}px`);
    el.style.setProperty('--rail-fill', `${fill - top}px`);
  }, [active, chapters]);

  return (
    <nav className="rail" aria-label="Chapters">
      <ol className="rail__list" ref={list}>
        <span className="rail__line" aria-hidden="true"><i /></span>
        {chapters.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              className={`rail__item${active === i ? ' rail__item--active' : ''}`}
              onClick={() => onSelect(c.id)}
              aria-current={active === i ? 'true' : undefined}
            >
              <span className="rail__label">{c.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
