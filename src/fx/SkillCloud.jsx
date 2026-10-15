import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * Skills on a sphere. Points are placed with a Fibonacci spiral, projected
 * with depth-scaled size and alpha, and the sphere can be thrown with the
 * pointer. The nearest word to the pointer lights up in the accent colour.
 */
export default function SkillCloud({ words }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return undefined;
    const reduced = prefersReducedMotion();

    let w = 0, h = 0, R = 100;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * 0.4;
    };
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    const N = words.length;
    const pts = words.map((word, i) => {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = Math.PI * (3 - Math.sqrt(5)) * i;
      return { word, x: Math.cos(th) * r, y, z: Math.sin(th) * r };
    });

    let col = { fg: '#15213a', dim: '#8a97ad', accent: '#ff5a1f' };
    const readCol = () => {
      const cs = getComputedStyle(document.body);
      col = {
        fg: cs.getPropertyValue('--fg').trim() || col.fg,
        dim: cs.getPropertyValue('--fg-3').trim() || col.dim,
        accent: cs.getPropertyValue('--accent').trim() || col.accent,
      };
    };
    readCol();
    const mo = new MutationObserver(readCol);
    mo.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    let ax = 0.0016, ay = 0.0024; // angular velocity
    let dragging = false, lx = 0, ly = 0, mx = -1e4, my = -1e4;
    let raf = 0, running = true;

    const rotate = (dx, dy) => {
      const cy = Math.cos(dy), sy = Math.sin(dy);
      const cx = Math.cos(dx), sx = Math.sin(dx);
      pts.forEach(p => {
        let y = p.y * cy - p.z * sy;
        let z = p.y * sy + p.z * cy;
        p.y = y; p.z = z;
        const x = p.x * cx - p.z * sx;
        z = p.x * sx + p.z * cx;
        p.x = x; p.z = z;
      });
    };

    const draw = () => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (!reduced) {
        if (!dragging) { rotate(ay, ax); ax *= 0.985; ay *= 0.985; if (Math.abs(ax) < 0.0016) ax = 0.0016 * Math.sign(ax || 1); if (Math.abs(ay) < 0.0012) ay = 0.0012 * Math.sign(ay || 1); }
      }
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      // equator + meridian guides
      ctx.strokeStyle = col.dim; ctx.globalAlpha = 0.25; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.28, R, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;

      const sorted = pts.slice().sort((a, b) => a.z - b.z);
      let nearest = null, nd = 28;
      sorted.forEach(p => {
        const depth = (p.z + 1) / 2; // 0 back, 1 front
        const scale = 0.55 + depth * 0.65;
        const sx = cx + p.x * R, sy = cy + p.y * R;
        const d = Math.hypot(sx - mx, sy - my);
        if (d < nd) { nd = d; nearest = p; }
        p.sx = sx; p.sy = sy; p.scale = scale; p.depth = depth;
      });
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      sorted.forEach(p => {
        const hot = p === nearest;
        ctx.font = `${hot ? 700 : 500} ${Math.round(11 + p.scale * 7)}px "IBM Plex Mono", monospace`;
        ctx.globalAlpha = hot ? 1 : 0.25 + p.depth * 0.75;
        ctx.fillStyle = hot ? col.accent : col.fg;
        ctx.fillText(p.word, p.sx, p.sy);
        if (hot) {
          const tw = ctx.measureText(p.word).width;
          ctx.strokeStyle = col.accent; ctx.lineWidth = 1;
          ctx.strokeRect(p.sx - tw / 2 - 6, p.sy - 11, tw + 12, 22);
        }
      });
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(draw);

    const down = (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture?.(e.pointerId); };
    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      rotate(-dy * 0.006, dx * 0.006);
      ax = dx * 0.0012; ay = -dy * 0.0012;
    };
    const up = () => { dragging = false; };
    const leave = () => { mx = -1e4; my = -1e4; dragging = false; };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', leave);

    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([en]) => {
          if (en.isIntersecting && !running) { running = true; raf = requestAnimationFrame(draw); }
          else if (!en.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
        })
      : null;
    io?.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro?.disconnect(); mo.disconnect(); io?.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('pointerleave', leave);
    };
  }, [words]);

  return <canvas ref={ref} className="cloud" role="img" aria-label={`Skill sphere: ${words.join(', ')}. Drag to spin.`} />;
}
