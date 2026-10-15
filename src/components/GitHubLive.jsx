import { useGitHub } from '../hooks/useGitHub';
import { useGitHubEvents } from '../hooks/useGitHubEvents';
import Heatmap from '../fx/Heatmap';

function relative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(months / 12);
  return `${years} yr ago`;
}

export default function GitHubLive({ user, profileUrl }) {
  const data = useGitHub(user);
  const events = useGitHubEvents(user);

  if (!data) {
    return (
      <div className="gh gh--loading" aria-busy="true">
        <p className="gh__note">Fetching the latest from GitHub…</p>
      </div>
    );
  }

  return (
    <div className="gh">
      <div className="gh__col">
        <p className="gh__label">Recent pushes</p>
        <ol className="gh__repos">
          {data.repos.map(r => (
            <li key={r.name} className="gh__repo">
              <a href={r.html_url} target="_blank" rel="noopener noreferrer" className="gh__name">
                {r.name}
              </a>
              <span className="gh__meta">
                {r.language && <span>{r.language}</span>}
                <span>{relative(r.pushed_at)}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="gh__col">
        <p className="gh__label">Activity</p>
        {events
          ? <Heatmap days={events.days} />
          : <p className="gh__note" aria-busy="true">Loading pushes…</p>}
        <p className="gh__note">
          {events && !events.stale && events.total > 0 && `${events.total} commits pushed to public repositories in the period. `}
          {events?.stale && 'GitHub did not answer for activity just now. '}
          {data.stale
            ? 'Repository list is a cached snapshot.'
            : `${data.total} public repositories.`}{' '}
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">See everything →</a>
        </p>
      </div>
    </div>
  );
}
