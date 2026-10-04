export const SECURITY = [
  {
    title: 'National Cyber League',
    label: 'Competition',
    when: 'Fall 2025',
    techs: ['Wireshark', 'John the Ripper', 'Hashcat', 'OSINT'],
    description:
      'Competed in the NCL Fall 2025 season. Our team placed in the top 1000 nationally across cryptography, network traffic analysis, log analysis, and forensics challenges.',
    highlights: [
      'Decrypted encrypted messages and cracked hashes under time pressure',
      'Traffic analysis with Wireshark, password attacks with John and Hashcat',
    ],
  },
  {
    title: 'Homelab network infrastructure',
    label: 'Infrastructure',
    when: 'Ongoing',
    techs: ['Linux', 'NFS', 'Tailscale', 'ext4', 'Firewall zones'],
    description:
      'A 3.6 TB NAS on Linux with ext4, NFS exports, and fstab automounts, reachable from macOS over a Tailscale mesh VPN. Debugged NFS permissions, UID mapping, and firewall zone rules until it was boring, which is the goal.',
    highlights: [
      'Persistent storage with NFS exports and automated mounts',
      'Secure remote access over a mesh VPN with no exposed ports',
    ],
  },
  {
    title: 'PKI behind the corporate firewall',
    label: 'At work',
    when: '2026',
    techs: ['Docker', 'Devcontainers', 'PKI', 'Certificates'],
    description:
      'At Flint Hills Resources I configured Docker devcontainers with enterprise PKI certificates so package installs succeed behind corporate firewall policy without weakening it.',
    highlights: ['Certificate chains inside containers', 'Secure package installation for the whole team'],
  },
  {
    title: 'Ethical Hacking and Cryptography',
    label: 'Coursework',
    when: 'CS 352 · CS 656',
    techs: ['Nmap', 'Wireshark', 'John the Ripper', 'Hashcat'],
    description:
      'Reconnaissance and host discovery with Nmap, traffic capture and protocol analysis with Wireshark, and dictionary and brute-force hash cracking. Cryptography covered the primitives behind the tools.',
    highlights: ['Lab-environment reconnaissance and enumeration', 'Attack-vector identification from captures'],
  },
];
