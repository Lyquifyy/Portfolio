/*
 * One loop for everything that moves with the page.
 *
 *  - A wheel-driven inertial scroll on fine pointers. Wheel deltas feed a
 *    target; a lerp walks window.scrollTo towards it every frame. Touch,
 *    keyboard and the scrollbar stay native, and any scroll we did not cause
 *    hands control straight back. Sticky layout, anchors, find-in-page and
 *    everything else keep working because the document really scrolls.
 *  - Scroll velocity, smoothed, published as --vy on <html> so CSS can skew
 *    and stretch things while the page is moving.
 *  - Per-element progress: 0 → 1 as an element travels between two viewport
 *    positions, written to --p on the element. All the scrubbed animations
 *    on the page are plain CSS reading that variable.
 *  - Per-frame subscribers for the canvases.
 */
import { prefersReducedMotion } from '../hooks/useReducedMotion';

const EDGE = { top: 0, center: 0.5, bottom: 1 };

const frameSubs = new Set();
const progSubs = new Set();

const state = { y: 0, v: 0, vh: 0, t: 0 };
let raf = 0;
let dirty = true;
let prevY = 0;
let lastT = 0;
let started = false;

/* ---- inertial wheel scroll ------------------------------------------------ */

const smooth = { on: false, active: false, target: 0, current: 0, lastSet: -1, ease: 0.11 };

const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

function scrollsInside(target, dy) {
  // Let a scrollable box (palette list, project sheet) take the wheel first.
  let el = target;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el instanceof Element) {
      const s = getComputedStyle(el);
      if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1) {
        if (dy < 0 && el.scrollTop > 0) return true;
        if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      }
    }
    el = el.parentNode;
  }
  return false;
}

function onWheel(e) {
  if (e.ctrlKey || e.metaKey) return;                                 // pinch zoom
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;                // horizontal gesture
  if (document.body.style.overflow === 'hidden') return;              // a modal owns the page
  if (scrollsInside(e.target, e.deltaY)) return;
  e.preventDefault();
  let dy = e.deltaY;
  if (e.deltaMode === 1) dy *= 16;
  else if (e.deltaMode === 2) dy *= window.innerHeight;
  dy = clamp(dy, -220, 220);
  if (!smooth.active) {
    smooth.current = smooth.target = window.scrollY;
    smooth.active = true;
  }
  smooth.target = clamp(smooth.target + dy, 0, maxScroll());
}

function smoothStep(dt) {
  if (!smooth.active) return;
  if (document.body.style.overflow === 'hidden') {          // a modal opened mid-glide
    smooth.active = false;
    smooth.lastSet = -1;
    return;
  }
  const y = window.scrollY;
  if (smooth.lastSet >= 0 && Math.abs(y - smooth.lastSet) > 2) {
    // Something else scrolled (keyboard, scrollbar, anchor). Let it.
    smooth.active = false;
    smooth.lastSet = -1;
    return;
  }
  const diff = smooth.target - smooth.current;
  if (Math.abs(diff) < 0.4) {
    smooth.current = smooth.target;
    window.scrollTo(0, smooth.current);
    smooth.active = false;
    smooth.lastSet = -1;
    return;
  }
  // frame-rate independent: the same glide at 30, 60 or 120 fps
  smooth.current += diff * (1 - Math.pow(1 - smooth.ease, dt / 16.7));
  window.scrollTo(0, smooth.current);
  smooth.lastSet = Math.round(smooth.current);
}

/** Scroll the page to an element, through the engine when it is on. */
export function scrollToEl(el, offset = 0) {
  if (!el) return;
  const top = clamp(el.getBoundingClientRect().top + window.scrollY - offset, 0, maxScroll());
  if (smooth.on) {
    smooth.current = window.scrollY;
    smooth.target = top;
    smooth.active = true;
    smooth.lastSet = -1;
  } else {
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

/* ---- the loop ------------------------------------------------------------- */

function readProgress() {
  const vh = state.vh;
  // read every rect first, then write, so the subscribers do not thrash layout
  const rects = [];
  progSubs.forEach(s => rects.push([s, s.el.getBoundingClientRect()]));
  rects.forEach(([s, r]) => {
    const topAtStart = vh * s.start[1] - r.height * EDGE[s.start[0]];
    const topAtEnd = vh * s.end[1] - r.height * EDGE[s.end[0]];
    const span = topAtStart - topAtEnd || 1;
    const p = clamp((topAtStart - r.top) / span, 0, 1);
    if (p !== s.last) {
      s.last = p;
      s.cb(p, r);
    }
  });
}

function loop(now) {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(64, now - (lastT || now));
  lastT = now;
  state.t += dt / 1000;

  smoothStep(dt);

  const y = window.scrollY || 0;
  const v = y - prevY;
  prevY = y;
  state.y = y;
  const k = 1 - Math.pow(0.8, dt / 16.7);
  state.v = state.v + (v * (16.7 / Math.max(1, dt)) - state.v) * k;
  if (Math.abs(state.v) < 0.05) state.v = 0;
  if (v !== 0) dirty = true;

  document.documentElement.style.setProperty('--vy', state.v.toFixed(2));

  if (dirty) {
    dirty = false;
    state.vh = window.innerHeight;
    readProgress();
  }
  frameSubs.forEach(s => s(state, dt));
}

function markDirty() { dirty = true; }

function start() {
  if (started) return;
  started = true;
  state.vh = window.innerHeight;
  prevY = window.scrollY || 0;
  window.addEventListener('scroll', markDirty, { passive: true });
  window.addEventListener('resize', markDirty);
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(markDirty).observe(document.body);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { lastT = 0; raf = requestAnimationFrame(loop); }
  });
  const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (fine && !prefersReducedMotion()) {
    smooth.on = true;
    window.addEventListener('wheel', onWheel, { passive: false });
  }
  raf = requestAnimationFrame(loop);
}

/** Called every frame with { y, v, vh, t } and the frame's dt in ms. */
export function onFrame(cb) {
  start();
  frameSubs.add(cb);
  return () => frameSubs.delete(cb);
}

/**
 * Progress of `el` between two viewport positions. `start` and `end` are
 * [edge, viewportFraction]: ['top', 1] is the element's top at the bottom
 * of the viewport; ['bottom', 0] is its bottom at the top.
 */
export function subscribe(el, cb, { start: s = ['top', 1], end: e = ['bottom', 0] } = {}) {
  start();
  const sub = { el, cb, start: s, end: e, last: -1 };
  progSubs.add(sub);
  dirty = true;
  return () => progSubs.delete(sub);
}

export const scrollState = state;
export const smoothScrollEnabled = () => smooth.on;
