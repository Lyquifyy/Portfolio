import React, { useEffect, useState } from 'react';
import IntroScreen from './components/IntroScreen';
import Header from './components/Header';
import Modal from './components/Modal';
import ContactForm from './components/ContactForm';
import Notification from './components/Notification';
import BackToTop from './components/BackToTop';
import { projects } from './data/projects';
import { experiences } from './data/experiences';
import { ideas } from './data/ideas';
import profileImage from './images/portfolio_main.jpg';
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleScrollTo = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openPopup = (item, type) => {
    setSelectedItem(item);
    setPopupType(type);
  };

  const closePopup = () => {
    setSelectedItem(null);
    setPopupType(null);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification({ message: '', type: '' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (sectionTop < windowHeight * 0.8) {
          section.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="App">
      {showIntro && <IntroScreen onEnter={() => setShowIntro(false)} />}

      <div className="animated-bg" />

      <Header onNavigate={handleScrollTo} />

      <main className="main-content">
        <section id="about" className="about-section section-left">
          <h1>About Me</h1>
          <div className="about-container">
            <img src={profileImage} alt="Zander Erwin" className="profile-pic" />
            <div className="about-text">
              <p>
                As a dedicated student at Wichita State University, I am committed to continuous learning and growth. My passion lies in developing a deep and comprehensive understanding of my field, where I continually strive for excellence and mastery. Through my experiences, I've gained proficiency in various technologies, including PL/SQL, TypeScript, React, and Python. This diverse skill set allows me to approach challenges with a well-rounded perspective and apply innovative solutions in my projects.
              </p>
              <h2>Technologies I'm Familiar With</h2>
              <ul className="tech-list">
                <li>JavaScript</li>
                <li>React</li>
                <li>Node.js</li>
                <li>PL/SQL</li>
                <li>TypeScript</li>
                <li>Python</li>
                <li>C++</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="projects">
          <h1>Projects</h1>
          <div className="projects-tiles">
            {projects.map((project, index) => (
              <div
                className="tile project-tile"
                key={index}
                onClick={() => openPopup(project, 'project')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openPopup(project, 'project')}
                aria-label={`View details for ${project.title}`}
              >
                <h2>{project.title}</h2>
                <p>{project.description}</p>
                <div className="tech-stack">
                  {project.tech.map((tech, idx) => (
                    <span key={idx}>{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="experience">
          <h1>Experience</h1>
          <div className="experience-tiles">
            {experiences.map((exp, index) => (
              <div
                className="tile experience-tile"
                key={index}
                onClick={() => openPopup(exp, 'experience')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openPopup(exp, 'experience')}
                aria-label={`View details for ${exp.title} at ${exp.company}`}
              >
                <h2>{exp.title}</h2>
                <h3>{exp.company}</h3>
                <p>{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ideas">
          <h1>Future Ideas</h1>
          <div className="ideas-tiles">
            {ideas.map((idea, index) => (
              <div
                className="tile idea-tile"
                key={index}
                onClick={() => openPopup(idea, 'idea')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openPopup(idea, 'idea')}
                aria-label={`View details for ${idea.title}`}
              >
                <h2>{idea.title}</h2>
                <p>{idea.description}</p>
              </div>
            ))}
          </div>
        </section>

        <ContactForm onNotification={showNotification} />
      </main>

      <Modal item={selectedItem} type={popupType} onClose={closePopup} />

      <Notification
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />

      <BackToTop />

      <footer>
        <p>© 2025 Zander Erwin</p>
      </footer>
    </div>
  );
}

export default App;
