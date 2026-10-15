import { useEffect, useRef } from 'react';
import usePointer, { pointer } from '../hooks/usePointer';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/*
 * Crosshair cursor. Two hairlines span the viewport through the pointer and
 * a small box sits at the centre. Over interactive elements the box snaps
 * out to the element's bounding box and the hairlines fade. Text inputs
 * hand control back to the native caret. Fine pointers only.
 */
const SNAP_SELECTOR = 'a, button, summary, [data-snap], label.field';
const TEXT_SELECTOR = 'input, textarea, [contenteditable]';

export default function Cursor() {
  const root = useRef(null);
  const hRef = useRef(null);
  const vRef = useRef(null);
  const boxRef = useRef(null);
  usePointer();

  useEffect(() => {
    if (!pointer.fine || prefersReducedMotion()) return undefined;
    const el = root.current;
    if (!el) return undefined;
    document.body.classList.add('has-cursor');

    let mode = 'cross';
    let target = null;
    let bx = pointer.x, by = pointer.y, bw = 14, bh = 14;
    let visible = false;
    let raf = 0;

    const setMode = (m, t) => { mode = m; target = t; el.dataset.mode = m; };
    const onOver = (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest(TEXT_SELECTOR)) { setMode('text', null); return; }
      const snap = t.closest(SNAP_SELECTOR);
      if (snap) { setMode('snap', snap); return; }
      if (mode !== 'cross') setMode('cross', null);
    };
    const onLeave = () => { visible = false; el.classList.remove('is-on'); };
    const onEnter = () => { visible = true; el.classList.add('is-on'); };
    const onDown = () => el.classList.add('is-down');
    const onUp = () => el.classList.remove('is-down');

    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.documentElement.addEventListener('pointerenter', onEnter);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('blur', onLeave);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const { x, y } = pointer;
      if (!visible && (x !== 0 || y !== 0)) onEnter();

      let tx = x, ty = y, tw = 14, th = 14;
      if (mode === 'snap' && target && target.isConnected) {
        const r = target.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.width < window.innerWidth * 0.9) {
          tx = r.left + r.width / 2; ty = r.top + r.height / 2;
          tw = r.width + 10; th = r.height + 10;
        }
      } else if (mode === 'text') { tw = 2; th = 22; }

      const k = mode === 'snap' ? 0.28 : 0.6;
      bx += (tx - bx) * k; by += (ty - by) * k;
      bw += (tw - bw) * 0.3; bh += (th - bh) * 0.3;

      hRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
      vRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
      boxRef.current.style.transform = `translate3d(${bx - bw / 2}px, ${by - bh / 2}px, 0)`;
      boxRef.current.style.width = `${bw}px`;
      boxRef.current.style.height = `${bh}px`;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove('has-cursor');
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.removeEventListener('pointerenter', onEnter);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('blur', onLeave);
    };
  }, []);

  return (
    <div ref={root} className="cursor" data-mode="cross" aria-hidden="true">
      <div ref={hRef} className="cursor__h" />
      <div ref={vRef} className="cursor__v" />
      <div ref={boxRef} className="cursor__box" />
    </div>
  );
}
