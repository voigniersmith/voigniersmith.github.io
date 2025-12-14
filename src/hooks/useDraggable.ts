import { useRef, useEffect, useState, useCallback } from 'react';

interface UseDraggableProps {
  initialValue: number;
  min: number;
  max: number;
  isEnabled: boolean;
  axis: 'x' | 'y'; // 'x' for horizontal (width), 'y' for vertical (height)
  containerSelector: string; // CSS selector to find the container for coordinate bounds
  valueUnit?: 'px' | '%'; // 'px' for pixel values (width), '%' for percentage (height)
  onValueChange?: (value: number) => void;
}

interface UseDraggableReturn {
  value: number;
  isDragging: boolean;
  onMouseDown: () => void;
}

/**
 * useDraggable - A reusable hook for creating draggable elements with constraints
 *
 * Manages all mouse events (mousemove, mouseup) and keeps track of the current
 * drag value. Uses refs to prevent stale closures and maintain current state.
 *
 * @example
 * const { value, isDragging, onMouseDown } = useDraggable({
 *   initialValue: 200,
 *   min: 120,
 *   max: 400,
 *   isEnabled: true,
 *   axis: 'x',
 *   containerSelector: 'div[style*="flex-direction: row"]',
 *   onValueChange: (newWidth) => setState(newWidth)
 * });
 *
 * return <div onMouseDown={onMouseDown} style={{ width: `${value}px` }} />;
 */
export function useDraggable({
  initialValue,
  min,
  max,
  isEnabled,
  axis,
  containerSelector,
  onValueChange,
}: UseDraggableProps): UseDraggableReturn {
  // Track current value (use ref for event handlers to avoid stale closures)
  const valueRef = useRef(initialValue);
  const [value, setValue] = useState(initialValue);

  // Track dragging state
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  // Keep refs in sync with state for use in event handlers
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Clamp value to constraints
  const clampValue = useCallback(
    (val: number) => Math.max(min, Math.min(max, val)),
    [min, max]
  );

  // Handle mouse move - update value based on cursor position
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !isEnabled) return;

      const container = document.querySelector(containerSelector) as HTMLElement;
      if (!container) {
        console.log('Container not found with selector:', containerSelector);
        return;
      }

      const containerRect = container.getBoundingClientRect();

      // Calculate new value based on axis
      let newValue: number;

      if (axis === 'x') {
        // Horizontal drag: use clientX (for width in pixels)
        newValue = e.clientX - containerRect.left;
      } else {
        // Vertical drag: use clientY (for height, convert to percentage)
        const rawValue = e.clientY - containerRect.top;
        newValue = (rawValue / containerRect.height) * 100;
      }

      // Clamp and update
      const clampedValue = clampValue(newValue);
      console.log('Dragging:', { axis, rawValue: newValue, clamped: clampedValue, isDragging: isDraggingRef.current, containerHeight: containerRect.height, containerTop: containerRect.top, clientY: e.clientY });
      setValue(clampedValue);
      onValueChange?.(clampedValue);
    },
    [axis, containerSelector, isEnabled, clampValue, onValueChange]
  );

  // Handle mouse up - end drag
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse down - start drag
  const handleMouseDown = useCallback(() => {
    if (!isEnabled) {
      console.log('Drag not enabled');
      return;
    }
    console.log('Starting drag, isEnabled:', isEnabled);
    setIsDragging(true);
  }, [isEnabled]);

  // Attach/detach global event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    value,
    isDragging,
    onMouseDown: handleMouseDown,
  };
}
