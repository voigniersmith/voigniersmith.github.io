import { useState, useEffect, useMemo, useRef } from 'react';
import { useDraggable } from './useDraggable';

interface AnimationSegment {
  id: string;
  duration: number;
  target: 'vertical' | 'horizontal';
  startValue: number;
  endValue: number;
}

interface UseTerminalAnimationOptions {
  // Animation settings
  enabled?: boolean;
  segments?: AnimationSegment[];

  // Divider settings
  axis: 'x' | 'y'; // Divider axis (x=vertical, y=horizontal)
  dragMin?: number;
  dragMax?: number;
  containerSelector?: string;
}

export interface TerminalAnimationState {
  // Animation states
  isExpanded: boolean;
  isAnimating: boolean;

  // Horizontal divider display value (flex percentage)
  horizontalDisplayValue: number;

  // Vertical divider display value (pixels)
  verticalDisplayValue: number;

  // Divider drag handlers
  horizontalDragHandlers: {
    onMouseDown: () => void;
  };

  verticalDragHandlers: {
    onMouseDown: () => void;
  };
}

/**
 * Unified hook that manages startup animation orchestration AND drag interactions
 * Supports animation chains where segments execute sequentially
 */
export function useTerminalAnimation(
  options: UseTerminalAnimationOptions
): TerminalAnimationState {
  const {
    enabled = true,
    segments = [],
    axis,
    dragMin = 20,
    dragMax = 80,
    containerSelector = '.container'
  } = options;

  // Animation state
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [horizontalAnimationValue, setHorizontalAnimationValue] = useState(100);
  const [verticalAnimationValue, setVerticalAnimationValue] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  // Trigger expansion animation when enabled
  useEffect(() => {
    if (enabled && !isExpanded) {
      setIsExpanded(true);
      setIsAnimating(true);
      setCurrentSegmentIndex(0);
    }
  }, [enabled, isExpanded]);

  // Animation chain executor
  useEffect(() => {
    if (isAnimating && segments.length > 0 && currentSegmentIndex < segments.length) {
      const currentSegment = segments[currentSegmentIndex];
      const animationStart = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - animationStart;
        const progress = Math.min(elapsed / currentSegment.duration, 1);

        // Cubic ease-in-out easing
        const eased = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

        // Update the appropriate animation value
        const value = currentSegment.startValue + (currentSegment.endValue - currentSegment.startValue) * eased;

        if (currentSegment.target === 'vertical') {
          setVerticalAnimationValue(value);
        } else if (currentSegment.target === 'horizontal') {
          setHorizontalAnimationValue(value);
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Segment complete, start next one
          if (currentSegmentIndex < segments.length - 1) {
            setCurrentSegmentIndex(currentSegmentIndex + 1);
          } else {
            // All animations complete
            setIsAnimating(false);
          }
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isAnimating, currentSegmentIndex, segments]);

  // Stop animations when disabled
  useEffect(() => {
    if (!enabled) {
      setIsExpanded(false);
      setIsAnimating(false);
      setCurrentSegmentIndex(0);
      setHorizontalAnimationValue(100);
      setVerticalAnimationValue(0);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [enabled]);

  // Initialize draggable state for horizontal divider
  const horizontalDragState = useDraggable({
    initialValue: 80,
    min: dragMin,
    max: dragMax,
    isEnabled: true,
    axis,
    containerSelector
  });

  // Initialize draggable state for vertical divider
  const verticalDragState = useDraggable({
    initialValue: 200,
    min: 120,
    max: 400,
    isEnabled: true,
    axis: 'x',
    containerSelector
  });

  // Determine which values to display
  // During animation, use animationValues; otherwise use drag values
  const horizontalDisplayValue = useMemo(() => {
    if (isAnimating) {
      return horizontalAnimationValue;
    }
    return horizontalDragState.value;
  }, [isAnimating, horizontalAnimationValue, horizontalDragState.value]);

  const verticalDisplayValue = useMemo(() => {
    if (isAnimating) {
      return verticalAnimationValue;
    }
    return verticalDragState.value;
  }, [isAnimating, verticalAnimationValue, verticalDragState.value]);

  return {
    isExpanded,
    isAnimating,
    horizontalDisplayValue,
    verticalDisplayValue,
    horizontalDragHandlers: {
      onMouseDown: horizontalDragState.onMouseDown
    },
    verticalDragHandlers: {
      onMouseDown: verticalDragState.onMouseDown
    }
  };
}
