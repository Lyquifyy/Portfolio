import React from 'react';
import './ScrollDots.css';

export default function ScrollDots({ sections, activeSection, onDotClick }) {
  return (
    <nav className="scroll-dots" aria-label="Page sections">
      {sections.map((label, i) => (
        <button
          key={label}
          className={`scroll-dot${activeSection === i ? ' scroll-dot--active' : ''}`}
          onClick={() => onDotClick(i)}
          aria-label={`Go to ${label}`}
        >
          <span className="scroll-dot__label">{label}</span>
          <span className="scroll-dot__marker" />
        </button>
      ))}
    </nav>
  );
}
