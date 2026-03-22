// ── Portfolio content config ────────────────────────────────────────────────
// Edit this file to update the desktop portfolio content.

export const ABOUT = {
  intro: "Hi! I'm Andrew. Software Engineer @ Amazon NYC.",
  roles: [
    ['company', 'Amazon'],
    ['team',    'NYC'],
    ['degree',  'CS - Purdue'],
    ['focus',   'Software Eng.'],
  ],
  interests: [
    'Coffee', 'Baking', 'Improving', 'Goals',
    'Whales', 'Succulents (at war)', 'Goldfish crackers',
  ],
  languages: [
    ['fav',  'C'],
    ['also', 'JS / Java'],
    ['used', 'C++ React Node SQL'],
  ],
};

export const PROJECTS = [
  {
    title:    'Powder Pixel Physics',
    tag:      'C++/OpenGL',
    desc:     'CS 535 final: shader + GPU demo.',
    download: 'ppps_release.zip',
  },
  {
    title: 'Shell Interpreter',
    tag:   'C/C++',
    desc:  'CLI with pipes, wildcards.',
    href:  'https://en.wikipedia.org/wiki/Bash_(Unix_shell)',
  },
  {
    title: 'Omilia',
    tag:   'React+Fire',
    desc:  'Social site: Twitter+Reddit hybrid.',
    href:  'https://www.youtube.com/watch?v=m_u6P5k0vP0',
  },
  {
    title: 'Memory Allocator',
    tag:   'C',
    desc:  'Doug Lea-style OS memory manager.',
    href:  'http://gee.cs.oswego.edu/dl/html/malloc.html',
  },
  {
    title: 'Bug Detect Tool',
    tag:   'Analysis',
    desc:  'Call graph invariant analysis.',
    href:  'https://scan.coverity.com/about',
  },
  {
    title: 'Paging (XINU)',
    tag:   'C/OS',
    desc:  'x86 paging + demand load in XINU.',
    href:  'https://xinu.cs.purdue.edu/',
  },
  {
    title: 'Parallel Chess AI',
    tag:   'C/pthread',
    desc:  'Minimax chess engine w/ alpha-beta.',
    href:  'https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning',
  },
  {
    title: 'CryptoCalc',
    tag:   'Python',
    desc:  'RSA/AES/hash calculator + explainer.',
    href:  'https://en.wikipedia.org/wiki/Public-key_cryptography',
  },
  {
    title: 'Moodify',
    tag:   'JS/Spotify',
    desc:  'Spotify playlist builder from mood.',
    href:  'https://developer.spotify.com/',
  },
  {
    title: 'This Portfolio',
    tag:   'React/Canvas',
    desc:  "You're looking at it.",
    href:  'https://voigniersmith.com',
  },
];

export const CONTACT = {
  email: 'voigniersmith@gmail.com',
};

export const SOCIALS = [
  { icon: '[M]', label: 'voigniersmith@gmail.com', href: 'mailto:voigniersmith@gmail.com' },
  { icon: '[G]', label: 'github/voigniersmith',    href: 'https://github.com/voigniersmith' },
  { icon: '[L]', label: 'linkedin',                href: 'https://www.linkedin.com/in/voigniersmith/' },
  { icon: '[I]', label: 'instagram',               href: 'https://www.instagram.com/andrewnook4/' },
];

export const FORTUNES = [
  '"It works on my machine." — every developer',
  '"99 little bugs in the code, 99 little bugs... patch one down, compile again... 127 little bugs in the code."',
  '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"Any fool can write code a computer understands. Good programmers write code humans understand." — Martin Fowler',
  '"Make it work, make it right, make it fast." — Kent Beck',
  '"Debugging is twice as hard as writing the code." — Brian Kernighan',
  '"There are 2 hard problems in CS: cache invalidation, naming things, and off-by-1 errors."',
  '"The best code is no code at all." — Jeff Atwood',
  '"sudo make me a sandwich" — xkcd',
  '"Have you tried turning it off and on again?" — IT Crowd',
  '"Walking on water and developing software are easy if both are frozen." — Edward Berard',
  '"Programs must be written for people to read, and only incidentally for machines to execute."',
  '"Weeks of coding can save you hours of planning."',
  '"A user interface is like a joke. If you have to explain it, it\'s not that good."',
  '"Always code as if the person who ends up maintaining your code will be a violent psychopath who knows where you live."',
  '"No code is faster than no code."',
  '"Simplicity is the soul of efficiency." — Austin Freeman',
  '"Talk is cheap. Show me the code." — Linus Torvalds',
  '"The most disastrous thing that you can ever learn is your first programming language." — Alan Kay',
];
