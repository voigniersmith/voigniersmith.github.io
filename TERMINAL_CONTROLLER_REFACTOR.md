# TerminalController Refactoring Plan

## Current State
- 534 lines of monolithic logic
- Hardcoded file mappings (lines 105-160)
- Hardcoded command registry (lines 224-394)
- Duplicate drag logic (lines 428-490)
- Mixed concerns: state, animation, commands, drag, rendering

## Goal
Refactor into modular, reusable pieces following the patterns from StartScreen refactoring.

## Refactoring Steps

### Phase 1: Extract Data
1. Create `src/data/fileRegistry.ts` - File content and link mappings
2. Move all file/link mappings from TerminalController into data module

### Phase 2: Extract Hooks
1. Create `src/hooks/useCommandRegistry.ts` - Command matching and execution
   - Takes file registry as input
   - Returns command execution function
   - Manages animation state for command results

2. Update TerminalController to use `useDraggable` hook (replace lines 428-490)
   - Horizontal divider (splitHeight)
   - Vertical divider (fileTreeWidth)

### Phase 3: Extract Components
1. Create components if needed for better organization
2. Ensure TerminalController becomes <200 lines

## Success Criteria
- ✅ TerminalController <200 lines
- ✅ No hardcoded file mappings in TerminalController
- ✅ Command logic in reusable hook
- ✅ Drag logic uses `useDraggable` hook
- ✅ All original functionality preserved
- ✅ Code is AI-readable and maintainable
