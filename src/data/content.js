/* ==========================================================================
   SITE CONTENT
   All copy lives here so section components stay presentational.
   ========================================================================== */

export const SECTIONS = [
  { id: 'hero',       label: 'Home',       num: null },
  { id: 'about',      label: 'About',      num: '01' },
  { id: 'projects',   label: 'Projects',   num: '02' },
  { id: 'experience', label: 'Experience', num: '03' },
  { id: 'cyber',      label: 'Cyber Labs', num: '04' },
  { id: 'resumes',    label: 'Resumes',    num: '05' },
  { id: 'ideas',      label: 'Ideas',      num: '06' },
  { id: 'contact',    label: 'Contact',    num: '07' },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);

export const PROFILE = {
  name: 'Zander Erwin',
  firstName: 'Zander',
  lastName: 'Erwin',
  role: 'Software Engineer',
  initials: 'ZE',
  bio: 'Building elegant, high-performing applications at the intersection of engineering and design.',
  github: 'https://github.com/Lyquifyy',
  linkedin: 'https://linkedin.com/in/zander-erwin',
};

export const EMAILJS = {
  serviceId:  'service_urtbt14',
  templateId: 'template_8sfqyrn',
  publicKey:  'PTuqiFviGAOMEb1v5',
};

export const ABOUT = {
  paragraphs: [
    "I'm a software developer and Wichita State University student passionate about building elegant, high-performing applications. My focus lies in bridging complex engineering challenges with intuitive user experiences.",
    'Currently a Software Engineer Co-op at Flint Hills Resources (Koch Industries), where I build and maintain enterprise .NET applications in C# and Visual Basic. I thrive on solving difficult problems and continuously expanding what I know.',
  ],
  stack: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'C#', '.NET', 'Python', 'C++', 'PL/SQL'],
  security: ['Wireshark', 'Burp Suite', 'Nmap', 'Metasploit', 'Kali Linux', 'Splunk', 'John the Ripper', 'Autopsy'],
};

/* Skill graph rendered by SkillConstellation — recolored to the aurora palette.
   `group` drives cross-graph highlighting on hover. */
export const SKILL_NODES = [
  { name: 'React',      group: 'core',     rgb: '34,211,238'   },
  { name: 'TypeScript', group: 'core',     rgb: '79,70,229'    },
  { name: 'JavaScript', group: 'core',     rgb: '124,58,237'   },
  { name: 'C#',         group: 'core',     rgb: '167,139,250'  },
  { name: '.NET',       group: 'platform', rgb: '129,140,248'  },
  { name: 'Python',     group: 'platform', rgb: '20,184,166'   },
  { name: 'Node.js',    group: 'platform', rgb: '45,212,191'   },
  { name: 'C++',        group: 'platform', rgb: '217,70,239'   },
  { name: 'Wireshark',  group: 'security', rgb: '34,211,238'   },
  { name: 'Burp Suite', group: 'security', rgb: '232,121,249'  },
  { name: 'Nmap',       group: 'security', rgb: '139,92,246'   },
  { name: 'Splunk',     group: 'security', rgb: '94,234,212'   },
  { name: 'Kali Linux', group: 'security', rgb: '192,132,252'  },
];

export const PROJECTS = [
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

export const EXPERIENCES = [
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

export const RESUMES = [
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

export const IDEAS = [
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

export const CYBER_PROJECTS = [
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
