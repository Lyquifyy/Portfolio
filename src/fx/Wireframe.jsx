import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * A wireframe massing model, drawn on a 2D canvas with a hand-rolled
 * perspective projection. Boxes extrude from the ground plane on first view,
 * levels are labelled like a Revit elevation, and the whole thing can be
 * dragged with inertia. Colours come from CSS so it follows the theme.
 */
const BOXES = [
  // x, z, w, d, h  (model units; y is up)
  [-1.6, -1.2, 1.4, 1.2, 1.1],
  [-0.1, -1.2, 1.9, 1.2, 2.6],
  [ 0.9,  0.2, 0.9, 0.9, 3.4],
  [-1.6,  0.2, 1.1, 1.0, 1.8],
  [-0.4,  0.3, 1.2, 0.9, 0.8],
];
const LEVELS = [0, 1.1, 1.8, 2.6, 3.4];

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

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    let col = { line: '#6f8fb8', fg: '#15213a', accent: '#ff5a1f', dim: '#8a97ad' };
    const readCol = () => {
      col = {
        line: cssColour('--fg-3', col.line),
        fg: cssColour('--fg', col.fg),
        accent: cssColour('--accent', col.accent),
        dim: cssColour('--fg-3', col.dim),
      };
    };
    readCol();
    const mo = new MutationObserver(readCol);
    mo.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    // camera
    let yaw = -0.65, pitch = 0.42;
    let vyaw = 0, vpitch = 0;
    let dragging = false, lx = 0, ly = 0;
    let build = reduced ? 1 : 0;
    const t0 = performance.now();
    let raf = 0, running = true;

    const project = (x, y, z) => {
      // rotate yaw around Y, pitch around X
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cx = Math.cos(pitch), sx = Math.sin(pitch);
      let X = x * cy - z * sy;
      let Z = x * sy + z * cy;
      let Y = y * cx - Z * sx;
      Z = y * sx + Z * cx;
      const dist = 7.5;
      const f = (Math.min(w, h) * 0.95) / (dist + Z);
      return [w / 2 + X * f, h * 0.57 - Y * f, Z];
    };

    const seg = (a, b, stroke, width = 1) => {
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const draw = (t) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (!reduced) {
        build = Math.min(1, (t - t0 - 300) / 1600);
        if (build < 0) build = 0;
        if (!dragging) { yaw += 0.0025 + vyaw; pitch += vpitch; vyaw *= 0.95; vpitch *= 0.9; }
        pitch = Math.max(0.15, Math.min(1.1, pitch));
      }
      ctx.clearRect(0, 0, w, h);
      const eb = 1 - Math.pow(1 - build, 3);

      // ground grid
      ctx.globalAlpha = 0.55;
      for (let i = -3; i <= 3; i++) {
        seg(project(i, 0, -3), project(i, 0, 3), col.line, 0.6);
        seg(project(-3, 0, i), project(3, 0, i), col.line, 0.6);
      }
      ctx.globalAlpha = 1;

      // axes
      seg(project(0, 0, 0), project(3.4, 0, 0), col.accent, 1);
      seg(project(0, 0, 0), project(0, 0, 3.4), col.accent, 1);
      seg(project(0, 0, 0), project(0, 3.6 * eb, 0), col.accent, 1);

      // boxes
      BOXES.forEach(([x, z, bw, bd, bh], bi) => {
        const local = Math.min(1, Math.max(0, (eb * 1.6 - bi * 0.12)));
        const H = bh * local;
        const c = [
          [x, 0, z], [x + bw, 0, z], [x + bw, 0, z + bd], [x, 0, z + bd],
          [x, H, z], [x + bw, H, z], [x + bw, H, z + bd], [x, H, z + bd],
        ].map(p => project(...p));
        const E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
        E.forEach(([a, b]) => {
          const depth = (c[a][2] + c[b][2]) / 2;
          ctx.globalAlpha = 0.45 + 0.55 * (1 - (depth + 3) / 6);
          seg(c[a], c[b], col.fg, 1.1);
        });
        ctx.globalAlpha = 1;
        // vertices
        ctx.fillStyle = col.fg;
        c.forEach(p => { ctx.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3); });
      });

      // level markers
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.textBaseline = 'middle';
      LEVELS.forEach((lv, i) => {
        if (lv > 3.6 * eb + 0.01) return;
        const a = project(-2.4, lv, -1.6);
        const b = project(-2.0, lv, -1.6);
        seg(a, b, col.dim, 1);
        ctx.fillStyle = col.dim;
        ctx.textAlign = 'right';
        ctx.fillText(i === 0 ? 'L0  ±0.00' : `L${i}  +${lv.toFixed(2)}`, a[0] - 6, a[1]);
      });

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

  return <canvas ref={ref} className="wire" role="img" aria-label="Rotating wireframe massing model. Drag to orbit." />;
}
