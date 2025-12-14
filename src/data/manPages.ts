/**
 * Man page documentation for all terminal commands
 */

export interface ManPage {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  relatedCommands?: string[];
}

export const MAN_PAGES: Record<string, ManPage> = {
  cat: {
    name: 'cat',
    description: 'Display file contents in the terminal',
    usage: 'cat [file_name]',
    examples: [
      'cat ppps.cpp         - View the Powder Pixel Physics Simulator project',
      'cat shell.cpp        - View the proprietary shell implementation',
      'cat resume.txt       - View your resume',
    ],
    relatedCommands: ['ls', 'cd', 'ln'],
  },
  cd: {
    name: 'cd',
    description: 'Change the current directory',
    usage: 'cd [directory_name]',
    examples: [
      'cd ~/Applications    - Navigate to your projects folder',
      'cd ~/Contact         - Navigate to your contact information',
      'cd ~                 - Go back to home directory',
      'cd ..                - Go up one level',
    ],
    relatedCommands: ['ls', 'pwd'],
  },
  ls: {
    name: 'ls',
    description: 'List files and directories in the current directory',
    usage: 'ls [optional_directory]',
    examples: [
      'ls                   - List current directory contents',
      'ls ~/Applications    - List all your projects',
      'ls ~/Contact         - List contact information options',
    ],
    relatedCommands: ['cd', 'pwd'],
  },
  pwd: {
    name: 'pwd',
    description: 'Print the current working directory path',
    usage: 'pwd',
    examples: ['pwd                  - Shows your current location in the filesystem'],
    relatedCommands: ['ls', 'cd'],
  },
  ln: {
    name: 'ln',
    description: 'Open a URL or link associated with a file',
    usage: 'ln [file_name]',
    examples: [
      'ln ppps.cpp          - Open the GitHub repository for the project',
      'ln gmail             - Open your email client',
      'ln github            - Open your GitHub profile',
      'ln linkedin          - Open your LinkedIn profile',
    ],
    relatedCommands: ['cat', 'ls'],
  },
  echo: {
    name: 'echo',
    description: 'Display text in the terminal',
    usage: 'echo [text]',
    examples: [
      'echo Hello World     - Display "Hello World"',
      'echo Type anything   - Echo back whatever you type',
    ],
    relatedCommands: [],
  },
  clear: {
    name: 'clear',
    description: 'Clear the terminal screen',
    usage: 'clear',
    examples: ['clear                - Clears all text from the terminal'],
    relatedCommands: [],
  },
  help: {
    name: 'help',
    description: 'Display a list of all available commands with brief descriptions',
    usage: 'help',
    examples: ['help                 - Shows all available commands and their usage'],
    relatedCommands: ['man'],
  },
  man: {
    name: 'man',
    description: 'Display detailed documentation for a specific command',
    usage: 'man [command_name]',
    examples: [
      'man cat              - View detailed documentation for the cat command',
      'man ls               - Learn how to use the ls command',
      'man help             - Get help about the help command',
    ],
    relatedCommands: ['help'],
  },
  whoami: {
    name: 'whoami',
    description: 'Display information about Andrew Smith (the site owner)',
    usage: 'whoami',
    examples: ['whoami               - Shows biographical information'],
    relatedCommands: ['stats', 'contact'],
  },
  stats: {
    name: 'stats',
    description:
      'Display your personal session statistics (GitHub repo info and visitor stats)',
    usage: 'stats',
    examples: [
      'stats                - Shows GitHub stats and your current session information',
    ],
    relatedCommands: ['global-stats'],
  },
  'global-stats': {
    name: 'global-stats',
    description: 'Display aggregate statistics from all visitors to the site',
    usage: 'global-stats',
    examples: ['global-stats         - Shows global usage statistics'],
    relatedCommands: ['stats'],
  },
  theme: {
    name: 'theme',
    description: 'Change the color theme of the terminal',
    usage: 'theme [theme_name]',
    examples: [
      'theme light          - Switch to light theme',
      'theme dark           - Switch to dark theme',
      'theme dracula        - Switch to Dracula theme',
    ],
    relatedCommands: [],
  },
  time: {
    name: 'time',
    description: 'Display the current time in ISO format',
    usage: 'time',
    examples: ['time                 - Shows the current date and time'],
    relatedCommands: [],
  },
  ps: {
    name: 'ps',
    description: 'Change the command prompt string',
    usage: 'ps [new_prompt]',
    examples: [
      'ps $                 - Set prompt to "$"',
      'ps >>                - Set prompt to ">>"',
      'ps user$             - Set prompt to "user$"',
    ],
    relatedCommands: [],
  },
  history: {
    name: 'history',
    description: 'Display the history of commands you have executed',
    usage: 'history',
    examples: ['history              - Shows all previously executed commands'],
    relatedCommands: [],
  },
  projects: {
    name: 'projects',
    description:
      'Display a list of all your projects with descriptions and GitHub links',
    usage: 'projects',
    examples: ['projects             - Lists all projects with brief descriptions'],
    relatedCommands: ['cat', 'ln'],
  },
  'view-source': {
    name: 'view-source',
    description: 'Navigate to the source code of this terminal website on GitHub',
    usage: 'view-source',
    examples: ['view-source          - Opens this site\'s GitHub repository'],
    relatedCommands: [],
  },
  'view-react-docs': {
    name: 'view-react-docs',
    description: 'Navigate to the React documentation',
    usage: 'view-react-docs',
    examples: ['view-react-docs      - Opens the React JS documentation'],
    relatedCommands: [],
  },
  start: {
    name: 'start',
    description: 'Display the welcome message',
    usage: 'start',
    examples: ['start                - Shows the introductory message'],
    relatedCommands: ['help', 'whoami'],
  },
};

/**
 * Project information with one-line descriptions
 */
export interface Project {
  filename: string;
  name: string;
  description: string;
  githubUrl: string;
}

export const PROJECTS: Project[] = [
  {
    filename: 'ppps.cpp',
    name: 'Powder Pixel Physics Simulator',
    description: 'Computer graphics project - particle physics simulation in C++',
    githubUrl: 'https://github.com/voigniersmith/CS535FinalProject',
  },
  {
    filename: 'shell.cpp',
    name: 'Proprietary Shell',
    description: 'CS252 final project - zsh & bash shell implementation in C++',
    githubUrl: 'https://github.com/voigniersmith/Shell',
  },
  {
    filename: 'omilia.js',
    name: 'Omilia Social Network',
    description: 'Twitter/Facebook/Reddit clone - social media app using FERN stack',
    githubUrl: 'https://github.com/voigniersmith/omilia',
  },
  {
    filename: 'mymalloc.c',
    name: 'Memory Allocator',
    description: 'Doug Lea\'s Memory Allocator - optimized memory allocation library',
    githubUrl: 'https://github.com/voigniersmith/myMalloc',
  },
  {
    filename: 'bugdetect.java',
    name: 'Bug Detector',
    description: 'Clang compiler plugin - static analysis tool for finding paired function call bugs',
    githubUrl: 'https://github.com/voigniersmith/clang-bug-detector',
  },
  {
    filename: 'voigniersmith.js',
    name: 'Personal Portfolio',
    description: 'This website - proprietary React-based terminal interface',
    githubUrl: 'https://github.com/voigniersmith/voigniersmith.github.io',
  },
  {
    filename: 'paging.c',
    name: 'Paging on x86',
    description: 'OS graduate project - TLB and paging support for Xinu on Intel Galileo',
    githubUrl: 'https://github.com/voigniersmith/pagingx86',
  },
  {
    filename: 'chess.c',
    name: 'Parallel Chess',
    description: 'CS525 project - chess AI with parallel alpha-beta pruning',
    githubUrl: 'https://github.com/voigniersmith/parallel_chess',
  },
  {
    filename: 'cryptocalc.py',
    name: 'Cryptographic Calculator',
    description: 'CS555 project - secure multi-party computation using ElGamal & Shamir',
    githubUrl: 'https://github.com/voigniersmith/cs555-algorand-mpc',
  },
  {
    filename: 'moodify.js',
    name: 'Moodify',
    description: 'Spotify API project - mood-based playlist recommendation system',
    githubUrl: 'https://github.com/nguyldo/moodify',
  },
];
