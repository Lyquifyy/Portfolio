import { useEffect, useRef } from 'react';
import usePointer, { pointer } from '../hooks/usePointer';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * Full-screen WebGL contour field. A fractal noise height-map is sliced into
 * isolines (think site survey / topographic sheet), overlaid on a fine grid.
 * The pointer acts as a lens that bends the field and tints nearby contours
 * with the accent colour. Everything is drawn with alpha onto the page
 * background, so theme changes only need new uniform colours.
 */

const VERT = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_pointer;
uniform float u_scroll;
uniform vec3  u_line;
uniform vec3  u_accent;
uniform float u_alpha;
uniform float u_hasDeriv;

vec2 hash(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(in vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
             mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
float width(float h){
#ifdef GL_OES_standard_derivatives
  if (u_hasDeriv > 0.5) return fwidth(h);
#endif
  return 0.03;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(u_pointer.x * aspect, u_pointer.y);

  float d = distance(p, m);
  float lens = exp(-d * d * 7.0);

  vec2 q = p * 2.4 + vec2(0.0, u_scroll * 0.9);
  q += (p - m) * lens * 0.55;
  float n = fbm(q + vec2(0.05, 0.03) * u_time);
  float h = n * 7.0;

  float fw = width(h);
  float line = abs(fract(h) - 0.5);
  float iso = 1.0 - smoothstep(0.0, fw * 1.3, line);
  float majorIdx = mod(floor(h + 0.5), 4.0);
  float major = step(majorIdx, 0.5);
  iso *= 0.55 + 0.45 * major;

  vec2 gp = p * 10.0;
  vec2 g = abs(fract(gp) - 0.5);
  float gw = width(gp.x);
  float grid = 1.0 - smoothstep(0.0, gw * 1.2, min(g.x, g.y));
  grid *= 0.22;

  float vis = 0.42 + 0.58 * lens;
  float a = (iso * 0.55 + grid) * vis * u_alpha;
  vec3 col = mix(u_line, u_accent, clamp(lens * 1.4, 0.0, 1.0) * iso);
  gl_FragColor = vec4(col * a, a);
}
`;

function hexToRgb(hex) {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function readThemeColours() {
  const cs = getComputedStyle(document.body);
  const line = cs.getPropertyValue('--field-line').trim() || '#6f8fb8';
  const accent = cs.getPropertyValue('--accent').trim() || '#ff5a1f';
  const alpha = parseFloat(cs.getPropertyValue('--field-alpha')) || 1;
  return { line: hexToRgb(line), accent: hexToRgb(accent), alpha };
}

export default function ShaderField() {
  const ref = useRef(null);
  usePointer();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    let gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
    } catch { gl = null; }
    if (!gl) { canvas.style.display = 'none'; return undefined; }

    const hasDeriv = !!gl.getExtension('OES_standard_derivatives');
    const reduced = prefersReducedMotion();

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        // eslint-disable-next-line no-console
        console.warn(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { canvas.style.display = 'none'; return undefined; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    const U = {};
    ['u_res', 'u_time', 'u_pointer', 'u_scroll', 'u_line', 'u_accent', 'u_alpha', 'u_hasDeriv'].forEach(n => { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform1f(U.u_hasDeriv, hasDeriv ? 1 : 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const applyColours = () => {
      const c = readThemeColours();
      gl.uniform3fv(U.u_line, c.line);
      gl.uniform3fv(U.u_accent, c.accent);
      gl.uniform1f(U.u_alpha, c.alpha);
    };
    applyColours();

    const scale = 0.6;
    let w = 1, h = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
      w = Math.max(1, Math.floor(window.innerWidth * dpr));
      h = Math.max(1, Math.floor(window.innerHeight * dpr));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.u_res, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const mo = new MutationObserver(applyColours);
    mo.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    let px = 0.5, py = 0.5, sc = 0, raf = 0, running = true;
    const start = performance.now();
    const frame = (t) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      const tx = pointer.x / window.innerWidth;
      const ty = 1 - pointer.y / window.innerHeight;
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      const target = (window.scrollY || 0) / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      sc += (target - sc) * 0.08;
      gl.uniform1f(U.u_time, (t - start) / 1000);
      gl.uniform2f(U.u_pointer, px, py);
      gl.uniform1f(U.u_scroll, sc);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduced) {
      gl.uniform1f(U.u_time, 12);
      gl.uniform2f(U.u_pointer, 0.5, 0.5);
      gl.uniform1f(U.u_scroll, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onVis = () => {
      if (reduced) return;
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!running) { running = true; raf = requestAnimationFrame(frame); }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      mo.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <canvas ref={ref} className="shader" aria-hidden="true" />;
}
