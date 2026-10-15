import { useEffect, useState } from 'react';
import useScramble from '../hooks/useScramble';
import useReducedMotion from '../hooks/useReducedMotion';

export function Scramble({ text, as: Tag = 'span', className = '', speed }) {
  const reduced = useReducedMotion();
  const out = useScramble(text, { speed, enabled: !reduced });
  return <Tag className={className} aria-label={text}>{out}</Tag>;
}

/** Cycles through `items`, decoding each one in. */
export function Cycler({ items, interval = 3400, className = '' }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return undefined;
    const id = setInterval(() => setI(n => (n + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [items.length, interval, reduced]);
  return <Scramble text={items[i]} className={className} speed={24} />;
}
