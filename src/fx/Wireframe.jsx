import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * A wireframe dumbbell on a 2D canvas with a hand-rolled perspective
 * projection. Every part is a cylinder along the X axis: the bar, two
 * collars, and three plates a side. Rings are drawn at each end of a part
 * and joined by a few longitudinal lines. It turns on its own and can be
 * dragged, with inertia. Colours come from CSS so it follows the theme.
 */
const SEG = 36;

function plates(sign) {
  const out = [];
  let x = 2.5;
  [[1.0, 0.3], [0.84, 0.26], [0.64, 0.22]].forEach(([r, t]) => {
    out.push({ x0: sign * x, x1: sign * (x + t), r, long: 12, accent: true });
    x += t + 0.06;
  });
  return out;
}

const PARTS = [
  { x0: -3.4, x1: 3.4, r: 0.11, long: 6 },
  { x0: -2.46, x1: -2.14, r: 0.24, long: 8 },
  { x0: 2.14, x1: 2.46, r: 0.24, long: 8 },
  ...plates(-1),
  ...plates(1),
];

function cssColour(name, fallback) {
  const v = getComputedStyle(document.body).getPropertyValue(name).trim();
  return v || fallback;
}

export default function Wireframe() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return undefined;
    const reduced = prefersReducedMotion();

    let w = 0, h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    let col = { fg: '#16171a', accent: '#6d4ae8' };
    const readCol = () => {
      col = { fg: cssColour('--fg', col.fg), accent: cssColour('--accent', col.accent) };
    };
    readCol();
    const mo = new MutationObserver(readCol);
    mo.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    let yaw = -0.7, pitch = 0.32, roll = -0.35;
    let vyaw = 0, vpitch = 0;
    let dragging = false, lx = 0, ly = 0;
    let raf = 0, running = true;

    const project = (x, y, z) => {
      // roll about Z (tilts the bar), then yaw about Y, then pitch about X
      const cr = Math.cos(roll), sr = Math.sin(roll);
      let X = x * cr - y * sr;
      let Y = x * sr + y * cr;
      let Z = z;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const X2 = X * cy - Z * sy;
      Z = X * sy + Z * cy;
      X = X2;
      const cx = Math.cos(pitch), sx = Math.sin(pitch);
      const Y2 = Y * cx - Z * sx;
      Z = Y * sx + Z * cx;
      Y = Y2;
      const dist = 9;
      const f = (Math.min(w, h) * 1.05) / (dist + Z);
      return [w / 2 + X * f, h / 2 - Y * f, Z];
    };

    const ring = (x, r) => {
      const pts = [];
      for (let i = 0; i < SEG; i++) {
        const a = (i / SEG) * Math.PI * 2;
        pts.push(project(x, Math.cos(a) * r, Math.sin(a) * r));
      }
      return pts;
    };

    const alphaFor = (z) => 0.3 + 0.7 * (1 - (z + 2.2) / 4.4);

    const polyline = (pts, stroke, width, closed) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      if (closed) ctx.closePath();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const draw = () => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (!reduced && !dragging) {
        yaw += 0.004 + vyaw; pitch += vpitch;
        vyaw *= 0.95; vpitch *= 0.9;
        pitch = Math.max(-0.6, Math.min(0.9, pitch));
      }
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = 'round';

      PARTS.forEach(part => {
        const a = ring(part.x0, part.r);
        const b = ring(part.x1, part.r);
        const stroke = part.accent ? col.accent : col.fg;
        // rings, segment by segment so depth can fade each one
        for (const pts of [a, b]) {
          for (let i = 0; i < SEG; i++) {
            const p = pts[i], q = pts[(i + 1) % SEG];
            ctx.globalAlpha = alphaFor((p[2] + q[2]) / 2);
            polyline([p, q], stroke, part.accent ? 1.4 : 1.1, false);
          }
        }
        // longitudinal lines
        for (let i = 0; i < part.long; i++) {
          const k = Math.round((i / part.long) * SEG) % SEG;
          ctx.globalAlpha = alphaFor((a[k][2] + b[k][2]) / 2) * 0.8;
          polyline([a[k], b[k]], col.fg, 1, false);
        }
      });
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(draw);

    const down = (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture?.(e.pointerId); };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      yaw += dx * 0.008; pitch += dy * 0.006;
      vyaw = dx * 0.0015; vpitch = dy * 0.0008;
    };
    const up = () => { dragging = false; };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

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
    };
  }, []);

  return <canvas ref={ref} className="wire" role="img" aria-label="Rotating wireframe dumbbell. Drag to orbit." />;
}
