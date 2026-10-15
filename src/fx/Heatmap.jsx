import { useEffect, useRef, useState } from 'react';

/*
 * Thirteen weeks of pushes as a canvas heatmap, one cell per day, drawn in
 * the theme's colours. Hovering a cell shows the date and count.
 */
const WEEKS = 13;
const CELL = 13, GAP = 3;

function cssColour(name, fallback) {
  const v = getComputedStyle(document.body).getPropertyValue(name).trim();
  return v || fallback;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function Heatmap({ days }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  // grid of dates: columns are weeks ending today, rows Sunday..Saturday
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const end = new Date(today);
  const start = new Date(end); start.setDate(end.getDate() - (WEEKS * 7 - 1) - end.getDay());
  const cells = [];
  for (let i = 0; i < WEEKS * 7 + end.getDay() + 1; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    if (d > end) break;
    const key = d.toISOString().slice(0, 10);
    cells.push({ key, col: Math.floor(i / 7), row: i % 7, n: days[key] || 0, date: d });
  }
  const cols = cells.length ? cells[cells.length - 1].col + 1 : WEEKS;
  const max = Math.max(1, ...cells.map(c => c.n));

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas && canvas.getContext && canvas.getContext('2d');
    if (!ctx) return undefined;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cols * (CELL + GAP), h = 7 * (CELL + GAP);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const [r, g, b] = hexToRgb(cssColour('--accent', '#6d4ae8'));
      const [er, eg, eb] = hexToRgb(cssColour('--fg', '#16171a'));
      cells.forEach(c => {
        const x = c.col * (CELL + GAP), y = c.row * (CELL + GAP);
        if (c.n === 0) ctx.fillStyle = `rgba(${er},${eg},${eb},0.08)`;
        else ctx.fillStyle = `rgba(${r},${g},${b},${0.3 + 0.7 * Math.sqrt(c.n / max)})`;
        ctx.fillRect(x, y, CELL, CELL);
        if (hover && hover.key === c.key) {
          ctx.strokeStyle = `rgb(${er},${eg},${eb})`; ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
        }
      });
    };
    draw();
    const mo = new MutationObserver(draw);
    mo.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, hover, cols]);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const col = Math.floor((e.clientX - r.left) / (CELL + GAP));
    const row = Math.floor((e.clientY - r.top) / (CELL + GAP));
    const c = cells.find(x => x.col === col && x.row === row);
    setHover(c || null);
  };

  return (
    <div className="heat">
      <canvas ref={ref} onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img"
        aria-label={`Pushes per day over the last ${WEEKS} weeks`} />
      <p className="heat__label">
        {hover
          ? `${hover.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}: ${hover.n} commit${hover.n === 1 ? '' : 's'} pushed`
          : `Last ${WEEKS} weeks, public pushes by day`}
      </p>
    </div>
  );
}
