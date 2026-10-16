import { useEffect, useState } from 'react';

/** Size and last-modified date of a static file, from a HEAD request. */
export function useFileMeta(url) {
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    if (typeof fetch !== 'function') return undefined;
    let cancelled = false;
    fetch(url, { method: 'HEAD' })
      .then(r => {
        if (!r.ok || cancelled) return;
        const size = Number(r.headers.get('content-length'));
        const mod = r.headers.get('last-modified');
        setMeta({
          kb: size ? Math.round(size / 1024) : null,
          updated: mod ? new Date(mod) : null,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [url]);
  return meta;
}
