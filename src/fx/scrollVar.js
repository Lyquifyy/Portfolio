/*
 * One scroll loop for every scroll-linked effect. Subscribers get called with
 * their element's progress through the viewport and write it wherever they
 * like (usually a CSS custom property). Runs only while the page actually
 * scrolls, then goes quiet.
 */
const subs = new Set();
let raf = 0;
let dirty = true;

function run() {
  raf = 0;
  if (!dirty) return;
  dirty = false;
  const vh = window.innerHeight;
  subs.forEach(s => {
    const r = s.el.getBoundingClientRect();
    // 0 when the element's top hits the bottom of the viewport,
    // 1 when its bottom leaves the top. `offset` shifts the window.
    const start = vh - s.lead;
    const end = -r.height + s.trail;
    const p = (start - r.top) / (start - end);
    s.cb(Math.min(1, Math.max(0, p)), r);
  });
}

function request() {
  dirty = true;
  if (!raf) raf = requestAnimationFrame(run);
}

export function subscribe(el, cb, { lead = 0, trail = 0 } = {}) {
  const s = { el, cb, lead, trail };
  subs.add(s);
  if (subs.size === 1) {
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
  }
  request();
  return () => {
    subs.delete(s);
    if (subs.size === 0) {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    }
  };
}
