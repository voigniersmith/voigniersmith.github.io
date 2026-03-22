# Feature Gap Analysis

Features from IDEAS.md **not covered** by the 10 designed systems
(identity, event-bus, firebase-realtime, achievement-engine, particle-physics,
virtual-filesystem, audio-engine, notification-system, pwa, ai-integration).

Each gap maps to a proposed system that would need to be designed.

---

## 1. Window Manager System
**Uncovered features:** multi-window z-order, drag/resize, snap-to-grid, minimize
animations, focus ring, virtual desktops, window state persistence, fullscreen
toggle, window shake/wobble easter egg, maximise/restore.

---

## 2. Farming Game Engine
**Uncovered features:** crop plot grid, plant/water/harvest cycle, weather events,
seasons, upgrades shop, coins & XP economy, farm.log VFS integration, crop-ready
notifications, animated sprites (growing stages), desktop overlay rendering,
save/restore farm state to Firebase.

---

## 3. Gesture & Input Handler
**Uncovered features:** swipe-up/down/left/right on mobile, pinch-to-zoom,
long-press context menu, drag-and-drop between windows, touch vs mouse
disambiguation, keyboard shortcut registry, gamepad support for arcade games.

---

## 4. Advanced Shell Parser
**Uncovered features:** pipes (`ls | grep foo`), I/O redirect (`cat file > out`),
multi-command chains (`&&`, `;`), variable expansion (`$HOME`), command history
with up-arrow, tab completion, glob expansion (`ls *.txt`), alias support,
background jobs (`sleep 5 &`).

---

## 5. Arcade Game Engine
**Uncovered features:** Snake, Tron, breakout, tic-tac-toe, memory match — shared
canvas game loop, input handling, high-score board (Firebase), game-over/restart
flow, BGM handoff to audio engine, achievement hooks (`FIRST_WIN`, `HIGH_SCORE`).

---

## 6. Web Revival Browser Engine
**Uncovered features:** Marginalia/Wiby search integration, deny-list for mainstream
domains, link-graph navigation, page preview thumbnail, bookmarks, browser history,
URL bar with fake protocol (`avos://`), back/forward, tab strip, page renderer
(HTML-to-canvas or iframe sandbox), web-ring directory.

---

## 7. Preferences / Settings Manager
**Uncovered features:** volume sliders (delegates to audio engine), theme picker
(CGA/EGA palettes), font size, terminal prompt customisation, keybinding editor,
display scaling, 24/12-hour clock toggle, persist all settings to localStorage,
export/import settings JSON.

---

## 8. Wallpaper Manager
**Uncovered features:** pixel-art wallpaper gallery, set active wallpaper,
animated wallpapers (rAF driven), procedurally generated patterns (starfield,
matrix rain, plasma), seasonal auto-swap, custom upload (dataURL), screensaver
vs desktop wallpaper distinction.

---

## 9. Time & Event Scheduler
**Uncovered features:** daily MOTD rotation, time-of-day visual themes (sunrise/
sunset palette), seasonal events (Halloween skin, holiday greeting), scheduled
"system messages" pushed via Firebase, crop-growth timers, reminder toasts,
real-world event hooks (Friday deploy warning, etc.).

---

## 10. Procedural Generation Engine
**Uncovered features:** dungeon map generation (for terminal dungeon crawler),
lore text generation (fake commit messages, fake news headlines from GitHub
activity), random handle generator, ASCII art generator, procedural chiptune
riff generator, random NPC dialogue, world-seed system for reproducible layouts.

---

## 11. Profile & Social UI Engine
**Uncovered features:** public profile page (`/u/handle`), avatar editor (pixel
art, 8×8 grid), visitor-handle display on desktop, follow/friend list, profile
card popover, online presence dot, message inbox, handle claim flow (first-visit
vs return).

---

## 12. Lore & Narrative Engine
**Uncovered features:** VFS `/lore/` content authoring, MOTD daily rotation
logic, fake changelog generator, OS boot narrative sequence, conditional lore
unlocks (e.g. read `/lore/manifesto.txt` → achievement), NPC dialogue system
for dungeon crawler, in-world "OS manual" pages.

---

## 13. Analytics & Visualisation Engine
**Uncovered features:** visitor heatmap (which apps opened most), command
frequency bar chart, global XP leaderboard, GitHub contribution graph overlay,
farming yield history sparkline, real-time visitor count, session replay (for
demo mode), stats window with canvas-drawn charts.

---

## 14. Screensaver Engine
**Uncovered features:** idle-timeout detection, screensaver activation/deactivation,
screensaver library (matrix rain, starfield, DVD bounce, AVOS logo), lock screen
with handle prompt, screensaver preview in preferences, wake-on-keypress/click.

---

## 15. Portfolio Display Engine
**Uncovered features:** project card carousel/grid, live demo embed (iframe or
canvas), tech-stack badge renderer, GitHub stats pull (stars, last commit),
résumé PDF viewer, recruiter mode (clean non-OS UI toggle), project deep-link
`/projects/:slug`, case-study modal with screenshots.

---

## 16. Real-Time Collaboration Engine
**Uncovered features:** multi-cursor presence on desktop (show other visitors'
mouse positions), shared whiteboard/paint canvas (Firebase CRDT or last-write),
co-op arcade game session, live chat room (extends firebase-realtime), typing
indicators, visitor emoji reactions, shared VFS write (graffiti wall file).

---

## 17. Virtual Desktop Manager
**Uncovered features:** multiple desktop spaces (Spaces / Exposé style),
workspace-per-app grouping, desktop switcher animation, per-workspace wallpaper,
workspace persistence across sessions, drag window to another workspace.

---

## 18. Advanced Physics Engine
**Uncovered features:** rigid-body collisions (beyond the particle spring model),
draggable/throwable windows with momentum, fluid simulation for weather effects,
cloth simulation for flag/banner, destructible pixel art (window smash easter
egg), gravity zones for a platformer mini-game.

---

## Summary table

| # | System | Priority | Complexity |
|---|--------|----------|------------|
| 1 | Window Manager | High | High |
| 2 | Farming Game Engine | High | High |
| 3 | Gesture & Input Handler | High | Medium |
| 4 | Advanced Shell Parser | Medium | Medium |
| 5 | Arcade Game Engine | High | Medium |
| 6 | Web Revival Browser Engine | High | High |
| 7 | Preferences / Settings Manager | Medium | Low |
| 8 | Wallpaper Manager | Low | Low |
| 9 | Time & Event Scheduler | Medium | Low |
| 10 | Procedural Generation Engine | Medium | Medium |
| 11 | Profile & Social UI Engine | Medium | Medium |
| 12 | Lore & Narrative Engine | Low | Low |
| 13 | Analytics & Visualisation Engine | Low | Medium |
| 14 | Screensaver Engine | Low | Low |
| 15 | Portfolio Display Engine | High | Medium |
| 16 | Real-Time Collaboration Engine | Medium | High |
| 17 | Virtual Desktop Manager | Low | Medium |
| 18 | Advanced Physics Engine | Low | High |
