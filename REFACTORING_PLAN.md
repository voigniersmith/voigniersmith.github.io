# Refactoring Plan: StartScreen Architecture

## Goal
Refactor StartScreen into modular, self-contained components with clear separation of concerns. Each piece should be independently understandable and reusable by GenAI agents.

## Architecture Overview

```
src/demo/
├── startScreen.tsx (orchestrator - simplified)
├── hooks/
│   ├── useAnimationPhase.ts (NEW)
│   └── useDraggable.ts (NEW)
└── components/
    ├── AnimatedTerminalSplit.tsx (NEW - extracted)
    ├── AnimatedFileSidebar.tsx (NEW - extracted)
    └── ResizableDivider.tsx (NEW - extracted)
```

## Refactoring Steps

### Phase 1: Extract Custom Hooks
**Goal:** Move drag and animation logic into reusable, testable hooks.

#### Step 1a: Create `useAnimationPhase` hook
**File:** `src/hooks/useAnimationPhase.ts`

**Responsibilities:**
- Track when component should be animating vs interactive
- Manage CSS class application timing
- Handle animation duration timeout

**Input:**
- `shouldAnimate: boolean` - whether animation should start
- `durationMs: number` - animation duration (default 800)

**Output:**
```typescript
{
  isAnimating: boolean,
  className: string  // 'animating' | ''
}
```

**Tests to verify:**
- Returns `isAnimating: true` initially when `shouldAnimate=true`
- Returns `isAnimating: false` after duration elapsed
- Resets if `shouldAnimate` becomes false

---

#### Step 1b: Create `useDraggable` hook
**File:** `src/hooks/useDraggable.ts`

**Responsibilities:**
- Handle all mouse event listeners (mousemove, mouseup)
- Clamp values to min/max constraints
- Provide current value during drag
- Use ref to prevent stale closures

**Input:**
```typescript
{
  initialValue: number,
  min: number,
  max: number,
  isEnabled: boolean,
  onValueChange?: (value: number) => void
}
```

**Output:**
```typescript
{
  value: number,
  isDragging: boolean,
  bind: {
    onMouseDown: (e: MouseEvent) => void
  }
}
```

**Tests to verify:**
- Clamps values to min/max correctly
- Doesn't clamp when disabled
- Fires `onValueChange` on mousemove
- Cleanup listeners on unmount
- `isDragging` is true during drag, false otherwise

---

### Phase 2: Extract Child Components
**Goal:** Move layout pieces into self-contained components that use the hooks.

#### Step 2a: Create `AnimatedTerminalSplit` component
**File:** `src/components/AnimatedTerminalSplit.tsx`

**Props:**
```typescript
{
  isExpanding: boolean,
  splitHeight: number,
  onSplitHeightChange: (height: number) => void,
  topTerminalContent: React.ReactNode,
  bottomTerminalContent: React.ReactNode
}
```

**Responsibilities:**
- Render two terminals with animation
- Use `useAnimationPhase` for animation timing
- Use `useDraggable` for horizontal divider
- Clamp splitHeight to 20-80%

**Tests to verify:**
- Animation plays when `isExpanding=true`
- Animation class removed after duration
- Divider drag updates splitHeight
- Constraints enforced (20-80%)

---

#### Step 2b: Create `AnimatedFileSidebar` component
**File:** `src/components/AnimatedFileSidebar.tsx`

**Props:**
```typescript
{
  isExpanding: boolean,
  width: number,
  onWidthChange: (width: number) => void,
  children: React.ReactNode  // FileTree component
}
```

**Responsibilities:**
- Render sidebar with animation
- Use `useAnimationPhase` for animation timing
- Use `useDraggable` for vertical divider
- Clamp width to 120-400px

**Tests to verify:**
- Animation plays when `isExpanding=true`
- Animation class removed after duration
- Divider drag updates width
- Constraints enforced (120-400px)

---

#### Step 2c: Create `ResizableDivider` component (optional)
**File:** `src/components/ResizableDivider.tsx`

**Props:**
```typescript
{
  direction: 'horizontal' | 'vertical',
  isDragging: boolean,
  onMouseDown: () => void
}
```

**Responsibilities:**
- Just the divider UI
- Cursor style
- Hover effects

---

### Phase 3: Simplify StartScreen
**Goal:** StartScreen becomes an orchestrator, not the implementation.

**New StartScreen responsibilities:**
- Import ScreenState expansion flag
- Manage overall dimensions state (splitHeight, fileTreeWidth)
- Render child components with props
- Pass state callbacks down

**What gets removed:**
- useReducer (moved to useDraggable)
- Manual event listener setup (moved to useDraggable)
- Animation timing logic (moved to useAnimationPhase)
- Complex className logic (moved to child components)

---

## Validation Checklist

After each phase, verify using `FEATURE_CHECKLIST.md`:

- [ ] Phase 1: Extract hooks (features still work)
- [ ] Phase 2a: Extract AnimatedTerminalSplit (features still work)
- [ ] Phase 2b: Extract AnimatedFileSidebar (features still work)
- [ ] Phase 3: Simplify StartScreen (all features still work)

## Key Constraints During Refactoring

1. **Don't change CSS animations** - Timing/easing must stay identical
2. **Don't change event handling logic** - Clamping/constraints must be identical
3. **Don't change starting state values** - splitHeight: 50, fileTreeWidth: 200
4. **Test after every file change** - Run through feature checklist
5. **Keep hook contracts simple** - Each hook does one thing well

## After Refactoring

The codebase will be:
- ✅ Easy for GenAI to understand (clear boundaries)
- ✅ Easy to add new features (reuse hooks)
- ✅ Easy to test (hooks are pure-ish, components are focused)
- ✅ Easy to maintain (changes are localized)
