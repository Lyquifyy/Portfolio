import React, { useEffect } from 'react';

function Modal({ item, type, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!item) return null;

  const renderContent = () => {
    switch (type) {
      case 'project':
        return (
          <>
            <h2>{item.title}</h2>
            <div className="popup-section">
              <h3>Overview</h3>
              <p>{item.details}</p>
            </div>
            <div className="popup-section">
              <h3>Challenges</h3>
              <p>{item.challenges}</p>
            </div>
            <div className="popup-section">
              <h3>Outcome</h3>
              <p>{item.outcome}</p>
            </div>
            <div className="popup-section">
              <h3>Technologies Used</h3>
              <div className="tech-stack">
                {item.tech.map((tech, idx) => (
                  <span key={idx}>{tech}</span>
                ))}
              </div>
            </div>
            {(item.githubUrl || item.liveUrl) && (
              <div className="popup-section project-links">
                {item.githubUrl && (
                  <a
                    href={item.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    View on GitHub
                  </a>
                )}
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    View Live Demo
                  </a>
                )}
              </div>
            )}
          </>
        );

      case 'experience':
        return (
          <>
            <h2>{item.title}</h2>
            <h3 className="company-name">{item.company}</h3>
            <p className="period">{item.period}</p>
            <div className="popup-section">
              <h3>Key Responsibilities</h3>
              <ul className="responsibilities-list">
                {item.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
            <div className="popup-section">
              <h3>Technologies Used</h3>
              <div className="tech-stack">
                {item.technologies.map((tech, idx) => (
                  <span key={idx}>{tech}</span>
                ))}
              </div>
            </div>
            <div className="popup-section">
              <h3>Key Achievement</h3>
              <p>{item.achievements}</p>
            </div>
          </>
        );

      case 'idea':
        return (
          <>
            <h2>{item.title}</h2>
            <div className="popup-section">
              <h3>Concept</h3>
              <p>{item.concept}</p>
            </div>
            <div className="popup-section">
              <h3>Planned Features</h3>
              <ul className="features-list">
                {item.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="popup-section">
              <h3>Proposed Technologies</h3>
              <div className="tech-stack">
                {item.technologies.map((tech, idx) => (
                  <span key={idx}>{tech}</span>
                ))}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="popup-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
        {renderContent()}
      </div>
    </div>
  );
}

export default Modal;
