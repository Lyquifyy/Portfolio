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
      'Sentinel, a Rust desktop app, is being built to watch it',
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

// Session replayed in the Security chapter. Every command maps to something
// in the entries above: the NAS over Tailscale, NCL traffic and hash work,
// and CS 352 reconnaissance in a lab range.
export const SESSION = [
  { type: 'cmd',  text: 'tailscale status' },
  { type: 'out',  text: '100.64.0.2   nas          linux   active; direct' },
  { type: 'out',  text: '100.64.0.5   macbook      macOS   -' },
  { type: 'cmd',  text: 'showmount -e nas' },
  { type: 'out',  text: 'Export list for nas:' },
  { type: 'out',  text: '/srv/nas/media   100.64.0.0/10' },
  { type: 'out',  text: '/srv/nas/backup  100.64.0.0/10' },
  { type: 'ok',   text: '[+] 3.6T ext4, automount via fstab, no public ports' },
  { type: 'cmd',  text: 'nmap -sV -T4 10.10.0.0/24' },
  { type: 'out',  text: 'Nmap scan report for lab-01 (10.10.0.12)' },
  { type: 'out',  text: '22/tcp   open  ssh    OpenSSH 8.9p1' },
  { type: 'out',  text: '80/tcp   open  http   Apache httpd 2.4.52' },
  { type: 'cmd',  text: 'tshark -r ncl_round2.pcap -Y "http.request" -T fields -e http.host -e http.request.uri | head' },
  { type: 'warn', text: '[!] 14 requests → /admin/login.php from one source in 3 s' },
  { type: 'cmd',  text: 'john --wordlist=rockyou.txt --format=raw-md5 hashes.txt' },
  { type: 'out',  text: 'Loaded 12 password hashes with no different salts' },
  { type: 'ok',   text: '[+] 9/12 cracked in 00:00:41' },
  { type: 'cmd',  text: 'hashcat -m 0 -a 0 remaining.txt rockyou.txt -r best64.rule' },
  { type: 'ok',   text: '[+] Recovered 3/3. Writeup → ncl-fall-2025.md' },
];
