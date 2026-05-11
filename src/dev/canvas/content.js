// ── Window content renderers ───────────────────────────────────────────────
// Each renderer takes (ctx, bx, by, bw, bh, scrollY, hotspots) where
// bx/by/bw/bh is the window body rect in canvas coords.
// Returns total content height so the caller can set up scrolling.

import { fillRect, strokeRect, hline, vline, text, textW, clip, wrapText, drawScrollbar, C, PAD, LINE, SMALL, SCROLLBAR_W, setTheme, getTheme } from './draw';
import { ABOUT, PROJECTS, CONTACT, SOCIALS, FORTUNES } from './portfolio.config';

const CARD_PAD = 3;

// ── Layout constants ────────────────────────────────────────────────────────
const CARD_SPACING      = 3;   // vertical gap between cards
const PROJECT_CARD_H    = 42;
const PICO_CARD_H       = 46;
const CART_CARD_H       = 20;
const ROLE_VALUE_INDENT = 54;  // x-offset for role value column
const LANG_VALUE_INDENT = 38;  // x-offset for language value column
const SOCIAL_ICON_W     = 20;  // width reserved for social icon glyph

function section(ctx, label, x, y, w) {
  text(ctx, label, x, y, C.cyan, SMALL);
  hline(ctx, x, y + SMALL + 2, w, C.borderDim);
  return y + LINE + 1;
}

function hotspot(hotspots, x, y, w, h, bx, by, bh, action) {
  // Only register if visible within the body clip area
  if (y + h > by && y < by + bh) {
    hotspots.push({ x, y, w, h, action });
  }
}

// ── About ──────────────────────────────────────────────────────────────────

export function renderAbout(ctx, bx, by, bw, bh, scrollY, hotspots) {
  const fw  = bw - PAD * 2 - SCROLLBAR_W - 2;
  const lx  = bx + PAD;
  let   cy  = by - scrollY + PAD;

  cy = section(ctx, '// whoami', lx, cy, fw) + 2;
  for (const line of wrapText(ctx, ABOUT.intro, fw, SMALL)) {
    text(ctx, line, lx, cy, C.text, SMALL); cy += LINE;
  }
  cy += 4;

  cy = section(ctx, '// roles', lx, cy, fw) + 2;
  for (const [lbl, val] of ABOUT.roles) {
    text(ctx, lbl, lx, cy, C.yellow, SMALL);
    text(ctx, val, lx + ROLE_VALUE_INDENT, cy, C.text, SMALL);
    cy += LINE;
  }
  cy += 4;

  cy = section(ctx, '// interests', lx, cy, fw) + 2;
  for (const item of ABOUT.interests) {
    text(ctx, `* ${item}`, lx, cy, C.textDim, SMALL);
    cy += LINE;
  }
  cy += 4;

  cy = section(ctx, '// languages', lx, cy, fw) + 2;
  for (const [lbl, val] of ABOUT.languages) {
    text(ctx, lbl,  lx,                    cy, C.yellow, SMALL);
    text(ctx, val,  lx + LANG_VALUE_INDENT, cy, C.text,   SMALL);
    cy += LINE;
  }
  cy += PAD;

  const totalH = cy - (by - scrollY + PAD);
  drawScrollbar(ctx, bx + bw - SCROLLBAR_W - 1, by, bh, scrollY, totalH, bh);
  return totalH;
}

// ── Projects ───────────────────────────────────────────────────────────────

export function renderProjects(ctx, bx, by, bw, bh, scrollY, hotspots) {
  const fw  = bw - PAD * 2 - SCROLLBAR_W - 2;
  const lx  = bx + PAD;
  let   cy  = by - scrollY + PAD;
  const cardH = PROJECT_CARD_H;

  for (const p of PROJECTS) {
    fillRect(ctx,   lx, cy, fw, cardH, C.chrome);
    strokeRect(ctx, lx, cy, fw, cardH, C.borderDim);

    text(ctx, p.title, lx + CARD_PAD, cy + CARD_PAD, C.yellow, SMALL);

    const tagStr = `[${p.tag}]`;
    const tw = textW(ctx, tagStr, SMALL);
    text(ctx, tagStr, lx + fw - tw - CARD_PAD, cy + CARD_PAD, C.magenta, SMALL);

    const descLines = wrapText(ctx, p.desc, fw - CARD_PAD * 2, SMALL);
    text(ctx, descLines[0] || '', lx + CARD_PAD, cy + CARD_PAD + LINE, C.textDim, SMALL);

    const linkLabel = p.download ? '[download]' : '[more]';
    const lw = textW(ctx, linkLabel, SMALL);
    const linkX = lx + fw - lw - CARD_PAD;
    const linkY = cy + cardH - 10;
    text(ctx, linkLabel, linkX, linkY, C.cyan, SMALL);
    hotspot(hotspots, linkX, linkY, lw, 9, bx, by, bh,
      p.download
        ? () => { const a = document.createElement('a'); a.download = p.download; a.href = `/${p.download}`; a.click(); }
        : () => window.open(p.href, '_blank')
    );

    cy += cardH + CARD_SPACING;
  }
  cy += PAD;

  const totalH = cy - (by - scrollY + PAD);
  drawScrollbar(ctx, bx + bw - SCROLLBAR_W - 1, by, bh, scrollY, totalH, bh);
  return totalH;
}

// ── Resume ─────────────────────────────────────────────────────────────────

export function renderResume(ctx, bx, by, bw, bh, scrollY, hotspots) {
  const fw = bw - PAD * 2 - SCROLLBAR_W - 2;
  const lx = bx + PAD;
  let   cy = by - scrollY + PAD;

  cy = section(ctx, '// resume', lx, cy, fw) + 2;
  for (const line of wrapText(ctx, "Resume not hosted here. Email me and I'll send it over.", fw, SMALL)) {
    text(ctx, line, lx, cy, C.textDim, SMALL); cy += LINE;
  }
  cy += 6;

  const email = `> ${CONTACT.email}`;
  text(ctx, email, lx, cy, C.magenta, SMALL);
  hotspot(hotspots, lx, cy, textW(ctx, email, SMALL), 7, bx, by, bh,
    () => window.open(`mailto:${CONTACT.email}`)
  );
  cy += LINE + PAD;

  return cy - (by - scrollY + PAD);
}

// ── Contact ────────────────────────────────────────────────────────────────

export function renderContact(ctx, bx, by, bw, bh, scrollY, hotspots) {
  const fw = bw - PAD * 2 - SCROLLBAR_W - 2;
  const lx = bx + PAD;
  let   cy = by - scrollY + PAD;

  cy = section(ctx, '// contact', lx, cy, fw) + 2;
  for (const line of wrapText(ctx, `Best way: email ${CONTACT.email}`, fw, SMALL)) {
    text(ctx, line, lx, cy, C.textDim, SMALL); cy += LINE;
  }
  cy += 6;

  cy = section(ctx, '// links', lx, cy, fw) + 2;
  for (const s of SOCIALS) {
    text(ctx, s.icon, lx, cy, C.cyan, SMALL);
    const lbl = `> ${s.label}`;
    text(ctx, lbl, lx + SOCIAL_ICON_W, cy, C.magenta, SMALL);
    hotspot(hotspots, lx, cy, SOCIAL_ICON_W + textW(ctx, lbl, SMALL), 7, bx, by, bh,
      () => window.open(s.href, '_blank')
    );
    cy += LINE;
  }
  cy += PAD;

  return cy - (by - scrollY + PAD);
}

// ── Carts ──────────────────────────────────────────────────────────────────

export function renderCarts(ctx, bx, by, bw, bh, scrollY, carts, hotspots, onLaunch) {
  const fw = bw - PAD * 2 - SCROLLBAR_W - 2;
  const lx = bx + PAD;
  let   cy = by - scrollY + PAD;

  cy = section(ctx, '// carts', lx, cy, fw) + 2;

  if (!carts || carts.length === 0) {
    const msg = 'No carts. Export PICO-8 cart as HTML, drop in public/carts/, add to manifest.json.';
    for (const line of wrapText(ctx, msg, fw, SMALL)) {
      text(ctx, line, lx, cy, C.textDim, SMALL); cy += LINE;
    }
  } else {
    for (const cart of carts) {
      fillRect(ctx,   lx, cy, fw, CART_CARD_H, C.chrome);
      strokeRect(ctx, lx, cy, fw, CART_CARD_H, C.borderDim);
      const cartTextY = cy + CARD_PAD + 3;
      text(ctx, cart.title, lx + CARD_PAD, cartTextY, C.yellow, SMALL);
      const runLabel = '[run]';
      const rw = textW(ctx, runLabel, SMALL);
      text(ctx, runLabel, lx + fw - rw - CARD_PAD, cartTextY, C.green, SMALL);
      hotspot(hotspots, lx + fw - rw - CARD_PAD, cartTextY, rw, 7, bx, by, bh,
        () => onLaunch(cart)
      );
      cy += CART_CARD_H + CARD_SPACING;
    }
  }
  cy += PAD;

  return cy - (by - scrollY + PAD);
}

// ── Terminal ───────────────────────────────────────────────────────────────

export const TERM_PROMPT = 'guest@andrew:~$ ';

// ASCII art collection — pre: true means render char-by-char, no word-wrap
const ASCII_ART = {
  me: [
    '      .\'\'\'\'\'\'.',
    '    .\'  .   . \'.',
    '   /  .  \\ /  . \\',
    '  | .  O   O  . |',
    '  |  .   ^   .  |',
    '   \\  . \\_/ .  /',
    '    \'.  .  . .\'',
    '      \'\'.  .\'\'',
    '    /   \\  /   \\',
    '   / aws \\/ nyc \\',
  ],
  floppy: [
    ' ___________',
    '|  _______  |',
    '| |       | |',
    '| |  3.5  | |',
    '| |_______| |',
    '|   _____   |',
    '|  |     |  |',
    '|  |     |  |',
    '|___________|',
  ],
  chess: [
    '   k   K',
    '  \\|/ \\|/',
    '  -*-*-*-',
    '  /|\\ /|\\',
    ' q . . . Q',
    '  \\ . . /',
    '   \\___/',
    '    | |',
    '   _|_|_',
  ],
  bash: [
    '  ____  _   _',
    ' | __ )| \\ | |',
    ' |  _ \\|  \\| |',
    ' | |_) | |\\  |',
    ' |____/|_| \\_|',
    '',
    ' Bourne Again Shell',
  ],
  butterfly: [
    '  \\  / \\  /',
    '   \\/   \\/',
    '   /\\   /\\',
    '  /  \\ /  \\',
    '    \\|/',
    '     *',
    '    /|\\',
  ],
  omega: [
    '   .\'\'\'.',
    ' .\'     \'.',
    '/  o   o  \\',
    '|    ^    |',
    ' \\  ___  /',
    '  \'-----\'',
    ' /|     |\\',
    '/ |     | \\',
  ],
  xinu: [
    ' __  _____ _   _ _   _',
    ' \\ \\/ /_ _| \\ | | | | |',
    '  \\  / | ||  \\| | | | |',
    '  /  \\ | || |\\  | |_| |',
    ' /_/\\_\\___|_| \\_|\\___/',
    '',
    ' Xinu Is Not Unix',
  ],
  raspberrypi: [
    '    .\'\'.',
    '   /    \\',
    '  | () () |',
    '  |  ___  |',
    '   \\.___./\'',
    '    |   |',
    '  __|___|__',
    ' /  Pi 4B  \\',
  ],
  // Easter egg ASCII
  tux: [
    '    .-.',
    '   (o o)',
    '   | O |',
    '  / --- \\',
    ' /|     |\\',
    '/_| |-| |_\\',
    '  |_| |_|',
  ],
  hitchhiker: [
    '  ___  ___',
    ' /   \\/   \\',
    '| DON\'T    |',
    '| PANIC    |',
    ' \\_________/',
    '',
    ' The answer is 42.',
  ],
  pikachu: [
    '  \\_/\\_/',
    ' (o . o)',
    ' =( Y )=',
    '  )   (',
    ' (_)-(_)',
    '',
    ' pika pika!',
  ],
  doge: [
    ' ___________',
    '|  wow      |',
    '|  such cmd |',
    '|  very os  |',
    '|  many px  |',
    '|___________|',
  ],
};

// ── Easter egg triggers ─────────────────────────────────────────────────────

const EASTER_EGGS = {
  'sudo rm -rf /': () => [
    { t: 'nice try.', c: '#e94560' },
    { t: 'this is a canvas, not a real shell.', c: C.textDim },
    { t: ':)', c: C.green },
  ],
  'sudo make me a sandwich': () => [
    { t: 'okay.', c: C.green },
  ],
  'sudo': (raw) => [
    { t: `sudo: permission denied (you're a guest)`, c: '#e94560' },
  ],
  'hello world': () => [
    { t: 'Hello, World!', c: C.green },
  ],
  'hello': () => [
    { t: 'hey! :wave:', c: C.cyan },
  ],
  '42': () => asciiLines('hitchhiker', C.yellow),
  'the answer to life the universe and everything': () => [
    { t: '42', c: C.yellow },
  ],
  'star wars': () => [
    { t: 'A long time ago, in a canvas far far away...', c: C.yellow },
  ],
  'pika': () => asciiLines('pikachu', C.yellow),
  'pikachu': () => asciiLines('pikachu', C.yellow),
  'pokemon': () => asciiLines('pikachu', C.cyan),
  'wow': () => asciiLines('doge', C.yellow),
  'doge': () => asciiLines('doge', C.yellow),
  'git gud': () => [
    { t: 'already on it.', c: C.green },
  ],
  'rm -rf': () => [
    { t: 'you wouldn\'t dare.', c: C.magenta },
  ],
  'hack the planet': () => [
    { t: 'HACK THE PLANET', c: C.green },
    { t: 'HACK THE PLANET', c: C.cyan },
    { t: 'HACK THE PLANET', c: C.magenta },
  ],
  'coffee': () => [
    { t: 'brewing...', c: C.yellow },
    { t: '  ( (', c: C.yellow },
    { t: '   ) )', c: C.yellow },
    { t: ' ....', c: C.textDim },
    { t: ' |   |]', c: C.textDim },
    { t: ' \\   /', c: C.textDim },
    { t: '  ---', c: C.textDim },
  ],
  'matrix': () => [
    { t: 'Wake up, Neo...', c: C.green },
    { t: 'The Matrix has you.', c: C.green },
    { t: 'Follow the white rabbit.', c: C.textDim },
  ],
};

function asciiLines(key, col) {
  return (ASCII_ART[key] || []).map(l => ({ t: l, c: col, pre: true }));
}

// ── Terminal commands ────────────────────────────────────────────────────────

const VALID_APPS  = ['about', 'projects', 'resume', 'contact', 'carts', 'pico-browser', 'terminal', 'github', 'weather', 'paint'];
const VALID_FILES = [
  'about.txt', 'resume.pdf', 'contact.txt',
  'me.txt', 'floppy.txt', 'chess.txt', 'bash.txt',
  'butterfly.txt', 'omega.txt', 'xinu.txt', 'raspberrypi.txt',
];
const VALID_THEMES = ['dark', 'dracula', 'nord', 'gruvbox', 'monokai'];

const TERM_COMMANDS = {
  help() {
    return [
      { t: 'commands:', c: C.cyan },
      { t: '  help           this message', c: C.textDim },
      { t: '  whoami         about me', c: C.textDim },
      { t: '  ls             list apps + files', c: C.textDim },
      { t: '  cat <file>     read a file', c: C.textDim },
      { t: '  open <app>     open a window', c: C.textDim },
      { t: '  neofetch       system info', c: C.textDim },
      { t: '  projects       list projects', c: C.textDim },
      { t: '  theme <name>   switch color theme', c: C.textDim },
      { t: '  fortune        wisdom', c: C.textDim },
      { t: '  cowsay <text>  the cow says', c: C.textDim },
      { t: '  sl             choo choo', c: C.textDim },
      { t: '  nyan           :3', c: C.textDim },
      { t: '  echo <text>    print text', c: C.textDim },
      { t: '  history        command history', c: C.textDim },
      { t: '  time           current time', c: C.textDim },
      { t: '  rps            rock paper scissors', c: C.textDim },
      { t: '  flip           flip a coin', c: C.textDim },
      { t: '  dice [n]       roll a die', c: C.textDim },
      { t: '  clear          clear terminal', c: C.textDim },
    ];
  },
  whoami() {
    return [
      { t: ABOUT.intro, c: C.text },
    ];
  },
  ls(args) {
    return [
      { t: '// apps', c: C.cyan },
      { t: VALID_APPS.map(a => a).join('  '), c: C.green },
      { t: '', c: C.text },
      { t: '// files', c: C.cyan },
      { t: VALID_FILES.join('  '), c: C.yellow },
    ];
  },
  cat(args) {
    const file = args[0] || '';
    if (file === 'about.txt') {
      return [
        { t: ABOUT.intro, c: C.text },
        { t: '', c: C.text },
        ...ABOUT.roles.map(([k, v]) => ({ t: `${k.padEnd(10)} ${v}`, c: C.text })),
        { t: '', c: C.text },
        ...ABOUT.interests.map(i => ({ t: `  * ${i}`, c: C.textDim })),
      ];
    }
    if (file === 'resume.pdf') {
      return [{ t: 'binary file — open the resume window instead', c: C.textDim }];
    }
    if (file === 'contact.txt') {
      return [
        { t: `email: ${CONTACT.email}`, c: C.text },
        { t: '', c: C.text },
        ...SOCIALS.map(s => ({ t: `${s.icon.padEnd(4)} ${s.label}`, c: C.textDim })),
      ];
    }
    // ASCII art files
    const artKey = file.replace('.txt', '');
    if (ASCII_ART[artKey]) {
      return asciiLines(artKey, C.cyan);
    }
    // project files
    const proj = PROJECTS.find(p => p.title.toLowerCase().replace(/ /g, '-') === file.replace('.txt', ''));
    if (proj) {
      return [
        { t: proj.title, c: C.yellow },
        { t: `[${proj.tag}]`, c: C.magenta },
        { t: '', c: C.text },
        { t: proj.desc, c: C.text },
      ];
    }
    return [{ t: `cat: ${file}: no such file`, c: C.magenta }];
  },
  open(args, _ctx, openWin) {
    const id = args[0] || '';
    if (VALID_APPS.includes(id)) {
      if (openWin) openWin(id);
      return [{ t: `opening ${id}...`, c: C.green }];
    }
    return [
      { t: `open: unknown app '${id}'`, c: C.magenta },
      { t: `  try: ${VALID_APPS.join(' ')}`, c: C.textDim },
    ];
  },
  projects() {
    return [
      { t: '// projects', c: C.cyan },
      ...PROJECTS.map(p => ({ t: `  ${p.title.padEnd(22)} [${p.tag}]`, c: C.text })),
    ];
  },
  theme(args) {
    const name = args[0] || '';
    if (!name) {
      return [
        { t: `current theme: ${getTheme()}`, c: C.text },
        { t: `available: ${VALID_THEMES.join(', ')}`, c: C.textDim },
      ];
    }
    if (!VALID_THEMES.includes(name)) {
      return [
        { t: `theme: unknown theme '${name}'`, c: C.magenta },
        { t: `  try: ${VALID_THEMES.join(' ')}`, c: C.textDim },
      ];
    }
    setTheme(name);
    return [{ t: `theme set to ${name}`, c: C.green }];
  },
  echo(args) {
    return [{ t: args.join(' ') || '', c: C.text }];
  },
  history(_args, _ctx, _openWin, term) {
    if (!term || !term.history || term.history.length === 0) {
      return [{ t: 'no history yet', c: C.textDim }];
    }
    return term.history.map((h, i) => ({ t: `  ${String(i + 1).padStart(3)}  ${h}`, c: C.textDim }));
  },
  time() {
    return [{ t: new Date().toLocaleTimeString(), c: C.cyan }];
  },
  rps(args) {
    const choices = ['rock', 'paper', 'scissors'];
    const player  = args[0] ? args[0].toLowerCase() : null;
    const cpu     = choices[Math.floor(Math.random() * 3)];
    if (!player || !choices.includes(player)) {
      return [
        { t: 'usage: rps rock|paper|scissors', c: C.textDim },
      ];
    }
    const wins = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
    const result = player === cpu ? 'tie!'
      : wins[player] === cpu ? 'you win!' : 'cpu wins!';
    return [
      { t: `you:  ${player}`, c: C.cyan },
      { t: `cpu:  ${cpu}`, c: C.magenta },
      { t: result, c: result === 'you win!' ? C.green : result === 'tie!' ? C.yellow : C.border },
    ];
  },
  flip() {
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    return [{ t: `flipping... ${result}`, c: C.yellow }];
  },
  dice(args) {
    const sides = parseInt(args[0], 10) || 6;
    const roll  = Math.floor(Math.random() * sides) + 1;
    return [{ t: `d${sides}: rolled ${roll}`, c: C.yellow }];
  },
  man(args) {
    const cmd = args[0] || '';
    const manPages = {
      help:     'help — list available commands',
      whoami:   'whoami — show who I am',
      ls:       'ls — list apps and files',
      cat:      'cat <file> — print file contents. try: cat me.txt',
      open:     'open <app> — open a desktop window',
      neofetch: 'neofetch — system info with ASCII art',
      projects: 'projects — list all projects',
      theme:    'theme [name] — set color theme: dark dracula nord gruvbox monokai',
      echo:     'echo <text> — print text back',
      history:  'history — show command history',
      time:     'time — show current time',
      rps:      'rps <rock|paper|scissors> — play rock paper scissors',
      flip:     'flip — flip a coin',
      dice:     'dice [n] — roll an n-sided die (default: 6)',
      clear:    'clear — clear the terminal',
    };
    if (manPages[cmd]) return [{ t: manPages[cmd], c: C.text }];
    if (!cmd) return [{ t: 'usage: man <command>', c: C.textDim }];
    return [{ t: `no manual entry for ${cmd}`, c: C.magenta }];
  },
  neofetch() {
    return [
      { t: '         .\'\'\'`.         andrew@portfolio', c: C.cyan,    pre: true },
      { t: '      .\'\'      \'\'.      ----------------', c: C.cyan,    pre: true },
      { t: '    .\'    .---.   \'.    OS:   web/canvas', c: C.text,    pre: true },
      { t: '   /    /       \\   \\   WM:   DesktopCanvas', c: C.text, pre: true },
      { t: '  |    |  O   O  |   |  Shell: terminal.js', c: C.text,  pre: true },
      { t: '  |    |    ^    |   |  Font: Press Start 2P', c: C.text, pre: true },
      { t: '   \\    \\  ___  /   /   Lang: JS/React/C', c: C.text,   pre: true },
      { t: '    \'.   `-----\'  .\'   Role: SWE @ Amazon', c: C.text,  pre: true },
      { t: '      \'\'.      .\'\'     Focus: Soft. Eng.', c: C.text,   pre: true },
      { t: '         `\'\'\'\'\'        ', c: C.cyan,                    pre: true },
    ];
  },
  ln() {
    return [
      { t: '// links', c: C.cyan },
      ...SOCIALS.map(s => ({ t: `  ${s.icon} ${s.label}`, c: C.magenta })),
    ];
  },
  fortune() {
    return [{ t: FORTUNES[Math.floor(Math.random() * FORTUNES.length)], c: C.yellow }];
  },
  cowsay(args) {
    const msg = args.join(' ') || 'moo';
    const len = msg.length;
    return [
      { t: ` ${'_'.repeat(len + 2)}`, c: C.text, pre: true },
      { t: `< ${msg} >`,               c: C.text, pre: true },
      { t: ` ${'-'.repeat(len + 2)}`, c: C.text, pre: true },
      { t: '        \\   ^__^',         c: C.text, pre: true },
      { t: '         \\  (oo)\\_____',   c: C.text, pre: true },
      { t: '            (__)\\      )~', c: C.text, pre: true },
      { t: '                ||----w |', c: C.text, pre: true },
      { t: '                ||     ||', c: C.text, pre: true },
    ];
  },
  sl() {
    return [
      { t: 'sl: command not found', c: C.magenta },
      { t: 'did you mean: ls', c: C.textDim },
      { t: '', c: C.text, pre: true },
      { t: '      ====        ________', c: C.yellow, pre: true },
      { t: '  _D _|  |_______/  loco  \\', c: C.yellow, pre: true },
      { t: '   |(_)-  |  H\\_____|     |', c: C.yellow, pre: true },
      { t: '   /___|  |  H  |   |     |', c: C.yellow, pre: true },
      { t: "  '--'----'--'--'---'-----'", c: C.yellow, pre: true },
      { t: '   o   o   o   o   o   o',   c: C.textDim, pre: true },
    ];
  },
  nyan() {
    return [
      { t: '+      +    +',           c: C.cyan,    pre: true },
      { t: '   +      +',             c: C.magenta, pre: true },
      { t: ',.--\'\'--.,,.--\'\'--.,',  c: C.textDim, pre: true },
      { t: ':  ,----.  |   |  :',     c: C.text,    pre: true },
      { t: ':  | ,--\'  |   |  :   ~', c: C.yellow,  pre: true },
      { t: ':  | \'--,  |   |  :',    c: C.text,    pre: true },
      { t: ':  \'----\'  |   |  :   ~', c: C.yellow,  pre: true },
      { t: "',..--'',,.'..--..'",     c: C.textDim, pre: true },
      { t: '',                         c: C.text,    pre: true },
      { t: 'nyan nyan nyan nyan~',     c: C.magenta },
    ];
  },
  clear() {
    return [{ t: '__CLEAR__', c: '' }];
  },
};

// Run a command string; returns output lines array.
// term is the full term state (for history access).
// openWin is an optional callback to open desktop windows.
export function runTerminalCommand(raw, openWin, term) {
  // Easter egg check (exact match on full trimmed input)
  const lower = raw.trim().toLowerCase();
  if (EASTER_EGGS[lower]) return EASTER_EGGS[lower](raw);
  // Prefix match for 'sudo ...' catch-all
  if (lower.startsWith('sudo ') && EASTER_EGGS['sudo']) return EASTER_EGGS['sudo'](raw);

  const parts = raw.trim().split(/\s+/);
  const cmd   = parts[0].toLowerCase();
  const args  = parts.slice(1);
  if (!cmd) return [];
  const fn = TERM_COMMANDS[cmd];
  if (!fn) return [{ t: `${cmd}: command not found. try 'help'`, c: C.magenta }];
  return fn(args, null, openWin, term);
}

// ── Tab completion ──────────────────────────────────────────────────────────

const ALL_COMMANDS = ['help','whoami','ls','cat','open','neofetch','projects','theme','fortune',
  'cowsay','sl','nyan','echo','history','time','rps','flip','dice','man','ln','clear'];

export function tabComplete(input) {
  const parts = input.trim().split(/\s+/);
  if (parts.length <= 1) {
    // Complete command name
    const prefix = parts[0] || '';
    const matches = ALL_COMMANDS.filter(c => c.startsWith(prefix));
    if (matches.length === 1) return matches[0];
    if (matches.length > 1 && prefix) return matches[0]; // complete to first match
    return input;
  }
  // Complete second argument
  const cmd = parts[0];
  const arg = parts[parts.length - 1];
  let candidates = [];
  if (cmd === 'open')  candidates = VALID_APPS;
  if (cmd === 'cat')   candidates = VALID_FILES;
  if (cmd === 'theme') candidates = VALID_THEMES;
  if (cmd === 'man')   candidates = ALL_COMMANDS;
  const matches = candidates.filter(c => c.startsWith(arg));
  if (matches.length === 1) return `${parts.slice(0, -1).join(' ')} ${matches[0]}`;
  if (matches.length > 1)   return `${parts.slice(0, -1).join(' ')} ${matches[0]}`;
  return input;
}

// Build initial terminal lines shown on first open
export function makeTerminalLines() {
  return [
    { t: 'andrew-portfolio v2.0 — type \'help\' for commands', c: C.cyan },
    { t: '', c: C.text },
  ];
}

export function renderTerminal(ctx, bx, by, bw, bh, term) {
  // term = { lines, input, blink, history, histIdx }
  const lx     = bx + PAD;
  const fw     = bw - PAD * 2;
  let   cy     = by + PAD;
  const maxY   = by + bh - LINE * 2 - PAD;  // reserve space for input row

  // Draw output lines (clip to body)
  clip(ctx, bx, by, bw, bh - LINE - PAD, () => {
    const visLines = Math.max(1, Math.floor((bh - LINE * 2 - PAD * 2) / LINE));
    const start    = Math.max(0, term.lines.length - visLines);
    cy = by + PAD;
    for (let i = start; i < term.lines.length; i++) {
      const line = term.lines[i];
      if (cy > maxY) break;
      if (line.pre) {
        // pre-formatted: render as-is, no word-wrap, monospace-ish by padding
        text(ctx, line.t || ' ', lx, cy, line.c || C.text, SMALL);
        cy += LINE;
      } else {
        const wrapped = wrapText(ctx, line.t || ' ', fw, SMALL);
        for (const wl of wrapped) {
          text(ctx, wl, lx, cy, line.c || C.text, SMALL);
          cy += LINE;
        }
      }
    }
  });

  // Input row
  const inputY = by + bh - LINE - PAD;
  hline(ctx, bx, inputY - 2, bw, C.borderDim);
  const prompt  = TERM_PROMPT;
  const pw      = textW(ctx, prompt, SMALL);
  text(ctx, prompt, lx, inputY, C.green, SMALL);
  text(ctx, term.input, lx + pw, inputY, C.text, SMALL);

  // Blinking cursor
  if (Math.floor(term.blink / 30) % 2 === 0) {
    const cx2 = lx + pw + textW(ctx, term.input, SMALL);
    fillRect(ctx, cx2, inputY, 5, SMALL, C.text);
  }
}

// ── Cart player (iframe via DOM overlay — see DesktopCanvas) ──────────────
// Not rendered on canvas; DesktopCanvas places a DOM iframe aligned to the window body.

// ── Pico-8 Explorer ────────────────────────────────────────────────────────

export const BROWSER_NAV_H = 16;

// No hardcoded BBS carts — add them to manifest.json with a "pid" field.
// Find the pid in the BBS URL: lexaloffle.com/bbs/?pid=XXXXX

// carts = manifest array (file-based local carts shown in // mine).
// bbsFeatured = auto-fetched from BBS API (null = loading, [] = empty).
export function renderPicoBrowser(ctx, bx, by, bw, bh, scrollY, hotspots, browserState, onSelect, onBack, carts, bbsFeatured, bbsLoading, bbsHasMore) {
  const fw       = bw - 2;
  const contentW = fw - SCROLLBAR_W - 2;
  const lx       = bx + 2;

  // ── Nav bar (always visible) ───────────────────────────────────────────
  fillRect(ctx, bx + 1, by, fw, BROWSER_NAV_H, C.chrome);
  hline(ctx, bx + 1, by + BROWSER_NAV_H, fw, C.borderDim);

  let nx = bx + 3;
  const nty = by + Math.floor((BROWSER_NAV_H - SMALL) / 2);

  const backActive = browserState.view === 'cart';
  const backW = Math.floor(textW(ctx, '[<]', SMALL)) + 2;
  text(ctx, '[<]', nx, nty, backActive ? C.cyan : C.borderDim, SMALL);
  if (backActive) hotspots.push({ x: nx, y: by, w: backW, h: BROWSER_NAV_H, action: onBack });
  nx += backW + 2;

  const homeW = Math.floor(textW(ctx, '[H]', SMALL)) + 2;
  text(ctx, '[H]', nx, nty, C.cyan, SMALL);
  hotspots.push({ x: nx, y: by, w: homeW, h: BROWSER_NAV_H, action: onBack });
  nx += homeW + 3;

  vline(ctx, nx, by + 3, BROWSER_NAV_H - 6, C.borderDim);
  nx += 3;

  const cart = browserState.cart;
  const addr = backActive && cart
    ? cart.pid
      ? `bbs.pico-8/${cart.pid}/${cart.title.toLowerCase().replace(/ /g, '-')}`
      : `local:/${cart.file}`
    : 'p-explorer/home';
  clip(ctx, nx + 1, by + 2, fw - (nx - bx) - 4, BROWSER_NAV_H - 4, () => {
    text(ctx, addr, nx + 2, nty, C.textDim, SMALL);
  });

  // ── Content area ───────────────────────────────────────────────────────
  const cy0   = by + BROWSER_NAV_H;
  const bodyH = bh - BROWSER_NAV_H;

  if (browserState.view === 'cart') {
    fillRect(ctx, bx + 1, cy0, fw, bodyH, C.bg);
    return bh;
  }

  // ── Home view ──────────────────────────────────────────────────────────
  const cardW = Math.floor((contentW - PAD * 2 - CARD_SPACING) / 2);
  const cardH = PICO_CARD_H;
  let cy = cy0 - scrollY + PAD;

  // Draws a 2-column card grid; returns new cy (advanced past the grid).
  function cardGrid(items, subBCol, onPlay) {
    const startCy = cy;
    for (let i = 0; i < items.length; i++) {
      const item  = items[i];
      const col   = i % 2;
      const row   = Math.floor(i / 2);
      const cx    = lx + PAD + col * (cardW + CARD_SPACING);
      const cardY = startCy + row * (cardH + CARD_SPACING);

      if (cardY + cardH < cy0 || cardY > cy0 + bodyH) continue;

      fillRect(ctx, cx, cardY, cardW, cardH, C.chrome);
      strokeRect(ctx, cx, cardY, cardW, cardH, C.borderDim);

      const t = item.title;
      text(ctx, t.length > 11 ? t.slice(0, 10) + '~' : t, cx + CARD_PAD, cardY + CARD_PAD, C.yellow, SMALL);

      if (item.author) {
        const a = item.author.length > 10 ? item.author.slice(0, 9) + '~' : item.author;
        text(ctx, a, cx + CARD_PAD, cardY + CARD_PAD + LINE, C.textDim, SMALL);
      }

      const badge = item.tag ? `[${item.tag}]` : item.file ? `[${item.file.split('.').pop()}]` : '[bbs]';
      text(ctx, badge, cx + CARD_PAD, cardY + CARD_PAD + LINE * 2, subBCol, SMALL);

      const pw = Math.floor(textW(ctx, '[play]', SMALL));
      const px = cx + cardW - pw - CARD_PAD;
      const py = cardY + cardH - 11;
      text(ctx, '[play]', px, py, C.green, SMALL);
      if (py + 10 > cy0 && py < cy0 + bodyH) {
        // eslint-disable-next-line no-loop-func
        hotspots.push({ x: px, y: py, w: pw, h: 10, action: () => onPlay(item) });
      }
    }
    return startCy + Math.ceil(items.length / 2) * (cardH + CARD_SPACING);
  }

  // ── Featured carts (auto-fetched from BBS) ───────────────────────────
  cy = section(ctx, '// featured (bbs)', lx + PAD, cy, contentW) + 2;

  if (bbsFeatured === null) {
    text(ctx, 'loading...', lx + PAD, cy, C.textDim, SMALL);
    cy += LINE + 4;
  } else if (bbsFeatured.length === 0) {
    text(ctx, 'could not load bbs carts.', lx + PAD, cy, C.textDim, SMALL);
    cy += LINE + 4;
  } else {
    cy = cardGrid(bbsFeatured, C.magenta, onSelect) + PAD;
    if (bbsLoading) {
      text(ctx, 'loading more...', lx + PAD, cy, C.textDim, SMALL);
      cy += LINE + 4;
    } else if (!bbsHasMore) {
      text(ctx, '-- end --', lx + PAD, cy, C.borderDim, SMALL);
      cy += LINE + 4;
    }
  }

  // ── My carts (local manifest) — show both file-based and pid-based entries ─
  const localCarts = (carts || []).filter(c => c.file || c.pid);
  if (localCarts.length > 0) {
    cy = section(ctx, '// mine', lx + PAD, cy, contentW) + 2;
    cy = cardGrid(localCarts, C.cyan, onSelect) + PAD;
  }

  const totalH = cy - (cy0 - scrollY + PAD);
  drawScrollbar(ctx, bx + bw - SCROLLBAR_W - 1, cy0, bodyH, scrollY, totalH, bodyH);
  return totalH;
}

// ── GitHub Events ──────────────────────────────────────────────────────────

const GH_ICONS = {
  PushEvent:        '^',
  CreateEvent:      '+',
  WatchEvent:       '*',
  ForkEvent:        'F',
  IssuesEvent:      '!',
  PullRequestEvent: 'P',
  DeleteEvent:      'X',
  ReleaseEvent:     'R',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function renderGitHub(ctx, bx, by, bw, bh, scrollY, hotspots, events, loading) {
  const fw = bw - PAD * 2 - SCROLLBAR_W - 2;
  const lx = bx + PAD;
  let   cy = by - scrollY + PAD;

  cy = section(ctx, '// github activity', lx, cy, fw) + 2;

  if (loading || events === null) {
    text(ctx, 'loading...', lx, cy, C.textDim, SMALL); cy += LINE;
  } else if (!events || events.length === 0) {
    text(ctx, 'no events found.', lx, cy, C.textDim, SMALL); cy += LINE;
  } else {
    for (const ev of events) {
      const icon   = GH_ICONS[ev.type] || '?';
      const repo   = (ev.repo?.name || '').replace('voigniersmith/', '');
      const when   = timeAgo(ev.created_at);
      const detail = ev.type === 'PushEvent'
        ? ` (${(ev.payload?.commits || []).length} commit${(ev.payload?.commits || []).length !== 1 ? 's' : ''})`
        : '';

      const y1 = cy;
      text(ctx, `[${icon}]`, lx, y1, C.cyan, SMALL);
      const typeLabel = ev.type.replace('Event', '').toLowerCase() + detail;
      clip(ctx, lx + 20, y1, fw - 60, LINE, () => {
        text(ctx, typeLabel, lx + 20, y1, C.text, SMALL);
      });
      const whenW = textW(ctx, when, SMALL);
      text(ctx, when, lx + fw - whenW, y1, C.textDim, SMALL);

      const y2 = y1 + LINE;
      clip(ctx, lx + 20, y2, fw - 20, LINE, () => {
        text(ctx, repo, lx + 20, y2, C.yellow, SMALL);
      });
      cy = y2 + LINE + 2;
    }
  }

  cy += PAD;
  const totalH = cy - (by - scrollY + PAD);
  drawScrollbar(ctx, bx + bw - SCROLLBAR_W - 1, by, bh, scrollY, totalH, bh);
  return totalH;
}

// ── Weather ─────────────────────────────────────────────────────────────────

const WMO_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Showers', 81: 'Showers', 82: 'Heavy showers',
  95: 'Thunderstorm',
};

export function renderWeather(ctx, bx, by, bw, bh, weather) {
  const fw = bw - PAD * 2;
  const lx = bx + PAD;
  let   cy = by + PAD;

  if (!weather) {
    cy = section(ctx, '// weather', lx, cy, fw) + 2;
    text(ctx, 'enable location to see weather.', lx, cy, C.textDim, SMALL);
    return;
  }

  cy = section(ctx, '// weather', lx, cy, fw) + 2;

  const cond = WMO_CODES[weather.weathercode] || 'Unknown';
  const temp = Math.round(weather.temperature);
  const wind = Math.round(weather.windspeed);

  // Big temperature display
  const tempStr = `${temp}C`;
  const bigSize = 16;
  ctx.fillStyle = temp > 25 ? C.border : temp < 5 ? C.cyan : C.yellow;
  ctx.font = `${bigSize}px "Press Start 2P"`;
  ctx.textBaseline = 'top';
  ctx.fillText(tempStr, lx, cy);
  cy += bigSize + 8;

  text(ctx, cond, lx, cy, C.text, SMALL);      cy += LINE + 4;
  text(ctx, `wind: ${wind} km/h`, lx, cy, C.textDim, SMALL); cy += LINE;
  text(ctx, `feels like ${temp - 2}C`, lx, cy, C.textDim, SMALL); cy += LINE;
}

// ── Paint ───────────────────────────────────────────────────────────────────

const PAINT_PALETTE = [
  C.bg, '#eaeaea', C.green, C.cyan,
  C.yellow, C.magenta, C.border, '#ffffff',
];
const PALETTE_H = 24;

export function renderPaint(ctx, bx, by, bw, bh, paintState, hotspots) {
  if (!paintState.pixels) {
    const cols = paintState.cols;
    const rows = paintState.rows;
    paintState.pixels = new Array(cols * rows).fill(0);
  }

  const { cols, rows } = paintState;
  const gridH = bh - PALETTE_H - 2;
  const zoom  = Math.max(1, Math.floor(Math.min(bw / cols, gridH / rows)));
  const gridW = cols * zoom;
  const ox    = bx + Math.floor((bw - gridW) / 2);

  // Store layout in paintState so mouse handler can use it
  paintState._layout = { ox, oy: by, zoom, cols, rows, gridH: rows * zoom };

  // Draw pixels
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const colorIdx = paintState.pixels[r * cols + c];
      fillRect(ctx, ox + c * zoom, by + r * zoom, zoom, zoom,
        PAINT_PALETTE[colorIdx] || C.bg);
    }
  }

  // Grid lines (subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(ox + c * zoom, by);
    ctx.lineTo(ox + c * zoom, by + rows * zoom);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(ox, by + r * zoom);
    ctx.lineTo(ox + gridW, by + r * zoom);
    ctx.stroke();
  }

  // Palette row
  const py = by + bh - PALETTE_H + 2;
  hline(ctx, bx, py - 2, bw, C.borderDim);
  const swatchSize = PALETTE_H - 6;
  const totalSwatchW = PAINT_PALETTE.length * (swatchSize + 2);
  const px0 = bx + Math.floor((bw - totalSwatchW) / 2);
  for (let i = 0; i < PAINT_PALETTE.length; i++) {
    const sx = px0 + i * (swatchSize + 2);
    fillRect(ctx, sx, py, swatchSize, swatchSize, PAINT_PALETTE[i]);
    if (i === paintState.colorIdx) {
      strokeRect(ctx, sx - 1, py - 1, swatchSize + 2, swatchSize + 2, '#ffffff');
    } else {
      strokeRect(ctx, sx, py, swatchSize, swatchSize, C.borderDim);
    }
    hotspots.push({ x: sx, y: py, w: swatchSize, h: swatchSize,
      action: () => { paintState.colorIdx = i; } });
  }

  // Clear button
  const clearLabel = '[clr]';
  const clrW = textW(ctx, clearLabel, SMALL);
  const clrX = bx + bw - clrW - PAD;
  text(ctx, clearLabel, clrX, py + 4, C.border, SMALL);
  hotspots.push({ x: clrX, y: py, w: clrW, h: swatchSize,
    action: () => { paintState.pixels = new Array(cols * rows).fill(0); } });
}
