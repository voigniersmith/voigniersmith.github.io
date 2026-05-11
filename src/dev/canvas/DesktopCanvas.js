import React, { useEffect, useRef, useState } from 'react';
import {
  W, H, TITLEBAR_H, TASKBAR_H, BTN_SIZE,
  BTN_CLOSE_X, BTN_MIN_X, BTN_MAX_X,
  drawDesktop, drawWindowChrome, drawDesktopIcons, drawTaskbar, drawStatsWidget, drawCursor, drawToasts,
  clip, fillRect, text, C, initScreensaver, drawScreensaver, setTheme, getTheme,
} from './draw';
import { renderAbout, renderProjects, renderResume, renderContact, renderCarts, renderPicoBrowser, renderTerminal, renderGitHub, renderWeather, renderPaint, runTerminalCommand, makeTerminalLines, tabComplete, TERM_PROMPT, BROWSER_NAV_H } from './content';
import { sounds, isMuted, setMuted } from '../sounds';
import { ICONS, INIT_WINS, BBS_FALLBACK, BBS_WIDGET_URL, BBS_PAGE_SIZE } from './desktop.config';
import { fetchBBSPage, loadMoreBBSPage, getTime, toast } from './bbs-utils';

const DBLCLICK_MS   = 350;
const RESIZE_HANDLE = 8;
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

function buildCartSrc(cart) {
  if (/\.(p8|p8\.png)$/i.test(cart.file || '')) {
    return `/pico8-player.html?cart=${encodeURIComponent(cart.file)}`;
  }
  return `/carts/${cart.file}`;
}

// ── Initial state ──────────────────────────────────────────────────────────

const WINDOWS_TEMPLATE = INIT_WINS.map((w, i) => ({
  scrollY: 0, ...w,
  ...(w.id === 'pico-browser' ? { browserState: { view: 'home', cart: null } } : {}),
  ...(w.id === 'terminal'     ? { term: { lines: makeTerminalLines(), input: '', blink: 0, history: [], histIdx: -1 } } : {}),
  ...(w.id === 'paint'        ? { paintState: { cols: 40, rows: 28, colorIdx: 1, pixels: null } } : {}),
  isOpen: false, isMinimized: false, isMaximized: false, zIndex: i, preMax: null,
}));

function mkState() {
  return {
    windows:   WINDOWS_TEMPLATE.map(w => ({ ...w })),
    focusedId: null,
    maxZ:      INIT_WINS.length,
    drag:      null,  // { id, offX, offY }
    resize:    null,  // { id, mx0, my0, w0, h0 }
    dblClick:  {},    // { [id]: lastClickMs }
    muted:     isMuted(),
    weather:   null,
    carts:       [],
    bbsFeatured: null,  // null = initial load in progress
    bbsPage:     1,
    bbsLoading:  false, // true while fetching a subsequent page
    bbsHasMore:  true,
    bbsLastLoad: 0,     // timestamp of last successful page load (cooldown)
    toasts:      [],    // [{ msg, ttl }] — ttl counts down each frame
    stats: {
      cpu:    12,
      cores:  navigator.hardwareConcurrency || '?',
      ram:    navigator.deviceMemory || '?',
      heap:   null,
      uptime: '00:00:00',
    },
    hotspots:  [],
    time:      getTime(),
    startMs:   Date.now(),
    mouseX:       0,
    mouseY:       0,
    mouseDown:    false,
    lastActivity: Date.now(),
    screensaver:  false,
    ssState:      null,
    ghEvents:     null,   // null = loading
    ghLoading:    true,
    konamiSeq:    0,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtUptime(ms) {
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sc = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sc}`;
}

function winAt(wins, x, y) {
  return [...wins].reverse().find(w =>
    w.isOpen && !w.isMinimized &&
    x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h
  );
}

function hitBtn(win, x, y) {
  const by = Math.floor(win.y + (TITLEBAR_H - BTN_SIZE) / 2);
  if (y < by || y > by + BTN_SIZE) return null;
  if (x >= win.x + BTN_CLOSE_X && x <= win.x + BTN_CLOSE_X + BTN_SIZE) return 'close';
  if (x >= win.x + BTN_MIN_X   && x <= win.x + BTN_MIN_X   + BTN_SIZE) return 'min';
  if (x >= win.x + BTN_MAX_X   && x <= win.x + BTN_MAX_X   + BTN_SIZE) return 'max';
  return null;
}

function hitResize(win, x, y) {
  if (win.isMaximized) return false;
  return x >= win.x + win.w - RESIZE_HANDLE && y >= win.y + win.h - RESIZE_HANDLE;
}

function hitTitlebar(win, x, y) {
  return x >= win.x && x <= win.x + win.w && y >= win.y && y <= win.y + TITLEBAR_H;
}

// ── Main component ─────────────────────────────────────────────────────────

// ── Boot sequence lines ────────────────────────────────────────────────────

const BOOT_LINES = [
  { text: 'ANDREW-BIOS v2.6  (C) 2025 voigniersmith.com', delay: 0   },
  { text: 'CPU: WebCore @ 60fps    RAM: navigator.deviceMemory', delay: 120 },
  { text: 'Checking canvas context...          [ OK ]', delay: 280 },
  { text: 'Loading portfolio assets...         [ OK ]', delay: 500 },
  { text: 'Mounting filesystem...              [ OK ]', delay: 700 },
  { text: 'Starting window manager...          [ OK ]', delay: 950 },
  { text: '', delay: 1100 },
  { text: 'Welcome. Type \'help\' in terminal.', delay: 1200 },
];
const BOOT_DONE_MS = 1800;  // when desktop fades in

export default function DesktopCanvas({ onExit }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef(mkState());
  const [scale,        setScale]        = useState(1);
  const [canvasW,      setCanvasW]      = useState(W);
  const [canvasH,      setCanvasH]      = useState(H);
  const [browserCartSrc, setBrowserCartSrc] = useState(null);
  const [cartFocused,    setCartFocused]    = useState(false);
  const [isDragging,     setIsDragging]     = useState(false);
  const [bootDone,       setBootDone]       = useState(false);
  const [bootLines,      setBootLines]      = useState([]);

  // Boot sequence
  useEffect(() => {
    BOOT_LINES.forEach(({ text: t, delay }) => {
      setTimeout(() => setBootLines(prev => [...prev, t]), delay);
    });
    setTimeout(() => setBootDone(true), BOOT_DONE_MS);
  }, []);

  // Integer pixel scale; canvas dims fill the viewport exactly
  useEffect(() => {
    const update = () => {
      const dpr = window.devicePixelRatio || 1;
      const s   = Math.max(1, Math.floor(Math.min(
        window.innerWidth  * dpr / W,
        window.innerHeight * dpr / H,
      ) / dpr));
      const cw = Math.ceil(window.innerWidth  / s);
      const ch = Math.ceil(window.innerHeight / s);
      setScale(s);
      setCanvasW(cw);
      setCanvasH(ch);
      stateRef.current.canvasW = cw;
      stateRef.current.canvasH = ch;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Fetch weather
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`)
        .then(r => r.json())
        .then(d => { stateRef.current.weather = d.current_weather; })
        .catch(() => {});
    }, () => {});
  }, []);

  // Fetch local carts manifest
  useEffect(() => {
    fetch('/carts/manifest.json')
      .then(r => r.json())
      .then(d => { stateRef.current.carts = d.carts || []; })
      .catch(() => {});
  }, []);

  // Fetch BBS featured carts (page 1)
  useEffect(() => {
    fetchBBSPage(1, (items, err) => {
      const s = stateRef.current;
      if (err || !items || items.length === 0) {
        s.bbsFeatured = BBS_FALLBACK;
        s.bbsPage     = 0;    // so load-more retries live page 1
        s.bbsHasMore  = true; // still allow retry attempts
        toast(s, 'p-explorer: using offline carts');
      } else {
        s.bbsFeatured = items;
        s.bbsPage     = 1;
        s.bbsHasMore  = items.length >= BBS_PAGE_SIZE;
        toast(s, `p-explorer: loaded ${items.length} carts`);
      }
    });
  }, []);

  // Fetch GitHub events
  useEffect(() => {
    fetch('https://api.github.com/users/voigniersmith/events?per_page=20')
      .then(r => r.json())
      .then(data => {
        const s = stateRef.current;
        s.ghEvents  = Array.isArray(data) ? data : [];
        s.ghLoading = false;
      })
      .catch(() => {
        const s = stateRef.current;
        s.ghEvents  = [];
        s.ghLoading = false;
      });
  }, []);

  // Stats + clock ticker
  useEffect(() => {
    const t = setInterval(() => {
      const s = stateRef.current;
      s.time = getTime();
      s.stats.uptime = fmtUptime(Date.now() - s.startMs);
      s.stats.cpu = Math.min(99, Math.max(1, s.stats.cpu + (Math.random() * 14 - 7)));
      if (performance.memory) {
        s.stats.heap = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
      }
      // Screensaver after 45s idle
      if (!s.screensaver && Date.now() - s.lastActivity > 45000) {
        s.screensaver = true;
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // localStorage: restore prefs on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('desktop-prefs') || '{}');
      if (saved.theme) setTheme(saved.theme);
      if (saved.muted !== undefined) { setMuted(saved.muted); stateRef.current.muted = saved.muted; }
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      try {
        const s = stateRef.current;
        localStorage.setItem('desktop-prefs', JSON.stringify({
          theme: getTheme(),
          muted: s.muted,
        }));
      } catch (_) {}
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Global keyboard handler: screensaver wake, Ctrl+D exit, Konami, terminal input
  useEffect(() => {
    const onKey = (e) => {
      const s = stateRef.current;
      s.lastActivity = Date.now();
      if (s.screensaver) { s.screensaver = false; return; }
      if (e.ctrlKey && e.key === 'd') { e.preventDefault(); if (onExit) onExit(); return; }

      // Konami code
      if (e.key === KONAMI[s.konamiSeq]) {
        s.konamiSeq++;
        if (s.konamiSeq === KONAMI.length) {
          s.konamiSeq = 0;
          setTheme('dracula');
          toast(s, 'KONAMI CODE ACCEPTED');
          const win = s.windows.find(w => w.id === 'terminal');
          if (win && win.term) {
            win.term.lines.push({ t: '*** CHEAT CODE ACTIVATED ***', c: C.magenta });
            win.term.lines.push({ t: 'theme: dracula', c: '#ff79c6' });
          }
        }
      } else {
        s.konamiSeq = e.key === KONAMI[0] ? 1 : 0;
      }

      const win = s.windows.find(w => w.id === 'terminal' && w.isOpen && !w.isMinimized);
      if (!win || s.focusedId !== 'terminal') return;
      const term = win.term;
      if (e.key === 'Tab') {
        e.preventDefault();
        term.input = tabComplete(term.input);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const raw = term.input.trim();
        term.lines.push({ t: TERM_PROMPT + term.input, c: C.textDim });
        if (raw) {
          // push to history (no dupes at end)
          if (term.history[term.history.length - 1] !== raw) {
            term.history.push(raw);
          }
          const output = runTerminalCommand(raw, openWin, term);
          if (output.length === 1 && output[0].t === '__CLEAR__') {
            term.lines = makeTerminalLines();
          } else {
            term.lines.push(...output);
          }
        }
        term.input = '';
        term.histIdx = -1;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (term.history.length > 0) {
          term.histIdx = term.histIdx < 0
            ? term.history.length - 1
            : Math.max(0, term.histIdx - 1);
          term.input = term.history[term.histIdx];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (term.histIdx >= 0) {
          term.histIdx++;
          if (term.histIdx >= term.history.length) {
            term.histIdx = -1;
            term.input = '';
          } else {
            term.input = term.history[term.histIdx];
          }
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        term.input = term.input.slice(0, -1);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        term.input += e.key;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render loop ────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let animId;
    const frame = () => {
      render(ctx, stateRef.current);
      animId = requestAnimationFrame(frame);
    };
    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── Canvas coordinate translation ──────────────────────────────────────

  const toCanvas = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvasRef.current.width  / rect.width),
      y: (e.clientY - rect.top)  * (canvasRef.current.height / rect.height),
    };
  };

  // ── Focus a window ────────────────────────────────────────────────────

  const focusWin = (id) => {
    const s = stateRef.current;
    s.maxZ += 1;
    s.focusedId = id;
    const win = s.windows.find(w => w.id === id);
    if (win) { win.zIndex = s.maxZ; win.isOpen = true; win.isMinimized = false; }
  };

  const openWin = (id) => {
    sounds.open();
    focusWin(id);
    const win = stateRef.current.windows.find(w => w.id === id);
    if (win) win.anim = 0;  // kick off open animation
  };

  const closeWin = (id) => {
    sounds.close();
    const win = stateRef.current.windows.find(w => w.id === id);
    if (win) win.isOpen = false;
  };

  const minimizeWin = (id) => {
    sounds.minimize();
    const win = stateRef.current.windows.find(w => w.id === id);
    if (win) win.isMinimized = true;
  };

  const toggleMax = (id) => {
    const s = stateRef.current;
    const win = s.windows.find(w => w.id === id);
    if (!win) return;
    if (win.isMaximized) {
      Object.assign(win, win.preMax);
      win.isMaximized = false;
      win.preMax = null;
    } else {
      win.preMax = { x: win.x, y: win.y, w: win.w, h: win.h };
      win.x = 0; win.y = 0;
      win.w = s.canvasW || W;
      win.h = (s.canvasH || H) - TASKBAR_H;
      win.isMaximized = true;
    }
  };

  // ── Mouse events ───────────────────────────────────────────────────────

  const handlePaintAt = (win, px, py) => {
    const ps = win.paintState;
    if (!ps || !ps._layout || !ps.pixels) return;
    const { ox, oy, zoom, cols, rows, gridH } = ps._layout;
    if (px < ox || px >= ox + cols * zoom || py < oy || py >= oy + gridH) return;
    const col = Math.floor((px - ox) / zoom);
    const row = Math.floor((py - oy) / zoom);
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      ps.pixels[row * cols + col] = ps.colorIdx;
    }
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    stateRef.current.lastActivity = Date.now();
    if (stateRef.current.screensaver) { stateRef.current.screensaver = false; return; }
    const s   = stateRef.current;
    const pt  = toCanvas(e);
    const sorted = [...s.windows]
      .filter(w => w.isOpen && !w.isMinimized)
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    // Check hotspots first
    for (const hs of s.hotspots) {
      if (pt.x >= hs.x && pt.x <= hs.x + hs.w && pt.y >= hs.y && pt.y <= hs.y + hs.h) {
        if (hs.tag === 'exit')     { if (onExit) onExit(); return; }
        if (hs.tag === 'mute')     { s.muted = !s.muted; setMuted(s.muted); return; }
        if (hs.tag === 'focusWin') { sounds.focus(); focusWin(hs.id); return; }
        if (hs.tag === 'icon')     {
          const now = Date.now();
          if (now - (s.dblClick[hs.id] || 0) < DBLCLICK_MS) { openWin(hs.id); s.dblClick[hs.id] = 0; }
          else s.dblClick[hs.id] = now;
          return;
        }
        if (hs.action) { hs.action(); return; }
      }
    }

    // Check window chrome
    for (const win of sorted) {
      if (!win.isOpen || win.isMinimized) continue;
      if (pt.x < win.x || pt.x > win.x + win.w || pt.y < win.y || pt.y > win.y + win.h) continue;

      sounds.focus();
      focusWin(win.id);

      const btn = hitBtn(win, pt.x, pt.y);
      if (btn === 'close')  { closeWin(win.id); return; }
      if (btn === 'min')    { minimizeWin(win.id); return; }
      if (btn === 'max')    { toggleMax(win.id); return; }

      if (hitResize(win, pt.x, pt.y)) {
        s.resize = { id: win.id, mx0: pt.x, my0: pt.y, w0: win.w, h0: win.h };
        setIsDragging(true);
        return;
      }

      if (hitTitlebar(win, pt.x, pt.y)) {
        const now = Date.now();
        if (now - (s.dblClick[win.id] || 0) < DBLCLICK_MS) { toggleMax(win.id); s.dblClick[win.id] = 0; return; }
        s.dblClick[win.id] = now;
        s.drag = { id: win.id, offX: pt.x - win.x, offY: pt.y - win.y };
        setIsDragging(true);
        return;
      }

      // Paint window: start drawing
      if (win.id === 'paint' && win.paintState) {
        stateRef.current.paintDown = true;
        handlePaintAt(win, pt.x, pt.y);
      }
      return; // clicked inside body — focus only
    }
  };

  const onMouseMove = (e) => {
    const s  = stateRef.current;
    const pt = toCanvas(e);
    s.mouseX = pt.x;
    s.mouseY = pt.y;
    if (s.drag) {
      const win = s.windows.find(w => w.id === s.drag.id);
      if (win && !win.isMaximized) {
        win.x = pt.x - s.drag.offX;
        win.y = pt.y - s.drag.offY;
      }
    }
    if (s.resize) {
      const win = s.windows.find(w => w.id === s.resize.id);
      if (win) {
        win.w = Math.max(120, s.resize.w0 + (pt.x - s.resize.mx0));
        win.h = Math.max(80,  s.resize.h0 + (pt.y - s.resize.my0));
      }
    }
    // Paint while mouse button held
    if (s.paintDown && s.focusedId === 'paint') {
      const win = s.windows.find(w => w.id === 'paint' && w.isOpen);
      if (win) handlePaintAt(win, pt.x, pt.y);
    }
    s.lastActivity = Date.now();
  };

  const onMouseUp = () => {
    stateRef.current.drag      = null;
    stateRef.current.resize    = null;
    stateRef.current.paintDown = false;
    setIsDragging(false);
  };

  const onWheel = (e) => {
    const s   = stateRef.current;
    s.lastActivity = Date.now();
    if (s.screensaver) { s.screensaver = false; return; }
    const pt  = toCanvas(e);
    const win = winAt(s.windows.filter(w => w.isOpen && !w.isMinimized), pt.x, pt.y);
    if (!win) return;
    win.scrollY = Math.max(0, (win.scrollY || 0) + e.deltaY * 0.5);

    // Infinite scroll: trigger next BBS page when p-explorer home nears the bottom
    if (win.id === 'pico-browser') {
      const bh = win.h - TITLEBAR_H - 1 - BROWSER_NAV_H;
      if (win.browserState?.view === 'home'
          && !s.bbsLoading && s.bbsHasMore
          && Array.isArray(s.bbsFeatured) && win.contentH
          && !(s.bbsLastLoad && Date.now() - s.bbsLastLoad < 500)
          && win.scrollY + bh >= win.contentH - 80) {
        loadMoreBBSPage(s, s.bbsPage + 1);
      }
    }
  };

  // ── Launch a PICO-8 cart in a new window ──────────────────────────────

  const launchCart = (cart) => {
    const s = stateRef.current;
    // pid-only carts: open inside p-explorer rather than a bare iframe
    if (cart.pid && !cart.file) {
      openWin('pico-browser');
      if (s.onBrowserSelect) s.onBrowserSelect(cart);
      return;
    }
    const id = `cart-${cart.file}`;
    if (s.windows.find(w => w.id === id)) { openWin(id); return; }
    s.windows.push({
      id, title: cart.title,
      x: 50, y: 20, w: 400, h: 290,
      isOpen: true, isMinimized: false, isMaximized: false,
      zIndex: ++s.maxZ, scrollY: 0, preMax: null,
      cartSrc: buildCartSrc(cart),
    });
    s.focusedId = id;
    sounds.open();
  };

  // ── Cart/browser callbacks (stable setters, safe to reassign each render) ─
  stateRef.current.launchCart = launchCart;
  stateRef.current.onBrowserSelect = (cart) => {
    const win = stateRef.current.windows.find(w => w.id === 'pico-browser');
    if (win) { win.browserState = { view: 'cart', cart }; win.scrollY = 0; }
    const src = cart.pid ? `${BBS_WIDGET_URL}${cart.pid}` : buildCartSrc(cart);
    setCartFocused(false);  // show "click to play" overlay for new cart
    setBrowserCartSrc(src);
  };
  stateRef.current.onBrowserBack = () => {
    const win = stateRef.current.windows.find(w => w.id === 'pico-browser');
    if (win) { win.browserState = { view: 'home', cart: null }; win.scrollY = 0; }
    setCartFocused(false);
    setBrowserCartSrc(null);
  };

  return (
    <div style={{ background: '#0d0d1a', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={canvasW}
        height={canvasH}
        style={{
          position: 'absolute',
          left: 0, top: 0,
          width: '100vw', height: '100vh',
          imageRendering: 'pixelated',
          cursor: 'none',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      />
      {/* DOM iframes for local PICO-8 cart windows */}
      {stateRef.current.windows
        .filter(w => w.isOpen && !w.isMinimized && w.cartSrc)
        .map(w => (
          <iframe
            key={w.id}
            src={w.cartSrc}
            title={w.title}
            allow="autoplay; gamepad"
            sandbox="allow-scripts allow-same-origin"
            style={{
              position: 'absolute',
              left:   w.x * scale,
              top:    (w.y + TITLEBAR_H) * scale,
              width:  w.w * scale,
              height: (w.h - TITLEBAR_H) * scale,
              border: 'none',
              pointerEvents: 'auto',
            }}
          />
        ))
      }
      {/* Pico-browser cart iframe (BBS widget or local cart) */}
      {(() => {
        const w = stateRef.current.windows.find(win => win.id === 'pico-browser');
        if (!w || !w.isOpen || w.isMinimized || !browserCartSrc) return null;
        const iLeft   = (w.x + 1) * scale;
        const iTop    = (w.y + TITLEBAR_H + BROWSER_NAV_H) * scale;
        const iWidth  = (w.w - 2) * scale;
        const iHeight = (w.h - TITLEBAR_H - BROWSER_NAV_H - 1) * scale;
        return (
          <React.Fragment key="pico-browser-cart">
            <iframe
              src={browserCartSrc}
              title="pico-8 cart"
              allow="autoplay; gamepad"
              style={{
                position: 'absolute',
                left: iLeft, top: iTop, width: iWidth, height: iHeight,
                border: 'none',
                pointerEvents: (cartFocused && !isDragging) ? 'auto' : 'none',
              }}
            />
            {/* Click-to-activate overlay — shown until user clicks to focus the game */}
            {!cartFocused && (
              <div
                onClick={() => setCartFocused(true)}
                style={{
                  position: 'absolute',
                  left: iLeft, top: iTop, width: iWidth, height: iHeight,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.45)',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                }}
              >
                <span style={{
                  color: '#00cfff',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: `${Math.max(6, scale * 6)}px`,
                  textAlign: 'center',
                  lineHeight: 2,
                  pointerEvents: 'none',
                }}>
                  CLICK TO PLAY<br/>
                  <span style={{ color: '#7a7a9a', fontSize: `${Math.max(5, scale * 5)}px` }}>
                    click [&lt;] to go back<br/>
                    <a
                      href={browserCartSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ color: '#ffd700', pointerEvents: 'auto', textDecoration: 'none' }}
                    >open on lexaloffle ↗</a>
                  </span>
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })()}

      {/* CRT scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        pointerEvents: 'none',
        zIndex: 10,
      }} />

      {/* Boot screen */}
      {!bootDone && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: '#0d0d1a',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '10vh 8vw',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 'clamp(7px, 1.1vw, 11px)',
          lineHeight: 2.2,
          color: '#33ff33',
          whiteSpace: 'pre',
        }}>
          {bootLines.map((line, i) => (
            <div key={i} style={{ opacity: 0.92 }}>{line || '\u00A0'}</div>
          ))}
          <div style={{ marginTop: '1em', color: '#7a7a9a', animation: 'blink 1s step-end infinite' }}>▮</div>
        </div>
      )}
    </div>
  );
}

// ── Render function (called every frame) ───────────────────────────────────

function render(ctx, s) {
  s.hotspots = [];
  const cw = s.canvasW || W;
  const ch = s.canvasH || H;

  // Screensaver
  if (s.screensaver) {
    if (!s.ssState) s.ssState = initScreensaver(cw, ch);
    drawScreensaver(ctx, s.ssState, cw, ch);
    return;
  }
  if (s.ssState) s.ssState = null;

  const sorted = [...s.windows]
    .filter(w => w.isOpen && !w.isMinimized)
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // 1. Desktop
  drawDesktop(ctx, cw, ch);

  // 2. Desktop icons
  drawDesktopIcons(ctx, ICONS, s.hotspots);

  // 3. Stats widget
  drawStatsWidget(ctx, s.stats, cw);

  // 4. Windows
  for (const win of sorted) {
    // Open animation: anim ticks 0→12 over ~12 frames; fully open after
    const ANIM_FRAMES = 10;
    if (win.anim !== undefined && win.anim < ANIM_FRAMES) win.anim++;
    const animT = win.anim === undefined ? 1 : win.anim / ANIM_FRAMES;

    if (win.cartSrc) {
      // Cart windows: draw chrome only — iframe handles content
      drawWindowChrome(ctx, win, win.id === s.focusedId);
      fillRect(ctx, win.x + 1, win.y + TITLEBAR_H, win.w - 2, win.h - TITLEBAR_H - 1, '#000');
      text(ctx, '[pico-8 running]', win.x + 8, win.y + TITLEBAR_H + 8, C.green, 5);
      continue;
    }

    // Apply open animation: scale clip rect from center of window
    const cx0 = win.x + win.w / 2;
    const cy0 = win.y + win.h / 2;
    const aw  = Math.round(win.w * animT);
    const ah  = Math.round(win.h * animT);
    const ax  = Math.round(cx0 - aw / 2);
    const ay  = Math.round(cy0 - ah / 2);

    ctx.save();
    ctx.beginPath();
    ctx.rect(ax, ay, aw, ah);
    ctx.clip();

    drawWindowChrome(ctx, win, win.id === s.focusedId);
    ctx.restore();

    if (animT < 1) continue;  // skip content render during animation

    const bx = win.x + 1;
    const by = win.y + TITLEBAR_H;
    const bw = win.w - 2;
    const bh = win.h - TITLEBAR_H - 1;

    clip(ctx, bx, by, bw, bh, () => {
      let totalH;
      switch (win.id) {
        case 'about':        totalH = renderAbout(ctx, bx, by, bw, bh, win.scrollY, s.hotspots); break;
        case 'projects':     totalH = renderProjects(ctx, bx, by, bw, bh, win.scrollY, s.hotspots); break;
        case 'resume':       totalH = renderResume(ctx, bx, by, bw, bh, win.scrollY, s.hotspots); break;
        case 'contact':      totalH = renderContact(ctx, bx, by, bw, bh, win.scrollY, s.hotspots); break;
        case 'carts':        totalH = renderCarts(ctx, bx, by, bw, bh, win.scrollY, s.carts, s.hotspots, s.launchCart || (() => {})); break;
        case 'terminal':
          if (win.term) {
            win.term.blink = (win.term.blink + 1) % 60;
            renderTerminal(ctx, bx, by, bw, bh, win.term);
          }
          break;
        case 'pico-browser': totalH = renderPicoBrowser(ctx, bx, by, bw, bh, win.scrollY, s.hotspots,
                               win.browserState  || { view: 'home', cart: null },
                               s.onBrowserSelect || (() => {}),
                               s.onBrowserBack   || (() => {}),
                               s.carts       || [],
                               s.bbsFeatured,
                               s.bbsLoading,
                               s.bbsHasMore);  break;
        case 'github':
          totalH = renderGitHub(ctx, bx, by, bw, bh, win.scrollY, s.hotspots, s.ghEvents, s.ghLoading);
          break;
        case 'weather':
          renderWeather(ctx, bx, by, bw, bh, s.weather);
          break;
        case 'paint':
          if (win.paintState) renderPaint(ctx, bx, by, bw, bh, win.paintState, s.hotspots);
          break;
        default:             break;
      }
      // Clamp scroll after measuring content; cache contentH for infinite scroll
      if (totalH !== undefined) {
        win.scrollY  = Math.max(0, Math.min(win.scrollY, Math.max(0, totalH - bh)));
        win.contentH = totalH;
      }
    });
  }

  // 5. Taskbar
  drawTaskbar(ctx,
    s.windows.filter(w => w.isOpen),
    s.focusedId,
    s.time,
    s.weather,
    s.muted,
    s.hotspots,
    cw, ch,
  );

  // 6. Toasts
  drawToasts(ctx, s.toasts, cw, ch);

  // 7. Pixel-art cursor (drawn last so it's always on top)
  drawCursor(ctx, s.mouseX, s.mouseY);
}
