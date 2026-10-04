export const PROFILE = {
  name: 'Zander Erwin',
  role: 'Software Engineer',
  focus: 'Full-stack · Integrations · Security',
  based: 'Wichita, Kansas',
  email: 'zandererwin2023@gmail.com',
  github: 'https://github.com/Lyquifyy',
  githubUser: 'Lyquifyy',
  linkedin: 'https://linkedin.com/in/zander-erwin',
  status: 'Automation & Integration Developer at PEC',
  thesis:
    'I build the unglamorous parts well: integrations that replace manual work, enterprise .NET that people lean on every day, mobile apps with real backends, and a homelab I keep secure because I want to know how things break.',
  education: [
    {
      degree: 'B.S. Computer Science, Minor in Mathematics',
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
    'I graduated from Wichita State in May 2026 with a B.S. in Computer Science and a minor in Mathematics, and I now build automation and integrations at PEC, an engineering consultancy: Revit add-ins and Autodesk Platform Services workflows in C#/.NET, plus TypeScript integrations that connect the business systems other teams depend on. Before that I spent two and a half years as an engineer alongside school, first on Oracle ERP systems at Integra Technologies, then modernizing .NET applications at Flint Hills Resources, a Koch company.',
    'Outside work I build products end to end. DineSense brings a daily nutrition budget to restaurant menus and is in an invite-only pilot, written in native Swift on Supabase. Before it came Nova, a fitness RPG in React Native and Expo with guilds, trials, and gear. Both taught me more about backends, auth, and shipping than any class did.',
    'The security side is not a separate hobby. Running a NAS over a mesh VPN, competing in the National Cyber League, and cracking hashes in CS 352 changed how I write application code: I think about the attacker first.',
  ],
  skills: [
    {
      group: 'Languages',
      items: ['C#', 'TypeScript', 'JavaScript', 'Python', 'Swift', 'SQL', 'PL/SQL', 'C++', 'Bash', 'F#'],
    },
    {
      group: 'Frameworks',
      items: ['.NET / ASP.NET Core', 'Entity Framework Core', 'Node.js', 'React', 'React Native', 'Expo', 'Flask', 'Next.js'],
    },
    {
      group: 'Data',
      items: ['PostgreSQL (Supabase)', 'Oracle', 'SQLite', 'Firebase', 'MongoDB'],
    },
    {
      group: 'Tools & platforms',
      items: ['Azure', 'AWS Lambda', 'Autodesk Platform Services (ACC, Design Automation, Forma)', 'Revit API', 'Microsoft Entra ID', 'GitHub', 'Azure DevOps', 'Docker', 'Linux', 'Oracle APEX'],
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
      'Revit and Autodesk Platform Services automation at PEC, enterprise .NET and Node.js at Koch, Oracle ERP at Integra, and DineSense on Supabase.',
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
