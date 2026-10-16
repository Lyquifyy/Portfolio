import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * Green ink behind the intro: a GPU fluid simulation (semi-Lagrangian
 * advection, vorticity confinement, Jacobi pressure solve) written against
 * raw WebGL. Idle splats keep it moving; the pointer stirs it. The canvas
 * fades out as the page scrolls past the intro and the loop stops then.
 * Without renderable half-float textures it falls back to a 2D particle
 * field in the same colours. Reduced motion renders nothing.
 */

const CONFIG = {
  SIM: 128, DYE: 640,
  DENSITY_DISSIPATION: 0.9, VELOCITY_DISSIPATION: 0.25,
  PRESSURE: 0.8, PRESSURE_ITERATIONS: 16, CURL: 28,
  SPLAT_RADIUS: 0.2, SPLAT_FORCE: 5000,
};

const VERT = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv, vL, vR, vT, vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEAD = `precision highp float; precision highp sampler2D; varying vec2 vUv, vL, vR, vT, vB;`;

const FRAG = {
  copy: `${HEAD} uniform sampler2D uTexture; uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`,
  splat: `${HEAD} uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main () {
      vec2 p = vUv - point.xy; p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }`,
  advection: `${HEAD} uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform vec2 dyeTexelSize; uniform float dt; uniform float dissipation;
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
      vec2 st = uv / tsize - 0.5; vec2 iuv = floor(st); vec2 fuv = fract(st);
      vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
      vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
      vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
      vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
      return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    void main () {
    #ifdef MANUAL_FILTERING
      vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
      vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      vec4 result = texture2D(uSource, coord);
    #endif
      float decay = 1.0 + dissipation * dt;
      gl_FragColor = result / decay;
    }`,
  divergence: `${HEAD} uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x; float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y; float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) { L = -C.x; } if (vR.x > 1.0) { R = -C.x; }
      if (vT.y > 1.0) { T = -C.y; } if (vB.y < 0.0) { B = -C.y; }
      gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }`,
  curl: `${HEAD} uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y; float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x; float B = texture2D(uVelocity, vB).x;
      gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
    }`,
  vorticity: `${HEAD} uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x; float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x; float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity, vUv).xy + force * dt;
      gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
    }`,
  pressure: `${HEAD} uniform sampler2D uPressure; uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
      float divergence = texture2D(uDivergence, vUv).x;
      gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
    }`,
  gradient: `${HEAD} uniform sampler2D uPressure; uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }`,
  display: `${HEAD} uniform sampler2D uTexture;
    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      // soft shoulder so dense ink saturates instead of blowing out to white
      c = 1.0 - exp(-c * 1.6);
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, a);
    }`,
};

/* ---- colour helpers --------------------------------------------------- */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(f, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
function rgbToHsl([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
function hslToRgb([h, s, l]) {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t) => { t = (t + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
}
function readAccent() {
  const v = getComputedStyle(document.body).getPropertyValue('--accent').trim();
  return hexToRgb(v || '#178a4e');
}
/** A colour near the accent: same hue family, varied lightness. */
function inkColour(accent, dark, strength = 1) {
  const [h, s, l] = rgbToHsl(accent);
  const hue = h + (Math.random() - 0.5) * 0.06;
  const light = dark ? l + (Math.random() - 0.3) * 0.3 : l + (Math.random() - 0.6) * 0.25;
  const [r, g, b] = hslToRgb([hue, Math.min(1, s * (0.85 + Math.random() * 0.3)), Math.max(0.12, Math.min(0.85, light))]);
  const k = (dark ? 0.3 : 0.4) * strength;
  return [r * k, g * k, b * k];
}

/* ---- WebGL plumbing --------------------------------------------------- */
function getContext(canvas) {
  const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false, premultipliedAlpha: true, powerPreference: 'high-performance' };
  let gl = canvas.getContext('webgl2', params);
  const isWebGL2 = !!gl;
  if (!gl) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
  if (!gl) return null;
  let halfFloat = null, linear = false;
  if (isWebGL2) { gl.getExtension('EXT_color_buffer_float'); linear = true; }
  else { halfFloat = gl.getExtension('OES_texture_half_float'); linear = !!gl.getExtension('OES_texture_half_float_linear'); }
  if (!isWebGL2 && !halfFloat) return null;
  const type = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
  const pick = (internal, format) => supported(gl, internal, format, type) ? { internal, format } : null;
  let rgba, rg, r;
  if (isWebGL2) {
    rgba = pick(gl.RGBA16F, gl.RGBA);
    rg = pick(gl.RG16F, gl.RG) || rgba;
    r = pick(gl.R16F, gl.RED) || rg;
  } else {
    rgba = pick(gl.RGBA, gl.RGBA); rg = rgba; r = rgba;
  }
  if (!rgba) return null;
  return { gl, type, linear, rgba, rg, r };
}

function supported(gl, internal, format, type) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, type, null);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.deleteFramebuffer(fbo); gl.deleteTexture(tex);
  return ok;
}

function compile(gl, kind, src) {
  const s = gl.createShader(kind);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

function program(gl, vs, fsSrc) {
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const uniforms = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; uniforms[name] = gl.getUniformLocation(p, name); }
  return { p, u: uniforms, use() { gl.useProgram(p); } };
}

function createFBO(gl, w, h, fmt, type, filter) {
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internal, w, h, 0, fmt.format, type, null);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return {
    texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
    attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; },
  };
}

function createDoubleFBO(gl, w, h, fmt, type, filter) {
  let a = createFBO(gl, w, h, fmt, type, filter);
  let b = createFBO(gl, w, h, fmt, type, filter);
  return {
    width: w, height: h, texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY,
    get read() { return a; }, set read(v) { a = v; },
    get write() { return b; }, set write(v) { b = v; },
    swap() { const t = a; a = b; b = t; },
  };
}

/* ---- 2D fallback: a green particle field ------------------------------- */
function startParticles(canvas, dark) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  let w = 0, h = 0, raf = 0, running = true;
  const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  const N = 500;
  const pts = Array.from({ length: N }, () => ({ x: Math.random() * w, y: Math.random() * h, life: Math.random() * 200 }));
  const accent = readAccent();
  const field = (x, y, t) => {
    const a = Math.sin(x * 0.0025 + t * 0.3) + Math.cos(y * 0.003 - t * 0.2);
    return a * Math.PI;
  };
  const start = performance.now();
  const frame = (now) => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const t = (now - start) / 1000;
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(${Math.round(accent[0] * 255)},${Math.round(accent[1] * 255)},${Math.round(accent[2] * 255)},0.7)`;
    pts.forEach(p => {
      const a = field(p.x, p.y, t);
      p.x += Math.cos(a) * 1.4; p.y += Math.sin(a) * 1.4; p.life -= 1;
      if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) { p.x = Math.random() * w; p.y = Math.random() * h; p.life = 100 + Math.random() * 200; }
      ctx.fillRect(p.x, p.y, 1.5, 1.5);
    });
  };
  raf = requestAnimationFrame(frame);
  return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
}

/* ---- the simulation ---------------------------------------------------- */
function startFluid(canvas) {
  const g = getContext(canvas);
  if (!g) return null;
  const { gl, type, linear } = g;
  const filter = linear ? gl.LINEAR : gl.NEAREST;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const P = {};
  Object.entries(FRAG).forEach(([k, src]) => {
    const s = (k === 'advection' && !linear) ? `#define MANUAL_FILTERING\n${src}` : src;
    P[k] = program(gl, vs, s);
  });

  // fullscreen quad
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  const blit = (target) => {
    if (!target) { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    else { gl.viewport(0, 0, target.width, target.height); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };

  let dye, velocity, divergence, curl, pressure;
  const resolution = (res) => {
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(res), max = Math.round(res * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
  };
  const small = window.innerWidth < 700;
  const init = () => {
    const sim = resolution(small ? 96 : CONFIG.SIM);
    const dyeRes = resolution(small ? 384 : CONFIG.DYE);
    gl.disable(gl.BLEND);
    dye = createDoubleFBO(gl, dyeRes.width, dyeRes.height, g.rgba, type, filter);
    velocity = createDoubleFBO(gl, sim.width, sim.height, g.rg, type, filter);
    divergence = createFBO(gl, sim.width, sim.height, g.r, type, gl.NEAREST);
    curl = createFBO(gl, sim.width, sim.height, g.r, type, gl.NEAREST);
    pressure = createDoubleFBO(gl, sim.width, sim.height, g.r, type, gl.NEAREST);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const w = Math.floor(window.innerWidth * dpr), h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; init(); }
  };
  resize();
  window.addEventListener('resize', resize);

  let dark = document.body.dataset.theme === 'dark';
  let accent = readAccent();
  const mo = new MutationObserver(() => { dark = document.body.dataset.theme === 'dark'; accent = readAccent(); });
  mo.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  const splat = (x, y, dx, dy, color) => {
    P.splat.use();
    gl.uniform1i(P.splat.u.uTarget, velocity.read.attach(0));
    gl.uniform1f(P.splat.u.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(P.splat.u.point, x, y);
    gl.uniform3f(P.splat.u.color, dx, dy, 0);
    let radius = CONFIG.SPLAT_RADIUS / 100;
    const aspect = canvas.width / canvas.height;
    if (aspect > 1) radius *= aspect;
    gl.uniform1f(P.splat.u.radius, radius);
    blit(velocity.write); velocity.swap();
    gl.uniform1i(P.splat.u.uTarget, dye.read.attach(0));
    gl.uniform3f(P.splat.u.color, color[0], color[1], color[2]);
    blit(dye.write); dye.swap();
  };

  const step = (dt) => {
    gl.disable(gl.BLEND);
    P.curl.use();
    gl.uniform2f(P.curl.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.curl.u.uVelocity, velocity.read.attach(0));
    blit(curl);

    P.vorticity.use();
    gl.uniform2f(P.vorticity.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.vorticity.u.uVelocity, velocity.read.attach(0));
    gl.uniform1i(P.vorticity.u.uCurl, curl.attach(1));
    gl.uniform1f(P.vorticity.u.curl, CONFIG.CURL);
    gl.uniform1f(P.vorticity.u.dt, dt);
    blit(velocity.write); velocity.swap();

    P.divergence.use();
    gl.uniform2f(P.divergence.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.divergence.u.uVelocity, velocity.read.attach(0));
    blit(divergence);

    P.copy.use();
    gl.uniform1i(P.copy.u.uTexture, pressure.read.attach(0));
    gl.uniform1f(P.copy.u.value, CONFIG.PRESSURE);
    blit(pressure.write); pressure.swap();

    P.pressure.use();
    gl.uniform2f(P.pressure.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.pressure.u.uDivergence, divergence.attach(0));
    for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(P.pressure.u.uPressure, pressure.read.attach(1));
      blit(pressure.write); pressure.swap();
    }

    P.gradient.use();
    gl.uniform2f(P.gradient.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.gradient.u.uPressure, pressure.read.attach(0));
    gl.uniform1i(P.gradient.u.uVelocity, velocity.read.attach(1));
    blit(velocity.write); velocity.swap();

    P.advection.use();
    gl.uniform2f(P.advection.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!linear) gl.uniform2f(P.advection.u.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    const velId = velocity.read.attach(0);
    gl.uniform1i(P.advection.u.uVelocity, velId);
    gl.uniform1i(P.advection.u.uSource, velId);
    gl.uniform1f(P.advection.u.dt, dt);
    gl.uniform1f(P.advection.u.dissipation, CONFIG.VELOCITY_DISSIPATION);
    blit(velocity.write); velocity.swap();

    if (!linear) gl.uniform2f(P.advection.u.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(P.advection.u.uVelocity, velocity.read.attach(0));
    gl.uniform1i(P.advection.u.uSource, dye.read.attach(1));
    gl.uniform1f(P.advection.u.dissipation, CONFIG.DENSITY_DISSIPATION);
    blit(dye.write); dye.swap();
  };

  const render = () => {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    P.display.use();
    gl.uniform1i(P.display.u.uTexture, dye.read.attach(0));
    blit(null);
  };

  // pointer
  let px = 0, py = 0, pdown = false, moved = false;
  const onMove = (e) => {
    const x = e.clientX / window.innerWidth, y = 1 - e.clientY / window.innerHeight;
    if (!moved) { px = x; py = y; moved = true; return; }
    const dx = (x - px) * CONFIG.SPLAT_FORCE, dy = (y - py) * CONFIG.SPLAT_FORCE;
    px = x; py = y;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) splat(x, y, dx * 0.8, dy * 0.8, inkColour(accent, dark, 0.45));
  };
  const onDown = (e) => { pdown = true; onMove(e); };
  const onUp = () => { pdown = false; };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });

  // opening pour, then idle stirring
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2;
    splat(0.55 + Math.random() * 0.35, 0.3 + Math.random() * 0.4, Math.cos(a) * 1200, Math.sin(a) * 1200, inkColour(accent, dark));
  }

  let raf = 0, running = true, last = performance.now(), idleAt = 0;
  const frame = (now) => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    if (now > idleAt) {
      idleAt = now + 900 + Math.random() * 1400;
      const a = Math.random() * Math.PI * 2, s = 500 + Math.random() * 900;
      const x = 0.45 + Math.random() * 0.5, y = 0.15 + Math.random() * 0.7;
      splat(x, y, Math.cos(a) * s, Math.sin(a) * s, inkColour(accent, dark));
      if (Math.random() < 0.3) splat(Math.random(), Math.random(), (Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600, inkColour(accent, dark));
    }
    step(dt);
    render();
  };
  raf = requestAnimationFrame(frame);

  return {
    pause() { if (running) { running = false; cancelAnimationFrame(raf); } },
    resume() { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } },
    stop() {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      mo.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
    get pointerDown() { return pdown; },
  };
}

export default function Fluid() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || prefersReducedMotion()) return undefined;

    let sim = null, stopParticles = null;
    try { sim = startFluid(canvas); } catch { sim = null; }
    if (!sim) {
      const fresh = canvas; // the failed WebGL context cannot become a 2D one; swap in a sibling
      const alt = document.createElement('canvas');
      alt.className = fresh.className;
      fresh.replaceWith(alt);
      ref.current = alt;
      stopParticles = startParticles(alt, document.body.dataset.theme === 'dark');
    }
    const el = ref.current;
    el.classList.add('is-on');

    // fade with scroll, pause once gone
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const p = Math.min(1, window.scrollY / (window.innerHeight * 0.85));
        el.style.opacity = String(1 - p);
        if (sim) { if (p >= 1) sim.pause(); else sim.resume(); }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onVis = () => { if (!sim) return; if (document.hidden) sim.pause(); else onScroll(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      cancelAnimationFrame(raf);
      sim?.stop();
      stopParticles?.();
    };
  }, []);

  return <canvas ref={ref} className="fluid" aria-hidden="true" />;
}
