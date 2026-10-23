import * as pics from './content/pics';
import { dotfiles, projects, readme } from './content/text';

// A file is something `cat` can print and/or `open` can launch.
export interface File {
  lines?: string[];
  art?: boolean; // wide ASCII art: shrink to fit instead of wrapping
  url?: string;
}

const RESUME_URL =
  'https://docs.google.com/document/d/1EPNoUclm8Qs0Vbad_wvpiwvWjLRynip3JYSporWPdGM/edit?usp=sharing';
const INSTAGRAM = 'https://www.instagram.com/andrewnook4/';
const gh = (repo: string) => `https://github.com/voigniersmith/${repo}`;

const project = (name: string, url?: string, pic?: string[]): File => ({
  lines: pic ? [...pic, ' ', ...projects[name]] : projects[name],
  url,
});

const link = (url: string): File => ({ lines: [url], url });
const art = (lines: string[], url?: string): File => ({ lines, art: true, url });

export const tree: Record<string, Record<string, File>> = {
  '~': Object.fromEntries(Object.entries(dotfiles).map(([name, lines]) => [name, { lines }])),
  '~/Applications': {
    // no links: the homelab's pages sit behind Cloudflare Access
    'homelab.sh': project('homelab.sh'),
    'mamacraft.mc': project('mamacraft.mc'),
    'ppps.cpp': project('ppps.cpp', gh('CS535FinalProject')),
    'shell.cpp': project('shell.cpp', gh('Shell'), pics.bash42),
    'omilia.js': project('omilia.js', gh('omilia'), pics.omega7),
    'mymalloc.c': project('mymalloc.c', gh('myMalloc'), pics.floppy19),
    'bugdetect.java': project('bugdetect.java', gh('clang-bug-detector'), pics.butterfly19),
    'voigniersmith.js': project('voigniersmith.js', gh('voigniersmith.github.io')),
    'paging.c': project('paging.c', gh('pagingx86')),
    'chess.c': project('chess.c', gh('parallel_chess'), pics.chessboard),
    'cryptocalc.py': project('cryptocalc.py', gh('cs555-algorand-mpc')),
    'moodify.js': project('moodify.js', 'https://github.com/nguyldo/moodify'),
  },
  '~/Contact': {
    gmail: link('mailto:voigniersmith@gmail.com'),
    school_email: link('mailto:smit3407@purdue.edu'),
    instagram: link(INSTAGRAM),
    github: link('https://github.com/voigniersmith'),
    linkedin: link('https://www.linkedin.com/in/voigniersmith/'),
  },
  '~/Documents': {
    'README.md': { lines: readme, url: gh('voigniersmith.github.io') },
    'resume.txt': art(pics.resume, RESUME_URL),
  },
  '~/Downloads': {},
  '~/Pictures': {
    me81: art(pics.me81, INSTAGRAM),
    me41: art(pics.me41, INSTAGRAM),
    floppy19: art(pics.floppy19, gh('myMalloc')),
    bash42: art(pics.bash42, gh('Shell')),
    butterfly19: art(pics.butterfly19, gh('clang-bug-detector')),
    raspberrypi11: art(pics.raspberrypi11, 'https://www.raspberrypi.org'),
    omega7: art(pics.omega7, gh('omilia')),
    xinu8: art(pics.xinu8, 'https://xinu.cs.purdue.edu'),
    chessboard: art(pics.chessboard, gh('parallel_chess')),
  },
  '~/Resume': {
    'resume.txt': art(pics.resume, RESUME_URL),
  },
};

export const HOME = '~';
export const homeDirs = Object.keys(tree)
  .filter((d) => d !== HOME)
  .map((d) => d.slice(2));

// Resolve a `cd` target relative to cwd. Only one level deep exists.
export function resolveDir(cwd: string, target: string): string | null {
  const t = target.replace(/\/+$/, '');
  if (!t || t === '.') return cwd;
  if (t === '~' || t === '..' || t === '~/') return HOME;
  const abs = t.startsWith('~/') ? t : cwd === HOME ? `~/${t}` : null;
  if (abs === null) {
    // allow `cd ../Pictures` from a subdirectory
    if (t.startsWith('../')) return resolveDir(HOME, t.slice(3));
    return null;
  }
  const match = Object.keys(tree).find((d) => d.toLowerCase() === abs.toLowerCase());
  return match ?? null;
}

// `all` (ls -a) includes dotfiles and the . / .. entries.
export function listDir(dir: string, all = false): string[] {
  const files = Object.keys(tree[dir] ?? {});
  const entries = dir === HOME ? [...files, ...homeDirs.map((d) => d + '/')] : files;
  return all ? ['./', ...(dir === HOME ? [] : ['../']), ...entries] : entries.filter((f) => !f.startsWith('.'));
}

// Find a file by name in cwd, or by `Dir/name` path from home.
export function findFile(cwd: string, name: string): File | null {
  const slash = name.lastIndexOf('/');
  const dir = slash === -1 ? cwd : resolveDir(cwd, name.slice(0, slash));
  const base = slash === -1 ? name : name.slice(slash + 1);
  if (!dir) return null;
  const files = tree[dir] ?? {};
  const key = Object.keys(files).find((f) => f.toLowerCase() === base.toLowerCase());
  return key ? files[key] : null;
}
