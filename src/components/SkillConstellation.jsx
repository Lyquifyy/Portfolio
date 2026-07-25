import { useEffect, useRef } from 'react';
import { SKILL_NODES } from '../data/content';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './SkillConstellation.css';

/* Ring assignment per group. Nodes hold a stable orbit and are perturbed by
   the cursor, rather than running a free force sim — the structure stays
   legible and can never collapse or drift apart. */
const RINGS = {
  core:     { radius: 0.20, speed:  0.00042, size: 5.0 },
  platform: { radius: 0.33, speed: -0.00027, size: 4.2 },
  security: { radius: 0.46, speed:  0.00017, size: 3.6 },
};

const REPEL_RADIUS = 130;
const REPEL_FORCE = 0.85;
const SPRING_BACK = 0.055;
const DAMPING = 0.86;
const HOVER_RADIUS = 24;
const LINK_DISTANCE = 0.42; // as a fraction of min(width, height)

function buildNodes() {
  const byGroup = {};
  SKILL_NODES.forEach((s) => {
    (byGroup[s.group] ||= []).push(s);
  });

  const nodes = [];
  Object.entries(byGroup).forEach(([group, members]) => {
    const ring = RINGS[group];
    members.forEach((skill, i) => {
      nodes.push({
        ...skill,
        ring,
        angle: (i * Math.PI * 2) / members.length + (group === 'platform' ? Math.PI / members.length : 0),
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0,
        x: 0,
        y: 0,
        glow: 0,
      });
    });
  });
  return nodes;
}

/**
 * Hero centerpiece: a cursor-reactive skill constellation.
 *
 * Replaces the old OrbitCanvas — same 13 skills, but recolored to the aurora
 * palette, running at full framerate, with proximity links, cursor repulsion
 * and hover-to-highlight across a skill group.
 */
export default function SkillConstellation() {
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const nodes = buildNodes();
    const pointer = { x: -9999, y: -9999, inside: false };
    let hovered = null;

    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = width / 2;
      cy = height / 2;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* --- pointer (canvas-local, so it stays correct while the page scrolls) */
    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.inside = true;

      let best = null;
      let bestDist = HOVER_RADIUS;
      nodes.forEach((n) => {
        const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        if (d < bestDist) {
          bestDist = d;
          best = n;
        }
      });
      hovered = best;
      canvas.style.cursor = best ? 'pointer' : 'default';
    };

    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      pointer.inside = false;
      hovered = null;
      canvas.style.cursor = 'default';
    };

    if (!reducedMotion) {
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);
    }

    /* --- drawing ---------------------------------------------------------- */

    const positionNodes = (dt) => {
      const minDim = Math.min(width, height);

      nodes.forEach((n) => {
        n.angle += n.ring.speed * dt;

        const tx = cx + Math.cos(n.angle) * minDim * n.ring.radius;
        const ty = cy + Math.sin(n.angle) * minDim * n.ring.radius;

        if (pointer.inside) {
          const px = tx + n.dx;
          const py = ty + n.dy;
          const ddx = px - pointer.x;
          const ddy = py - pointer.y;
          const dist = Math.hypot(ddx, ddy) || 1;

          if (dist < REPEL_RADIUS) {
            const strength = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
            n.vx += (ddx / dist) * strength;
            n.vy += (ddy / dist) * strength;
          }
        }

        // spring back to the orbit, with damping
        n.vx += -n.dx * SPRING_BACK;
        n.vy += -n.dy * SPRING_BACK;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.dx += n.vx;
        n.dy += n.vy;

        n.x = tx + n.dx;
        n.y = ty + n.dy;

        // proximity glow, eased so it doesn't pop
        const pd = pointer.inside ? Math.hypot(n.x - pointer.x, n.y - pointer.y) : 9999;
        const targetGlow = Math.max(0, 1 - pd / (REPEL_RADIUS * 1.5));
        n.glow += (targetGlow - n.glow) * 0.12;
      });
    };

    const alphaFor = (n) => {
      if (!hovered) return 0.72 + n.glow * 0.28;
      return hovered.group === n.group ? 1 : 0.22;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const minDim = Math.min(width, height);
      const linkMax = minDim * LINK_DISTANCE;

      // Proximity links, drawn first so nodes sit on top
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > linkMax) continue;

          let alpha = (1 - d / linkMax) * 0.3;
          if (hovered) {
            const related = hovered.group === a.group && hovered.group === b.group;
            alpha *= related ? 2.1 : 0.28;
          } else {
            alpha *= 1 + (a.glow + b.glow) * 0.9;
          }

          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, `rgba(${a.rgb},${Math.min(alpha, 0.85)})`);
          grad.addColorStop(1, `rgba(${b.rgb},${Math.min(alpha, 0.85)})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Centre bloom
      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.16);
      bloom.addColorStop(0, 'rgba(124,58,237,0.22)');
      bloom.addColorStop(1, 'rgba(124,58,237,0)');
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // Nodes
      nodes.forEach((n) => {
        const a = alphaFor(n);
        const size = n.ring.size * (1 + n.glow * 0.5);
        const glowR = size * (4 + n.glow * 3);

        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        g.addColorStop(0, `rgba(${n.rgb},${0.42 * a})`);
        g.addColorStop(1, `rgba(${n.rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${n.rgb},${a})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Labels — always legible at rest, promoted to a pill near the cursor
      nodes.forEach((n) => {
        const near = Math.max(n.glow, hovered === n ? 1 : 0);
        const baseAlpha = hovered && hovered.group !== n.group ? 0.16 : 0.42;
        const alpha = baseAlpha + near * (1 - baseAlpha);
        if (alpha < 0.03) return;

        const fontSize = 11.5;
        ctx.font = `500 ${fontSize}px 'Geist Mono Variable', ui-monospace, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const w = ctx.measureText(n.name).width;

        /* Keep labels inside the canvas. Outer-ring nodes sit close enough to
           the edge that their labels would otherwise be clipped — badly so on
           narrow viewports. */
        const halfW = w / 2 + 8;
        const lx = Math.min(Math.max(n.x, halfW), width - halfW);
        const ly = Math.max(n.y - (n.ring.size + 13), fontSize);

        if (near > 0.04) {
          const pw = 7;
          const ph = 4;
          const rw = w + pw * 2;
          const rh = fontSize + ph * 2;
          ctx.fillStyle = `rgba(10,10,15,${0.82 * near})`;
          ctx.beginPath();
          ctx.roundRect(lx - rw / 2, ly - rh / 2, rw, rh, 5);
          ctx.fill();

          ctx.strokeStyle = `rgba(${n.rgb},${0.4 * near})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(244,244,245,${alpha})`;
        ctx.fillText(n.name, lx, ly);
      });
    };

    /* --- loop ------------------------------------------------------------- */

    if (reducedMotion) {
      // One static frame: structure without motion.
      positionNodes(0);
      draw();
      return () => ro.disconnect();
    }

    let raf = null;
    let last = performance.now();
    let visible = true;
    let onScreen = true;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(now - last, 50);
      last = now;
      if (!visible || !onScreen) return;
      positionNodes(dt);
      draw();
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      visible = !document.hidden;
      last = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        last = performance.now();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [reducedMotion]);

  return (
    <div className="constellation">
      <canvas ref={canvasRef} className="constellation__canvas" role="presentation" />
      {/* The canvas is decorative; the skills themselves are real content. */}
      <ul className="visually-hidden">
        {SKILL_NODES.map((s) => (
          <li key={s.name}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
}
