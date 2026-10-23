import { findFile, HOME, listDir, resolveDir, tree } from './fs';
import { projects, start } from './content/text';
import { me41 } from './content/pics';
import * as guestbook from './guestbook';
import * as mc from './mc';

export interface Line {
  text: string;
  kind?: 'art' | 'input' | 'error' | 'dim';
  href?: string;
}

export interface Ctx {
  cwd: string;
  setCwd(dir: string): void;
  print(...lines: (string | Line)[]): void;
  clear(): void;
  // Prompt the visitor for one line of input; null if they cancel (Esc / Ctrl+C).
  ask(label: string): Promise<string | null>;
  history: string[];
  setTheme(theme: string): boolean;
}

export interface Command {
  name: string;
  usage: string;
  summary: string;
  hidden?: boolean;
  // `man <name>` page; summary doubles as the one-line description
  man?: { description: string[]; examples?: string[]; seeAlso?: string[] };
  run(args: string[], ctx: Ctx, raw: string): void | Promise<void>;
}

const err = (text: string): Line => ({ text, kind: 'error' });
const dim = (text: string): Line => ({ text, kind: 'dim' });

const loadedAt = Date.now();

const listGuestbook = async (ctx: Ctx, n: number) => {
  ctx.print(dim('reading the guestbook...'));
  const { entries, hasMore } = await guestbook.page(n);
  if (entries.length === 0) {
    ctx.print(n === 1 ? 'Nobody has signed yet. Be the first: guestbook sign' : `There is no page ${n}.`);
    return;
  }
  for (const e of entries) {
    const date = new Date(e.ts).toISOString().slice(0, 10);
    ctx.print({ text: `${date}  ${e.name}`, kind: 'dim' }, `  ${e.message}`);
  }
  const older = hasMore ? ` Older: 'guestbook ${n + 1}'.` : '';
  ctx.print(' ', dim(`Page ${n}, newest first.${older} Leave yours with 'guestbook sign'.`));
};

const signGuestbook = async (ctx: Ctx) => {
  const wait = guestbook.secondsUntilCanSign();
  if (wait > 0) {
    ctx.print(err(`You just signed! Try again in ${wait}s.`));
    return;
  }
  ctx.print(dim('Signing the guestbook. Leave a line blank to cancel.'));
  const name = guestbook.clean((await ctx.ask('name: ')) ?? '', guestbook.NAME_MAX);
  if (!name) return ctx.print(dim('cancelled.'));
  const message = guestbook.clean((await ctx.ask('message: ')) ?? '', guestbook.MESSAGE_MAX);
  if (!message) return ctx.print(dim('cancelled.'));
  ctx.print(dim('signing...'));
  await guestbook.sign(name, message);
  ctx.print(`Thanks, ${name}! You're in the book.`);
};

const openUrl = (url: string, ctx: Ctx) => {
  window.open(url, '_blank', 'noopener');
  ctx.print({ text: url, href: url });
};

const neofetch = (ctx: Ctx) => {
  const mins = Math.floor((Date.now() - loadedAt) / 60_000);
  const info = [
    'guest@voigniersmith',
    '-------------------',
    'OS: voigniersmith v3',
    'Host: GitHub Pages',
    'Kernel: React 18',
    `Shell: guestsh (${commands.filter((c) => !c.hidden).length} commands)`,
    `Uptime: ${mins} min${mins === 1 ? '' : 's'} (since you arrived)`,
    `Resolution: ${window.innerWidth}x${window.innerHeight}`,
    `Theme: ${document.documentElement.dataset.theme ?? 'dark'}`,
    ' ',
    'Owner: Andrew Smith',
    'Work: Software Engineer @ Amazon',
    'Location: New York',
    'Projects: projects',
    'Contact: ls ~/Contact',
    'Guestbook: guestbook sign',
  ];
  const art = me41.slice(0, -1);
  const width = Math.max(...art.map((l) => l.length)) + 3;
  const rows = Math.max(art.length, info.length);
  for (let i = 0; i < rows; i++) {
    ctx.print({ text: (art[i] ?? '').padEnd(width) + (info[i] ?? ''), kind: 'art' });
  }
};

export const commands: Command[] = [
  {
    name: 'help',
    usage: 'help',
    summary: 'list commands',
    man: { description: ['Lists every command with a one-line summary.'], seeAlso: ['man'] },
    run: (_args, ctx) => {
      ctx.print(' ');
      for (const c of commands.filter((c) => !c.hidden)) {
        ctx.print(`  ${c.usage.padEnd(22)} ${c.summary}`);
      }
      ctx.print(' ', dim("Tab completes, arrow keys walk history, 'man <command>' for more."));
    },
  },
  {
    name: 'man',
    usage: 'man <command>',
    summary: 'manual page for a command',
    man: { description: ['Shows the manual page for a command.'], examples: ['man guestbook', 'man ls'] },
    run: ([name], ctx) => {
      const cmd = name && commands.find((c) => c.name === name.toLowerCase() && c.man);
      if (!name) return ctx.print(err('What manual page do you want? e.g. man guestbook'));
      if (!cmd || !cmd.man) return ctx.print(err(`No manual entry for ${name}`));
      const { description, examples, seeAlso } = cmd.man;
      ctx.print(' ', 'NAME', `    ${cmd.name} - ${cmd.summary}`, ' ', 'SYNOPSIS', `    ${cmd.usage}`, ' ', 'DESCRIPTION');
      ctx.print(...description.map((d) => `    ${d}`));
      if (examples?.length) ctx.print(' ', 'EXAMPLES', ...examples.map((e) => `    ${e}`));
      if (seeAlso?.length) ctx.print(' ', 'SEE ALSO', `    ${seeAlso.join(', ')}`);
      ctx.print(' ');
    },
  },
  {
    name: 'ls',
    usage: 'ls [-a] [dir]',
    summary: 'list a directory',
    man: {
      description: ['Lists the current directory, or the one given.', '-a also shows hidden files (the ones starting with a dot).'],
      examples: ['ls', 'ls Applications', 'ls -a'],
      seeAlso: ['cd', 'cat'],
    },
    run: (args, ctx) => {
      const all = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const target = args.find((a) => !a.startsWith('-'));
      const dir = target ? resolveDir(ctx.cwd, target) : ctx.cwd;
      if (!dir) return ctx.print(err(`ls: no such directory: ${target}`));
      ctx.print(listDir(dir, all).join('  ') || dim('(empty)'));
    },
  },
  {
    name: 'cd',
    usage: 'cd <dir>',
    summary: 'change directory',
    man: { description: ['Moves into a directory. cd or cd ~ goes home, cd .. goes up.'], examples: ['cd Pictures', 'cd ..'], seeAlso: ['ls', 'pwd'] },
    run: ([target = HOME], ctx) => {
      const dir = resolveDir(ctx.cwd, target);
      if (dir) ctx.setCwd(dir);
      else ctx.print(err(`cd: no such directory: ${target}`));
    },
  },
  {
    name: 'pwd',
    usage: 'pwd',
    summary: 'print working directory',
    man: { description: ['Prints the directory you are in.'], seeAlso: ['cd'] },
    run: (_args, ctx) => ctx.print(ctx.cwd),
  },
  {
    name: 'cat',
    usage: 'cat <file>',
    summary: 'show a file',
    man: {
      description: ['Prints a file. Paths work from anywhere: cat Applications/chess.c.'],
      examples: ['cat Documents/resume.txt', 'cat Pictures/me81', 'cat .plan'],
      seeAlso: ['ls', 'open'],
    },
    run: ([name], ctx) => {
      if (!name) return ctx.print(err('cat: which file? try ls'));
      const file = findFile(ctx.cwd, name);
      if (!file?.lines) return ctx.print(err(`cat: ${name}: no such file`));
      const kind: Line['kind'] = file.art ? 'art' : undefined;
      ctx.print(...file.lines.map((text) => ({ text, kind, href: !file.art && text === file.url ? file.url : undefined })));
      if (file.url && !file.url.startsWith('mailto:') && file.lines[0] !== file.url) {
        ctx.print(' ', dim(`open ${name} to visit`));
      }
    },
  },
  {
    name: 'open',
    usage: 'open <file>',
    summary: 'open the link behind a file',
    man: {
      description: ['Opens the link behind a file in a new tab: a project repo, a contact, the resume.'],
      examples: ['open Applications/chess.c', 'open Contact/linkedin'],
      seeAlso: ['cat'],
    },
    run: ([name], ctx) => {
      if (!name) return ctx.print(err('open: which file? try ls'));
      const file = findFile(ctx.cwd, name);
      if (!file?.url) return ctx.print(err(`open: ${name}: nothing to open`));
      openUrl(file.url, ctx);
    },
  },
  {
    name: 'projects',
    usage: 'projects',
    summary: "things I've built",
    man: { description: ['Lists the projects in ~/Applications with a one-line description each.'], seeAlso: ['cat', 'open'] },
    run: (_args, ctx) => {
      ctx.print(' ');
      for (const name of Object.keys(tree['~/Applications'])) {
        ctx.print(`  ${name.padEnd(18)} ${projects[name]?.[0] ?? ''}`);
      }
      ctx.print(' ', dim("cat Applications/<name> for details, open Applications/<name> for the code."));
    },
  },
  {
    name: 'guestbook',
    usage: 'guestbook [sign|page]',
    summary: 'read the guestbook, or sign it',
    man: {
      description: [
        'With no arguments, shows the newest entries. A number shows older pages.',
        'guestbook sign asks for your name and a message. Entries are public and',
        `can't be edited afterwards. Names up to ${guestbook.NAME_MAX} characters, messages up to ${guestbook.MESSAGE_MAX}.`,
      ],
      examples: ['guestbook', 'guestbook 2', 'guestbook sign'],
    },
    run: async ([sub], ctx) => {
      if (!sub) return listGuestbook(ctx, 1);
      if (sub === 'sign') return signGuestbook(ctx);
      const n = Number(sub.replace(/^--?page=?/, ''));
      if (Number.isInteger(n) && n >= 1) return listGuestbook(ctx, n);
      return ctx.print(err(`guestbook: unknown option '${sub}'. try: guestbook, guestbook 2, guestbook sign`));
    },
  },
  {
    name: 'neofetch',
    usage: 'neofetch',
    summary: 'system info, sort of',
    man: { description: ['Shows information about this "system" next to a picture of its owner.'], seeAlso: ['whoami'] },
    run: (_args, ctx) => neofetch(ctx),
  },
  {
    name: 'mc',
    usage: 'mc',
    summary: 'is the Minecraft server up?',
    man: {
      description: ['Checks whether my Minecraft server is online.'],
      seeAlso: ['cat Applications/mamacraft.mc'],
    },
    run: async (_args, ctx) => {
      ctx.print(dim('pinging the server...'));
      const s = await mc.status();
      if (!s.online) return ctx.print('MamaCraft is offline right now (or napping).');
      ctx.print(`MamaCraft is up · Minecraft ${s.version ?? '?'} (Java + Bedrock)`);
      if (s.players) ctx.print(`players: ${s.players.online}/${s.players.max}`);
      if (s.motd) ctx.print(dim(s.motd.replace(/\s*\n\s*/g, ' · ')));
    },
  },
  {
    name: 'whoami',
    usage: 'whoami',
    summary: 'who am I?',
    man: { description: ['Tells you who you are here.'], seeAlso: ['neofetch'] },
    run: (_args, ctx) => ctx.print('guest. Andrew is the one who lives here.', dim("try 'neofetch'")),
  },
  {
    name: 'start',
    usage: 'start',
    summary: 'show the welcome message again',
    run: (_args, ctx) => ctx.print(...start),
  },
  {
    name: 'echo',
    usage: 'echo <text>',
    summary: 'print text',
    run: (_args, ctx, raw) => ctx.print(raw.replace(/^\s*echo\s?/i, '')),
  },
  {
    name: 'history',
    usage: 'history',
    summary: 'show what you typed',
    run: (_args, ctx) => ctx.history.forEach((h, i) => ctx.print(`  ${String(i + 1).padStart(3)}  ${h}`)),
  },
  {
    name: 'theme',
    usage: 'theme <light|dark>',
    summary: 'change colours',
    man: { description: ['Switches between the dark and light colour schemes. Your choice is remembered.'], examples: ['theme light'] },
    run: ([theme], ctx) => {
      if (!theme || !ctx.setTheme(theme)) ctx.print(err('theme: pick light or dark'));
    },
  },
  {
    name: 'clear',
    usage: 'clear',
    summary: 'clear the screen',
    run: (_args, ctx) => ctx.clear(),
  },
  {
    name: 'view-source',
    usage: 'view-source',
    summary: 'see how this is built',
    run: (_args, ctx) => openUrl('https://github.com/voigniersmith/voigniersmith.github.io', ctx),
  },
  {
    name: 'time',
    usage: 'time',
    summary: 'the time, in ISO',
    hidden: true,
    run: (_args, ctx) => ctx.print(new Date().toISOString()),
  },
  {
    name: 'sign',
    usage: 'sign',
    summary: 'same as guestbook sign',
    hidden: true,
    run: (_args, ctx) => signGuestbook(ctx),
  },
  {
    name: 'ln',
    usage: 'ln <file>',
    summary: 'old name for open',
    hidden: true,
    run: (args, ctx, raw) => commands.find((c) => c.name === 'open')!.run(args, ctx, raw),
  },
  {
    name: 'll',
    usage: 'll',
    summary: 'ls -a (see .bashrc)',
    hidden: true,
    run: (args, ctx, raw) => commands.find((c) => c.name === 'ls')!.run(['-a', ...args], ctx, raw),
  },
  {
    name: 'sudo',
    usage: 'sudo',
    summary: '',
    hidden: true,
    run: (_args, ctx) => ctx.print(err("sudo: you're a guest here :)")),
  },
  {
    name: 'please',
    usage: 'please',
    summary: '',
    hidden: true,
    run: (_args, ctx) => ctx.print(err("please: still a guest, but thanks for asking nicely")),
  },
];

const easterEggs: Record<string, string> = {
  'hello there': 'General Kenobi...',
};

export async function runLine(raw: string, ctx: Ctx): Promise<void> {
  const line = raw.trim();
  if (!line) return;
  const egg = easterEggs[line.toLowerCase()];
  if (egg) return ctx.print(egg);
  const [name, ...args] = line.split(/\s+/);
  const cmd = commands.find((c) => c.name === name.toLowerCase());
  if (!cmd) return ctx.print(err(`${name}: command not found. try 'help'`));
  try {
    await cmd.run(args, ctx, raw);
  } catch (e) {
    ctx.print(err(`${cmd.name}: ${e instanceof Error ? e.message : String(e)}`));
  }
}

// Tab completion: command names for the first word, file/dir names after.
export function complete(input: string, cwd: string): string {
  const parts = input.split(' ');
  const last = parts[parts.length - 1].toLowerCase();
  const pool =
    parts.length === 1
      ? commands.filter((c) => !c.hidden).map((c) => c.name)
      : listDir(cwd, last.startsWith('.')).map((f) => f.replace(/\/$/, ''));
  const hits = pool.filter((p) => p.toLowerCase().startsWith(last));
  if (hits.length !== 1) return input;
  parts[parts.length - 1] = hits[0];
  return parts.join(' ');
}
