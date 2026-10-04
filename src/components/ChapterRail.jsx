import './ChapterRail.css';

export default function ChapterRail({ chapters, active, onSelect }) {
  return (
    <nav className="rail" aria-label="Chapters">
      <ol className="rail__list">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              className={`rail__item${active === i ? ' rail__item--active' : ''}`}
              onClick={() => onSelect(c.id)}
              aria-current={active === i ? 'true' : undefined}
            >
              <span className="rail__num">{c.num}</span>
              <span className="rail__label">{c.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
