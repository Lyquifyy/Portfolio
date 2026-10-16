import React from 'react';
import useProgress from '../motion/useProgress';

/*
 * A paragraph that reads itself in: each word comes up from faint to full
 * as the scroll passes it, and back again on the way up. `wires` is an
 * optional list of { match, onClick } so names in the prose can open the
 * thing they mention; a wired name is treated as one word.
 */
function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export default function Words({ as: Tag = 'p', text, wires = [], className = '', k = 1.4, style, ...rest }) {
  const ref = useProgress({ start: ['top', 0.92], end: ['bottom', 0.55] });
  const re = wires.length
    ? new RegExp(`(${wires.map(w => escapeRe(w.match)).sort((a, b) => b.length - a.length).join('|')})`, 'g')
    : null;
  const parts = re ? text.split(re) : [text];

  // Spaces go exactly where the text had them, so punctuation after a wired
  // name stays attached to it.
  const out = [];
  let i = 0;
  parts.forEach((part, pi) => {
    if (!part) return;
    const wire = re && wires.find(w => w.match === part);
    if (wire) {
      out.push(
        <button type="button" key={`w${pi}`} className="w wired" style={{ '--i': i++ }} onClick={wire.onClick}>
          {part}
        </button>
      );
      return;
    }
    if (/^\s/.test(part)) out.push(' ');
    part.split(/\s+/).filter(Boolean).forEach((wd, wi) => {
      if (wi > 0) out.push(' ');
      out.push(<span className="w" key={`${pi}-${wi}`} style={{ '--i': i++ }}>{wd}</span>);
    });
    if (/\s$/.test(part)) out.push(' ');
  });

  return (
    <Tag ref={ref} className={`words ${className}`.trim()} style={{ '--n': i, '--k': k, ...style }} {...rest}>
      {out}
    </Tag>
  );
}
