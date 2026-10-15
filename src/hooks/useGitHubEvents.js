import { useEffect, useState } from 'react';

/*
 * Public push activity by day for the last 13 weeks, from the events API.
 * GitHub keeps roughly 90 days / 300 events there without authentication,
 * which is enough for a heatmap. Returns { days: { 'YYYY-MM-DD': commits },
 * total, stale } or null while loading.
 */
const CACHE_KEY = 'gh-events-v1';
const CACHE_TTL = 15 * 60 * 1000;

function summarize(events) {
  const days = {};
  let total = 0;
  events.forEach(e => {
    if (e.type !== 'PushEvent') return;
    const day = e.created_at.slice(0, 10);
    const n = e.payload?.size ?? e.payload?.commits?.length ?? 1;
    days[day] = (days[day] || 0) + n;
    total += n;
  });
  return { days, total, stale: false };
}

export function useGitHubEvents(user) {
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
    if (typeof fetch !== 'function') { setData({ days: {}, total: 0, stale: true }); return; }
    let cancelled = false;
    Promise.all([1, 2, 3].map(page =>
      fetch(`https://api.github.com/users/${user}/events/public?per_page=100&page=${page}`, {
        headers: { Accept: 'application/vnd.github+json' },
      }).then(r => (r.ok ? r.json() : []))
    ))
      .then(pages => {
        if (cancelled) return;
        const next = summarize(pages.flat());
        setData(next);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: next })); } catch {}
      })
      .catch(() => { if (!cancelled) setData({ days: {}, total: 0, stale: true }); });
    return () => { cancelled = true; };
  }, [user, data]);

  return data;
}
