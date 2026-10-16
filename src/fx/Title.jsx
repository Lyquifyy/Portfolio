import useProgress from '../motion/useProgress';

/*
 * A heading whose words rise into place as it scrolls into view, and sink
 * back on the way up. `lines` is a list of strings or { text, muted } for
 * the quieter second line. `load` runs it once on mount instead (the
 * intro). The element carries the plain text for assistive tech.
 */
export default function Title({ as: Tag = 'h2', lines, className = '', k = 0.7, load = false, ...rest }) {
  const ref = useProgress(load ? { start: ['top', 0], end: ['top', 0] } : { start: ['top', 0.95], end: ['top', 0.55] });
  const norm = lines.map(l => (typeof l === 'string' ? { text: l } : l));
  const n = norm.reduce((s, l) => s + l.text.split(' ').length, 0);
  let i = 0;
  const label = norm.map(l => l.text).join(' ');
  const sep = (li) => (li < norm.length - 1 ? ' ' : '');
  return (
    <Tag ref={ref} className={`title${load ? ' title--load' : ''} ${className}`.trim()} style={{ '--n': n, '--k': k }} aria-label={label} {...rest}>
      {norm.map((line, li) => (
        <span className={`title__line${line.muted ? ' title__line--muted' : ''}${line.accent ? ' title__line--accent' : ''}`} key={li} aria-hidden="true">
          {line.text.split(' ').flatMap((w, wi, arr) => {
            const idx = i++;
            const word = (
              <span className="title__w" key={wi}>
                <span className="title__in" style={{ '--i': idx }}>{w}</span>
              </span>
            );
            return wi < arr.length - 1 ? [word, ' '] : [word];
          })}
        </span>
      )).flatMap((el, li) => (sep(li) ? [el, sep(li)] : [el]))}
    </Tag>
  );
}
