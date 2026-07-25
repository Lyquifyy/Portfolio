import { useEffect, useRef, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'motion/react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './AuroraBackdrop.css';

/* Palette mirrors the aurora stops in src/styles/tokens.css, as 0..1 RGB. */
const PALETTE = {
  base:    [0.039, 0.039, 0.059], // #0a0a0f
  violet:  [0.486, 0.227, 0.929], // #7c3aed
  indigo:  [0.310, 0.275, 0.898], // #4f46e5
  teal:    [0.078, 0.722, 0.651], // #14b8a6
  fuchsia: [0.851, 0.275, 0.937], // #d946ef
  cyan:    [0.133, 0.827, 0.933], // #22d3ee
};

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;

uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_pointer;
uniform float u_pointerActive;
uniform float u_scroll;

uniform vec3 u_base;
uniform vec3 u_violet;
uniform vec3 u_indigo;
uniform vec3 u_teal;
uniform vec3 u_fuchsia;
uniform vec3 u_cyan;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

/* Two fbm variants. This shader runs on every pixel of a full-viewport quad,
   and snoise is the entire cost, so the octave count is the perf dial: the
   warp pass gets 2 octaves, the final field 3. */
float fbm2(vec3 p) {
  float sum = 0.5 * snoise(p);
  sum += 0.25 * snoise(p * 2.02);
  return sum;
}

float fbm3(vec3 p) {
  float sum = 0.5 * snoise(p);
  sum += 0.25 * snoise(p * 2.02);
  sum += 0.125 * snoise(p * 4.06);
  return sum;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  vec2 p = uv;
  p.x *= aspect;

  float t = u_time * 0.055;

  /* Cursor bends the warp field locally, falling off fast so it reads as a
     lensing effect rather than a global shift. */
  vec2 pointerPos = vec2(u_pointer.x * aspect, 1.0 - u_pointer.y);
  float pd = length(p - pointerPos);
  float bend = exp(-pd * 2.6) * u_pointerActive;

  /* Scroll rotates the field so each section sits in a different colour
     region of the same continuous noise. */
  float scrollOff = u_scroll * 3.4;

  /* One domain-warp pass, not two. The second pass cost as much as everything
     else combined and the extra detail is invisible under the scrim. */
  vec2 q = vec2(
    fbm2(vec3(p * 1.15 + vec2(0.0, scrollOff), t)),
    fbm2(vec3(p * 1.15 + vec2(5.2, 1.3 + scrollOff), t))
  );

  float f = fbm3(vec3(p * 1.15 + 2.3 * q + bend * 1.6, t));

  vec3 col = u_base;
  col = mix(col, u_violet,  smoothstep(-0.35, 0.55, f));
  col = mix(col, u_indigo,  smoothstep(0.10, 0.95, length(q) * 0.85));
  col = mix(col, u_teal,    smoothstep(0.35, 1.05, q.x * 0.6 + f * 0.5 + 0.5));
  col = mix(col, u_fuchsia, smoothstep(0.55, 1.15, q.y * 0.6 - f * 0.4 + 0.5) * 0.75);
  col = mix(col, u_cyan,    bend * 0.55);

  /* Vignette pulls the corners back to base so the page edges stay calm. */
  float vig = smoothstep(1.25, 0.20, length(uv - 0.5) * 1.55);
  col *= vig;

  /* Keep the aurora as a glow over the base rather than a full-bleed wash —
     body text has to stay readable on top of this. */
  col = mix(u_base, col, 0.62);

  /* Ordered-ish dither: large smooth gradients band badly at 8 bits. */
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dither - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Full-viewport animated aurora field.
 *
 * Renders at 0.6x DPR into a CSS-upscaled canvas — the field is entirely
 * low-frequency, so the resolution loss is invisible while the fragment count
 * drops by ~65%. Falls back to a static CSS mesh gradient when WebGL is
 * unavailable or reduced motion is requested.
 */
export default function AuroraBackdrop({ pointerRef }) {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll();
  const scrollRef = useRef(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    scrollRef.current = v;
  });

  useEffect(() => {
    if (reducedMotion) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl =
      canvas.getContext('webgl', { antialias: false, alpha: false, depth: false }) ||
      canvas.getContext('experimental-webgl', { antialias: false, alpha: false, depth: false });

    if (!gl) {
      setFailed(true);
      return undefined;
    }

    const program = createProgram(gl);
    if (!program) {
      setFailed(true);
      return undefined;
    }

    gl.useProgram(program);

    // Fullscreen triangle — cheaper than a quad, no diagonal seam.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name) => gl.getUniformLocation(program, name);
    const uResolution = u('u_resolution');
    const uTime = u('u_time');
    const uPointer = u('u_pointer');
    const uPointerActive = u('u_pointerActive');
    const uScroll = u('u_scroll');

    gl.uniform3fv(u('u_base'), PALETTE.base);
    gl.uniform3fv(u('u_violet'), PALETTE.violet);
    gl.uniform3fv(u('u_indigo'), PALETTE.indigo);
    gl.uniform3fv(u('u_teal'), PALETTE.teal);
    gl.uniform3fv(u('u_fuchsia'), PALETTE.fuchsia);
    gl.uniform3fv(u('u_cyan'), PALETTE.cyan);

    /* Render scale ladder. Devices without a real GPU fall back to software
       rasterization, where a full-viewport noise shader is far too expensive —
       so measure actual frame cost and step down, then give up entirely. */
    const SCALES = [0.6, 0.38];
    let scaleStep = 0;
    let width = 0;
    let height = 0;

    const resize = (force = false) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = SCALES[scaleStep];
      const w = Math.max(1, Math.floor(window.innerWidth * dpr * scale));
      const h = Math.max(1, Math.floor(window.innerHeight * dpr * scale));
      if (!force && w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uResolution, w, h);
    };

    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    /* Accumulate our own clock so pausing (hidden tab / offscreen) never
       produces a time jump when the loop resumes. */
    let elapsed = 0;
    let last = performance.now();
    let raf = null;
    let running = true;
    let smoothedActive = 0;

    /* Perf sampling: skip a warm-up window, then average real frame cost. */
    const WARMUP_FRAMES = 25;
    const SAMPLE_FRAMES = 50;
    const BUDGET_MS = 26; // ~38fps — below this the backdrop is hurting more than helping
    let sampled = 0;
    let sampleSum = 0;
    let degraded = false;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);

      const dt = Math.min(now - last, 50); // clamp so a stall can't lurch
      last = now;
      if (!running) return;
      elapsed += dt;

      if (!degraded) {
        sampled++;
        if (sampled > WARMUP_FRAMES) sampleSum += dt;
        if (sampled === WARMUP_FRAMES + SAMPLE_FRAMES) {
          const avg = sampleSum / SAMPLE_FRAMES;
          if (avg > BUDGET_MS) {
            if (scaleStep < SCALES.length - 1) {
              scaleStep++;
              resize(true);
              sampled = 0;
              sampleSum = 0;
            } else {
              // Even at the lowest scale this device can't afford the shader.
              degraded = true;
              setFailed(true);
              return;
            }
          } else {
            degraded = true; // fast enough; stop measuring
          }
        }
      }

      const pointer = pointerRef?.current ?? { x: 0.5, y: 0.5, active: false };
      const target = pointer.active ? 1 : 0;
      smoothedActive += (target - smoothedActive) * 0.06;

      gl.uniform1f(uTime, elapsed / 1000);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uPointerActive, smoothedActive);
      gl.uniform1f(uScroll, scrollRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      running = !document.hidden;
      last = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
  }, [pointerRef, reducedMotion]);

  const useFallback = failed || reducedMotion;

  return (
    <div className="aurora" aria-hidden="true">
      {useFallback ? (
        <div className="aurora__fallback" />
      ) : (
        <canvas ref={canvasRef} className="aurora__canvas" />
      )}
      <div className="aurora__scrim" />
      <div className="aurora__grid" />
    </div>
  );
}
