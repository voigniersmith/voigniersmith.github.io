# Systems Architecture

This document maps the infrastructure needed to support the features in IDEAS.md,
what already exists, and the recommended build order across all 28 systems.

System design docs live in `docs/systems/`.

---

## Current State (audit summary)

| System | Status | Notes |
|--------|--------|-------|
| State persistence | Partial | localStorage for prefs/stats; Firebase write-only; app state is ephemeral stateRef |
| Event communication | Minimal | Direct callbacks + hotspot detection only; no pub/sub |
| Audio | Functional | 5 hardcoded synth beeps via Web Audio API; no samples, no BGM |
| Theming | Good | 6 canvas themes, persisted to localStorage |
| Terminal commands | Extensive | 20+ commands, modular registry; no pipes, aliases, or env vars |
| Firebase | Configured | Page loads + command counts only; no real-time listeners |
| Animations | Limited | Linear tweens in rAF loop; no springs, no particles |
| Notifications | Basic | 3-second auto-dismiss toasts; no types, no badges, no tray |
| Identity | Missing | No concept of "who is this user" |
| Virtual filesystem | Minimal | Fake file tree inside terminal codebase only; not shared |
| Physics | Missing | Nothing |
| Achievements | Missing | Nothing |
| PWA | Missing | No manifest, no service worker |
| Window management | Partial | Ad-hoc state blobs in DesktopCanvas; no shared registry |
| Input abstraction | None | Raw mouse/touch listeners scattered across canvas files |

---

## All 28 systems — dependency map

```
── No dependencies ──────────────────────────────────────────────────────────
  Event Bus
  Particle & Physics System
  Virtual Filesystem
  Procedural Generation Engine
  PWA Layer
  Gesture & Input Handler  (attaches to canvas DOM only)

── Depend on foundation only ────────────────────────────────────────────────
  Identity System            ← Firebase, Event Bus
  Preferences Manager        ← Event Bus
  Audio Engine               ← (extends existing sounds.js)
  Lore & Narrative Engine    ← VFS
  Advanced Shell Parser      ← VFS, command registry

── Depend on foundation + tier above ────────────────────────────────────────
  Window Manager             ← Event Bus, Gesture/Input
  Notification System        ← Event Bus, Audio Engine
  Wallpaper Manager          ← Preferences Manager
  Achievement Engine         ← Event Bus, Identity System
  Time & Event Scheduler     ← Event Bus, Firebase Realtime
  Advanced Physics Engine    ← Particle & Physics System

── Depend on OS shell layer ─────────────────────────────────────────────────
  Screensaver Engine         ← Preferences, Gesture/Input, Wallpaper
  Virtual Desktop Manager    ← Window Manager, Wallpaper, Preferences
  Profile & Social UI        ← Identity, Firebase, Achievement Engine
  Analytics & Visualisation  ← Event Bus, Firebase, Identity
  Portfolio Display Engine   ← portfolio.config.js, Window Manager
  AI Integration             ← portfolio.config.js, env vars

── Feature apps (many dependencies) ────────────────────────────────────────
  Farming Game Engine        ← Event Bus, Firebase, Audio, Particles,
                               Notification, Achievement, Scheduler, VFS
  Arcade Game Engine         ← Audio, Event Bus, Firebase, Gesture/Input,
                               Achievement, Window Manager
  Web Revival Browser        ← Window Manager, Audio, Preferences
  Real-Time Collaboration    ← Firebase, Identity, Event Bus,
                               Gesture/Input, Particle Physics
```

---

## Tier 1 — Zero-dependency foundations
*Build these first. Nothing can start without them.*

| # | System | Doc | Est. effort |
|---|--------|-----|-------------|
| 1 | **Event Bus** | `docs/systems/event-bus.md` | 30 min |
| 2 | **Real-time Firebase layer** | `docs/systems/firebase-realtime.md` | 2–3 hrs |
| 3 | **Gesture & Input Handler** | `docs/systems/gesture-input.md` | 2–3 hrs |
| 4 | **Virtual Filesystem** | `docs/systems/virtual-filesystem.md` | 2 hrs |
| 5 | **Particle & Physics System** | `docs/systems/particle-physics.md` | 2 hrs |
| 6 | **Procedural Generation Engine** | `docs/systems/procedural-gen.md` | 2–3 hrs |

**After this tier:** event routing, canvas input, fake filesystem, and basic
particles all work. Unblocks almost everything.

---

## Tier 2 — Core OS infrastructure
*Depend only on tier 1. Build in parallel.*

| # | System | Doc | Depends on |
|---|--------|-----|------------|
| 7 | **Identity System** | `docs/systems/identity.md` | Firebase, Event Bus |
| 8 | **Audio Engine** | `docs/systems/audio-engine.md` | (extends sounds.js) |
| 9 | **Preferences Manager** | `docs/systems/preferences.md` | Event Bus |
| 10 | **Advanced Shell Parser** | `docs/systems/shell-parser.md` | VFS |
| 11 | **Lore & Narrative Engine** | `docs/systems/lore-narrative.md` | VFS |
| 12 | **Advanced Physics Engine** | `docs/systems/advanced-physics.md` | Particles |

**After this tier:** visitor identity, full audio, persistent settings, shell
pipes/aliases, lore content, and rigid-body physics all work.

---

## Tier 3 — OS chrome & shell
*The visible window/notification/wallpaper layer. Needs tier 1–2 complete.*

| # | System | Doc | Depends on |
|---|--------|-----|------------|
| 13 | **Window Manager** | `docs/systems/window-manager.md` | Event Bus, Gesture/Input |
| 14 | **Notification System** | `docs/systems/notification-system.md` | Event Bus, Audio |
| 15 | **Wallpaper Manager** | `docs/systems/wallpaper.md` | Preferences |
| 16 | **Achievement Engine** | `docs/systems/achievement-engine.md` | Event Bus, Identity |
| 17 | **Time & Event Scheduler** | `docs/systems/scheduler.md` | Event Bus, Firebase |

**After this tier:** the OS looks and behaves like an OS — windows, notifications,
wallpapers, achievements, and scheduled events all function.

---

## Tier 4 — Enrichment layer
*Enhances existing OS with richer content and social features.*

| # | System | Doc | Depends on |
|---|--------|-----|------------|
| 18 | **Screensaver Engine** | `docs/systems/screensaver.md` | Prefs, Gesture/Input, Wallpaper |
| 19 | **Virtual Desktop Manager** | `docs/systems/virtual-desktops.md` | Window Manager, Wallpaper, Prefs |
| 20 | **Profile & Social UI** | `docs/systems/profile-social.md` | Identity, Firebase, Achievement |
| 21 | **Analytics & Visualisation** | `docs/systems/analytics-viz.md` | Event Bus, Firebase, Identity |
| 22 | **PWA Layer** | `docs/systems/pwa.md` | (additive — nothing else needs it) |
| 23 | **AI Integration** | `docs/systems/ai-integration.md` | portfolio.config.js |
| 24 | **Portfolio Display Engine** | `docs/systems/portfolio-display.md` | portfolio.config.js, Window Manager |

---

## Tier 5 — Feature apps
*The payoff. Each is a major feature that stands on the tiers above.*

| # | System | Doc | Key dependencies |
|---|--------|-----|-----------------|
| 25 | **Farming Game Engine** | `docs/systems/farming-game.md` | Event Bus, Firebase, Audio, Particles, Notification, Achievement, Scheduler, VFS |
| 26 | **Arcade Game Engine** | `docs/systems/arcade-game-engine.md` | Audio, Event Bus, Firebase, Gesture/Input, Achievement, Window Manager |
| 27 | **Web Revival Browser** | `docs/systems/web-revival-browser.md` | Window Manager, Audio, Preferences |
| 28 | **Real-Time Collaboration** | `docs/systems/realtime-collab.md` | Firebase, Identity, Event Bus, Gesture/Input, Particles |

---

## Recommended build order (linear)

```
TIER 1 — Foundations (can build in parallel within tier)
  1.  Event Bus                  30 min
  2.  Real-time Firebase         2–3 hrs
  3.  Gesture & Input Handler    2–3 hrs
  4.  Virtual Filesystem         2 hrs
  5.  Particle & Physics         2 hrs
  6.  Procedural Gen Engine      2–3 hrs

TIER 2 — Core OS (parallelisable)
  7.  Identity System            2–3 hrs
  8.  Audio Engine               3–4 hrs
  9.  Preferences Manager        2 hrs
  10. Advanced Shell Parser      3–4 hrs
  11. Lore & Narrative           2 hrs
  12. Advanced Physics           3–4 hrs

TIER 3 — Chrome (parallelisable, needs 1–2 done)
  13. Window Manager             4–6 hrs  ← biggest lift; everything else needs it
  14. Notification System        2–3 hrs
  15. Wallpaper Manager          2 hrs
  16. Achievement Engine         2–3 hrs
  17. Time & Event Scheduler     2 hrs

TIER 4 — Enrichment (after tier 3)
  18. Screensaver Engine         2 hrs
  19. Virtual Desktop Manager    3–4 hrs
  20. Profile & Social UI        3–4 hrs
  21. Analytics & Viz            3–4 hrs
  22. PWA Layer                  2 hrs  (anytime — fully additive)
  23. AI Integration             2–3 hrs
  24. Portfolio Display Engine   3–4 hrs

TIER 5 — Feature Apps (after relevant deps in tiers 1–4)
  25. Farming Game Engine        6–10 hrs  ← most complex
  26. Arcade Game Engine         4–6 hrs
  27. Web Revival Browser        4–6 hrs
  28. Real-Time Collaboration    4–6 hrs
```

**Critical path:** Event Bus → Firebase → Identity → Window Manager → everything else.
The Window Manager (tier 3, #13) is the single most blocking system — nothing feels
like an OS until windows work properly, and the farming game, arcade, and browser all
need it.

**Quickest visible wins (in order):**
1. Event Bus (30 min) → unlocks achievement wiring
2. Audio Engine (3 hrs) → immediately makes the OS feel more alive
3. Notification System (2 hrs) → typed toasts + badges, visible everywhere
4. AI Integration (2 hrs) → most impressive demo feature
5. PWA Layer (2 hrs) → install to home screen, offline support

---

## Quick-start: minimum viable next step

If you want the highest impact with the least risk, this sequence gets the
foundation solid before touching any features:

```
Event Bus (30 min)
    → Identity System (2 hrs) — know who the user is
    → Real-time Firebase (2 hrs) — live data everywhere
    → Achievement Engine (2 hrs) — gamification hooks for free
    → Audio Engine (3 hrs) — makes everything feel better
    → Notification System (2 hrs) — closes the feedback loop
```

That's roughly a 1–2 day sprint and immediately enables: chat, presence,
ghost cursors, leaderboards, achievements on every existing action, richer
audio, and typed toasts. Everything built after this point gets all of
those for free.
