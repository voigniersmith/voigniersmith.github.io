import { useCallback, CSSProperties } from 'react';

interface DividerProps {
  axis: 'x' | 'y'; // 'x' for vertical divider, 'y' for horizontal divider
  isDraggable?: boolean;
  onMouseDown?: () => void;
  onDragStart?: () => void;
  colors: {
    normal: string;
    hover: string;
  };
}

/**
 * Generic draggable or static divider component
 * Supports both vertical (x-axis) and horizontal (y-axis) orientations
 * Parent component is responsible for providing drag logic via onMouseDown
 */
export const Divider = ({
  axis,
  isDraggable = false,
  onMouseDown,
  onDragStart,
  colors
}: DividerProps) => {
  // Handle divider mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      onDragStart?.();
      onMouseDown?.();
    },
    [onMouseDown, onDragStart]
  );

  // Handle hover state
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggable) {
      e.currentTarget.style.backgroundColor = colors.hover;
    }
  }, [isDraggable, colors.hover]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = colors.normal;
  }, [colors.normal]);

  // Base styles for divider
  const baseStyle: CSSProperties = {
    backgroundColor: colors.normal,
    userSelect: 'none',
    flexShrink: 0,
    transition: 'background-color 0.2s ease',
    zIndex: 10
  };

  // Orientation-specific styles
  const orientationStyle: CSSProperties =
    axis === 'x'
      ? {
          width: '6px',
          height: '100%',
          cursor: isDraggable ? 'col-resize' : 'default',
          pointerEvents: isDraggable ? 'auto' : 'none'
        }
      : {
          height: '6px',
          width: '100%',
          cursor: isDraggable ? 'row-resize' : 'default',
          pointerEvents: isDraggable ? 'auto' : 'none'
        };

  return (
    <div
      className="divider"
      style={{
        ...baseStyle,
        ...orientationStyle
      }}
      onMouseDown={isDraggable ? handleMouseDown : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};
