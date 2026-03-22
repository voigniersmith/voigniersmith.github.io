# System Design: Real-Time Collaboration Engine

## Purpose
Make the OS feel like a living shared space: show other visitors' cursors
floating on the desktop, enable a live multi-user chat room, support emoji
reactions broadcast to all connected visitors, and lay groundwork for
co-op arcade sessions. Built entirely on Firebase Realtime Database's
live subscription model with ephemeral presence data.

---

## Public API

```js
// src/systems/collab.js

// Presence & cursors
joinSession()                // register presence + start cursor broadcast
leaveSession()               // remove presence on disconnect
broadcastCursor(x, y)        // send cursor position to all visitors
getOnlineCursors()           // → CursorState[]  (live, updated via Firebase)

// Reactions
sendReaction(emoji)          // broadcast a floating emoji to all visitors
onReaction(handler)          // listen for incoming reactions

// Chat
sendChatMessage(text)        // → Promise<void>
onChatMessage(handler)       // live listener for new messages
getChatHistory(limit?)       // → Promise<ChatMessage[]>

// Co-op (future hook)
joinGameSession(gameId)      // → Promise<GameSessionId>
broadcastGameInput(input)    // send input frame to co-op partner
onGameInput(handler)         // receive partner's input
leaveGameSession()
```

---

## Data shapes

```js
CursorState {
  handle:   string,
  x:        number,          // canvas %, 0–1 (normalised to viewport)
  y:        number,
  color:    string,          // unique per visitor
  lastSeen: number,
}

Reaction {
  handle:   string,
  emoji:    string,
  x:        number,          // origin x (canvas %)
  y:        number,
  ts:       number,
}

ChatMessage {
  id:       string,
  handle:   string,
  text:     string,          // max 280 chars
  ts:       number,
  color:    string,          // handle's assigned color
}
```

---

## Diagrams

### Architecture

```mermaid
classDiagram
  class CollabEngine {
    -string _handle
    -Map~string,CursorState~ _cursors
    +joinSession() void
    +broadcastCursor(x, y) void
    +getOnlineCursors() CursorState[]
    +sendReaction(emoji) void
    +sendChatMessage(text) Promise
    -_subscribeCursors() void
    -_subscribeChat() void
    -_heartbeat() void
  }

  class Firebase {
    +presence/{handle}
    +cursors/{handle}
    +chat/messages
    +reactions (ephemeral)
  }

  class EventBus {
    +emit('CURSOR_UPDATE')
    +emit('CHAT_MESSAGE')
    +emit('REACTION', { emoji, x, y })
  }

  CollabEngine --> Firebase : reads/writes
  CollabEngine --> EventBus : emits updates
```

### Cursor broadcast loop

```mermaid
sequenceDiagram
  participant User
  participant Input as Gesture/Input Handler
  participant Collab as Collab Engine
  participant Firebase
  participant Other as Other Visitors

  User->>Input: mousemove
  Input->>Collab: broadcastCursor(x/cw, y/ch)
  Collab->>Collab: throttle to max 10/sec
  Collab->>Firebase: set /cursors/{handle} { x, y, ts }

  Firebase-->>Other: onValue fires
  Other->>Other: update CursorState map
  Other->>Other: render cursor sprite on canvas
```

### Chat message flow

```mermaid
sequenceDiagram
  participant User
  participant ChatWindow
  participant Collab as Collab Engine
  participant Firebase
  participant Bus as Event Bus
  participant All as All Visitors

  User->>ChatWindow: type + send message
  ChatWindow->>Collab: sendChatMessage('hello!')
  Collab->>Firebase: push /chat/messages { handle, text, ts }

  Firebase-->>All: onChildAdded fires
  All->>Bus: emit('CHAT_MESSAGE', { handle, text })
  Bus->>All: notification toast (if chat not open)
  Bus->>All: chat window appends message
```

### Floating emoji reaction

```mermaid
sequenceDiagram
  participant User
  participant Collab as Collab Engine
  participant Firebase
  participant Particle as Particle System
  participant All as All Visitors

  User->>Collab: sendReaction('🎉')
  Collab->>Firebase: push /reactions { handle, emoji, x, y, ts }
  Firebase-->>All: onChildAdded
  All->>Particle: spawn floating emoji at (x, y)
  note over Particle: emoji floats up and fades over 2s
  Firebase->>Firebase: auto-delete reactions older than 5s
    note over Firebase: use Firebase TTL or cleanup job
```

### Cursor rendering (canvas)

```mermaid
flowchart TD
  A[draw frame] --> B[for each cursor in getOnlineCursors]
  B --> C{cursor.lastSeen > now - 5s}
  C -- yes --> D[draw arrow at cursor.x * cw, cursor.y * ch]
  D --> E[draw handle label below arrow]
  D --> F[apply cursor.color tint]
  C -- no --> G[remove stale cursor]
```

---

## Firebase schema (collab namespace)

```
/cursors/{handle}
  x:        number (0–1)
  y:        number (0–1)
  ts:       number

/chat/messages/{pushId}
  handle:   string
  text:     string
  ts:       number
  color:    string

/reactions/{pushId}
  handle:   string
  emoji:    string
  x:        number
  y:        number
  ts:       number

/presence/{handle}           ← owned by identity system
```

---

## Integration points

| Depends on | Reason |
|-----------|--------|
| Firebase Realtime | all collab data lives here |
| Identity system | handle, color used in all messages |
| Event bus | emits CHAT_MESSAGE, REACTION, CURSOR_UPDATE |
| Gesture/Input handler | cursor position source |
| Particle physics | floating emoji reactions rendered as particles |

| Used by | Reason |
|---------|--------|
| DesktopCanvas | renders other visitors' cursors |
| Chat room window | live message feed |
| Notification system | new message badge + toast |
| Profile/Social engine | online presence |
| Analytics | online visitor count |

---

## Implementation notes

- **Cursor throttle:** send at most 10 updates/second (100ms debounce).
  Firebase free tier has bandwidth limits — don't hammer it with raw
  mousemove at 60fps.
- **Cursor normalisation:** store `x/canvasWidth` and `y/canvasHeight`
  (0–1 range) so cursors render correctly even if visitors have different
  canvas sizes.
- **Stale cursor cleanup:** remove cursor entries from the rendered list
  if `lastSeen > 5s`. Firebase `onDisconnect` removes the `/cursors/{handle}`
  entry when the visitor disconnects.
- **Chat moderation:** no profanity filter initially — this is a niche
  portfolio, not a public forum. Add rate limiting (max 5 messages per
  10s per handle).
- **Reaction TTL:** use a Firebase Cloud Function or client-side cleanup
  job to delete `/reactions` entries older than 10 seconds. Don't let
  the reactions collection grow unbounded.
- **Co-op gaming:** the `joinGameSession` / `broadcastGameInput` API is a
  placeholder. Implement after single-player arcade is solid. Latency will
  be the primary challenge — target < 100ms RTT.
