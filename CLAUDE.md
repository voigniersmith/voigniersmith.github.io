# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at localhost:5173
npm run build     # tsc type-check + Vite build to /dist
npm run preview   # Serve the built /dist
```

There is no Node on Andrew's homelab host. Run npm inside Docker with the same Node as CI:

```bash
docker run --rm -u $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/app -w /app node:20 npm run build
```

---

## Architecture

v3 (Oct 2026) is a fresh rewrite: one terminal, no animations, loads like the 2022 site
(ASCII portrait + "Press any key", then the shell). Vite + React 18 + TypeScript.

```
src/
  main.tsx        entry
  App.tsx         start screen, theme (light/dark, saved in localStorage)
  Terminal.tsx    the single terminal: output lines + a real <input> (so phones get a keyboard)
  commands.ts     every command, runLine() dispatch, tab completion
  fs.ts           the pretend file tree: ~/Applications, Contact, Documents, Pictures, ...
  guestbook.ts    Firebase Realtime Database reads/writes, loaded lazily
  content/        pics.ts (ASCII art), text.ts (welcome text, project write-ups)
```

**Adding a command**: append to the `commands` array in `commands.ts`. `hidden: true` keeps it out of
`help` and tab completion. Commands talk to the terminal only through `Ctx` (`print`, `clear`, `ask`,
`setCwd`, ...). `ctx.ask(label)` prompts for a line and resolves `null` on cancel; that is how
`guestbook sign` asks for a name and message.

**Adding a file**: add it to `tree` in `fs.ts`. `lines` is what `cat` prints, `url` is what `open`
launches, `art: true` shrinks it to fit instead of wrapping.

**Prose vs art**: prose in `content/text.ts` goes through `reflow()`, which joins each paragraph into
one line so it wraps to the screen. ASCII art must not be reflowed.

---

## Guestbook / Firebase

- Data: `guestbook/entries/{pushId}` = `{ name, message, ts }`.
- `database.rules.json` is the real protection: public read, append-only (no edits/deletes), name ≤ 32,
  message ≤ 280, `ts` must be the server time. It is **not deployed automatically**: paste it into
  Firebase Console > Realtime Database > Rules. Pasting replaces all rules for the database.
- The 60s cooldown in `guestbook.ts` is client-side courtesy only.
- Config comes from `VITE_FIREBASE_*` env vars. CI maps them from the old `REACT_APP_FIREBASE_*`
  GitHub secrets. With no config the guestbook says it is offline; the rest of the site works.

---

## Deployment

CI (`.github/workflows/deploy.yml`) triggers on push to `main`: `npm ci` on Node 20, build, deploy
`dist/` to GitHub Pages. `public/CNAME` carries the custom domain into the build.

---

## Gotchas & discoveries

**This section is a living log. Append a bullet when you discover a non-obvious behaviour or footgun.**

- **Lockfile / Node version mismatch** — CI uses Node 20. Generate `package-lock.json` with Node 20
  (the Docker command above) or `npm ci` in CI fails with `Missing: <pkg>@<ver> from lock file`.
- **Old site in git history** — the 2022 terminal, the Dec 2025 split-pane terminal and the 2026 canvas
  "Dev OS" (plus its 28 design docs) were removed in the v3 rewrite. Look at commits before the rewrite
  if you need them.
