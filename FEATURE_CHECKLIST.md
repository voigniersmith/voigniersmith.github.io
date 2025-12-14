# Feature Checklist for StartScreen

This document defines all current features that must continue working after refactoring.

## 1. Initial Load & Animation
- [ ] Page loads with dark background (no white flash)
- [ ] me81 animation displays on startup
- [ ] Animation is smooth and character-by-character
- [ ] "Press Any Key to Start" text visible during animation

## 2. Expansion Animation (triggered by any key press)
- [ ] Top terminal resizes from 100% → 50% height smoothly (0.8s)
- [ ] Bottom terminal slides up from 0% → 50% height smoothly (0.1s delay)
- [ ] FileTree sidebar slides in from 0px → 200px width smoothly (0.8s)
- [ ] Vertical divider appears between sidebar and terminals
- [ ] Horizontal divider appears between the two terminals
- [ ] All animations use cubic-bezier(0.25, 0.46, 0.45, 0.94) easing
- [ ] "Press Any Key to Start" text disappears when expanded

## 3. Horizontal Divider (terminal split resize)
- [ ] Divider is visible and has hover effect (background color change)
- [ ] Divider has `row-resize` cursor on hover
- [ ] Dragging divider UP resizes top terminal larger, bottom smaller
- [ ] Dragging divider DOWN resizes top terminal smaller, bottom larger
- [ ] Top terminal respects 20% minimum height constraint
- [ ] Top terminal respects 80% maximum height constraint
- [ ] Bottom terminal automatically takes remaining height (100% - top%)
- [ ] Divider position persists while dragging (smooth, no jumping)

## 4. Vertical Divider (sidebar resize)
- [ ] Divider is visible and has hover effect (background color change)
- [ ] Divider has `col-resize` cursor on hover
- [ ] Dragging divider RIGHT expands sidebar
- [ ] Dragging divider LEFT shrinks sidebar
- [ ] Sidebar respects 120px minimum width constraint
- [ ] Sidebar respects 400px maximum width constraint
- [ ] Sidebar width persists while dragging (smooth, no jumping)
- [ ] FileTree content remains visible and usable in sidebar

## 5. Terminal Functionality
- [ ] Top terminal (Terminal 0) displays me81 animation content
- [ ] Top terminal is read-only (no cursor/input)
- [ ] Bottom terminal (Terminal 1) has input prompt ($)
- [ ] Bottom terminal accepts keyboard input
- [ ] Typed input appears in bottom terminal
- [ ] Input is submitted on Enter key

## 6. FileTree Sidebar
- [ ] FileTree displays directory structure
- [ ] FileTree is visible and scrollable
- [ ] FileTree responds to vim-style navigation (hjkl, Enter)
- [ ] FileTree content doesn't get cut off by sidebar boundaries

## 7. Mouse Event Cleanup
- [ ] No drag state persists after releasing mouse
- [ ] Can drag again immediately after previous drag
- [ ] No console errors on drag
- [ ] Multiple consecutive drags work smoothly

## 8. Responsive Layout
- [ ] All elements respect their flex container bounds
- [ ] No content overflow or scrollbars (except FileTree)
- [ ] Layout fills 100vh height and 100vw width
- [ ] Dividers don't disappear during drag

---

## Testing Procedure

1. **Load page** - Check initial state
2. **Press any key** - Watch expansion animation complete
3. **Drag horizontal divider** - Test resize constraints
4. **Drag vertical divider** - Test sidebar resize
5. **Type in bottom terminal** - Verify input works
6. **Drag dividers multiple times** - Check cleanup and persistence
