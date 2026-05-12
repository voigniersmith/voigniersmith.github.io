# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at localhost:3000
npm run build      # Production build to /build
npm test           # Run tests (react-scripts / Jest)
npm run deploy     # Build + deploy to GitHub Pages (runs predeploy first)
```

Linting is handled by ESLint built into Create React App — no separate lint script.

---

## Architecture overview

This repo has **two distinct UIs** that share the same React entry point:

1. **Dev OS** — pixel-art desktop OS at `/` (the default). Entirely canvas-rendered, no React DOM in the UI layer.
2. **Terminal site** — split-pane terminal emulator at `/terminal`. React + TypeScript.

Ctrl+D toggles between the two. Deep links (e.g. `/terminal`) work in production via the SPA-on-GH-Pages 404.html redirect in `public/`.

---

## Terminal site

`terminalController.tsx` orchestrates two panes — animated top terminal and interactive bottom terminal — separated by a draggable divider. Layout animates in: horizontal expand (610ms) → vertical slide (610ms).

**Command system** (`src/commands/`): Commands are registered via `useCommandRegistry` hook, organized by category (file, system, info, game, link, stats). Add a new command by creating a handler in the appropriate category file and registering it in the registry.

**State flow**: `src/index.tsx` → `src/demo/screenState.tsx` → `src/demo/startScreen.tsx` → `terminalController.tsx`. All terminal state logic lives in `src/hooks/`. Static content in `src/data/`.

**Firebase** (`src/utils/`): Write-only tracking of page loads and commands. Dev mode bypasses this. Requires `REACT_APP_FIREBASE_*` env vars — copy `.env.example` to `.env`.

---

## Dev OS canvas — critical patterns

Everything below applies to `src/dev/canvas/`. **Read this before touching any canvas file.**

### Canvas dimensions

- **Desktop**: logical size is `W × H` from `desktop.config.js` (currently **640 × 360**). The actual canvas element may be larger — the component computes an integer pixel scale so the logical grid fills the viewport exactly.
- **Mobile**: logical size is defined in `MobileCanvas.js` (currently **160 × 284**).
- Always use `s.canvasW || W` and `s.canvasH || H` inside `render()` — never hardcode dimensions.

### The `stateRef` pattern

The render loop runs in `requestAnimationFrame` **outside** the React component closure. State lives in `stateRef.current` (a plain mutable object, not React state). This is intentional — React re-renders would cause jank.

**Critical rule**: Any callback that the render function or a hotspot handler needs must be assigned directly to `stateRef.current`, not captured by closure. The render loop accesses them as `s.launchCart`, `s.onBrowserSelect`, etc.

```js
// ✅ Correct — assigned to stateRef each render, accessible inside render()
stateRef.current.myCallback = myCallback;

// ❌ Wrong — render() can't see variables captured by the component closure
// (the render function is defined at module scope, outside the component)
```

This is the same bug that caused `[run]` buttons to do nothing in P-Explorer — `launchCart` was defined as a local `const` but never assigned to `stateRef.current`.

### Render order (desktop)

`render(ctx, s)` in `DesktopCanvas.js` (line ~748) draws in this order — new systems must slot into the right layer:

```
1. Desktop background     drawDesktop()
2. Desktop icons          drawDesktopIcons()
3. Stats widget           drawStatsWidget()
4. Windows (z-sorted)     drawWindowChrome() + renderXxx() per window
5. Taskbar                drawTaskbar()
6. Toasts                 drawToasts()
7. Pixel cursor           drawCursor()       ← always on top
```

To add a new background layer (e.g. farming game): insert **before step 2**. To add a new overlay (e.g. particles): insert **before step 7**.

### Adding a new window

1. Add an entry to `INIT_WINS` in `desktop.config.js` with `id`, `title`, `x`, `y`, `w`, `h`.
2. Add a `case 'your-id':` to the `switch` in `render()` around line 814 that calls your render function.
3. If your window needs callbacks (e.g. button handlers), assign them to `stateRef.current` in the component body (alongside `launchCart`, `onBrowserSelect`, etc. around line 599).
4. Any window-specific state goes in `mkState()` or inside the window object in `WINDOWS_TEMPLATE`.

### Hotspot system

Interactive regions are registered each frame, not stored persistently:

```js
// Inside a render function:
s.hotspots.push({ x, y, w, h, cursor: 'pointer', action: () => { ... } });
```

`s.hotspots = []` is cleared at the top of every `render()` call. Mouse/touch handlers iterate the array to find hits. **Never** store hotspots across frames.

### Adding a new system module

New systems belong in `src/systems/` as plain `.js` modules (not `.ts` — the canvas layer is JavaScript, not TypeScript). They should be pure modules with no React imports.

```
src/systems/
  eventBus.js      ← pub/sub, ~30 lines
  identity.js
  audio.js
  farming.js
  ...
```

Systems are imported directly into `DesktopCanvas.js` or `MobileCanvas.js` as needed. They do **not** use React state or hooks — they mutate `stateRef.current` or their own module-level state.

### `toCanvas()` — coordinate translation

Raw mouse/touch events are in CSS pixels. Convert to canvas-logical coordinates before any hit-testing:

```js
const toCanvas = (e) => {
  const rect = canvasRef.current.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvasRef.current.width  / rect.width),
    y: (e.clientY - rect.top)  * (canvasRef.current.height / rect.height),
  };
};
```

Mobile uses the same approach with `touches[0]`.

### Canvas rendering conventions

- `ctx.imageSmoothingEnabled = false` is set once on context init — never enable it.
- All drawing helpers live in `draw.js` (`fillRect`, `text`, `clip`, etc.). Use them instead of raw canvas API calls to stay consistent.
- Pixel font is drawn via the `text()` helper with a size argument (5 = tiny, 8 = normal, 10 = large).
- Colors come from the `C` object exported from `draw.js` (`C.text`, `C.textDim`, `C.green`, `C.red`, etc.).

### TypeScript boundary

- `src/` (terminal site): TypeScript (`.ts`, `.tsx`)
- `src/dev/` (canvas OS): JavaScript (`.js`) — the canvas layer was written in JS and stays JS
- New systems in `src/systems/`: use `.js` to match the canvas layer they integrate with

---

## System design docs

All planned systems are documented in `docs/systems/` (28 total). The build order and dependency graph are in `ARCHITECTURE.md`. Feature ideas are in `IDEAS.md`. Gaps between designed systems and existing code are in `docs/GAPS.md`.

When implementing a system from `docs/systems/`, the public API in the doc is the target interface. Don't add extra parameters or split the API unless there's a concrete reason — consistency with the design makes it easier to wire systems together.

---

## Environment Variables

Firebase config: `REACT_APP_FIREBASE_*` env vars, injected at build time. CI reads from GitHub Actions secrets.

Claude API (for AI integration): `REACT_APP_CLAUDE_API_KEY`. Never commit this value.

---

## Deployment

CI (`.github/workflows/deploy.yml`) triggers on push to `main`: installs, builds with Firebase secrets, deploys to GitHub Pages via `gh-pages`.

---

## Gotchas & discoveries

**This section is a living log. Any Claude instance that discovers a non-obvious behaviour, a footgun, or a pattern not covered above should append a bullet here before ending the session.**

- **`stateRef` callback assignment** — any function called from inside `render()` or a hotspot `action` must be assigned to `stateRef.current` in the component body (e.g. `stateRef.current.launchCart = launchCart`). Functions only captured by closure are invisible to the render loop. Discovered when `[run]` buttons in P-Explorer did nothing.
- **BBS pagination URL format** — page 1 uses `BBS_FEATURED_URL` (featured ordering). Pages 2+ must use `BBS_MORE_URL` with `orderby=ts&page=N` — the `&p=N` parameter on the featured URL is silently ignored and always returns the same 30 items.
- **`fresh.length === 0` guard** — after deduplicating BBS results against already-loaded pids, always check if `fresh.length === 0` and set `bbsHasMore = false` if so, otherwise the load-more button loops forever fetching duplicate pages.
- **Lockfile / Node version mismatch** — CI uses Node 20 (`.github/workflows/deploy.yml`). Running `npm install` locally on a newer Node/npm produces a normalized lockfile that fails `npm ci` in CI with `Missing: <pkg>@<ver> from lock file`. Never commit lockfile churn from a stray local `npm install` without verifying CI passes (or bumping CI's Node version). If a working-tree diff to `package-lock.json` appears unprompted, prefer reverting it over committing it.
