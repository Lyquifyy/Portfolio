import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * A wireframe "</>" on a 2D canvas with a hand-rolled perspective
 * projection. Each stroke of the three glyphs is a slanted bar extruded
 * through Z: front face, back face, and the edges between them. It turns
 * on its own and can be dragged, with inertia. Colours come from CSS so it
 * follows the theme.
 */
const DEPTH = 0.55;
const W = 0.42; // stroke width

// a loose shell of points that drifts around the glyphs
const POINTS = Array.from({ length: 90 }, (_, i) => {
  const u = (i + 0.5) / 90, phi = Math.acos(1 - 2 * u), th = Math.PI * (3 - Math.sqrt(5)) * i;
  const r = 3.3 + ((i * 7919) % 100) / 100 * 1.4;
  return { x: r * Math.sin(phi) * Math.cos(th), y: r * Math.sin(phi) * Math.sin(th) * 0.75, z: r * Math.cos(phi), s: 1 + ((i * 104729) % 100) / 100 * 1.6 };
});

// A stroke from a to b (in XY) becomes a 4-corner face; mitres are left
// square so the corners read as drawn, not polished.
function stroke(a, b, w = W) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * (w / 2), ny = (dx / len) * (w / 2);
  return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]];
}

const GLYPHS = [
  // "<"
  { faces: [stroke([-1.3, 1.1], [-2.5, 0]), stroke([-2.5, 0], [-1.3, -1.1])], accent: false },
  // "/"
  { faces: [stroke([0.55, 1.5], [-0.55, -1.5], 0.4)], accent: true },
  // ">"
  { faces: [stroke([1.3, 1.1], [2.5, 0]), stroke([2.5, 0], [1.3, -1.1])], accent: false },
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

    let col = { fg: '#16171a', accent: '#178a4e' };
    const readCol = () => {
      col = { fg: cssColour('--fg', col.fg), accent: cssColour('--accent', col.accent) };
    };
    readCol();
    const mo = new MutationObserver(readCol);
    mo.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    let yaw = -0.5, pitch = 0.22, cloud = 0;
    let vyaw = 0, vpitch = 0;
    let dragging = false, lx = 0, ly = 0;
    let raf = 0, running = true;

    const project = (x, y, z) => {
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      let X = x * cy - z * sy;
      let Z = x * sy + z * cy;
      const cx = Math.cos(pitch), sx = Math.sin(pitch);
      let Y = y * cx - Z * sx;
      Z = y * sx + Z * cx;
      const dist = 8.5;
      const f = (Math.min(w, h) * 1.3) / (dist + Z);
      return [w / 2 + X * f, h / 2 - Y * f, Z];
    };

    const alphaFor = (z) => 0.32 + 0.68 * (1 - (z + 2) / 4);

    const seg = (a, b, stroke_, width) => {
      ctx.globalAlpha = alphaFor((a[2] + b[2]) / 2);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.strokeStyle = stroke_;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const draw = () => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (!reduced) cloud += 0.0012;
      if (!reduced && !dragging) {
        yaw += 0.0045 + vyaw; pitch += vpitch;
        vyaw *= 0.95; vpitch *= 0.9;
        pitch = Math.max(-0.7, Math.min(0.7, pitch));
      }
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // the point cloud turns on its own axis, slower than the glyphs
      const cc = Math.cos(cloud), sc = Math.sin(cloud);
      ctx.fillStyle = col.accent;
      POINTS.forEach(p => {
        const x = p.x * cc - p.z * sc, z = p.x * sc + p.z * cc;
        const q = project(x, p.y, z);
        ctx.globalAlpha = 0.12 + 0.5 * (1 - (q[2] + 4.7) / 9.4);
        ctx.beginPath();
        ctx.arc(q[0], q[1], p.s, 0, Math.PI * 2);
        ctx.fill();
      });

      GLYPHS.forEach(g => {
        const colour = g.accent ? col.accent : col.fg;
        g.faces.forEach(face => {
          const front = face.map(([x, y]) => project(x, y, DEPTH / 2));
          const back = face.map(([x, y]) => project(x, y, -DEPTH / 2));
          for (let i = 0; i < 4; i++) {
            const j = (i + 1) % 4;
            seg(front[i], front[j], colour, 1.5);
            seg(back[i], back[j], colour, 1.1);
            seg(front[i], back[i], colour, 1);
          }
          // vertices
          ctx.fillStyle = colour;
          [...front, ...back].forEach(p => {
            ctx.globalAlpha = alphaFor(p[2]);
            ctx.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3);
          });
        });
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

  return <canvas ref={ref} className="wire" role="img" aria-label="Rotating wireframe code brackets. Drag to orbit." />;
}
