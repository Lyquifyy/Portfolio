import React, { useRef, useEffect } from 'react';

const SKILLS = [
  { name: 'React',      color: '#38bdf8' },
  { name: 'TypeScript', color: '#818cf8' },
  { name: 'JavaScript', color: '#fbbf24' },
  { name: 'Python',     color: '#34d399' },
  { name: 'Node.js',    color: '#4ade80' },
  { name: 'C++',        color: '#f472b6' },
  { name: 'PL/SQL',     color: '#fb923c' },
  { name: 'Oracle',     color: '#f87171' },
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default function OrbitCanvas() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, cx, cy;

    function resize() {
      width  = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width  = width;
      canvas.height = height;
      cx = width  / 2;
      cy = height / 2;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const inner = SKILLS.slice(0, 4);
    const outer = SKILLS.slice(4);
    let angle = 0;

    function drawRing(radius, opacity) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56,189,248,${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawOrb(x, y, skill, size) {
      const rgb = hexToRgb(skill.color);
      const glowR = size * 4;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      glow.addColorStop(0, `rgba(${rgb},0.38)`);
      glow.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = skill.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawLabel(x, y, text, yOffset, fontSize) {
      ctx.fillStyle = `rgba(226,232,240,${fontSize >= 12 ? 0.85 : 0.65})`;
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y - yOffset);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      const minDim = Math.min(width, height);
      const r1 = minDim * 0.28;
      const r2 = minDim * 0.43;

      drawRing(r1, 0.1);
      drawRing(r2, 0.07);

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r1 * 0.38);
      cg.addColorStop(0, 'rgba(56,189,248,0.14)');
      cg.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, r1 * 0.38, 0, Math.PI * 2);
      ctx.fill();

      // Center dot
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner orbit (clockwise)
      inner.forEach((skill, i) => {
        const a = angle + (i * Math.PI * 2) / inner.length;
        const x = cx + Math.cos(a) * r1;
        const y = cy + Math.sin(a) * r1;
        drawOrb(x, y, skill, 5);
        drawLabel(x, y, skill.name, 18, 12);
      });

      // Outer orbit (counter-clockwise, slower)
      outer.forEach((skill, i) => {
        const a = -angle * 0.65 + (i * Math.PI * 2) / outer.length + Math.PI / outer.length;
        const x = cx + Math.cos(a) * r2;
        const y = cy + Math.sin(a) * r2;
        drawOrb(x, y, skill, 4);
        drawLabel(x, y, skill.name, 15, 11);
      });

      angle += 0.005;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      ro.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
