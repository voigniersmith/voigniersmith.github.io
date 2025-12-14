import React from 'react';
import { useAnimationPhase } from '../hooks/useAnimationPhase';
import { useDraggable } from '../hooks/useDraggable';
import '../demo/startScreen.css';

interface AnimatedFileSidebarProps {
  /**
   * Whether the sidebar is expanded
   * If false, sidebar is hidden (width: 0)
   */
  isExpanding: boolean;

  /**
   * Content to display in sidebar
   * Typically the FileTree component
   */
  children: React.ReactNode;
}

/**
 * AnimatedFileSidebar - Self-contained component for file tree sidebar with drag resizing
 *
 * This component handles:
 * - Animation of sidebar (0.8s cubic-bezier timing)
 * - Vertical divider on right edge
 * - Dragging divider to resize (120-400px constraints)
 * - Smooth expansion/collapse with animation class management
 *
 * The component is self-contained and can be used independently.
 * All animation and drag logic is handled internally.
 *
 * @example
 * <AnimatedFileSidebar isExpanding={isExpanding}>
 *   <FileTree currentDir={curdir} />
 * </AnimatedFileSidebar>
 */
export function AnimatedFileSidebar({ isExpanding, children }: AnimatedFileSidebarProps) {
  // Manage animation phase (animation runs 0.8s, then inline styles take over)
  const { isAnimating: isExpansionAnimating } = useAnimationPhase({
    shouldAnimate: isExpanding,
    durationMs: 800,
  });

  // Manage vertical divider drag
  const verticalDrag = useDraggable({
    initialValue: 200,
    min: 120,
    max: 400,
    isEnabled: isExpanding,
    axis: 'x',
    containerSelector: 'div[style*="flex-direction: row"]',
  });

  return (
    <>
      {/* FileTree Sidebar */}
      <div
        className={
          isExpanding
            ? isExpansionAnimating
              ? 'file-tree-wrapper-expanding'
              : 'file-tree-wrapper-expanded'
            : 'file-tree-wrapper-hidden'
        }
        style={{
          width: isExpanding ? `${verticalDrag.value}px` : '0px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>

      {/* Vertical Divider (sidebar resizer) */}
      <div
        className={isExpanding ? 'divider-vertical-expanding' : 'divider-vertical-hidden'}
        style={{
          width: '6px',
          height: '100%',
          backgroundColor: '#2a2d33',
          flexShrink: 0,
          cursor: 'col-resize',
          transition: 'background-color 0.2s ease',
        }}
        onMouseDown={verticalDrag.onMouseDown}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#3a3d43';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2a2d33';
        }}
      />
    </>
  );
}
