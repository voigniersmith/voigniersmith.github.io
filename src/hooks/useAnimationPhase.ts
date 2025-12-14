import { useState, useEffect } from 'react';

interface UseAnimationPhaseProps {
  shouldAnimate: boolean;
  durationMs?: number;
}

interface UseAnimationPhaseReturn {
  isAnimating: boolean;
  animationClassName: string;
}

/**
 * useAnimationPhase - Manages CSS animation lifecycle
 *
 * Returns a className to apply during animation, then removes it after duration
 * to allow inline styles to take control. This solves the problem of CSS
 * animations with `forwards` preventing JavaScript from overriding values.
 *
 * @example
 * const { animationClassName, isAnimating } = useAnimationPhase(isExpanding, 800);
 *
 * return (
 *   <div className={isAnimating ? animationClassName : ''}>
 *     Animated content
 *   </div>
 * );
 */
export function useAnimationPhase({
  shouldAnimate,
  durationMs = 800,
}: UseAnimationPhaseProps): UseAnimationPhaseReturn {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (shouldAnimate) {
      // Start animation
      setIsAnimating(true);

      // After duration, remove animation class to let inline styles take over
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, durationMs);

      return () => clearTimeout(timer);
    } else {
      // If animation is disabled, stop animating
      setIsAnimating(false);
    }
  }, [shouldAnimate, durationMs]);

  return {
    isAnimating,
    animationClassName: isAnimating ? 'animating' : '',
  };
}
