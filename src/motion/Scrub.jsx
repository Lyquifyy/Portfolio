import useProgress from './useProgress';

/*
 * A block whose children animate with the scroll. The block carries --p
 * (its progress), --n (how many children stagger) and --k (how spread out
 * the stagger is). Each child sets --i and the CSS does the rest.
 */
export default function Scrub({
  as: Tag = 'div',
  start = ['top', 0.94],
  end = ['top', 0.5],
  n = 1,
  k = 0.8,
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useProgress({ start, end });
  return (
    <Tag ref={ref} className={`scrub ${className}`.trim()} style={{ '--n': n, '--k': k, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
