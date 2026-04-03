import React, { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import profileImage from './images/portfolio_main.jpg';
import './App.css';
import { ThemeSwitch } from './components/ThemeSwitch';
import OrbitCanvas from './components/OrbitCanvas';
import ScrollDots from './components/ScrollDots';

const SECTION_IDS    = ['hero', 'about', 'projects', 'experience', 'cyber', 'resumes', 'ideas', 'contact'];
const SECTION_LABELS = ['Home', 'About', 'Projects', 'Experience', 'Cyber Labs', 'Resumes', 'Ideas', 'Contact'];

const PROJECTS = [
  {
    num: '01',
    title: 'Text Based Game',
    techs: ['C++'],
    description:
      'A command-line adventure game featuring complex navigation systems and robust state management. Players explore multi-room environments, manage an inventory, and engage with an interactive storyline.',
    highlights: [
      'Multi-room navigation system',
      'Inventory and state management',
      'Interactive branching storyline',
    ],
  },
  {
    num: '02',
    title: 'MaddMund Website',
    techs: ['HTML', 'CSS', 'JavaScript'],
    description:
      'My first real web project — built from scratch to learn the fundamentals of HTML, CSS, and vanilla JavaScript. Foundational work that shaped my understanding of the web platform.',
    highlights: [
      'Static site architecture',
      'Vanilla JS DOM manipulation',
      'Responsive design fundamentals',
    ],
  },
  {
    num: '03',
    title: 'Portfolio Website',
    techs: ['React', 'JavaScript', 'CSS', 'GitHub Pages'],
    description:
      'This very portfolio — built with React and deployed on GitHub Pages. Continuously evolved with new design approaches, animations, and content as my skills grew.',
    highlights: [
      'React SPA architecture',
      'CSS animations and theming',
      'GitHub Pages CI/CD deployment',
      'Responsive and accessible',
    ],
  },
  {
    num: '04',
    title: 'AI Fitbot',
    techs: ['HTML', 'CSS', 'JavaScript', 'Python'],
    description:
      'A GPT-powered fitness chatbot that provides personalized workout advice and nutrition guidance. Integrates a Python backend with a clean, conversational front-end interface.',
    highlights: [
      'GPT API integration',
      'Python Flask backend',
      'Conversational UI design',
      'Personalized fitness recommendations',
    ],
  },
  {
    num: '05',
    title: 'Basic Fitness App',
    techs: ['React Native', 'Firebase', 'JavaScript'],
    description:
      'A cross-platform mobile fitness tracker built with React Native and Firebase. Users can create custom workout plans, log exercises, and track their progress over time.',
    highlights: [
      'React Native cross-platform build',
      'Firebase real-time database',
      'Custom workout builder',
      'Progress tracking and history',
    ],
  },
  {
    num: '06',
    title: 'NutriForge',
    techs: ['React Native', 'TypeScript', 'Expo', 'AI/ML'],
    description:
      'An AI-powered mobile nutrition app that bridges the gap between knowing your macro targets and actually executing on them. Handles the full nutrition pipeline — from smart meal recommendations to budget-aware planning — in one adaptive experience.',
    highlights: [
      'AI-driven macro targeting and meal suggestions',
      'Budget and preference-aware meal planning',
      'End-to-end nutrition pipeline in a single app',
      'Cross-platform mobile with React Native + Expo',
    ],
  },
  {
    num: '07',
    title: 'Fitness Streak App',
    techs: ['TypeScript', 'React Native', 'Firebase'],
    description:
      'A gamified fitness mobile app designed to build consistent workout habits through streaks, achievements, and social features. Tracks progress and motivates users with a reward-driven system.',
    highlights: [
      'Streak and achievement reward system',
      'Social challenges and friend leaderboards',
      'Firebase real-time backend',
      'Cross-platform TypeScript/React Native build',
    ],
  },
  {
    num: '08',
    title: 'Car Maintenance Tracker',
    techs: ['TypeScript', 'React'],
    description:
      'A TypeScript web application for tracking vehicle maintenance records, service history, and upcoming service reminders. Helps users stay on top of routine upkeep across multiple vehicles.',
    highlights: [
      'Full service history log per vehicle',
      'Upcoming maintenance reminders',
      'Multi-vehicle support',
      'TypeScript + React frontend',
    ],
  },
  {
    num: '09',
    title: 'Traffic Simulation Dashboard',
    techs: ['Python', 'Flask', 'SUMO', 'Jupyter', 'Docker'],
    description:
      'Senior capstone research project integrating EPA vehicle emissions data (2008–2025) with SUMO traffic simulation to model and visualize urban traffic emissions. Includes a Flask web dashboard and a MATLAB vehicle classification model.',
    highlights: [
      'SUMO traffic simulation with real emission modeling',
      'EPA dataset pipeline covering 2008–2025 vehicle data',
      'Flask dashboard for live traffic and emissions visualization',
      'Dockerized dev environment with CARLA integration',
    ],
  },
];

const EXPERIENCES = [
  {
    role: 'Software Engineer Co-op',
    company: 'Flint Hills Resources (Koch Industries)',
    period: 'Present',
    techs: ['C#', '.NET', 'Visual Basic', 'WinForms'],
    description:
      'Developing and maintaining internal .NET applications for a leading petroleum refining company and subsidiary of Koch Industries.',
    responsibilities: [
      'Build and maintain enterprise applications in C# and Visual Basic on the .NET platform',
      'Work across the full application lifecycle from feature development to deployment',
      'Collaborate with cross-functional teams to gather requirements and deliver software solutions',
      'Debug and resolve issues in legacy Visual Basic codebases',
    ],
  },
  {
    role: 'Software Engineer Intern',
    company: 'Integra Technologies',
    period: 'March 2024 – 2025',
    techs: ['PL/SQL', 'JavaScript', 'Oracle Apex', 'Oracle Forms'],
    description:
      'Built and maintained enterprise software solutions for a leading semiconductor services company.',
    responsibilities: [
      'Handled 10–15 IT requests per week across multiple internal systems',
      'Developed UI improvements in Oracle Apex and Oracle Forms',
      'Wrote and optimized PL/SQL queries for backend database operations',
      'Collaborated with senior engineers on system architecture improvements',
    ],
  },
  {
    role: 'Student Assistant',
    company: 'Wichita State University',
    period: 'May 2023 – March 2024',
    techs: ['Data Analysis', 'Documentation', 'Research'],
    description:
      'Supported aerospace and automotive research through structural integrity testing and data analysis.',
    responsibilities: [
      'Conducted structural integrity tests on aircraft and vehicle seats',
      'Documented testing data and compiled detailed research reports',
      'Assisted faculty researchers with experimental setup and analysis',
      'Maintained accurate records for compliance and research continuity',
    ],
  },
];

const RESUMES = [
  {
    title: 'Software Engineering',
    file: '/Portfolio/resumes/Zander_Erwin_Software_Resume.pdf',
    description:
      'Tailored for software engineering and development roles. Highlights full-stack experience, enterprise .NET development at Koch Industries, and projects spanning React, TypeScript, Python, and C++.',
    highlights: [
      'Full-stack development experience',
      'Enterprise .NET & C# at Flint Hills Resources',
      'React, TypeScript, and Python projects',
      'Cross-platform mobile development',
    ],
  },
  {
    title: 'Cyber Security',
    file: '/Portfolio/resumes/Zander_Erwin_Cyber_Resume.pdf',
    description:
      'Focused on cybersecurity roles and security engineering. Features hands-on competition experience, network security fundamentals, and a security-minded approach to software development.',
    highlights: [
      'Top 300 in NCL (National Cyber League) Team Game',
      'Security-focused software development',
      'Network and system security fundamentals',
      'Capture the flag competition experience',
    ],
  },
];

const IDEAS = [
  {
    title: 'Mobile Workout / Game App',
    techs: ['React Native', 'Firebase', 'Node.js'],
    timeline: '~6 months',
    description:
      'A gamified fitness app that turns workouts into RPG-style progression. Users level up, unlock abilities, and compete with friends — making exercise genuinely addictive.',
    features: ['RPG progression system', 'Social challenges', 'Real-time leaderboards', 'Custom workout creation'],
  },
  {
    title: 'Communication Application',
    techs: ['WebRTC', 'Socket.io', 'React', 'MongoDB'],
    timeline: '~4 months',
    description:
      'A real-time communication platform with video calling, messaging, and collaborative workspaces — a private, self-hostable alternative for small teams.',
    features: ['P2P video via WebRTC', 'Real-time messaging', 'Collaborative workspaces', 'Self-hostable'],
  },
  {
    title: 'Game Engine',
    techs: ['C#', 'OpenGL'],
    timeline: '~12 months',
    description:
      'A 2D/3D game engine built from first principles in C# using OpenGL for rendering — a deep dive into graphics programming, physics simulation, and entity-component systems.',
    features: ['Custom OpenGL renderer', 'Physics simulation', 'Entity-component system', 'Scene editor'],
  },
  {
    title: 'Job Finding Tool',
    techs: ['Python', 'React', 'ML'],
    timeline: '~8 months',
    description:
      'An AI-powered job matching platform that scrapes listings, analyzes your resume, and surfaces roles that are genuinely good fits — not just keyword matches.',
    features: ['Resume parsing and analysis', 'Smart job matching', 'Application tracking', 'Interview prep'],
  },
];

const CYBER_PROJECTS = [
  {
    title: 'Home Lab Environment',
    category: 'Infrastructure',
    techs: ['Kali Linux', 'VirtualBox', 'pfSense', 'Splunk'],
    description:
      'A virtualized security lab for practicing offensive and defensive techniques. Includes segmented networks, vulnerable VMs, and a centralized SIEM for log analysis and threat detection.',
    highlights: [
      'Multi-VM network with VLAN segmentation',
      'Splunk SIEM for centralized log monitoring',
      'Vulnerable targets (DVWA, Metasploitable, HackTheBox)',
      'pfSense firewall with IDS/IPS rules',
    ],
  },
  {
    title: 'National Cyber League (NCL)',
    category: 'CTF Competition',
    techs: ['Wireshark', 'Burp Suite', 'John the Ripper', 'Autopsy'],
    description:
      'Competed in the National Cyber League individual and team games, placing in the top 300 nationally in the Team Game. Solved challenges spanning cryptography, log analysis, OSINT, forensics, and web exploitation.',
    highlights: [
      'Top 300 nationally in NCL Team Game',
      'Cryptography and password cracking challenges',
      'Network traffic analysis with Wireshark',
      'Web app exploitation and OSINT reconnaissance',
    ],
  },
  {
    title: 'Network Traffic Analysis',
    category: 'Blue Team',
    techs: ['Wireshark', 'tcpdump', 'Zeek', 'Python'],
    description:
      'Captured and analyzed network traffic to identify malicious patterns, anomalous behavior, and indicators of compromise. Built Python scripts to automate PCAP parsing and alert generation.',
    highlights: [
      'PCAP analysis for threat hunting',
      'Custom Python scripts for automated detection',
      'Protocol dissection and anomaly identification',
      'Incident report generation from captures',
    ],
  },
  {
    title: 'Vulnerability Assessment Lab',
    category: 'Red Team',
    techs: ['Nmap', 'Metasploit', 'Burp Suite', 'Nikto'],
    description:
      'Conducted vulnerability assessments against intentionally vulnerable applications and machines. Practiced the full penetration testing lifecycle from reconnaissance through exploitation and reporting.',
    highlights: [
      'Nmap scanning and service enumeration',
      'Metasploit exploitation of known CVEs',
      'Web app testing with Burp Suite and Nikto',
      'Structured penetration test reporting',
    ],
  },
];

export default function App() {
  const [introFading,     setIntroFading]     = useState(false);
  const [introVisible,    setIntroVisible]    = useState(true);
  const [activeSection,   setActiveSection]   = useState(0);
  const [selectedProject, setSelectedProject] = useState(0);
  const [formData,        setFormData]        = useState({ name: '', email: '', message: '' });
  const [formStatus,      setFormStatus]      = useState('');

  // Auto-fade intro
  useEffect(() => {
    const t1 = setTimeout(() => setIntroFading(true), 1800);
    const t2 = setTimeout(() => setIntroVisible(false), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Scroll reveals via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Active section tracking for scroll dots
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = SECTION_IDS.indexOf(e.target.id);
            if (idx !== -1) setActiveSection(idx);
          }
        });
      },
      { threshold: 0.35 }
    );
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {
      from_name:  formData.name,
      from_email: formData.email,
      message:    formData.message,
    };
    emailjs
      .send('service_urtbt14', 'template_8sfqyrn', params, 'PTuqiFviGAOMEb1v5')
      .then(() => {
        setFormStatus('success');
        setFormData({ name: '', email: '', message: '' });
      })
      .catch(() => setFormStatus('error'));
  };

  return (
    <div className="app">
      {/* Background layers */}
      <div className="grain-overlay" aria-hidden="true" />
      <div className="dot-matrix"   aria-hidden="true" />

      {/* Intro overlay — auto-fades after ~1.8s */}
      {introVisible && (
        <div className={`intro-overlay${introFading ? ' intro-overlay--fading' : ''}`} aria-hidden="true">
          <div className="intro-overlay__content">
            <span className="intro-overlay__name">Zander Erwin</span>
            <span className="intro-overlay__sub">Software Engineer</span>
          </div>
        </div>
      )}

      {/* Sticky header */}
      <header className="header">
        <div className="header__logo">ZE</div>
        <div className="header__actions">
          <a href="https://github.com/Lyquifyy" target="_blank" rel="noopener noreferrer" className="header__link">
            GitHub
          </a>
          <a href="https://linkedin.com/in/zander-erwin" target="_blank" rel="noopener noreferrer" className="header__link">
            LinkedIn
          </a>
          <ThemeSwitch />
        </div>
      </header>

      {/* Side navigation dots */}
      <ScrollDots
        sections={SECTION_LABELS}
        activeSection={activeSection}
        onDotClick={(i) => scrollTo(SECTION_IDS[i])}
      />

      <main>
        {/* ================================================================
            HERO
            ================================================================ */}
        <section id="hero" className="section hero">
          <div className="hero__content">
            <div className="hero__left">
              <p className="hero__eyebrow reveal">Software Engineer</p>
              <h1 className="hero__name reveal">
                <span>Zander</span>
                <span>Erwin</span>
              </h1>
              <p className="hero__bio reveal">
                Building elegant, high-performing applications at the intersection of engineering and design.
              </p>
              <div className="hero__cta reveal">
                <button className="btn btn--primary" onClick={() => scrollTo('projects')}>
                  View Work
                </button>
                <button className="btn btn--ghost" onClick={() => scrollTo('contact')}>
                  Get In Touch
                </button>
              </div>
            </div>
            <div className="hero__right reveal">
              <OrbitCanvas />
            </div>
          </div>
        </section>

        {/* ================================================================
            ABOUT
            ================================================================ */}
        <section id="about" className="section">
          <div className="section__inner">
            <div className="section__header reveal">
              <span className="section__num">01</span>
              <h2 className="section__title">About Me</h2>
            </div>
            <div className="about__grid">
              <div className="about__photo reveal reveal--left">
                <div className="photo-frame">
                  <img src={profileImage} alt="Zander Erwin" />
                </div>
              </div>
              <div className="about__content">
                <div className="glass-card reveal">
                  <p className="about__text">
                    I'm a software developer and Wichita State University student passionate about building
                    elegant, high-performing applications. My focus lies in bridging complex engineering
                    challenges with intuitive user experiences.
                  </p>
                  <p className="about__text">
                    Currently a Software Engineer Co-op at Flint Hills Resources (Koch Industries), where I
                    build and maintain enterprise .NET applications in C# and Visual Basic. I thrive on solving
                    difficult problems and continuously expanding what I know.
                  </p>
                  <div className="skills">
                    <p className="skills__label">Technical Stack</p>
                    <div className="skills__tags">
                      {['JavaScript', 'React', 'TypeScript', 'Node.js', 'C#', '.NET', 'Python', 'C++', 'PL/SQL'].map(s => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="skills">
                    <p className="skills__label">Security Tools</p>
                    <div className="skills__tags">
                      {['Wireshark', 'Burp Suite', 'Nmap', 'Metasploit', 'Kali Linux', 'Splunk', 'John the Ripper', 'Autopsy'].map(s => (
                        <span key={s} className="skill-tag skill-tag--cyber">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            PROJECTS
            ================================================================ */}
        <section id="projects" className="section">
          <div className="section__inner">
            <div className="section__header reveal">
              <span className="section__num">02</span>
              <h2 className="section__title">Projects</h2>
            </div>
            <div className="projects__split">
              <div className="projects__list reveal">
                {PROJECTS.map((proj, i) => (
                  <button
                    key={proj.num}
                    className={`project-item${selectedProject === i ? ' active' : ''}`}
                    onClick={() => setSelectedProject(i)}
                  >
                    <span className="project-item__num">{proj.num}</span>
                    <span className="project-item__title">{proj.title}</span>
                  </button>
                ))}
              </div>
              <div className="projects__detail reveal reveal--right">
                <div className="glass-card project-detail" key={selectedProject}>
                  <h3 className="project-detail__title">{PROJECTS[selectedProject].title}</h3>
                  <div className="project-detail__techs">
                    {PROJECTS[selectedProject].techs.map(t => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                  <p className="project-detail__desc">{PROJECTS[selectedProject].description}</p>
                  <ul className="project-detail__highlights">
                    {PROJECTS[selectedProject].highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            EXPERIENCE
            ================================================================ */}
        <section id="experience" className="section">
          <div className="section__inner">
            <div className="section__header reveal">
              <span className="section__num">03</span>
              <h2 className="section__title">Experience</h2>
            </div>
            <div className="experience__timeline">
              {EXPERIENCES.map((exp, i) => (
                <div
                  key={i}
                  className="experience-card glass-card reveal"
                  style={{ transitionDelay: `${i * 0.12}s` }}
                >
                  <div className="exp-card__header">
                    <div>
                      <h3 className="exp-card__role">{exp.role}</h3>
                      <p className="exp-card__company">{exp.company}</p>
                    </div>
                    <span className="exp-card__period">{exp.period}</span>
                  </div>
                  <p className="exp-card__desc">{exp.description}</p>
                  <ul className="exp-card__list">
                    {exp.responsibilities.map((r, j) => <li key={j}>{r}</li>)}
                  </ul>
                  <div className="exp-card__techs">
                    {exp.techs.map(t => <span key={t} className="tech-tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            CYBER PROJECTS / LABS
            ================================================================ */}
        <section id="cyber" className="section">
          <div className="section__inner">
            <div className="section__header reveal">
              <span className="section__num">04</span>
              <h2 className="section__title">Cyber Labs</h2>
            </div>
            <p className="cyber__intro reveal">
              Hands-on security projects, CTF competitions, and lab environments where I sharpen offensive and defensive skills.
            </p>
            <div className="cyber__grid">
              {CYBER_PROJECTS.map((proj, i) => (
                <div
                  key={i}
                  className="cyber-card glass-card reveal"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className="cyber-card__header">
                    <h3 className="cyber-card__title">{proj.title}</h3>
                    <span className="cyber-card__category">{proj.category}</span>
                  </div>
                  <p className="cyber-card__desc">{proj.description}</p>
                  <ul className="cyber-card__highlights">
                    {proj.highlights.map((h, j) => (
                      <li key={j}>{h}</li>
                    ))}
                  </ul>
                  <div className="cyber-card__techs">
                    {proj.techs.map(t => <span key={t} className="tech-tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            RESUMES
            ================================================================ */}
        <section id="resumes" className="section">
          <div className="section__inner">
            <div className="section__header reveal">
              <span className="section__num">05</span>
              <h2 className="section__title">Resumes</h2>
            </div>
            <p className="resumes__intro reveal">
              Download a resume tailored to the role you're hiring for.
            </p>
            <div className="resumes__grid">
              {RESUMES.map((resume, i) => (
                <div
                  key={i}
                  className="resume-card glass-card reveal"
                  style={{ transitionDelay: `${i * 0.12}s` }}
                >
                  <div className="resume-card__header">
                    <h3 className="resume-card__title">{resume.title}</h3>
                  </div>
                  <p className="resume-card__desc">{resume.description}</p>
                  <ul className="resume-card__highlights">
                    {resume.highlights.map((h, j) => (
                      <li key={j}>{h}</li>
                    ))}
                  </ul>
                  <a
                    href={resume.file}
                    download
                    className="btn btn--primary resume-card__download"
                  >
                    Download PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            FUTURE IDEAS
            ================================================================ */}
        <section id="ideas" className="section">
          <div className="section__inner">
            <div className="section__header reveal">
              <span className="section__num">06</span>
              <h2 className="section__title">Future Ideas</h2>
            </div>
            <div className="ideas__grid">
              {IDEAS.map((idea, i) => (
                <div
                  key={i}
                  className="idea-card glass-card reveal"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className="idea-card__header">
                    <h3 className="idea-card__title">{idea.title}</h3>
                    <span className="idea-card__timeline">{idea.timeline}</span>
                  </div>
                  <p className="idea-card__desc">{idea.description}</p>
                  <div className="idea-card__features">
                    {idea.features.map((f, j) => <span key={j} className="feature-tag">{f}</span>)}
                  </div>
                  <div className="idea-card__techs">
                    {idea.techs.map(t => <span key={t} className="tech-tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            CONTACT
            ================================================================ */}
        <section id="contact" className="section">
          <div className="section__inner section__inner--narrow">
            <div className="section__header reveal">
              <span className="section__num">07</span>
              <h2 className="section__title">Get In Touch</h2>
            </div>
            <div className="reveal">
              <p className="contact__intro">
                Have a project in mind, a question, or just want to connect? I'd love to hear from you.
              </p>
              <form className="glass-card contact__form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="btn btn--primary">Send Message</button>
                {formStatus === 'success' && (
                  <p className="form-status success">Message sent! I'll be in touch soon.</p>
                )}
                {formStatus === 'error' && (
                  <p className="form-status error">Something went wrong. Please try again.</p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Zander Erwin. Built with React.</p>
      </footer>
    </div>
  );
}
