# System Design: Web Revival Browser Engine

## Purpose
An in-OS browser that celebrates the indie/personal web. It queries
Marginalia Search and Wiby.me for results — both index only non-commercial,
human-written content — and renders pages inside the OS window. A curated
deny-list blocks mainstream domains so discovery stays within the "web revival
network". Navigation, bookmarks, and a web-ring directory make it a genuine
browsing experience, not just an iframe wrapper.

---

## Public API

```js
// src/systems/browser.js

// Navigation
navigate(url)                // load a URL → Promise<PageResult>
back()                       // history back
forward()                    // history forward
reload()                     // reload current page
getHistory()                 // → BrowseHistoryEntry[]
getCurrentUrl()              // → string | null

// Search
search(query, engine?)       // query Marginalia or Wiby → Promise<SearchResult[]>
  // engine: 'marginalia' | 'wiby' | 'both'  (default 'marginalia')

// Bookmarks
addBookmark(url, title?)
removeBookmark(url)
getBookmarks()               // → Bookmark[]

// Web rings / directory
getRingDirectory()           // → RingEntry[]  (curated indie sites)
getRandomSite()              // → string  (random site from directory)

// Deny list
isDenied(url)                // → boolean
addToDenyList(domain)        // (admin / easter egg only)
```

---

## Data shapes

```js
PageResult {
  url:        string,
  title:      string,
  content:    string,        // sanitised HTML or plain text
  loadedAt:   number,
  via:        'direct' | 'proxy',
  error?:     string,
}

SearchResult {
  url:        string,
  title:      string,
  snippet:    string,
  engine:     'marginalia' | 'wiby',
}

BrowseHistoryEntry {
  url:        string,
  title:      string,
  visitedAt:  number,
}

Bookmark {
  url:        string,
  title:      string,
  addedAt:    number,
}

RingEntry {
  url:        string,
  title:      string,
  description:string,
  tags:       string[],
}
```

---

## Diagrams

### Architecture

```mermaid
classDiagram
  class BrowserEngine {
    -BrowseHistoryEntry[] _history
    -number _historyIndex
    -Bookmark[] _bookmarks
    -Set~string~ _denyList
    +navigate(url) Promise
    +search(query) Promise
    +back() void
    +forward() void
    +isDenied(url) boolean
    -_fetch(url) Promise
    -_sanitise(html) string
    -_applyDenyList(results) SearchResult[]
  }

  class SearchAdapter {
    +queryMarginalia(q) Promise~SearchResult[]~
    +queryWiby(q) Promise~SearchResult[]~
  }

  class PageRenderer {
    +render(ctx, page, w, h, scrollY)
    +renderSearchResults(ctx, results, w, h)
  }

  class DenyList {
    -Set~string~ _domains
    +check(url) boolean
    +add(domain) void
  }

  BrowserEngine --> SearchAdapter
  BrowserEngine --> PageRenderer : passes content to render
  BrowserEngine --> DenyList
```

### Navigation flow

```mermaid
sequenceDiagram
  participant User
  participant Browser as Browser Engine
  participant DenyList
  participant Proxy as CORS Proxy
  participant Site as Target Site

  User->>Browser: navigate('https://example.tilde.club')
  Browser->>DenyList: isDenied('example.tilde.club')
  DenyList-->>Browser: false

  Browser->>Proxy: GET corsproxy.io/?url=https://example.tilde.club
  Proxy->>Site: fetch
  Site-->>Proxy: HTML
  Proxy-->>Browser: HTML

  Browser->>Browser: sanitise HTML (remove scripts, ads, tracking)
  Browser->>Browser: push to history stack
  Browser-->>User: render PageResult
```

### Search flow

```mermaid
sequenceDiagram
  participant User
  participant Browser as Browser Engine
  participant Marginalia
  participant Wiby
  participant DenyList

  User->>Browser: search('personal blog javascript')
  Browser->>Marginalia: GET marginalia.nu/search?q=...
  Browser->>Wiby: GET wiby.me/search?q=...
  Marginalia-->>Browser: SearchResult[]
  Wiby-->>Browser: SearchResult[]

  Browser->>Browser: merge + deduplicate results
  Browser->>DenyList: filter isDenied for each result URL
  Browser-->>User: filtered SearchResult[]
```

### Deny list decision

```mermaid
flowchart TD
  A[URL input] --> B[extract domain]
  B --> C{in hardcoded mainstream list?}
  C -- yes --> D[BLOCKED]
  C -- no --> E{in user deny list?}
  E -- yes --> D
  E -- no --> F{Alexa/Tranco rank < 10000?}
  F -- yes --> G[warn: popular site\nshow confirmation]
  F -- no --> H[ALLOWED]
```

### Browser window state machine

```mermaid
stateDiagram-v2
  [*] --> Home

  Home --> Loading : navigate() or search()
  Loading --> Page  : success
  Loading --> Error : fetch error / denied
  Page --> Loading  : navigate(), back(), forward()
  Error --> Home    : user clicks home
  Error --> Loading : retry
  Page --> Home     : user clicks home
```

---

## Mainstream deny list (seed)

```
google.com, youtube.com, facebook.com, twitter.com, instagram.com,
reddit.com, amazon.com, wikipedia.org, tiktok.com, linkedin.com,
netflix.com, twitch.tv, github.com, stackoverflow.com, medium.com,
substack.com, spotify.com, apple.com, microsoft.com, cloudflare.com
```
> Intent: keep discovery within indie/personal/niche sites.
> Not a moral judgement — these sites are just not the point of this browser.

---

## Integration points

| Depends on | Reason |
|-----------|--------|
| CORS proxy (corsproxy.io) | fetch cross-origin pages |
| Marginalia Search API | indie web search |
| Wiby.me API | text-web search |
| Audio engine | page-load click SFX, back/forward sounds |
| Window Manager | browser window open/close |

| Used by | Reason |
|---------|--------|
| Desktop icon | "Browser" app |
| Terminal | `open https://...` command |
| Web-ring directory | curated site list |

---

## Implementation notes

- **Sanitisation:** strip all `<script>`, `<iframe>`, `<object>`, `<embed>`,
  `onclick`, `onerror`, and external resource references from fetched HTML
  before rendering. Use a DOM parser (`DOMParser`) not regex.
- **Rendering:** render sanitised HTML as a styled canvas overlay or inside
  a sandboxed `<iframe sandbox="allow-same-origin">`. Canvas rendering is
  more on-brand but complex; iframe is simpler and safer.
- **CORS proxy:** wrap all fetches in corsproxy.io (or a self-hosted worker).
  Cache responses for 10 minutes to avoid hammering small indie sites.
- **Deny list enforcement:** apply at both navigation AND search result
  filtering so denied domains never appear anywhere in the UI.
- **Marginalia API:** `https://marginalia.nu/search?query=<q>&format=json`
  returns JSON results. No key required.
- **Wiby API:** `https://wiby.me/search/?q=<q>` returns HTML — parse with
  the same regex approach as the PICO-8 BBS parser.
- **History:** maintain a simple array + index for back/forward. Cap at 50
  entries.
- **Web-ring directory:** hardcode an initial 30–50 curated URLs in
  `browser.config.js`. Let users add to it via `addBookmark`.
