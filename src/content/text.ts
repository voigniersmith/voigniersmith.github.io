// Prose is written in short lines for the source's sake; join each paragraph
// back into one line so it wraps to the screen (phones especially).
const reflow = (lines: string[]) =>
  lines
    .join('\n')
    .split(/\n \n/)
    .flatMap((p, i) => (i ? [' ', p.replace(/\n/g, ' ')] : [p.replace(/\n/g, ' ')]));

export const start = reflow([
  'Welcome to voigniersmith.com!',
  ' ',
  "My name is Andrew Smith, and I'm a Software Engineer at Amazon in New York,",
  "where I've been since 2023. I'm passionate about",
  'building scalable systems and exploring the frontiers of generative AI.',
  'Anyhow, welcome to my portfolio website v3.',
  ' ',
  'This is a little shell built in React. Go ahead and explore by typing below.',
  "Type 'help' for the list of commands, or 'projects' to see what I've built.",
  ' ',
  "Passing through? Leave a note with 'guestbook sign'.",
]).concat(' ');

export const readme = [
  'README.md',
  ' ',
  'This site is a pretend shell. Nothing here follows the man pages,',
  "and some of it is hidden. Source: 'open README.md'.",
];

const prose: Record<string, string[]> = {
  'homelab.sh': [
    'My Homelab',
    ' ',
    'A little always-on computer at home where I tinker with',
    'self-hosting and run a Minecraft server for friends.',
  ],
  'mamacraft.mc': [
    'MamaCraft',
    ' ',
    "A Minecraft server I run for friends. Type 'mc' to see if it's up.",
  ],
  'ppps.cpp': [
    'Powder Pixel Physics Simulator',
    ' ',
    'As an introduction to computer graphics, this was',
    'my final project. Inspiration comes from the Powder',
    'Game by Dan-Ball (https://dan-ball.jp/en/javagame/dust/).',
    'My version is implemented using shaders in C++.',
  ],
  'shell.cpp': [
    'A zsh & bash Proprietary Shell',
    ' ',
    'The Purdue CS252 Final Project. Implementing basic features',
    'such as command parsing, pipes, and wildcards in C++.',
  ],
  'omilia.js': [
    'Omilia: A Twitter, Facebook, Reddit Clone',
    ' ',
    'Semester-long project that was meant as an excersise for',
    'the Agile software development cycle. Successfully turned',
    'into a social media application using a FERN stack.',
  ],
  'mymalloc.c': [
    'Proprietary Optimized Memory Allocation Library',
    ' ',
    "An academic example of Doug Lea's Memory Allocator.",
  ],
  'bugdetect.java': [
    'Clang Compiler Static Bug Detector',
    ' ',
    'For my Software Testing course, we implemented a',
    'static bug detector analyzing paired function calls.',
  ],
  'voigniersmith.js': [
    'My Personal Portfolio Website',
    ' ',
    "Initially inspired by Michael D'angelo's personal site,",
    "it's turned into my own idea of a proprietary React shell.",
    ' ',
    'v1 (2020) was a plain React portfolio, v2 (2022) the first terminal,',
    'and in between came a pixel-art desktop OS. v3 (2026) goes back to',
    'basics: one terminal, no animations, and a guestbook you sign from',
    'the command line.',
  ],
  'paging.c': [
    'Enabling Paging for an x86 Intel Galileo Machine',
    ' ',
    "The final project for Purdue's Graduate Operating Systems",
    'course, I implemented and designed my own paging structures',
    'as well as adding support for TLB and Paging in C on the Xinu',
    'OS.',
  ],
  'chess.c': [
    'Parallel Chess',
    ' ',
    'The final project for CS525 Parallel Computing, this program',
    'is chess in C. The parallelism comes with Alpha-Beta pruning',
    'of user-defined-depth search trees to determine the CPU\'s',
    'next move.',
  ],
  'cryptocalc.py': [
    'A Cryptographic Calculator',
    ' ',
    'By manually adding functionality for ElGamal Key Sharing,',
    "Shamir's Secret Sharing, and Algorand Smart Contracts, we",
    'were able to have a client successfully pay multiple parties',
    'to perform calculations without knowing what information',
    'they were computing or what information they were given.',
  ],
  'moodify.js': [
    'Moodify',
    ' ',
    "By using Spotify's API, we were able to implement a",
    'community-based recommendation algorithm that allows',
    "user's to build playlists based on their current mood.",
    'This was my undergrad Senior project.',
  ],
};

export const projects: Record<string, string[]> = Object.fromEntries(
  Object.entries(prose).map(([name, lines]) => [name, reflow(lines)]),
);

// Home directory dotfiles: `ls -a` to find them.
export const dotfiles: Record<string, string[]> = {
  '.bashrc': [
    '# ~/.bashrc',
    "export PS1='guest@voigniersmith:\\w$ '",
    "alias ll='ls -a'",
    "alias please='sudo'",
    '# TODO: stop adding easter eggs',
  ],
  '.plan': [
    "Andrew's .plan",
    ' ',
    '- v3 of this site: back to one terminal, plus a guestbook',
    '- running a Minecraft server for friends',
    '- more secrets in this shell, eventually',
  ],
  '.secret': [
    'You found the secret file!',
    ' ',
    "There's no prize, but you can brag about it in the guestbook:",
    '  guestbook sign',
  ],
};
