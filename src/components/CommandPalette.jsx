import { useEffect, useMemo, useRef, useState } from 'react';
import './CommandPalette.css';

const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function matches(query, text) {
  if (!query) return true;
  const q = fold(query).replace(/\s+/g, '');
  const t = fold(text);
  let i = 0;
  for (const ch of t) {
    if (ch === q[i]) i += 1;
    if (i === q.length) return true;
  }
  return false;
}

export default function CommandPalette({ open, onClose, actions }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(
    () => actions.filter(a => matches(query, `${a.group} ${a.label} ${a.hint || ''}`)),
    [actions, query]
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      const t = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => { setCursor(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[cursor];
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [cursor, open]);

  if (!open) return null;

  const run = (action) => {
    onClose();
    action.run();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[cursor]) run(filtered[cursor]); }
    else if (e.key === 'Tab') { e.preventDefault(); inputRef.current?.focus(); }
  };

  let lastGroup = null;

  return (
    <div className="palette" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="palette__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
      >
        <div className="palette__inputwrap">
          <span className="palette__prompt" aria-hidden="true">›</span>
          <input
            ref={inputRef}
            className="palette__input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Jump to a chapter, open a link, download a résumé…"
            aria-label="Search commands"
            aria-controls="palette-list"
            aria-activedescendant={filtered[cursor] ? `palette-opt-${filtered[cursor].id}` : undefined}
            role="combobox"
            aria-expanded="true"
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="palette__esc">esc</kbd>
        </div>
        <ul className="palette__list" id="palette-list" role="listbox" ref={listRef}>
          {filtered.length === 0 && (
            <li className="palette__empty">Nothing matches “{query}”.</li>
          )}
          {filtered.map((a, i) => {
            const showGroup = a.group !== lastGroup;
            lastGroup = a.group;
            return (
              <li
                key={a.id}
                id={`palette-opt-${a.id}`}
                role="option"
                aria-selected={i === cursor}
                className={`palette__item${i === cursor ? ' palette__item--active' : ''}${showGroup ? ' palette__item--first' : ''}`}
                data-group={showGroup ? a.group : undefined}
                onMouseEnter={() => setCursor(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run(a)}
              >
                <span className="palette__label">{a.label}</span>
                {a.hint && <span className="palette__hint">{a.hint}</span>}
              </li>
            );
          })}
        </ul>
        <div className="palette__foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> run</span>
          <span><kbd>⌘</kbd><kbd>K</kbd> toggle</span>
        </div>
      </div>
    </div>
  );
}
