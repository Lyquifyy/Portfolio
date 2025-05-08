import React, { useEffect, useState } from 'react';
import emailjs from 'emailjs-com';
import profileImage from './images/portfolio_main.jpg';
import linkedinImage from './images/linkedin.png';
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [typedName, setTypedName] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
});

  const projects = [
    {
      title: 'Text Based Game',
      description: 'Designed to allow directional movement within a text-based game.',
      tech: ['C++'],
      details: 'A command-line adventure game that demonstrates core programming concepts including user input handling, game state management, and character movement mechanics.',
      challenges: 'Implementing an intuitive navigation system and maintaining game state across different scenes.',
      outcome: 'Successfully created an engaging text-based adventure that serves as a foundation for more complex game development projects.'
    },
    {
      title: 'MaddMund Website',
      description: 'My first website where I learned the basics of how a website should run/look.',
      tech: ['HTML', 'CSS', 'JavaScript'],
      details: 'A responsive website showcasing fundamental web development principles and best practices.',
      challenges: 'Learning responsive design principles and cross-browser compatibility.',
      outcome: 'Developed a fully functional website that effectively demonstrates core web development skills.'
    },
    {
      title: 'Portfolio Website',
      description: 'Learn how I developed my website building skills by creating my own portfolio website.',
      tech: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages'],
      details: 'A professional portfolio website built to showcase my projects and skills to potential employers.',
      challenges: 'Creating an engaging user experience while maintaining clean, maintainable code.',
      outcome: 'Successfully deployed a modern, responsive portfolio that effectively presents my work and capabilities.'
    },
    {
      title: 'AI Fitbot',
      description: 'Learn how I developed my first Chatbot using a basic GPT Model along with Static Responses.',
      tech: ['HTML', 'CSS', 'JavaScript', 'Python'],
      details: 'An AI-powered fitness assistant that provides workout recommendations and answers fitness-related questions.',
      challenges: 'Integrating GPT models and creating meaningful conversation flows.',
      outcome: 'Created an interactive chatbot that helps users achieve their fitness goals through personalized guidance.'
    },
  ];

  const experiences = [
    {
      title: 'Software Engineer Intern',
      company: 'Integra Technologies',
      period: 'March 2024 - Present',
      description: 'Work on IT Requests from Integra Employees regarding Enhancements/Problems in the UI or backend database related issues.',
      responsibilities: [
        'Develop and maintain internal web applications',
        'Troubleshoot and resolve database-related issues',
        'Collaborate with cross-functional teams to implement UI enhancements',
        'Handle user support tickets and provide technical solutions'
      ],
      technologies: ['PL/SQL', 'JavaScript', 'Oracle Apex/Forms'],
      achievements: 'I have successfully resolved over 100 user IT requests'
    },
    {
      title: 'Student Assistant',
      company: 'Wichita State University',
      period: 'May 2023 - March 2024',
      description: 'Tested structural integrity of aircraft/vehicle seats.',
      responsibilities: [
        'Conducted thorough testing procedures',
        'Documented test results and findings',
        'Assisted in research data collection',
        'Maintained testing equipment'
      ],
      technologies: ['Testing Equipment', 'Documentation Software'],
      achievements: 'Completed countless successful tests for various clients'
    }
  ];

  const ideas = [
    {
      title: 'Mobile Workout/Game Application',
      description: 'Developing a mobile application that combines fitness with gaming.',
      concept: 'A gamified fitness app that turns workouts into interactive adventures',
      features: [
        'Real-time workout tracking',
        'Achievement system',
        'Social competition features',
        'Customizable workout plans'
      ],
      technologies: ['React Native', 'Firebase', 'Node.js'],
      timeline: 'Expected development: 6 months'
    },
    {
      title: 'Communication Application',
      description: 'Creating an application that allows you to chat with friends',
      concept: 'A modern messaging platform with unique features for enhanced communication',
      features: [
        'Real-time messaging',
        'End-to-end encryption',
        'Custom emoji system',
        'Voice and video calls'
      ],
      technologies: ['WebRTC', 'Socket.io', 'React', 'MongoDB'],
      timeline: 'Expected development: 4 months'
    }
  ];

  useEffect(() => {
    const name = "Zander Erwin";
    let index = 0;

    const typingInterval = setInterval(() => {
      setTypedName(name.substring(0, index + 1));
      index++;

      if (index === name.length) {
        clearInterval(typingInterval);
      }
    }, 205);

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 700);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  const handleIntroClick = () => {
    const introScreen = document.querySelector('.intro-screen');
    introScreen.classList.add('fade-out');

    setTimeout(() => {
      setShowIntro(false);
    }, 800);
  };

  const handleScrollTo = (sectionId) => {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
  };

  const openPopup = (item, type) => {
    setSelectedItem(item);
    setPopupType(type);
  };

  const closePopup = () => {
    setSelectedItem(null);
    setPopupType(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
      e.preventDefault();

      const templateParams = {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message
      };

      emailjs.send('service_urtbt14', 'template_8sfqyrn', templateParams, 'PTuqiFviGAOMEb1v5')
          .then((response) => {
              console.log('SUCCESS!', response.status, response.text);
              alert('Your message has been sent!');
              setFormData({ name: '', email: '', message: '' }); // Reset form
          })
          .catch((error) => {
              console.error('FAILED...', error);
              alert('Failed to send message. Please try again later.');
          });
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderPopupContent = () => {
    if (!selectedItem) return null;

    switch (popupType) {
      case 'project':
        return (
          <div className="popup-content">
            <button className="close-button" onClick={closePopup}>
              X
            </button>
            <h2>{selectedItem.title}</h2>
            <div className="popup-section">
              <h3>Overview</h3>
              <p>{selectedItem.details}</p>
            </div>
            <div className="popup-section">
              <h3>Challenges</h3>
              <p>{selectedItem.challenges}</p>
            </div>
            <div className="popup-section">
              <h3>Outcome</h3>
              <p>{selectedItem.outcome}</p>
            </div>
            <div className="popup-section">
              <h3>Technologies Used</h3>
              <div className="tech-stack">
                {selectedItem.tech.map((tech, idx) => (
                  <span key={idx}>{tech}</span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="popup-content">
            <button className="close-button" onClick={closePopup}>
              X
            </button>
            <h2>{selectedItem.title}</h2>
            <h3 className="company-name">{selectedItem.company}</h3>
            <p className="period">{selectedItem.period}</p>
            <div className="popup-section">
              <h3>Key Responsibilities</h3>
              <ul className="responsibilities-list">
                {selectedItem.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
            <div className="popup-section">
              <h3>Technologies Used</h3>
              <div className="tech-stack">
                {selectedItem.technologies.map((tech, idx) => (
                  <span key={idx}>{tech}</span>
                ))}
              </div>
            </div>
            <div className="popup-section">
              <h3>Key Achievement</h3>
              <p>{selectedItem.achievements}</p>
            </div>
          </div>
        );

      case 'idea':
        return (
          <div className="popup-content">
            <button className="close-button" onClick={closePopup}>
              X
            </button>
            <h2>{selectedItem.title}</h2>
            <div className="popup-section">
              <h3>Concept</h3>
              <p>{selectedItem.concept}</p>
            </div>
            <div className="popup-section">
              <h3>Planned Features</h3>
              <ul className="features-list">
                {selectedItem.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="popup-section">
              <h3>Proposed Technologies</h3>
              <div className="tech-stack">
                {selectedItem.technologies.map((tech, idx) => (
                  <span key={idx}>{tech}</span>
                ))}
              </div>
            </div>
            <div className="popup-section">
              <h3>Timeline</h3>
              <p>{selectedItem.timeline}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="App">
      {showIntro && (
        <div className="intro-screen" onClick={handleIntroClick}>
          <h1>
            {typedName}
            <span style={{ opacity: showCursor ? 1 : 0 }}>|</span>
          </h1>
          <p>Click to Enter</p>
        </div>
      )}

    <div className="animated-bg" />
      
      <header>
        <nav>
          <ul>
            <li><a href="#about" onClick={() => handleScrollTo('about')}>About Me</a></li>
            <li><a href="#projects" onClick={() => handleScrollTo('projects')}>Projects</a></li>
            <li><a href="#experience" onClick={() => handleScrollTo('experience')}>Experience</a></li>
            <li><a href="#ideas" onClick={() => handleScrollTo('ideas')}>Future Ideas</a></li>
            <li><a href="#contact" onClick={() => handleScrollTo('contact')}>Contact</a></li>
          </ul>
        </nav>
        <div className="social-links">
          <a href="https://www.linkedin.com/in/zander-erwin-79b376271" target="_blank" rel="noopener noreferrer">
            <img src={linkedinImage} alt="linkedin" />
          </a>
        </div>
      </header>

      <main className="main-content">
        <section id="about" className="about-section section-left">
          <h1>About Me</h1>
          <div className="about-container">
            <img src={profileImage} alt="Zander Erwin" className="profile-pic" />
            <div className="about-text">
              <p>
                As a dedicated student at Wichita State University, I am committed to continuous learning and growth. My passion lies in developing a deep and comprehensive understanding of my field, where I continually strive for excellence and mastery. Through my experiences, I've gained proficiency in various technologies, including PL/SQL, TypeScript, React, and Python. This diverse skill set allows me to approach challenges with a well-rounded perspective and apply innovative solutions in my projects.              </p>
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
              <div className="tile project-tile" key={index} onClick={() => openPopup(project, 'project')}>
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
              <div className="tile experience-tile" key={index} onClick={() => openPopup(exp, 'experience')}>
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
              <div className="tile idea-tile" key={index} onClick={() => openPopup(idea, 'idea')}>
                <h2>{idea.title}</h2>
                <p>{idea.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section">
          <h1>Get In Touch</h1>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Your message here..."
                rows="5"
              />
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </section>

      </main>

      {selectedItem && (
        <div className="popup-overlay" onClick={closePopup}>
          {renderPopupContent()}
        </div>
      )}

      <footer>
        <p>Â© 2025 Zander Erwin</p>
      </footer>
      
    </div>
  );
}

export default App;
