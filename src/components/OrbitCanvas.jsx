import { useRef, useEffect } from 'react';

const SKILLS = [
  // inner ring
  { name: 'React',      color: '#38bdf8', rgb: '56,189,248'  },
  { name: 'TypeScript', color: '#818cf8', rgb: '129,140,248' },
  { name: 'JavaScript', color: '#fbbf24', rgb: '251,191,36'  },
  { name: 'C#',         color: '#ae7bff', rgb: '174,123,255' },
  // outer ring
  { name: '.NET',       color: '#7c6fff', rgb: '124,111,255' },
  { name: 'Python',     color: '#34d399', rgb: '52,211,153'  },
  { name: 'Node.js',    color: '#4ade80', rgb: '74,222,128'  },
  { name: 'C++',        color: '#f472b6', rgb: '244,114,182' },
];

function getTheme() {
  return document.body.dataset.theme === 'light' ? 'light' : 'dark';
}

export default function OrbitCanvas() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, cx, cy;
    let lastTime = 0;
    const FRAME_MS = 1000 / 30; // cap to 30 fps

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width  = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width  = width  * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = width  / 2;
      cy = height / 2;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const inner = SKILLS.slice(0, 4);
    const outer = SKILLS.slice(4);
    let angle = 0;

    function drawRing(radius, opacity, isDark) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = isDark
        ? `rgba(56,189,248,${opacity})`
        : `rgba(3,105,161,${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawOrb(x, y, skill, size) {
      const glowR = size * 4;
      const glow  = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      glow.addColorStop(0, `rgba(${skill.rgb},0.38)`);
      glow.addColorStop(1, `rgba(${skill.rgb},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = skill.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawLabel(x, y, text, yOffset, isDark) {
      const fontSize = 12;
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      const lx = x;
      const ly = y - yOffset;
      const w  = ctx.measureText(text).width;
      const ph = 3;  // vertical padding
      const pw = 6;  // horizontal padding
      const rw = w  + pw * 2;
      const rh = fontSize + ph * 2;
      const rx = lx - rw / 2;
      const ry = ly - rh / 2;

      // pill background
      ctx.fillStyle = isDark ? 'rgba(0,0,0,0.88)' : 'rgba(255,255,255,0.92)';
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, 4);
      ctx.fill();

      // label text
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      ctx.fillText(text, lx, ly);
    }

    function draw(timestamp) {
      animRef.current = requestAnimationFrame(draw);

      const elapsed = timestamp - lastTime;
      if (elapsed < FRAME_MS) return;
      lastTime = timestamp;

      ctx.clearRect(0, 0, width, height);

      const isDark  = getTheme() === 'dark';
      const minDim  = Math.min(width, height);
      const r1      = minDim * 0.28;
      const r2      = minDim * 0.43;

      drawRing(r1, isDark ? 0.12 : 0.35, isDark);
      drawRing(r2, isDark ? 0.08 : 0.22, isDark);

      // Center glow
      const glowRgb   = isDark ? '56,189,248' : '3,105,161';
      const glowAlpha = isDark ? 0.14 : 0.22;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r1 * 0.38);
      cg.addColorStop(0, `rgba(${glowRgb},${glowAlpha})`);
      cg.addColorStop(1, `rgba(${glowRgb},0)`);
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, r1 * 0.38, 0, Math.PI * 2);
      ctx.fill();

      // Center dot
      ctx.fillStyle = isDark ? '#38bdf8' : '#0369a1';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner orbit (clockwise)
      inner.forEach((skill, i) => {
        const a = angle + (i * Math.PI * 2) / inner.length;
        const x = cx + Math.cos(a) * r1;
        const y = cy + Math.sin(a) * r1;
        drawOrb(x, y, skill, 5);
        drawLabel(x, y, skill.name, 20, isDark);
      });

      // Outer orbit (counter-clockwise, slower)
      outer.forEach((skill, i) => {
        const a = -angle * 0.65 + (i * Math.PI * 2) / outer.length + Math.PI / outer.length;
        const x = cx + Math.cos(a) * r2;
        const y = cy + Math.sin(a) * r2;
        drawOrb(x, y, skill, 4);
        drawLabel(x, y, skill.name, 17, isDark);
      });

      // Speed consistent regardless of fps (0.005 rad/frame at 60fps baseline)
      angle += 0.005 * (elapsed / (1000 / 60));
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
