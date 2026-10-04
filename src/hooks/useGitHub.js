import { useEffect, useState } from 'react';

const CACHE_KEY = 'gh-live-v1';
const CACHE_TTL = 15 * 60 * 1000;

const FALLBACK = {
  repos: [
    { name: 'DineSense-Website', language: 'CSS', pushed_at: '2026-10-02T13:57:27Z', html_url: 'https://github.com/Lyquifyy/DineSense-Website' },
    { name: 'Portfolio', language: 'JavaScript', pushed_at: '2026-07-25T14:05:26Z', html_url: 'https://github.com/Lyquifyy/Portfolio' },
    { name: 'Python-Revenue-Tracker', language: 'Python', pushed_at: '2026-05-10T21:54:56Z', html_url: 'https://github.com/Lyquifyy/Python-Revenue-Tracker' },
    { name: 'Senior-Project', language: 'Python', pushed_at: '2026-05-02T03:53:02Z', html_url: 'https://github.com/Lyquifyy/Senior-Project' },
    { name: 'Senior-Project-Website', language: 'JavaScript', pushed_at: '2026-03-14T23:47:48Z', html_url: 'https://github.com/Lyquifyy/Senior-Project-Website' },
  ],
  languages: [
    ['Python', 4], ['JavaScript', 4], ['C#', 3], ['CSS', 2], ['HTML', 1], ['F#', 1], ['C++', 1],
  ],
  stale: true,
};

function summarize(repos) {
  const counts = {};
  repos.forEach(r => {
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  });
  const languages = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const recent = repos
    .filter(r => !r.fork)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 5)
    .map(({ name, language, pushed_at, html_url, description }) => ({ name, language, pushed_at, html_url, description }));
  return { repos: recent, languages, total: repos.length, stale: false };
}

export function useGitHub(user) {
  const [data, setData] = useState(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.at < CACHE_TTL) return parsed.data;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    if (data) return;
    if (typeof fetch !== 'function') { setData(FALLBACK); return; }
    let cancelled = false;
    fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(repos => {
        if (cancelled) return;
        const next = summarize(repos);
        setData(next);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: next })); } catch {}
      })
      .catch(() => { if (!cancelled) setData(FALLBACK); });
    return () => { cancelled = true; };
  }, [user, data]);

  return data;
}
