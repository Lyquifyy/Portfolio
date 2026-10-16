import { useDineSense } from '../hooks/useDineSense';

function daysAgo(day) {
  if (!day) return 'none yet';
  const d = Math.round((Date.now() - new Date(`${day}T12:00:00Z`).getTime()) / 86400000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  return `${d} days ago`;
}

/*
 * The live panel for DineSense: catalog size and pilot activity, read from
 * the production database through a count-only function.
 */
export default function DineSensePulse() {
  const p = useDineSense();
  const n = (v) => (p ? v.toLocaleString() : '–');

  return (
    <div className="pulse" aria-busy={!p}>
      <div className="pulse__grid">
        <div className="pulse__cell"><strong>{n(p?.brands ?? 0)}</strong><span>chains with published figures</span></div>
        <div className="pulse__cell"><strong>{n(p?.dishes ?? 0)}</strong><span>dishes with figures</span></div>
        <div className="pulse__cell"><strong>{n(p?.places ?? 0)}</strong><span>places known</span></div>
        <div className="pulse__cell"><strong>{n(p?.picks ?? 0)}</strong><span>picks recorded in the pilot</span></div>
      </div>
      <p className="pulse__note">
        {p?.picks_7d ? `${p.picks_7d} this week, the last ${daysAgo(p.last_pick_day)}. ` : ''}
        {p?.stale ? 'Last reading; the database did not answer.' : 'Live from the production database, counts only.'}
      </p>
    </div>
  );
}
