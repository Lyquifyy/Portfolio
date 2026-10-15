import useInView from '../hooks/useInView';

/*
 * Splits a string into words and characters so each glyph can rise from
 * behind a clip. Words stay intact so wrapping is unaffected. Stagger is
 * driven by a CSS custom property so timing lives in the stylesheet.
 */
export default function SplitReveal({ text, as: Tag = 'span', className = '', delay = 0, threshold = 0.3 }) {
  const [ref, inView] = useInView({ threshold });
  const words = text.split(' ');
  let idx = 0;
  return (
    <Tag ref={ref} className={`sr ${inView ? 'is-in' : ''} ${className}`.trim()} aria-label={text} style={{ '--d': `${delay}s` }}>
      {words.map((w, wi) => (
        <span className="sr__w" key={wi} aria-hidden="true">
          {Array.from(w).map((ch, ci) => {
            const i = idx++;
            return <span className="sr__c" key={ci} style={{ '--i': i }}>{ch}</span>;
          })}
          {wi < words.length - 1 && <span className="sr__sp"> </span>}
        </span>
      ))}
    </Tag>
  );
}
