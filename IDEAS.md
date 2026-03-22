# Feature Ideas

## Mobile-specific
- Lock screen — pixel art clock, swipe-up-to-unlock animation
- Swipe-right-to-go-back gesture (natural iOS/Android feel)
- Icon badge counts (notification bubbles) — e.g. "3 new BBS carts"
- Pull-to-refresh in app views
- Long-press icon → jiggle mode for rearranging home grid, with localStorage persistence
- Spotlight-style search — swipe down on home grid to reveal a search bar across all content
- App switcher — swipe up slowly to reveal a card stack of recent apps
- Notification center — swipe down from status bar (GitHub events, weather, BBS)
- Real battery % and time from Web APIs (Battery API, `Date`)
- Landscape mode — wider 2-column layout with a sidebar
- Haptic feedback on taps via `navigator.vibrate`

## P-Explorer / PICO-8 (both)
- Cart thumbnail images — BBS response already includes `/bbs/thumbs/` URLs, render them in cards
- Favorites (localStorage) with a `// starred` section in p-explorer
- Cart search/filter by tag
- Cart detail view before playing — description, play count, author
- "Recently played" row

## Desktop-specific
- Window snapping — drag to screen edge to snap half/full
- Persistent layout — window positions/sizes saved to localStorage
- Minimize-to-taskbar with icon in taskbar
- Right-click context menu on desktop
- Boot sequence (the mobile has one; desktop jumps straight to icons)

## New apps (both unless noted)
- Music player — chiptune / .xm streaming
- Notepad — editable, saves to localStorage *(desktop: floating window; mobile: full-screen app)*
- Snake or tiny canvas game *(no PICO-8 required)*
- RSS/blog reader
- Calculator *(mobile: obvious dock app)*

## Terminal
- `ssh` easter egg — fake remote shell with its own filesystem
- Pipe support (`ls | grep`)
- `curl` command (via proxy, renders text output)

## Visual / Polish (both)
- Cart thumbnail rendering in cards
- CRT toggle *(mobile already has scanlines; make it user-toggleable)*
- Window/app open animation scaled from icon position *(desktop doesn't have this; mobile has a center-zoom)*
- Screensaver variety — matrix rain, starfield, pipes
- Theme picker accessible in-app (not just terminal `theme` command)

## Portfolio content
- Interactive timeline in resume *(scroll through career)*
- Project detail view with screenshots
- Skills chart rendered on canvas
- Contact form that actually submits

## Easter eggs / secrets
- Konami code → something silly (already hooked up in DesktopCanvas, just needs a payoff)
- `sudo` command with a password prompt that rejects everything
- `rm -rf /` that "deletes" the desktop then reboots with a dramatic animation
- Hidden files in the fake filesystem (`.secret`, `.love`) discoverable via `ls -a`
- ARG-style puzzle: clues scattered across `cat` files that unlock a hidden window
- Desktop pet — a tiny pixel character that wanders the desktop and reacts to windows
- `sl` command (steam locomotive) — classic Unix joke
- `cowsay` / `fortune` already exist; add `lolcat` color cycling output

## Terminal (more)
- `vim` / `nano` mock text editor that opens inline
- `git log` — pulls real commits from the GitHub API and renders them
- `ps aux` — fake process list with funny fake processes
- `wget <url>` simulation — pretends to download, then `cat`s the result
- `.bashrc` editing that actually changes terminal prompt or colors
- `tmux` — split the terminal pane in two
- `history` command already exists; add `!!` to re-run last command
- `alias` support

## Desktop (more)
- Sticky notes — draggable, editable, persisted to localStorage
- Trash can icon — drag windows/files to it, empty trash animation
- Virtual filesystem mirroring portfolio content, fully navigable with `cd`/`ls`/`cat`
- System Preferences window — one place for theme, sounds, CRT, font size
- Screenshot button — `canvas.toBlob()` → download as PNG
- `Cmd+Tab` / `Alt+Tab` app switcher overlay
- Contribution graph in the GitHub window — pixel art heatmap of commit activity
- CPU/RAM widget that tracks real browser metrics via `performance.memory`

## Mobile (more)
- "Today" screen — swipe right of home grid for a dashboard (weather, GitHub, BBS pick)
- Control center — swipe up from bottom for theme/mute/CRT toggles
- Face ID mock — blink animation then unlocks
- Animated wallpaper on the home screen (slow starfield or gradient shift)
- Notification dot on app icons that clears when you open the app
- Haptic pattern on boot sequence taps

## P-Explorer (more)
- Sort options — newest, most played, alphabetical
- "Random cart" button — I'm feeling lucky
- Cart collections / playlists saved to localStorage
- Keyboard navigation through the card grid *(desktop)*
- Share a cart — copy a direct URL to the BBS page

## Paint app
- Save / load drawings to localStorage
- Export as PNG download
- More tools: fill bucket, shapes, eraser size slider
- Share pixel art — copy as data URL

## Sounds / Audio
- Background ambient chiptune toggle
- Different sound packs (retro beeps vs softer tones)
- Volume slider in system preferences
- Sound visualizer in the music player

## Global statistics (Firebase already tracks page loads + commands)
- `stats` window / command showing live global numbers — total visitors, most popular commands, last active time
- Real-time visitor counter using Firebase `onValue` listener — "42 people have visited"
- Top commands leaderboard — bar chart on canvas of most-run commands across all visitors
- "Last seen" feed — anonymized timestamps of recent sessions ("someone visited 3 min ago")
- Unique visitor count via anonymous session UUIDs written to Firebase on first visit
- Global carts-played counter — every `[play]` click increments a Firebase counter
- "Live" indicator in the status bar / taskbar when another visitor is online simultaneously (Firebase presence)
- Stats dashboard window that auto-refreshes every 30s

## Chat room (Firebase Realtime DB is perfect for this)
- Guest chat with auto-generated pixel handles like `pixel-fox-2847`
- Messages stored in Firebase, rendered in a scrollable canvas chat window
- Desktop: floating chat window; mobile: full-screen chat app
- Rate limiting (1 message per 3s) + max message length enforced client-side
- "X people in room" presence counter using Firebase `.info/connected`
- Emoji reactions on messages (click a message to add a reaction, stored per-message)
- Persistent username stored in localStorage, changeable via `/nick <name>`
- Message timestamps + "just now / 2m ago" relative display
- Notification badge on the chat icon when new messages arrive while you're in another app
- Profanity / spam filter before writing to Firebase
- Chat history limited to last 100 messages (Firebase query + cleanup rule)
- Pinned message from you (the owner) at the top — update it without redeploying

## User profiles
- Anonymous persistent identity: UUID generated on first visit, stored in localStorage
- Avatar picker — choose from a set of pixel art avatars (drawn on canvas); saved to localStorage
- Display name editable in a profile window
- Personal stats card: commands run, carts played, time in app, first visit date
- Guestbook — leave a short public note viewable by all visitors, stored in Firebase
- Profile badge in chat room next to messages
- "Visitors wall" — a scrollable canvas window showing recent visitor handles + timestamps

## ASCII art & pictures
- The JPGs in `src/pictures/` rendered pixel-art style on canvas using `drawImage` + nearest-neighbor — use as desktop wallpapers
- Wallpaper picker window: thumbnail strip of the actual photos, click to set as desktop background
- ASCII art screensaver cycling through the existing `ASCII_ART` collection with typewriter animation
- `imgcat` terminal command — renders a picture from `src/pictures/` as ASCII art in the terminal
- ASCII art generator: pipe any short text through a figlet-style renderer (`banner <text>`)
- Photo viewer app — full-window display of the pictures with prev/next navigation
- ASCII portrait of you (`cat me.txt`) already works; add color cycling and animate it in the about window
- Mobile: swipeable photo gallery app showing `src/pictures/`
- Wallpaper auto-rotates on a timer (pick a new picture every N minutes)
- Desktop background behind windows uses one of the real photos with a pixel-art dither overlay

## Screensavers (more varieties)
- Conway's Game of Life
- Spinning 3D cube (canvas math, no lib needed)
- Your GitHub contribution graph animating in
- Matrix rain that uses lines from your actual `about.txt`

## Desktop overlay farming game
Core loop lives as a persistent canvas layer behind windows — crops grow in real time even while you're using other apps.

**Basics**
- Plot grid on the desktop background — click empty tiles to till, plant, water, harvest
- Crops have grow timers (seconds to minutes depending on type); progress bar visible on each tile
- Coins earned on harvest, spent in the shop
- Day/night cycle tied to real clock — things grow slower at night
- Seasons that rotate weekly (or based on real calendar month) affecting which crops grow best

**Crops & items**
- Starter crops: wheat, carrot, potato (fast, low value)
- Unlockable crops: strawberry, pumpkin, pixel-cactus, glitch-mushroom (slow, high value)
- Watering can — unwatered crops grow at half speed; watered tiles show a sparkle animation
- Fertilizer — doubles growth speed for one cycle
- Scarecrow item — placed on a tile, prevents "pest" events from that area
- Bee box — passively boosts adjacent crop yield by 20%

**Upgrades (shop window)**
- Expand plot (3×3 → 4×4 → 5×5 → 6×6)
- Auto-waterer — waters all crops every N minutes
- Turbo seeds — permanent growth speed bonus per crop type
- Barn — unlocks livestock (chicken → eggs, cow → milk) as passive income
- Greenhouse — one tile immune to season/weather penalties
- Market stall — sell crops at 1.5× value but with a cooldown
- Hired hand NPC — wanders the desktop and auto-harvests ready crops

**Events & surprises**
- Random pest event — a bug appears on a tile, clicking it in time saves the crop
- Weather events (rain = free watering, drought = crops wilt if not watered, frost = kills unprotected crops)
- Mystery crate drops randomly on the desktop — click to open for seeds, coins, or rare items
- Visiting merchant NPC appears for 60 seconds offering a one-time trade
- Golden crop — rare chance any harvest yields a golden version worth 10×

**Progression & meta**
- Player level based on total harvests — unlocks new crop types, plot expansions, decorations
- Achievements: "First Harvest", "100 Crops", "Survive a Frost", "Max Plot Size", etc.
- Prestige reset — wipe farm for a permanent multiplier bonus, cosmetic badge
- Leaderboard via Firebase — top farmers by total coins earned across all visitors
- Seasonal events: halloween pumpkins in October, holiday trees in December
- Desktop decorations unlocked by leveling: fences, paths, pixel trees, a well, a pond tile

**Persistence & integration**
- All state saved to localStorage (plot layout, crop timers, coins, upgrades, player level)
- Firebase syncs total coins earned globally — "players have harvested X crops total"
- Offline progress — calculate elapsed time on next visit and fast-forward crop timers
- Chat integration — harvesting a rare golden crop broadcasts to the chat room
- Farm stats visible in the personal stats card (crops harvested, coins earned, level)

**Mobile version**
- Tap-to-plant grid replaces the home screen wallpaper area
- Dock stays; farm plots fill the space above it
- Push-style toast notifications when crops are ready ("🌽 corn is ready!")
- Simplified 3×3 grid to fit the portrait layout

## Other games & interactive toys
- Tower defense — place pixel towers on the desktop between windows to stop waves of enemies
- Minesweeper — classic, rendered on canvas, high scores saved to localStorage
- Typing speed test — themed as a "hacking" scene, WPM tracked and saved globally to Firebase
- Dungeon crawler — navigate the virtual filesystem as dungeon rooms; files are loot chests
- Pixel art puzzle — jigsaw of one of the `src/pictures/` photos, drag-and-drop pieces
- Chess against a simple AI (minimax depth 3–4, no lib needed)
- Wordle clone — daily pixel word, streak saved to localStorage
- Virtual stock market — fake tech stocks based on your GitHub repos, prices tick randomly

## Tiny canvas games arcade
All rendered directly on canvas (no PICO-8), high scores saved to localStorage, global leaderboard via Firebase.

- **Snake** — classic; walls optional; speed increases each apple; global high score
- **Tron light cycles** — 1P vs simple AI that tries to cut you off; 2P via same keyboard (WASD vs arrows)
- **Breakout** — pixel bricks, powerups (multi-ball, wide paddle, laser); level progression
- **Asteroids** — vector-style on pixel canvas; wrap-around edges; score multiplier chain
- **Pong** — 1P vs AI with difficulty tiers; 2P on same keyboard; win/loss record saved
- **Flappy bird clone** — "Flappy Commit" — obstacles are git branch forks; pipe = merge conflict
- **Tetris** — full rotation, wall kicks, ghost piece, hold piece; global leaderboard
- **Space Invaders** — waves, shields, UFO bonus; difficulty ramps per wave
- **Frogger** — cross the (fiber optic) cable lanes to reach the servers on the other side
- **2048** — on a 4×4 canvas grid with pixel art tile colors per power of two
- **Pac-Man lite** — small maze, 4 ghosts, dots + power pellets; procedurally generated mazes
- **Platformer** — tiny side-scroller, one level, obstacles are windows you have to jump over
- **Typing invaders** — aliens fall with words on them; type the word to shoot; WPM-based difficulty
- **Simon says** — color/sound sequence memory game; sequence length increases each round

**Arcade meta-features**
- Arcade cabinet window on desktop — lists all games as a menu, launches each in its own window
- Global leaderboard per game stored in Firebase — top 10 scores with visitor handles
- Daily challenge mode — same random seed for everyone that day, compare scores in chat
- Unlockable game skins tied to farming game level or chat activity

## Web revival browser
A curated in-OS browser for the "small web" — personal sites, webrings, and indie pages only. Inspired by the original PageRank idea but applied to a deny-listed network of non-corporate sites.

**Discovery & ranking**
- Seed list of known "small web" hubs: Neocities directory, IndieWeb.org, HREF.cool, 512kb.club, 250kb.club, Wiby.me, Marginalia Search
- Marginalia Search has a free public API specifically for non-commercial personal sites — use it as the primary search backend
- Wiby.me also has a `?refer` random-site API — "surprise me" button fetches a random personal site
- Rank results by inbound links *within* the network (sites that other revival sites link to float up)
- Deny list of domains to never surface: google.com, facebook.com, twitter.com, reddit.com, amazon.com, youtube.com, wikipedia.org, and all Cloudflare/CDN-served mega-sites
- Allow list seeding from manually curated JSON file in the repo — easy to add new sites

**Browser UI (desktop window)**
- Pixel-art browser chrome: URL bar, back/forward, bookmarks star, refresh
- Pages open in an iframe with a content-security overlay that strips tracking scripts
- "Reader mode" — fetch via CORS proxy, strip HTML to plain text + images, render on canvas in the OS font
- Sidebar showing the current site's outbound links to other revival sites — click to hop
- Webring navigator — if the current site is in a webring, show prev/next ring buttons
- Page load "weight" indicator — shows KB size; badge if under 512kb or 1mb

**Social layer**
- Bookmark a site → saves to your profile, syncs to Firebase so others can see popular bookmarks
- "Recommended by X visitors" count per domain stored in Firebase
- Shared surfing — click "broadcast" to push the URL you're viewing to the chat room
- Site of the day — one curated URL surfaced on the browser home page, rotated daily, stored in Firebase by you
- Leave a pixel "stamp" on a site — stored in Firebase per domain, shown when others visit the same URL

**Mobile version**
- Full-screen app with swipe-back gesture
- Reader mode default (iframe rendering is cramped on the small canvas)
- Bookmarks accessible from the home screen as a dedicated app icon

## Retro internet / world-building
- Fake email client (Inbox, Sent, Compose) — messages are hand-authored lore about the OS
- Fake intranet browser — can visit a small set of "sites" (your portfolio pages as fake websites)
- BBS-style message board (separate from chat) — threaded posts, persistent in Firebase
- Pixel newspaper — "The Daily Commit" — headlines auto-generated from your GitHub events
- Fake file manager with a hidden `~/secret/` directory unlocked by a terminal command
- Dial-up modem boot animation with authentic screeching sound before connecting

## AI integration
- **Built-in AI assistant** — Claude API chatbot window; trained on your resume/portfolio data via system prompt; answers "what did Andrew build?", "is he available?", "what's his stack?"
- **AI terminal mode** — prefix any command with `ai` and it responds in-character as the OS (`ai what is this?` → witty lore response)
- **AI-generated daily newspaper** — headlines auto-generated from your recent GitHub commits, displayed in a "Daily Commit" window
- **AI caption for ASCII art** — hover over any ASCII art in the collection and get a generated one-liner
- **AI code explainer** — paste a snippet into a window, get a plain-English explanation rendered on canvas
- **Autocomplete in terminal** — LLM-powered suggestions as you type (small model, or prefix-match + Claude for ambiguous inputs)

## Physics layer
- **Window wobble** — windows shake slightly when dragged fast, spring back to rest (simple spring simulation)
- **Bouncing ball desktop toy** — launch a pixel ball that bounces off window borders; gravity, elasticity
- **Windows as physics objects** — hold a modifier key and fling a window; it slides and bumps into other windows
- **Particle effects** on events — coins burst from harvested crops, sparks fly when windows collide, confetti on achievements
- **Liquid desktop** — a slow fluid simulation behind windows as an optional wallpaper (metaball / smoothed particle)
- **Cursor gravity** — desktop icons subtly drift toward or away from the cursor

## Achievement & progression system (cross-app)
- Unified achievement engine: any app can fire events (`ACHIEVEMENT_UNLOCK`, `XP_GAIN`)
- **Achievements** — "First Command", "Played 10 Carts", "Survived a Frost", "Found the Secret File", "Sent a Chat Message", "Visited 5 Revival Sites", "Beat Snake High Score", "100 Crops Harvested"
- Achievements stored in localStorage + synced anonymously to Firebase
- Achievement toast pops up OS-wide when unlocked, with a pixel badge graphic
- Achievement showcase window — grid of locked/unlocked badges with descriptions
- **XP & OS level** — earn XP across all apps; level up unlocks cosmetics (cursor skins, window themes, desktop decorations)
- Global achievement leaderboard — who has the most badges
- Rare secret achievements only discoverable by exploring (no hints)
- Achievement share — generate a pixel art card of your badge collection, download as PNG

## OS lore & narrative
- The OS has a name, a version number, and a fictional history — "AVOS 0.3.1 — a personal operating system built in a weekend that got out of hand"
- `uname -a` in terminal returns the lore version string
- Fake "patch notes" window — changelogs written as if it's a real product ("v0.2.0: fixed a bug where the farmer would steal your windows")
- Hidden `lore/` directory in the fake filesystem with `.txt` files telling a story about the OS's creation
- Boot messages reference lore events ("restoring timeline integrity... [ OK ]")
- The desktop pet has a name and a backstory; `cat ~/pet.txt` reveals it
- Easter egg: `cat /etc/motd` shows a message of the day from "the OS maintainer"
- Time-based lore: different boot messages depending on time of day, day of week, or special dates (your birthday, major holidays)

## Time-based & real-world events
- **Day/night cycle** — OS color palette shifts subtly at sunrise/sunset based on local time (ask for timezone once, store in localStorage)
- **Seasonal desktop** — snow particles in December, falling leaves in autumn, cherry blossoms in spring
- **Midnight event** — something special happens if you're using the OS right at midnight (clock ticks over, short animation)
- **Return visitor postcard** — if you haven't visited in 7+ days, a pixel postcard appears on open ("welcome back, it's been 12 days — here's what grew while you were away")
- **Monday morning briefing** — auto-assembled summary window every Monday: new GitHub commits, BBS carts added, chat messages since last visit
- **Visitor milestones** — when the global visitor count hits a round number (100, 500, 1000), a special animation plays for whoever triggers it

## Generative & procedural systems
- **GitHub skyline** — render your yearly contribution graph as a 3D pixel cityscape (like GitHub's own skyline feature, but on canvas)
- **Repo constellation map** — each GitHub repo is a star; stars connected by shared topics/languages; interactive, zoomable
- **Procedural music from your commit history** — map commit frequency/times to BPM, pitch, and instrument; plays as ambient background
- **Generative desktop wallpaper** — a landscape procedurally built from your GitHub stats (commit count = mountain height, language mix = terrain color)
- **Pixel portrait evolution** — your ASCII `me` art slowly morphs and gains accessories as your OS level increases
- **Daily unique seed** — each calendar day generates a different desktop color accent, wallpaper variant, and fortune message, same for all visitors that day

## Live portfolio demos
- **Project showcase window** — each project in the projects list can have a live iframe embed or interactive canvas demo
- **Code playground** — a window with a simple JS editor + canvas output; visitors can write and run pixel art sketches
- **Live GitHub diff viewer** — pick any commit from `git log` and see a canvas-rendered diff with color coding
- **"Run it"** button on project cards that launches a sandboxed iframe of the actual deployed project
- **Tech stack visualizer** — animated diagram of a project's architecture, drawn on canvas, with tooltips

## Recruiter / professional mode
- **One-page mode** — a single hotkey composes everything into a clean, printable HTML summary (no canvas)
- **"I'm hiring" detector** — a `/hire` terminal command shows a tailored pitch, availability status, and preferred contact method
- **Availability badge** on the desktop status bar / mobile status bar — green dot if open to work, toggled by you via a Firebase flag
- **Download resume** button in the resume window — fetches a PDF from `public/`
- **Calendar embed** — a Calendly-style booking widget in the contact window
- **Referral tracking** — read UTM params on load, store in Firebase, see in your stats which links drove visitors

## PWA & platform
- **Installable PWA** — `manifest.json` + service worker; installs to home screen with the pixel OS icon
- **Offline mode** — service worker caches the app shell; shows a "you're offline" ASCII art screen with cached content still browsable
- **Push notifications** — opt-in; notify when someone leaves a chat message or guestbook entry (Firebase Cloud Messaging)
- **Share target** — register as a PWA share target so you can share URLs directly into the web revival browser from other apps

## Cursor & input polish
- **Custom pixel cursors** — several options (arrow, hand, crosshair, sword, wand); selectable in system preferences; stored in localStorage
- **Cursor trail** — optional sparkle/pixel trail following the mouse; toggle in preferences
- **Cursor ghost** — other online visitors' cursors shown as faint pixel ghosts moving in real time (Firebase presence + mouse position)
- **Keyboard shortcut overlay** — hold `?` to see all shortcuts as a canvas overlay
- **Mouse-free navigation** — full keyboard nav: arrow keys move focus between windows, Enter opens, Escape closes

## Virtual desktops & workspaces
- **Multiple virtual desktops** — switch with `Ctrl+1/2/3`; each has its own window layout
- **"Work" vs "Play" preset layouts** — Work opens terminal + GitHub + resume; Play opens p-explorer + arcade + farming game
- **Window groups** — snap two windows together so they move as one
- **Focus mode** — hide all windows except the active one; dim the rest

## Deeper social / multiplayer
- Collaborative pixel art canvas — shared `drawImage` state in Firebase, everyone paints together
- Multiplayer Snake — two visitors can play on the same canvas simultaneously via Firebase
- "Visitor of the day" — first person to visit each calendar day gets a badge in their profile
- Real-time cursor positions of other visitors shown as ghost cursors on the desktop
- Voting on features — visitors can upvote items from this IDEAS list, results shown in a window
