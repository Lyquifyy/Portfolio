import { useMemo } from 'react';

/*
 * The roles drawn to scale, one lane each, from the first start month to
 * today. Hovering a bar names the role; the list below highlights the
 * same job through the shared `active` index.
 */
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function monthIndex(s) {
  if (s === 'Present') { const d = new Date(); return d.getFullYear() * 12 + d.getMonth(); }
  const [m, y] = s.split(' ');
  return Number(y) * 12 + MONTHS[m];
}

export default function Timeline({ jobs, active, onActive }) {
  const model = useMemo(() => {
    const spans = jobs.map(j => ({ start: monthIndex(j.start), end: monthIndex(j.end) + 1 }));
    const min = Math.min(...spans.map(s => s.start));
    const max = Math.max(...spans.map(s => s.end));
    const total = max - min;
    const years = [];
    for (let m = min; m < max; m++) if (m % 12 === 0) years.push({ x: (m - min) / total, label: String(m / 12) });
    return { spans: spans.map(s => ({ x: (s.start - min) / total, w: (s.end - s.start) / total })), years, months: total };
  }, [jobs]);

  const LANE = 14, GAP = 6, TOP = 4;
  const height = TOP + jobs.length * (LANE + GAP) + 18;

  return (
    <div className="tl" onMouseLeave={() => onActive(null)}>
      <svg viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" className="tl__svg" aria-hidden="true">
        {model.years.map(y => (
          <g key={y.label}>
            <line x1={y.x * 1000} x2={y.x * 1000} y1={0} y2={height - 16} className="tl__tick" />
          </g>
        ))}
        {model.spans.map((s, i) => (
          <rect
            key={jobs[i].company}
            x={s.x * 1000} y={TOP + i * (LANE + GAP)} width={Math.max(4, s.w * 1000)} height={LANE}
            className={`tl__bar${active === i ? ' is-active' : ''}${active !== null && active !== i ? ' is-dim' : ''}`}
            onMouseEnter={() => onActive(i)}
            onMouseLeave={() => onActive(null)}
          />
        ))}
      </svg>
      <div className="tl__years" aria-hidden="true">
        {model.years.map(y => <span key={y.label} style={{ left: `${y.x * 100}%` }}>{y.label}</span>)}
      </div>
      <p className="tl__caption" aria-live="polite">
        {active === null ? '' : `${jobs[active].role}, ${jobs[active].company} · ${jobs[active].start} – ${jobs[active].end}`}
      </p>
    </div>
  );
}
