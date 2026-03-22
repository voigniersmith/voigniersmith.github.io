import React, { useEffect, useRef, useState } from 'react';
import {
  fillRect, strokeRect, hline, vline, text, textW, clip,
  drawIcon, drawToasts, C, PAD, LINE, SMALL, SCROLLBAR_W,
} from './draw';
import {
  renderAbout, renderProjects, renderResume, renderContact, renderCarts,
  renderPicoBrowser, renderTerminal, runTerminalCommand, makeTerminalLines,
  tabComplete, TERM_PROMPT, BROWSER_NAV_H,
} from './content';
import { sounds, isMuted, setMuted } from '../sounds';
import { BBS_FALLBACK, BBS_WIDGET_URL, BBS_PAGE_SIZE } from './desktop.config';
import { fetchBBSPage, getTime, toast } from './bbs-utils';

// ── Logical canvas dimensions (portrait) ───────────────────────────────────
const MW = 160;  // logical width
const MH = 284;  // logical height

// ── Layout constants ────────────────────────────────────────────────────────
const STATUS_H   = 12;  // status bar height
const APP_BAR_H  = 14;  // in-app title bar
const DOCK_H     = 34;  // bottom dock
const HOME_IND_H = 5;   // home indicator pill at very bottom
const ICON_SZ    = 20;  // icon bounding box

const DOCK_APPS = ['about', 'terminal', 'contact', 'projects'];

// Home screen: all apps not in dock, plus any extras
const HOME_APPS = ['about', 'projects', 'resume', 'contact', 'carts', 'pico-browser', 'terminal'];

const APP_TITLES = {
  about:          'about.txt',
  projects:       'projects/',
  resume:         'resume.pdf',
  contact:        'contact',
  carts:          'carts/',
  'pico-browser': 'p-explorer',
  terminal:       'terminal',
};

// ── Boot sequence ───────────────────────────────────────────────────────────
const BOOT_LINES = [
  { text: 'ANDREW-MOBILE v1.0', delay: 0   },
  { text: 'loading assets...  [ OK ]',  delay: 220 },
  { text: 'tap icons to explore',       delay: 480 },
];
const BOOT_DONE_MS = 900;

// ── State ───────────────────────────────────────────────────────────────────
function mkState() {
  return {
    hotspots:     [],
    time:         getTime(),
    bbsFeatured:  null,
    bbsLoading:   false,
    bbsHasMore:   true,
    bbsPage:      1,
    carts:        [],
    term:         { lines: makeTerminalLines(), input: '', blink: 0, history: [], histIdx: -1 },
    browserState: { view: 'home', cart: null },
    toasts:       [],
    scrollY:      0,
    contentH:     0,
    animTick:     999,  // 999 = no animation running
    canvasW:      MW,
    canvasH:      MH,
  };
}

// ── Component ───────────────────────────────────────────────────────────────
export default function MobileCanvas({ onExit }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(mkState());

  const [scale,          setScale]          = useState(1);
  const [canvasW,        setCanvasW]        = useState(MW);
  const [canvasH,        setCanvasH]        = useState(MH);
  const [activeApp,      setActiveApp]      = useState(null);   // React state for keyboard focus
  const [browserCartSrc, setBrowserCartSrc] = useState(null);
  const [bootDone,       setBootDone]       = useState(false);
  const [bootLines,      setBootLines]      = useState([]);
  const termInputRef = useRef(null);

  // ── Scale to fill viewport ────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const dpr = window.devicePixelRatio || 1;
      const s   = Math.max(1, Math.floor(Math.min(
        window.innerWidth  * dpr / MW,
        window.innerHeight * dpr / MH,
      ) / dpr));
      const cw = Math.ceil(window.innerWidth  / s);
      const ch = Math.ceil(window.innerHeight / s);
      setScale(s); setCanvasW(cw); setCanvasH(ch);
      stateRef.current.canvasW = cw;
      stateRef.current.canvasH = ch;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    BOOT_LINES.forEach(({ text: t, delay }) => {
      setTimeout(() => setBootLines(prev => [...prev, t]), delay);
    });
    setTimeout(() => setBootDone(true), BOOT_DONE_MS);
  }, []);

  // ── BBS fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchBBSPage(1, (items, err) => {
      const s = stateRef.current;
      if (err || !items || items.length === 0) {
        s.bbsFeatured = BBS_FALLBACK; s.bbsPage = 0; s.bbsHasMore = true;
        toast(s, 'bbs: using offline carts');
      } else {
        s.bbsFeatured = items;
        s.bbsHasMore  = items.length >= BBS_PAGE_SIZE;
        toast(s, `bbs: loaded ${items.length} carts`);
      }
    });
  }, []);

  // ── Local carts + clock ───────────────────────────────────────────────────
  useEffect(() => {
    fetch('/carts/manifest.json')
      .then(r => r.json())
      .then(d => { stateRef.current.carts = d.carts || []; })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => { stateRef.current.time = getTime(); }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Focus terminal input when app opens ───────────────────────────────────
  useEffect(() => {
    if (activeApp === 'terminal' && termInputRef.current) {
      termInputRef.current.focus();
    }
  }, [activeApp]);

  // ── Ctrl+D exits ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key === 'd') { e.preventDefault(); if (onExit) onExit(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── rAF render loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let animId;
    const frame = () => { renderFrame(ctx, stateRef.current); animId = requestAnimationFrame(frame); };
    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── Open / close app ─────────────────────────────────────────────────────
  const openApp = (id) => {
    sounds.open();
    stateRef.current.scrollY  = 0;
    stateRef.current.contentH = 0;
    stateRef.current.animTick = 0;
    setActiveApp(id);
  };

  const goHome = () => {
    sounds.close();
    const s = stateRef.current;
    if (s.browserState.view === 'cart') {
      s.browserState = { view: 'home', cart: null };
      setBrowserCartSrc(null);
    }
    s.scrollY = 0;
    setActiveApp(null);
  };

  // ── Canvas coordinate helper ──────────────────────────────────────────────
  const toCanvas = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src  = e.changedTouches?.[0] || e.touches?.[0] || e;
    return {
      x: (src.clientX - rect.left) * (canvasRef.current.width  / rect.width),
      y: (src.clientY - rect.top)  * (canvasRef.current.height / rect.height),
    };
  };

  // ── Touch scroll (registered directly on DOM with passive:false) ────────────
  const touchRef = useRef({ startX: 0, startY: 0, startScrollY: 0, startTime: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e) => {
      const pt = toCanvas(e);
      touchRef.current = { startX: pt.x, startY: pt.y, startScrollY: stateRef.current.scrollY, startTime: Date.now() };
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const s  = stateRef.current;
      const pt = toCanvas(e);
      const dy = pt.y - touchRef.current.startY;
      if (s._activeApp) {
        s.scrollY = Math.max(0, touchRef.current.startScrollY - dy);
      }
      // pico-browser infinite scroll
      if (s._activeApp === 'pico-browser' && s.browserState.view === 'home') {
        const bh = s.canvasH - STATUS_H - APP_BAR_H - HOME_IND_H - BROWSER_NAV_H;
        if (!s.bbsLoading && s.bbsHasMore && Array.isArray(s.bbsFeatured)
            && s.contentH && s.scrollY + bh >= s.contentH - 40) {
          s.bbsLoading = true;
          const nextPage = s.bbsPage + 1;
          fetchBBSPage(nextPage, (items, err) => {
            if (!err && items && items.length > 0) {
              const seen = new Set(s.bbsFeatured.map(c => c.pid));
              const fresh = items.filter(c => !seen.has(c.pid));
              if (fresh.length === 0) {
                s.bbsHasMore = false;
              } else {
                s.bbsFeatured = [...s.bbsFeatured, ...fresh];
                s.bbsPage    = nextPage;
                s.bbsHasMore = items.length >= BBS_PAGE_SIZE;
              }
            } else {
              s.bbsHasMore = false;
            }
            s.bbsLoading = false;
          });
        }
      }
    };

    const onTouchEnd = (e) => {
      const pt = toCanvas(e);
      const dx = Math.abs(pt.x - touchRef.current.startX);
      const dy = Math.abs(pt.y - touchRef.current.startY);
      const dt = Date.now() - touchRef.current.startTime;
      if (dx < 10 && dy < 10 && dt < 400) handleTap(pt.x, pt.y);
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true  });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: true  });
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTap = (x, y) => {
    for (const hs of stateRef.current.hotspots) {
      if (x >= hs.x && x <= hs.x + hs.w && y >= hs.y && y <= hs.y + hs.h) {
        if (hs.tag === 'openApp') { openApp(hs.id); return; }
        if (hs.tag === 'back')    { goHome();       return; }
        if (hs.action)            { hs.action();    return; }
      }
    }
  };

  // ── Terminal input (hidden input for mobile keyboard) ────────────────────
  const onTermKey = (e) => {
    const s    = stateRef.current;
    const term = s.term;
    if (e.key === 'Enter') {
      e.preventDefault();
      const raw = term.input.trim();
      term.lines.push({ t: TERM_PROMPT + term.input, c: C.textDim });
      if (raw) {
        if (term.history[term.history.length - 1] !== raw) term.history.push(raw);
        term.histIdx = -1;
        const out = runTerminalCommand(raw, openApp, term);
        if (out.length === 1 && out[0].t === '__CLEAR__') {
          term.lines = makeTerminalLines();
        } else {
          term.lines.push(...out);
        }
      }
      term.input   = '';
      term.histIdx = -1;
    } else if (e.key === 'Tab') {
      e.preventDefault();
      term.input = tabComplete(term.input);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      term.input = term.input.slice(0, -1);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      term.input += e.key;
    }
  };

  // Sync React activeApp into stateRef so the module-level renderFrame can read it
  stateRef.current._activeApp = activeApp;

  // ── pico-browser callbacks ────────────────────────────────────────────────
  stateRef.current.onBrowserSelect = (cart) => {
    const s = stateRef.current;
    s.browserState = { view: 'cart', cart };
    s.scrollY = 0;
    setBrowserCartSrc(cart.pid ? `${BBS_WIDGET_URL}${cart.pid}` : `/carts/${cart.file}`);
  };
  stateRef.current.onBrowserBack = () => {
    const s = stateRef.current;
    s.browserState = { view: 'home', cart: null };
    s.scrollY = 0;
    setBrowserCartSrc(null);
  };

  // ── Compute iframe position for pico-browser ──────────────────────────────
  const picoIframe = (() => {
    if (activeApp !== 'pico-browser' || !browserCartSrc) return null;
    const s  = stateRef.current;
    const cw = s.canvasW; const ch = s.canvasH;
    return {
      left:   1 * scale,
      top:    (STATUS_H + APP_BAR_H + BROWSER_NAV_H) * scale,
      width:  (cw - 2) * scale,
      height: (ch - STATUS_H - APP_BAR_H - BROWSER_NAV_H - HOME_IND_H) * scale,
    };
  })();

  return (
    <div style={{ background: C.bg, width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={canvasW}
        height={canvasH}
        style={{
          position: 'absolute', left: 0, top: 0,
          width: '100vw', height: '100vh',
          imageRendering: 'pixelated',
          cursor: 'none',
          touchAction: 'none',
        }}
        onClick={(e) => { const pt = toCanvas(e); handleTap(pt.x, pt.y); }}
      />

      {/* Hidden input to capture mobile keyboard for terminal */}
      {activeApp === 'terminal' && (
        <input
          ref={termInputRef}
          readOnly
          style={{ position: 'absolute', opacity: 0, width: 1, height: 1, bottom: 0, left: 0 }}
          onKeyDown={onTermKey}
        />
      )}

      {/* pico-browser iframe */}
      {picoIframe && (
        <React.Fragment>
          <iframe
            src={browserCartSrc}
            title="pico-8 cart"
            allow="autoplay; gamepad"
            style={{
              position: 'absolute',
              left: picoIframe.left, top: picoIframe.top,
              width: picoIframe.width, height: picoIframe.height,
              border: 'none', pointerEvents: 'auto',
            }}
          />
          {/* Fallback link in case widget fails to activate */}
          <a
            href={browserCartSrc}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              left: picoIframe.left,
              top:  picoIframe.top + picoIframe.height - 18 * scale,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: `${Math.max(5, scale * 5)}px`,
              color: '#ffd700',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 4px',
              textDecoration: 'none',
              pointerEvents: 'auto',
              zIndex: 5,
            }}
          >open on lexaloffle ↗</a>
        </React.Fragment>
      )}

      {/* CRT scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      }} />

      {/* Boot screen */}
      {!bootDone && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: '#0d0d1a',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '10vh 8vw',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 'clamp(7px, 3vw, 11px)',
          lineHeight: 2.4, color: '#33ff33',
        }}>
          {bootLines.map((line, i) => <div key={i}>{line || '\u00A0'}</div>)}
          <div style={{ color: '#7a7a9a', animation: 'blink 1s step-end infinite' }}>▮</div>
        </div>
      )}
    </div>
  );
}

// ── Render frame ────────────────────────────────────────────────────────────
// Called from rAF; reads stateRef directly.
// activeApp is passed in via stateRef.current._activeApp (set each render).

function renderFrame(ctx, s) {
  s.hotspots = [];
  const cw = s.canvasW || MW;
  const ch = s.canvasH || MH;

  // Background
  fillRect(ctx, 0, 0, cw, ch, C.bg);

  const app = s._activeApp;

  if (!app) {
    // ── Home screen ────────────────────────────────────────────────────────
    drawStatusBar(ctx, s.time, cw);
    drawHomeIcons(ctx, cw, ch, s.hotspots);
    drawDock(ctx, cw, ch, s.hotspots);
  } else {
    // ── App view ───────────────────────────────────────────────────────────
    // Open animation: animTick 0→8
    const ANIM_FRAMES = 8;
    if (s.animTick < ANIM_FRAMES) s.animTick++;
    const t  = Math.min(1, s.animTick / ANIM_FRAMES);
    const et = 1 - Math.pow(1 - t, 3);  // ease-out cubic

    const bx = 1;
    const by = STATUS_H + APP_BAR_H;
    const bw = cw - 2;
    const bh = ch - STATUS_H - APP_BAR_H - HOME_IND_H;

    // Animate from center of screen
    const fw = Math.round(cw * et);
    const fh = Math.round(ch * et);
    const fx = Math.round((cw - fw) / 2);
    const fy = Math.round((ch - fh) / 2);

    ctx.save();
    ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip();

    drawStatusBar(ctx, s.time, cw);
    drawAppBar(ctx, app, cw, s.hotspots);

    ctx.restore();

    if (et >= 1) {
      // Full content once animation complete
      clip(ctx, bx, by, bw, bh, () => {
        let totalH;
        switch (app) {
          case 'about':    totalH = renderAbout(ctx, bx, by, bw, bh, s.scrollY, s.hotspots); break;
          case 'projects': totalH = renderProjects(ctx, bx, by, bw, bh, s.scrollY, s.hotspots); break;
          case 'resume':   totalH = renderResume(ctx, bx, by, bw, bh, s.scrollY, s.hotspots); break;
          case 'contact':  totalH = renderContact(ctx, bx, by, bw, bh, s.scrollY, s.hotspots); break;
          case 'carts':    totalH = renderCarts(ctx, bx, by, bw, bh, s.scrollY, s.carts, s.hotspots, () => {}); break;
          case 'terminal':
            s.term.blink = (s.term.blink + 1) % 60;
            renderTerminal(ctx, bx, by, bw, bh, s.term);
            break;
          case 'pico-browser':
            totalH = renderPicoBrowser(ctx, bx, by, bw, bh, s.scrollY, s.hotspots,
              s.browserState || { view: 'home', cart: null },
              s.onBrowserSelect || (() => {}),
              s.onBrowserBack   || (() => {}),
              s.carts           || [],
              s.bbsFeatured, s.bbsLoading, s.bbsHasMore);
            break;
          default: break;
        }
        if (totalH !== undefined) {
          s.scrollY  = Math.max(0, Math.min(s.scrollY, Math.max(0, totalH - bh)));
          s.contentH = totalH;
        }
      });
    }
  }

  // Home indicator pill
  const pillW = 36;
  fillRect(ctx, Math.floor((cw - pillW) / 2), ch - HOME_IND_H + 1, pillW, 2, C.borderDim);

  // Toasts — positioned above dock on home, above bottom on app
  drawMobileToasts(ctx, s.toasts, cw, ch, app ? HOME_IND_H : DOCK_H + HOME_IND_H);
}

// Sync React activeApp into stateRef so renderFrame can read it.
// Called from the component's render path via a side-effectless trick:
// We attach it to the ref in the component and call it here.
// Actually, we do it via the _activeApp field that the component sets.
// See the useEffect below — but since renderFrame is module-level,
// the component sets stateRef.current._activeApp directly.

// ── Status bar ──────────────────────────────────────────────────────────────
function drawStatusBar(ctx, time, cw) {
  fillRect(ctx, 0, 0, cw, STATUS_H, C.chrome);
  hline(ctx, 0, STATUS_H, cw, C.borderDim);

  // Time (left)
  const ty = Math.floor((STATUS_H - 6) / 2);
  ctx.fillStyle = C.text;
  ctx.font = `6px "Press Start 2P"`;
  ctx.textBaseline = 'top';
  ctx.fillText(time, 3, ty);

  // Signal bars (right side)
  const barH  = [3, 5, 7, 9];
  let rx = cw - 3;
  for (let i = 3; i >= 0; i--) {
    rx -= 3;
    fillRect(ctx, rx, STATUS_H - 1 - barH[i], 2, barH[i], i < 3 ? C.green : C.borderDim);
  }
  rx -= 4;

  // Battery (right of signal)
  const batW = 10; const batH = 6;
  const bx = rx - batW; const by2 = Math.floor((STATUS_H - batH) / 2);
  strokeRect(ctx, bx, by2, batW, batH, C.borderDim);
  fillRect(ctx, bx + 1, by2 + 1, Math.floor(batW * 0.7) - 2, batH - 2, C.green);
  fillRect(ctx, bx + batW, by2 + 1, 2, batH - 2, C.borderDim);  // nub
}

// ── App title bar ───────────────────────────────────────────────────────────
function drawAppBar(ctx, app, cw, hotspots) {
  const y = STATUS_H;
  fillRect(ctx, 0, y, cw, APP_BAR_H, C.titlebar);
  hline(ctx, 0, y + APP_BAR_H, cw, C.cyan);

  // Back button
  const backLabel = '[<]';
  const bw = Math.floor(ctx.measureText(backLabel).width) + 4;
  ctx.fillStyle = C.cyan;
  ctx.font = `6px "Press Start 2P"`;
  ctx.textBaseline = 'top';
  ctx.fillText(backLabel, 3, y + Math.floor((APP_BAR_H - 6) / 2));
  hotspots.push({ x: 0, y, w: bw + 6, h: APP_BAR_H, tag: 'back' });

  // Title (centered)
  const title = APP_TITLES[app] || app;
  ctx.fillStyle = C.text;
  const tw = ctx.measureText(title).width;
  ctx.fillText(title, Math.floor((cw - tw) / 2), y + Math.floor((APP_BAR_H - 6) / 2));
}

// ── Home screen icons ────────────────────────────────────────────────────────
const COLS       = 3;
const CELL_W     = Math.floor((MW - PAD * 2) / COLS);   // ≈ 49
const CELL_H     = ICON_SZ + 3 + SMALL + 6;             // 37
const GRID_TOP   = STATUS_H + 10;

function drawHomeIcons(ctx, cw, ch, hotspots) {
  const cellW = Math.floor((cw - PAD * 2) / COLS);

  HOME_APPS.forEach((id, i) => {
    const col  = i % COLS;
    const row  = Math.floor(i / COLS);
    const cx   = PAD + col * cellW + Math.floor((cellW - ICON_SZ) / 2);
    const cy   = GRID_TOP + row * CELL_H;

    drawIcon(ctx, id, cx, cy);

    // Label
    const lbl  = (APP_TITLES[id] || id).replace(/\/$/, '');
    ctx.font = `6px "Press Start 2P"`;
    ctx.textBaseline = 'top';
    const lw = ctx.measureText(lbl).width;
    ctx.fillStyle = C.text;
    ctx.fillText(lbl, Math.floor(PAD + col * cellW + (cellW - lw) / 2), cy + ICON_SZ + 3);

    hotspots.push({ x: PAD + col * cellW, y: cy, w: cellW, h: CELL_H, tag: 'openApp', id });
  });
}

// ── Dock ─────────────────────────────────────────────────────────────────────
function drawDock(ctx, cw, ch, hotspots) {
  const dy = ch - HOME_IND_H - DOCK_H;
  fillRect(ctx, 0, dy, cw, DOCK_H, C.chrome);
  hline(ctx, 0, dy, cw, C.borderDim);

  const cellW  = Math.floor(cw / DOCK_APPS.length);
  const iconY  = dy + Math.floor((DOCK_H - ICON_SZ) / 2);

  DOCK_APPS.forEach((id, i) => {
    const iconX = i * cellW + Math.floor((cellW - ICON_SZ) / 2);
    drawIcon(ctx, id, iconX, iconY);
    hotspots.push({ x: i * cellW, y: dy, w: cellW, h: DOCK_H, tag: 'openApp', id });
  });
}

// ── Mobile toasts ────────────────────────────────────────────────────────────
const TOAST_W = 120; const TOAST_H = 14;

function drawMobileToasts(ctx, toasts, cw, ch, bottomOffset) {
  const visible = toasts.filter(t => t.ttl > 0);
  for (let i = 0; i < visible.length; i++) {
    const t    = visible[i];
    const fade = Math.min(1, t.ttl / 20);
    const tx   = Math.floor((cw - TOAST_W) / 2);
    const ty   = ch - bottomOffset - TOAST_H * (i + 1) - 3 * (i + 1);
    ctx.save();
    ctx.globalAlpha = fade;
    fillRect(ctx, tx, ty, TOAST_W, TOAST_H, C.chrome);
    ctx.strokeStyle = C.borderDim; ctx.lineWidth = 1;
    ctx.strokeRect(Math.floor(tx) + 0.5, Math.floor(ty) + 0.5, TOAST_W - 1, TOAST_H - 1);
    fillRect(ctx, tx, ty, 2, TOAST_H, C.cyan);
    ctx.fillStyle = C.text;
    ctx.font = '5px "Press Start 2P"';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.beginPath(); ctx.rect(tx + 4, ty, TOAST_W - 6, TOAST_H); ctx.clip();
    ctx.fillText(String(t.msg), tx + 4, ty + TOAST_H / 2);
    ctx.restore();
    ctx.restore();
    t.ttl--;
  }
  toasts.splice(0, toasts.length, ...toasts.filter(t => t.ttl > 0));
}
