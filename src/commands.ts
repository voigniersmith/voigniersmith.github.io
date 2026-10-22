import { findFile, HOME, listDir, resolveDir } from './fs';
import { start } from './content/text';
import * as guestbook from './guestbook';

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
  run(args: string[], ctx: Ctx, raw: string): void | Promise<void>;
}

const err = (text: string): Line => ({ text, kind: 'error' });
const dim = (text: string): Line => ({ text, kind: 'dim' });

const listGuestbook = async (ctx: Ctx) => {
  ctx.print(dim('reading the guestbook...'));
  const entries = await guestbook.recent();
  if (entries.length === 0) {
    ctx.print('Nobody has signed yet. Be the first: guestbook sign');
    return;
  }
  for (const e of entries) {
    const date = new Date(e.ts).toISOString().slice(0, 10);
    ctx.print({ text: `${date}  ${e.name}`, kind: 'dim' }, `  ${e.message}`);
  }
  ctx.print(' ', dim(`${entries.length} most recent. Leave yours with 'guestbook sign'.`));
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

export const commands: Command[] = [
  {
    name: 'help',
    usage: 'help',
    summary: 'list commands',
    run: (_args, ctx) => {
      ctx.print(' ');
      for (const c of commands.filter((c) => !c.hidden)) {
        ctx.print(`  ${c.usage.padEnd(22)} ${c.summary}`);
      }
      ctx.print(' ', dim('Tab completes, arrow keys walk history.'));
    },
  },
  {
    name: 'ls',
    usage: 'ls',
    summary: 'list the current directory',
    run: (_args, ctx) => ctx.print(listDir(ctx.cwd).join('  ') || dim('(empty)')),
  },
  {
    name: 'cd',
    usage: 'cd <dir>',
    summary: 'change directory',
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
    run: (_args, ctx) => ctx.print(ctx.cwd),
  },
  {
    name: 'cat',
    usage: 'cat <file>',
    summary: 'show a file',
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
    run: ([name], ctx) => {
      if (!name) return ctx.print(err('open: which file? try ls'));
      const file = findFile(ctx.cwd, name);
      if (!file?.url) return ctx.print(err(`open: ${name}: nothing to open`));
      window.open(file.url, '_blank', 'noopener');
      ctx.print({ text: file.url, href: file.url });
    },
  },
  {
    name: 'guestbook',
    usage: 'guestbook [sign]',
    summary: 'read the guestbook, or sign it',
    run: async ([sub], ctx) => {
      if (sub === 'sign') return signGuestbook(ctx);
      if (sub) return ctx.print(err(`guestbook: unknown option '${sub}'. try: guestbook, guestbook sign`));
      return listGuestbook(ctx);
    },
  },
  {
    name: 'whoami',
    usage: 'whoami',
    summary: 'who am I?',
    run: (_args, ctx) => ctx.print('guest. Andrew is the one who lives here.', dim("try 'cat ~/Pictures/me81'")),
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
    name: 'time',
    usage: 'time',
    summary: 'the time, in ISO',
    hidden: true,
    run: (_args, ctx) => ctx.print(new Date().toISOString()),
  },
  {
    name: 'view-source',
    usage: 'view-source',
    summary: 'see how this is built',
    run: (_args, ctx) => {
      const url = 'https://github.com/voigniersmith/voigniersmith.github.io';
      window.open(url, '_blank', 'noopener');
      ctx.print({ text: url, href: url });
    },
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
    name: 'sudo',
    usage: 'sudo',
    summary: '',
    hidden: true,
    run: (_args, ctx) => ctx.print(err("sudo: you're a guest here :)")),
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
      : listDir(cwd).map((f) => f.replace(/\/$/, ''));
  const hits = pool.filter((p) => p.toLowerCase().startsWith(last));
  if (hits.length !== 1) return input;
  parts[parts.length - 1] = hits[0];
  return parts.join(' ');
}
