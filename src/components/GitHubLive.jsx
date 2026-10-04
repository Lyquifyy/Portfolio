import { useGitHub } from '../hooks/useGitHub';

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

  if (!data) {
    return (
      <div className="gh gh--loading" aria-busy="true">
        <p className="gh__note">Fetching the latest from GitHub…</p>
      </div>
    );
  }

  const max = Math.max(...data.languages.map(([, n]) => n), 1);

  return (
    <div className="gh">
      <div className="gh__col">
        <p className="eyebrow">Recent pushes</p>
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
        <p className="eyebrow">Languages across public repos</p>
        <ul className="gh__langs">
          {data.languages.map(([lang, n]) => (
            <li key={lang} className="gh__lang">
              <span className="gh__langname">{lang}</span>
              <span className="gh__bar" aria-hidden="true">
                <span className="gh__fill" style={{ width: `${(n / max) * 100}%` }} />
              </span>
              <span className="gh__count">{n}</span>
            </li>
          ))}
        </ul>
        <p className="gh__note">
          {data.stale
            ? 'Showing a cached snapshot; GitHub did not answer just now.'
            : `${data.total} public repositories.`}{' '}
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">See everything →</a>
        </p>
      </div>
    </div>
  );
}
