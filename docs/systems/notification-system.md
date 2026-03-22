# System Design: Notification System

## Purpose
Extend the existing 3-second auto-dismiss toast system into a full OS-level notification
layer: typed toasts (info/success/error/achievement), badge counts on desktop icons and
mobile app icons, a dismissible notification tray, and optional browser push
notifications via Firebase Cloud Messaging.

---

## Public API

```js
// src/systems/notifications.js

// Toasts (rendered on canvas)
notify(message, options?)        // show a toast
notifyAchievement(def)           // special achievement toast with icon + XP
notifyError(message)             // red error toast
notifySuccess(message)           // green success toast

// Badges
setBadge(appId, count)           // set badge count on an icon (0 = clear)
getBadge(appId)                  // → number
clearBadge(appId)                // clear badge
clearAllBadges()                 // clear all badges

// Tray
getTray()                        // → Notification[] (persistent list)
clearTray()                      // dismiss all tray entries
dismissTray(id)                  // dismiss one entry
markTrayRead(id)                 // mark as read without dismissing

// Push (optional, requires FCM)
requestPushPermission()          // → boolean (granted)
subscribePush(topic)             // subscribe to a FCM topic
unsubscribePush(topic)
```

---

## Data shapes

```js
Notification {
  id:        string,           // uuid
  type:      'info' | 'success' | 'error' | 'achievement' | 'chat' | 'system',
  message:   string,
  icon?:     string,           // emoji or ASCII char
  appId?:    string,           // which app to badge
  ts:        number,           // Unix ms
  read:      boolean,
  ttl?:      number,           // frames until auto-dismiss (canvas toasts only)
}

BadgeMap {
  [appId: string]: number      // badge count per app icon
}

NotifyOptions {
  type?:     string,           // default 'info'
  icon?:     string,
  appId?:    string,           // increment badge on this app
  ttl?:      number,           // frames; default 180 (3s at 60fps)
  sound?:    boolean,          // default true
  tray?:     boolean,          // add to persistent tray; default true for chat/achievement
}
```

---

## Diagrams

### Component overview

```mermaid
classDiagram
  class NotificationSystem {
    -Notification[] _tray
    -BadgeMap _badges
    +notify(msg, opts) void
    +notifyAchievement(def) void
    +setBadge(appId, n) void
    +getBadge(appId) number
    +clearBadge(appId) void
    +getTray() Notification[]
    +dismissTray(id) void
    -_toastCanvas(n) void
    -_save() void
  }

  class ToastRenderer {
    +drawToasts(ctx, toasts, cw, ch)
  }

  class BadgeRenderer {
    +drawBadge(ctx, x, y, count)
  }

  class EventBus {
    +on(event, cb)
  }

  NotificationSystem --> ToastRenderer : delegates canvas drawing
  NotificationSystem --> BadgeRenderer : delegates badge drawing
  NotificationSystem --> EventBus : listens for ACHIEVEMENT_UNLOCKED, CHAT_MESSAGE
```

### Toast types (visual spec)

```
┌─────────────────────────────┐
│ ▌ [icon] message text here  │  ← info (cyan left bar)
└─────────────────────────────┘

┌─────────────────────────────┐
│ ▌ ✓ operation successful    │  ← success (green left bar)
└─────────────────────────────┘

┌─────────────────────────────┐
│ ▌ ✕ something went wrong    │  ← error (red left bar)
└─────────────────────────────┘

┌─────────────────────────────┐
│ ▌ 🏆 First Harvest  +20 XP  │  ← achievement (gold left bar, larger)
└─────────────────────────────┘
```

### Notification flow

```mermaid
sequenceDiagram
  participant Bus as Event Bus
  participant NS as Notification System
  participant Canvas as Canvas Toasts
  participant Tray as Notification Tray
  participant Badge as App Icon Badge
  participant Audio as Audio Engine

  Bus->>NS: ACHIEVEMENT_UNLOCKED { id, label, xp }
  NS->>Canvas: push achievement toast (ttl=300, gold)
  NS->>Tray: add to persistent tray
  NS->>Audio: play('achievement')
  NS->>Badge: setBadge('notifications', tray.length)

  Bus->>NS: CHAT_MESSAGE { handle, text }
  alt chat app is not open
    NS->>Canvas: push chat toast (ttl=180, cyan)
    NS->>Badge: setBadge('chat', chatBadge + 1)
    NS->>Tray: add to tray
    NS->>Audio: play('notification')
  end
```

### Tray state machine

```mermaid
stateDiagram-v2
  [*] --> Empty

  Empty --> HasUnread : notify() with tray:true
  HasUnread --> HasUnread : more notifications arrive
  HasUnread --> PartialRead : markTrayRead(id)
  PartialRead --> Empty : clearTray() or all read + dismissed
  HasUnread --> Empty : clearTray()

  state HasUnread {
    trayBadge = unread count
  }
```

### Badge rendering (canvas)

```mermaid
flowchart TD
  A[drawDesktopIcons called each frame] --> B{getBadge for each icon}
  B -- count > 0 --> C[draw red circle at top-right of icon]
  C --> D{count > 9}
  D -- yes --> E[draw '9+']
  D -- no --> F[draw count digit]
  B -- count == 0 --> G[no badge drawn]
```

---

## Integration points

| Depends on | Reason |
|-----------|--------|
| Event bus | listens for ACHIEVEMENT_UNLOCKED, CHAT_MESSAGE, LEVEL_UP, GAME_SCORE |
| Audio engine | plays sounds on notification |
| draw.js / canvas | renders toasts and badges in the RAF loop |
| localStorage | persists tray state and badge counts across sessions |

| Used by | Reason |
|---------|--------|
| DesktopCanvas / MobileCanvas | calls drawToasts, drawBadges each frame |
| Chat room | increments chat badge when window not focused |
| Achievement engine | shows achievement toast via notifyAchievement() |
| Farming game | crop-ready notifications |
| System events | error/success feedback for any user action |

---

## Implementation notes

- **Tray persistence:** save `_tray` (last 20 entries) and `_badges` to localStorage
  under `'avos_notifications'`. Restore on init.
- **Badge clearing:** when a user opens an app, call `clearBadge(appId)` in the
  `APP_OPENED` event handler (or in the app's open callback).
- **Achievement toast:** slightly taller than normal toasts, gold left bar, shows
  `+{xp} XP`. Stays visible for 5 seconds (300 frames) instead of 3.
- **Tray access:** on desktop, the tray opens as a small popover window (or panel)
  when clicking a notification bell icon in the taskbar. On mobile, it's accessible
  from the notification center (swipe down from status bar).
- **Push notifications:** FCM integration is optional and additive. Only the
  `requestPushPermission` / `subscribePush` functions need FCM. The rest of the
  system works without it. Gate this behind `isPushSupported()`.
- **Rate limiting:** if the same `appId` fires notifications rapidly (e.g. many chat
  messages), batch them into one badge increment rather than N toasts. Debounce
  toast firing per `appId` with a 500ms window.
