import React, { useState } from 'react';
import { useAnimationPhase } from '../hooks/useAnimationPhase';
import { useDraggable } from '../hooks/useDraggable';
import Terminal from '../terminal/terminal';
import '../demo/startScreen.css';

interface AnimatedTerminalSplitProps {
  /**
   * Whether the split is expanded (both terminals visible)
   * If false, top terminal takes 100% height
   */
  isExpanding: boolean;

  /**
   * Content to display in top terminal (me81 animation)
   * Typically JSX elements from useTypewriter hook
   */
  topTerminalContent: React.ReactNode;

  /**
   * Content to display in bottom terminal (user input)
   * Typically Terminal component with input handling
   */
  bottomTerminalContent: React.ReactNode;

  /**
   * Optional: Called when user presses key before expansion
   * Can be used to show "Press Any Key to Start" text
   */
  isBeforeExpansion?: boolean;
}

/**
 * AnimatedTerminalSplit - Self-contained component for terminal split with drag resizing
 *
 * This component handles:
 * - Animation of terminal split (0.8s cubic-bezier timing)
 * - Horizontal divider between terminals
 * - Dragging divider to resize (20-80% constraints)
 * - Automatic calculation of bottom terminal height
 *
 * The component is self-contained and can be used independently.
 * All animation and drag logic is handled internally.
 *
 * @example
 * <AnimatedTerminalSplit
 *   isExpanding={isExpanding}
 *   topTerminalContent={displayLines.map((line) => <TerminalOutput>{line}</TerminalOutput>)}
 *   bottomTerminalContent={<Terminal>{lineData}</Terminal>}
 * />
 */
export function AnimatedTerminalSplit({
  isExpanding,
  topTerminalContent,
  bottomTerminalContent,
  isBeforeExpansion = false,
}: AnimatedTerminalSplitProps) {
  const [splitHeight, setSplitHeight] = useState(50);

  // Manage animation phase (animation runs 0.8s, then inline styles take over)
  const { isAnimating: isExpansionAnimating } = useAnimationPhase({
    shouldAnimate: isExpanding,
    durationMs: 800,
  });

  // Manage horizontal divider drag
  const horizontalDrag = useDraggable({
    initialValue: splitHeight,
    min: 20,
    max: 80,
    isEnabled: isExpanding,
    axis: 'y',
    containerSelector: 'div[style*="flex-direction: row"]',
    onValueChange: setSplitHeight,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Top Terminal - displays me81 animation */}
      <div
        className={isExpanding && isExpansionAnimating ? 'start-terminal-expanding' : ''}
        style={{
          width: '100%',
          height: isExpanding ? `${splitHeight}%` : '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Terminal name="TERMINAL 0" num={0} prompt="" style={{ width: '100%', height: '100%' }}>
          <p />
          {topTerminalContent}
          {isBeforeExpansion && <h1 style={{ marginTop: 'auto' }}>Press Any Key to Start</h1>}
        </Terminal>
      </div>

      {/* Bottom Terminal - input prompt */}
      {isExpanding && (
        <>
          {/* Horizontal Divider (terminal split resizer) */}
          <div
            className="terminal-divider"
            onMouseDown={horizontalDrag.onMouseDown}
            style={{
              height: '6px',
              width: '100%',
              backgroundColor: '#2a2d33',
              cursor: 'row-resize',
              userSelect: 'none',
              flexShrink: 0,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3a3d43';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2a2d33';
            }}
          />

          <div
            className={isExpansionAnimating ? 'input-terminal-expanding' : ''}
            style={{
              width: '100%',
              height: `${100 - splitHeight}%`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {bottomTerminalContent}
          </div>
        </>
      )}
    </div>
  );
}
