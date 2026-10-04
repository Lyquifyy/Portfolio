export const PROFILE = {
  name: 'Zander Erwin',
  role: 'Software Engineer',
  focus: 'Full-stack engineering · Security',
  based: 'Wichita, Kansas',
  email: 'zandererwin2023@gmail.com',
  github: 'https://github.com/Lyquifyy',
  githubUser: 'Lyquifyy',
  linkedin: 'https://linkedin.com/in/zander-erwin',
  status: 'Software Engineer Co-op at Flint Hills Resources (Koch)',
  thesis:
    'I build the unglamorous parts well: enterprise .NET that a hundred people lean on, mobile apps with real backends, and a homelab I keep secure because I want to know how things break.',
  education: [
    {
      degree: 'B.S. Computer Science',
      school: 'Wichita State University',
      period: '2023 – 2026',
      note: 'Ethical Hacking (CS 352), Intro to Cybersecurity (CS 356), Cryptography (CS 656)',
    },
    {
      degree: 'A.S. Liberal Arts',
      school: 'Butler Community College',
      period: '2021 – 2023',
    },
  ],
  about: [
    'I graduated from Wichita State in May 2026 with a B.S. in Computer Science, and I have spent the last two and a half years working as an engineer alongside school: first on Oracle ERP systems at Integra Technologies, now modernizing .NET applications at Flint Hills Resources, a Koch company.',
    'Outside work I build mobile products end to end. DineSense brings a daily nutrition budget to restaurant menus; Nova turns workouts into an RPG with guilds, trials, and gear. DineSense is native Swift and Nova is React Native with Expo; both sit on Supabase, and both taught me more about backends, auth, and shipping than any class did.',
    'The security side is not a separate hobby. Running a NAS over a mesh VPN, competing in the National Cyber League, and cracking hashes in CS 352 changed how I write application code: I think about the attacker first.',
  ],
  skills: [
    {
      group: 'Languages',
      items: ['TypeScript', 'JavaScript', 'Swift', 'C#', 'Python', 'C++', 'PL/SQL', 'Bash', 'F#'],
    },
    {
      group: 'Frameworks',
      items: ['React', 'React Native', 'Expo', 'Node.js', '.NET', 'Flask', 'Next.js'],
    },
    {
      group: 'Data',
      items: ['PostgreSQL (Supabase)', 'Oracle', 'Firebase', 'MongoDB', 'SQLite', 'Entity Framework'],
    },
    {
      group: 'Tools & platforms',
      items: ['GitHub', 'Azure DevOps', 'Docker', 'Linux', 'Oracle APEX', 'Oracle Forms', 'VS Code'],
    },
    {
      group: 'Security & networking',
      items: ['Wireshark', 'Nmap', 'John the Ripper', 'Hashcat', 'TCP/IP', 'DNS', 'NFS', 'SSH', 'Tailscale', 'PKI / certificates', 'Firewall config'],
    },
  ],
};

export const RESUMES = [
  {
    id: 'software',
    title: 'Software Engineering',
    file: `${process.env.PUBLIC_URL}/resumes/Zander_Erwin_Software_Resume.pdf`,
    summary:
      'Enterprise .NET and Node.js at Koch, Oracle ERP work at Integra, and two shipped React Native products on Supabase.',
  },
  {
    id: 'cyber',
    title: 'Cyber Security',
    file: `${process.env.PUBLIC_URL}/resumes/Zander_Erwin_Cyber_Resume.pdf`,
    summary:
      'PKI-secured devcontainers, National Cyber League competition, homelab NAS over Tailscale, and ethical hacking coursework.',
  },
];

export const BACKLOG = [
  {
    title: 'Self-hosted communication app',
    techs: ['WebRTC', 'Socket.io', 'React', 'MongoDB'],
    horizon: '~4 months',
    description:
      'Video calls, messaging, and shared workspaces for small teams, deployable on a single box. A private alternative to the usual suspects.',
  },
  {
    title: 'Game engine from first principles',
    techs: ['C#', 'OpenGL'],
    horizon: '~12 months',
    description:
      'A 2D/3D engine with a custom renderer, physics, and an entity-component system. The point is the graphics programming, not the games.',
  },
  {
    title: 'Job matching that reads the resume',
    techs: ['Python', 'React', 'ML'],
    horizon: '~8 months',
    description:
      'Scrape listings, parse the resume, and surface roles that are genuinely good fits instead of keyword hits. Tracks applications along the way.',
  },
];
