import { useEffect, useState } from 'react';

/*
 * Live counts from DineSense. `pulse()` is a count-only database function
 * callable with the publishable key: six numbers, no rows. The key below is
 * the same one shipped inside the iOS app; row-level security is what keeps
 * data private, not the key.
 */
const URL = 'https://otjnvdjqdyhwnlazkcyo.supabase.co/rest/v1/rpc/pulse';
const KEY = 'sb_publishable_H8ZV-bz502rdE3f3aUH8Hg_RTmR0ZRA';
const CACHE_KEY = 'ds-pulse-v1';
const CACHE_TTL = 10 * 60 * 1000;

// Read on 2026-10-15; shown when the request fails.
const FALLBACK = {
  brands: 41, dishes: 1413, places: 58, picks: 7, picks_7d: 5, last_pick_day: '2026-10-13', stale: true,
};

export function useDineSense() {
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
    fetch(URL, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: '{}',
    })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(pulse => {
        if (cancelled) return;
        const next = { ...pulse, stale: false };
        setData(next);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: next })); } catch {}
      })
      .catch(() => { if (!cancelled) setData(FALLBACK); });
    return () => { cancelled = true; };
  }, [data]);

  return data;
}
