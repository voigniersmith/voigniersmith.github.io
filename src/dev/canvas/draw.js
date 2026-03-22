// ── Canvas drawing primitives ──────────────────────────────────────────────
// All coordinates floored to prevent sub-pixel blurring.

export const W = 640;
export const H = 360;
export const TASKBAR_H   = 18;
export const TITLEBAR_H  = 16;
export const BTN_SIZE    = 6;
export const SCROLLBAR_W = 4;
export const PAD         = 6;
export const LINE        = 14;  // standard line height
export const FONT        = 8;   // body font size (Press Start 2P minimum)
export const SMALL       = 8;   // small labels

// Window control button x-offsets (from window left edge)
export const BTN_CLOSE_X = 3;
export const BTN_MIN_X   = 10;
export const BTN_MAX_X   = 17;

// Desktop icons
export const ICON_SIZE    = 24;
export const ICON_SPACING = 18;  // gap between icon bottom and next icon top

// Stats widget
export const STATS_WIDGET_W    = 110;
export const CPU_WARN_THRESHOLD = 0.8;

export const C = {
  bg:        '#0d0d1a',
  window:    '#1a1a2e',
  chrome:    '#16213e',
  titlebar:  '#0f3460',
  titleBlur: '#1a1a2e',
  border:    '#e94560',
  borderDim: '#3a3a5c',
  text:      '#eaeaea',
  textDim:   '#7a7a9a',
  cyan:      '#00cfff',
  green:     '#33ff33',
  yellow:    '#ffd700',
  magenta:   '#ff6ec7',
  black:     '#000000',
  grid:      'rgba(0,0,0,0.3)',
};

export const THEMES = {
  dark: {
    bg: '#0d0d1a', window: '#1a1a2e', chrome: '#16213e',
    titlebar: '#0f3460', titleBlur: '#1a1a2e',
    border: '#e94560', borderDim: '#3a3a5c',
    text: '#eaeaea', textDim: '#7a7a9a',
    cyan: '#00cfff', green: '#33ff33', yellow: '#ffd700',
    magenta: '#ff6ec7', black: '#000000', grid: 'rgba(0,0,0,0.3)',
  },
  dracula: {
    bg: '#282a36', window: '#1e1f29', chrome: '#21222c',
    titlebar: '#44475a', titleBlur: '#282a36',
    border: '#ff79c6', borderDim: '#6272a4',
    text: '#f8f8f2', textDim: '#6272a4',
    cyan: '#8be9fd', green: '#50fa7b', yellow: '#f1fa8c',
    magenta: '#ff79c6', black: '#000000', grid: 'rgba(0,0,0,0.3)',
  },
  nord: {
    bg: '#2e3440', window: '#3b4252', chrome: '#2e3440',
    titlebar: '#4c566a', titleBlur: '#3b4252',
    border: '#88c0d0', borderDim: '#4c566a',
    text: '#eceff4', textDim: '#d8dee9',
    cyan: '#88c0d0', green: '#a3be8c', yellow: '#ebcb8b',
    magenta: '#b48ead', black: '#2e3440', grid: 'rgba(0,0,0,0.3)',
  },
  gruvbox: {
    bg: '#282828', window: '#3c3836', chrome: '#32302f',
    titlebar: '#504945', titleBlur: '#3c3836',
    border: '#fe8019', borderDim: '#504945',
    text: '#ebdbb2', textDim: '#a89984',
    cyan: '#83a598', green: '#b8bb26', yellow: '#fabd2f',
    magenta: '#d3869b', black: '#1d2021', grid: 'rgba(0,0,0,0.3)',
  },
  monokai: {
    bg: '#272822', window: '#1e1f1c', chrome: '#272822',
    titlebar: '#3e3d32', titleBlur: '#272822',
    border: '#f92672', borderDim: '#49483e',
    text: '#f8f8f2', textDim: '#75715e',
    cyan: '#66d9e8', green: '#a6e22e', yellow: '#e6db74',
    magenta: '#ae81ff', black: '#272822', grid: 'rgba(0,0,0,0.3)',
  },
};

let currentTheme = 'dark';
export function getTheme() { return currentTheme; }

export function setTheme(name) {
  const t = THEMES[name] || THEMES.dark;
  Object.assign(C, t);
  currentTheme = name in THEMES ? name : 'dark';
}

const f = Math.floor;

export function fillRect(ctx, x, y, w, h, col) {
  ctx.fillStyle = col;
  ctx.fillRect(f(x), f(y), f(w), f(h));
}

export function strokeRect(ctx, x, y, w, h, col) {
  ctx.strokeStyle = col;
  ctx.lineWidth = 1;
  ctx.strokeRect(f(x) + 0.5, f(y) + 0.5, f(w) - 1, f(h) - 1);
}

export function hline(ctx, x, y, len, col) {
  ctx.fillStyle = col;
  ctx.fillRect(f(x), f(y), f(len), 1);
}

export function vline(ctx, x, y, len, col) {
  ctx.fillStyle = col;
  ctx.fillRect(f(x), f(y), 1, f(len));
}

export function text(ctx, str, x, y, col, size = FONT) {
  ctx.fillStyle   = col;
  ctx.font        = `${size}px "Press Start 2P"`;
  ctx.textBaseline = 'top';
  ctx.fillText(String(str), f(x), f(y));
}

export function textW(ctx, str, size = FONT) {
  ctx.font = `${size}px "Press Start 2P"`;
  return ctx.measureText(String(str)).width;
}

export function clip(ctx, x, y, w, h, fn) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(f(x), f(y), f(w), f(h));
  ctx.clip();
  fn();
  ctx.restore();
}

export function wrapText(ctx, str, maxW, size = FONT) {
  const words = String(str).split(' ');
  const lines = [];
  let cur = '';

  // Break a single token char-by-char if it won't fit in maxW
  const breakWord = (word) => {
    let seg = '';
    for (const ch of word) {
      const test = seg + ch;
      if (textW(ctx, test, size) > maxW && seg) {
        lines.push(seg);
        seg = ch;
      } else {
        seg = test;
      }
    }
    return seg; // whatever's left (< maxW), caller appends to cur
  };

  for (const word of words) {
    // Word alone is wider than maxW — break it
    if (textW(ctx, word, size) > maxW) {
      if (cur) { lines.push(cur); cur = ''; }
      cur = breakWord(word);
      continue;
    }
    const test = cur ? `${cur} ${word}` : word;
    if (textW(ctx, test, size) > maxW && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ── Desktop background + pixel grid ───────────────────────────────────────

export function drawDesktop(ctx, cw = W, ch = H) {
  fillRect(ctx, 0, 0, cw, ch, C.bg);
}

// ── Window chrome ─────────────────────────────────────────────────────────

export function drawWindowChrome(ctx, win, focused) {
  const { x, y, w, h, title, isMaximized } = win;

  fillRect(ctx, x, y, w, h, C.window);
  fillRect(ctx, x, y, w, TITLEBAR_H, focused ? C.titlebar : C.titleBlur);
  hline(ctx, x, y + TITLEBAR_H, w, focused ? C.cyan : C.borderDim);
  strokeRect(ctx, x, y, w, h, focused ? C.cyan : C.border);

  // Control buttons
  const by = f(y + (TITLEBAR_H - BTN_SIZE) / 2);
  fillRect(ctx, x + BTN_CLOSE_X, by, BTN_SIZE, BTN_SIZE, '#e94560');
  fillRect(ctx, x + BTN_MIN_X,   by, BTN_SIZE, BTN_SIZE, '#ffd700');
  fillRect(ctx, x + BTN_MAX_X,   by, BTN_SIZE, BTN_SIZE, '#33ff33');
  strokeRect(ctx, x + BTN_CLOSE_X, by, BTN_SIZE, BTN_SIZE, C.black);
  strokeRect(ctx, x + BTN_MIN_X,   by, BTN_SIZE, BTN_SIZE, C.black);
  strokeRect(ctx, x + BTN_MAX_X,   by, BTN_SIZE, BTN_SIZE, C.black);

  // Title (clipped) — starts after buttons + small gap
  const titleX = x + BTN_MAX_X + BTN_SIZE + 2;
  clip(ctx, titleX, y, w - (titleX - x) - 3, TITLEBAR_H, () => {
    text(ctx, title, titleX, f(y + (TITLEBAR_H - SMALL) / 2), focused ? C.text : C.textDim, SMALL);
  });

  // Resize handle
  if (!isMaximized) {
    for (let i = 0; i < 3; i++) {
      const len = (3 - i) * 2;
      hline(ctx, x + w - len - 1, y + h - (i * 2) - 2, len, C.borderDim);
    }
  }
}

// ── Scrollbar ─────────────────────────────────────────────────────────────

export function drawScrollbar(ctx, x, y, trackH, scrollY, totalH, visibleH) {
  if (totalH <= visibleH) return;
  const thumbH = Math.max(6, f(trackH * (visibleH / totalH)));
  const thumbY = f((scrollY / Math.max(1, totalH - visibleH)) * (trackH - thumbH));
  fillRect(ctx, x, y, SCROLLBAR_W, trackH, C.chrome);
  fillRect(ctx, x, y + thumbY, SCROLLBAR_W, thumbH, C.borderDim);
}

// ── Taskbar ───────────────────────────────────────────────────────────────

export function drawTaskbar(ctx, openWins, focusedId, time, weather, muted, hotspots, cw = W, ch = H) {
  fillRect(ctx, 0, ch - TASKBAR_H, cw, TASKBAR_H, C.chrome);
  hline(ctx, 0, ch - TASKBAR_H, cw, C.borderDim);

  const ty = ch - TASKBAR_H + f((TASKBAR_H - SMALL) / 2);
  let lx = 2;

  // Exit button
  const exitLabel = '<exit';
  const exitW = f(textW(ctx, exitLabel, SMALL)) + 6;
  fillRect(ctx, lx, ch - TASKBAR_H + 2, exitW, TASKBAR_H - 4, C.chrome);
  strokeRect(ctx, lx, ch - TASKBAR_H + 2, exitW, TASKBAR_H - 4, C.borderDim);
  text(ctx, exitLabel, lx + 3, ty, C.textDim, SMALL);
  hotspots.push({ x: lx, y: ch - TASKBAR_H + 2, w: exitW, h: TASKBAR_H - 4, tag: 'exit' });
  lx += exitW + 3;
  vline(ctx, lx, ch - TASKBAR_H + 2, TASKBAR_H - 4, C.borderDim);
  lx += 3;

  // Open window buttons
  for (const win of openWins) {
    const lbl = win.title.length > 9 ? win.title.slice(0, 8) + '~' : win.title;
    const bw  = Math.min(f(textW(ctx, lbl, SMALL)) + 8, 72);
    const isFocused = win.id === focusedId;
    fillRect(ctx, lx, ch - TASKBAR_H + 2, bw, TASKBAR_H - 4, isFocused ? C.titlebar : C.window);
    strokeRect(ctx, lx, ch - TASKBAR_H + 2, bw, TASKBAR_H - 4, isFocused ? C.cyan : C.borderDim);
    text(ctx, lbl, lx + 4, ty, isFocused ? C.text : C.textDim, SMALL);
    hotspots.push({ x: lx, y: ch - TASKBAR_H + 2, w: bw, h: TASKBAR_H - 4, tag: 'focusWin', id: win.id });
    lx += bw + 2;
  }

  // Right side
  let rx = cw - 3;
  const clockW = f(textW(ctx, time, SMALL));
  rx -= clockW;
  text(ctx, time, rx, ty, C.textDim, SMALL);
  rx -= 4;

  const muteStr = muted ? '[M]' : '[S]';
  const muteW = f(textW(ctx, muteStr, SMALL));
  rx -= muteW;
  text(ctx, muteStr, rx, ty, C.cyan, SMALL);
  hotspots.push({ x: rx, y: ch - TASKBAR_H + 2, w: muteW, h: TASKBAR_H - 4, tag: 'mute' });
  rx -= 5;

  if (weather) {
    const wStr = `${Math.round(weather.temperature)}C`;
    const wW = f(textW(ctx, wStr, SMALL));
    rx -= wW;
    text(ctx, wStr, rx, ty, C.textDim, SMALL);
  }
}

// ── Desktop icons (procedural pixel art) ──────────────────────────────────

export function drawIcon(ctx, id, ix, iy) {
  switch (id) {
    case 'about': {
      // Head
      fillRect(ctx, ix+5, iy+1, 6, 5, C.cyan);
      // Body
      fillRect(ctx, ix+3, iy+7, 10, 6, C.titlebar);
      // Eyes
      fillRect(ctx, ix+6, iy+3, 1, 1, C.bg);
      fillRect(ctx, ix+9, iy+3, 1, 1, C.bg);
      break;
    }
    case 'projects': {
      // Folder body
      fillRect(ctx, ix+1, iy+4, 14, 10, C.titlebar);
      fillRect(ctx, ix+1, iy+4, 14, 10, '#0f3460');
      // Folder tab
      fillRect(ctx, ix+1, iy+2, 6, 3, C.yellow);
      // Lines
      hline(ctx, ix+3, iy+7,  8, C.green);
      hline(ctx, ix+3, iy+9,  10, C.textDim);
      hline(ctx, ix+3, iy+11, 7, C.textDim);
      break;
    }
    case 'resume': {
      // Paper
      fillRect(ctx, ix+3, iy+1, 10, 13, C.window);
      strokeRect(ctx, ix+3, iy+1, 10, 13, C.border);
      // Fold corner
      fillRect(ctx, ix+10, iy+1, 3, 3, C.bg);
      strokeRect(ctx, ix+10, iy+1, 3, 3, C.border);
      // Lines
      hline(ctx, ix+5, iy+5, 6, C.magenta);
      hline(ctx, ix+5, iy+7, 5, C.textDim);
      hline(ctx, ix+5, iy+9, 6, C.textDim);
      hline(ctx, ix+5, iy+11, 4, C.textDim);
      break;
    }
    case 'contact': {
      // Envelope body
      fillRect(ctx, ix+1, iy+3, 14, 9, C.titlebar);
      strokeRect(ctx, ix+1, iy+3, 14, 9, C.border);
      // Envelope flap (V shape)
      fillRect(ctx, ix+1, iy+3, 7, 5, C.magenta);
      fillRect(ctx, ix+8, iy+3, 7, 5, C.magenta);
      fillRect(ctx, ix+7, iy+7, 2, 1, C.bg);
      break;
    }
    case 'carts': {
      // Cartridge body
      fillRect(ctx, ix+2, iy+2, 12, 10, C.chrome);
      strokeRect(ctx, ix+2, iy+2, 12, 10, C.yellow);
      // Label
      fillRect(ctx, ix+4, iy+4, 8, 5, C.bg);
      // Screen pixels
      fillRect(ctx, ix+5, iy+5, 2, 1, C.green);
      fillRect(ctx, ix+9, iy+5, 1, 3, C.border);
      // Connector
      hline(ctx, ix+4, iy+12, 8, C.borderDim);
      break;
    }
    case 'pico-browser': {
      // Globe body
      fillRect(ctx, ix+4, iy+1, 8, 8, C.titlebar);
      strokeRect(ctx, ix+4, iy+1, 8, 8, C.cyan);
      // Latitude lines
      hline(ctx, ix+4, iy+4, 8, C.borderDim);
      hline(ctx, ix+4, iy+7, 8, C.borderDim);
      // Meridian
      vline(ctx, ix+8, iy+1, 8, C.borderDim);
      // Orbit ring (diagonal sweep)
      hline(ctx, ix+1, iy+10, 14, C.yellow);
      hline(ctx, ix+2, iy+11, 12, C.yellow);
      break;
    }
    case 'terminal': {
      // Screen bezel
      fillRect(ctx, ix+1, iy+1, 14, 11, C.chrome);
      strokeRect(ctx, ix+1, iy+1, 14, 11, C.green);
      // Prompt '> _'
      fillRect(ctx, ix+3, iy+4, 2, 1, C.green);
      fillRect(ctx, ix+3, iy+5, 1, 1, C.green);
      fillRect(ctx, ix+3, iy+6, 2, 1, C.green);
      hline(ctx, ix+6, iy+5, 4, C.text);
      // Cursor block
      fillRect(ctx, ix+11, iy+5, 2, 1, C.green);
      // Stand
      fillRect(ctx, ix+6, iy+12, 4, 2, C.chrome);
      hline(ctx, ix+4, iy+13, 8, C.borderDim);
      break;
    }
    case 'github': {
      // Octocat silhouette
      fillRect(ctx, ix+4, iy+1, 8, 7, C.text);
      fillRect(ctx, ix+3, iy+2, 10, 5, C.text);
      fillRect(ctx, ix+6, iy+3, 2, 1, C.bg);
      fillRect(ctx, ix+8, iy+3, 2, 1, C.bg);
      fillRect(ctx, ix+6, iy+5, 4, 1, C.bg);
      // Tentacles
      fillRect(ctx, ix+2, iy+8, 2, 4, C.text);
      fillRect(ctx, ix+5, iy+9, 2, 4, C.text);
      fillRect(ctx, ix+9, iy+9, 2, 4, C.text);
      fillRect(ctx, ix+12, iy+8, 2, 4, C.text);
      break;
    }
    case 'weather': {
      // Sun
      fillRect(ctx, ix+5, iy+2, 4, 4, C.yellow);
      // Sun rays
      hline(ctx, ix+6, iy+1, 2, C.yellow);
      hline(ctx, ix+6, iy+7, 2, C.yellow);
      vline(ctx, ix+4, iy+3, 2, C.yellow);
      vline(ctx, ix+10, iy+3, 2, C.yellow);
      // Cloud
      fillRect(ctx, ix+3, iy+7, 10, 5, C.text);
      fillRect(ctx, ix+5, iy+6, 6, 2, C.text);
      fillRect(ctx, ix+7, iy+5, 3, 2, C.text);
      break;
    }
    case 'paint': {
      // Canvas
      fillRect(ctx, ix+1, iy+1, 12, 10, C.window);
      strokeRect(ctx, ix+1, iy+1, 12, 10, C.borderDim);
      // Colorful pixels on canvas
      fillRect(ctx, ix+3, iy+3, 2, 2, C.border);
      fillRect(ctx, ix+6, iy+3, 2, 2, C.green);
      fillRect(ctx, ix+3, iy+6, 2, 2, C.cyan);
      fillRect(ctx, ix+6, iy+6, 2, 2, C.yellow);
      // Brush
      fillRect(ctx, ix+11, iy+10, 2, 4, C.textDim);
      fillRect(ctx, ix+12, iy+13, 1, 1, C.cyan);
      break;
    }
    default:
      fillRect(ctx, ix+2, iy+2, 12, 12, C.chrome);
      strokeRect(ctx, ix+2, iy+2, 12, 12, C.cyan);
  }
}

export function drawDesktopIcons(ctx, icons, hotspots) {
  let iy = 10;
  const ix      = 5;
  const spacing = ICON_SIZE + ICON_SPACING;
  for (const icon of icons) {
    drawIcon(ctx, icon.id, ix, iy);
    const lw = f(textW(ctx, icon.label, SMALL));
    text(ctx, icon.label, Math.max(1, f(ix + ICON_SIZE / 2 - lw / 2)), iy + ICON_SIZE + 2, C.text, SMALL);
    hotspots.push({ x: ix, y: iy, w: ICON_SIZE, h: ICON_SIZE + SMALL + 4, tag: 'icon', id: icon.id });
    iy += spacing;
  }
}

// ── Stats widget ──────────────────────────────────────────────────────────

const STATS_LABEL_W = 38;
const STATS_BAR_W   = 38;

export function drawStatsWidget(ctx, stats, cw = W) {
  const rowH = SMALL + 5;
  const wh   = 5 * rowH + 6;
  const wx   = cw - STATS_WIDGET_W - 4;
  const wy   = 4;

  fillRect(ctx, wx, wy, STATS_WIDGET_W, wh, C.chrome);
  strokeRect(ctx, wx, wy, STATS_WIDGET_W, wh, C.borderDim);

  const rows = [
    { label: 'CPU',   value: `${stats.cpu.toFixed(0)}%`,  bar: stats.cpu / 100 },
    { label: 'CORES', value: String(stats.cores) },
    { label: 'RAM',   value: `${stats.ram}GB` },
    { label: 'HEAP',  value: stats.heap ? `${stats.heap}MB` : '--' },
    { label: 'UP',    value: stats.uptime },
  ];

  let ry = wy + 3;
  for (const row of rows) {
    text(ctx, row.label, wx + 2, ry, C.cyan, SMALL);
    if (row.bar !== undefined) {
      const barX = wx + STATS_LABEL_W;
      fillRect(ctx, barX, ry + 1, STATS_BAR_W, 5, C.bg);
      fillRect(ctx, barX, ry + 1, f(STATS_BAR_W * row.bar), 4, row.bar > CPU_WARN_THRESHOLD ? C.border : C.green);
      text(ctx, row.value, barX + STATS_BAR_W + 2, ry, C.text, SMALL);
    } else {
      text(ctx, row.value, wx + STATS_LABEL_W, ry, C.text, SMALL);
    }
    ry += rowH;
  }
}

// ── Toast notifications ────────────────────────────────────────────────────

const TOAST_W  = 160;
const TOAST_H  = 18;
const TOAST_PAD = 4;

export function drawToasts(ctx, toasts, cw, ch) {
  const f   = Math.floor;
  const visible = toasts.filter(t => t.ttl > 0);
  for (let i = 0; i < visible.length; i++) {
    const t    = visible[i];
    const fade = Math.min(1, t.ttl / 20);   // fade out in last 20 frames
    const tx   = cw - TOAST_W - 4;
    const ty   = ch - TASKBAR_H - TOAST_H * (i + 1) - 4 * (i + 1);

    ctx.save();
    ctx.globalAlpha = fade;
    fillRect(ctx, tx, ty, TOAST_W, TOAST_H, '#16213e');
    ctx.strokeStyle = '#3a3a5c';
    ctx.lineWidth = 1;
    ctx.strokeRect(f(tx) + 0.5, f(ty) + 0.5, TOAST_W - 1, TOAST_H - 1);
    // Accent bar
    fillRect(ctx, tx, ty, 2, TOAST_H, '#00cfff');
    // Message (clipped)
    ctx.save();
    ctx.beginPath();
    ctx.rect(f(tx) + TOAST_PAD + 2, f(ty), TOAST_W - TOAST_PAD - 4, TOAST_H);
    ctx.clip();
    ctx.fillStyle = '#eaeaea';
    ctx.font      = `6px "Press Start 2P"`;
    ctx.textBaseline = 'middle';
    ctx.fillText(String(t.msg), f(tx) + TOAST_PAD + 4, f(ty) + TOAST_H / 2);
    ctx.restore();
    ctx.restore();

    t.ttl--;
  }
  // Prune dead toasts
  toasts.splice(0, toasts.length, ...toasts.filter(t => t.ttl > 0));
}

// ── Screensaver — matrix rain ───────────────────────────────────────────────

const SS_CHARS = '01ABCDEF!@#$<>?+-=~'.split('');

export function initScreensaver(cw, ch) {
  const charW = FONT + 2;
  const numCols = Math.floor(cw / charW);
  return {
    tick: 0,
    charW,
    cols: Array.from({ length: numCols }, () => ({
      headY: Math.random() * ch,
      speed: 0.5 + Math.random() * 1.5,
      length: 6 + Math.floor(Math.random() * 10),
    })),
  };
}

export function drawScreensaver(ctx, ss, cw, ch) {
  fillRect(ctx, 0, 0, cw, ch, '#000000');
  ctx.font = `${FONT}px "Press Start 2P"`;
  ctx.textBaseline = 'top';

  const { cols, charW } = ss;
  const rowH = FONT + 2;

  for (let ci = 0; ci < cols.length; ci++) {
    const col = cols[ci];
    const cx  = ci * charW;

    col.headY += col.speed;
    if (col.headY > ch + col.length * rowH) {
      col.headY = -Math.random() * 60;
      col.speed  = 0.5 + Math.random() * 1.5;
      col.length = 6 + Math.floor(Math.random() * 10);
    }

    for (let i = 0; i < col.length; i++) {
      const cy = Math.floor(col.headY) - i * rowH;
      if (cy < -rowH || cy > ch) continue;
      const t = 1 - i / col.length;
      ctx.fillStyle = i === 0
        ? '#ccffcc'
        : `rgb(0,${Math.floor(t * 170 + 30)},0)`;
      ctx.fillText(SS_CHARS[Math.floor(Math.random() * SS_CHARS.length)], cx, cy);
    }
  }

  ss.tick++;

  // "press any key" blink
  if (Math.floor(ss.tick / 40) % 2 === 0) {
    const msg = 'press any key';
    ctx.fillStyle = 'rgba(0,207,255,0.85)';
    const mw = ctx.measureText(msg).width;
    ctx.fillText(msg, Math.floor((cw - mw) / 2), ch - FONT - 8);
  }
}

// ── Pixel-art cursor ───────────────────────────────────────────────────────
// 7×11 arrow cursor bitmap (1=white outline, 2=black fill, 0=transparent)
const CURSOR_MAP = [
  [2,0,0,0,0,0,0],
  [2,2,0,0,0,0,0],
  [2,1,2,0,0,0,0],
  [2,1,1,2,0,0,0],
  [2,1,1,1,2,0,0],
  [2,1,1,1,1,2,0],
  [2,1,1,1,1,1,2],
  [2,1,1,2,2,0,0],
  [2,1,2,0,2,2,0],
  [2,2,0,0,0,2,2],
  [2,0,0,0,0,0,2],
];

export function drawCursor(ctx, mx, my) {
  const f = Math.floor;
  for (let row = 0; row < CURSOR_MAP.length; row++) {
    for (let col = 0; col < CURSOR_MAP[row].length; col++) {
      const v = CURSOR_MAP[row][col];
      if (v === 0) continue;
      ctx.fillStyle = v === 1 ? '#ffffff' : '#000000';
      ctx.fillRect(f(mx) + col, f(my) + row, 1, 1);
    }
  }
}
