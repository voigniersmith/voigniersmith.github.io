import { useState, useEffect, useRef } from 'react';

export interface TypewriterOptions {
  content: string[];
  speed: number;
  enabled?: boolean;
  lineByLine?: boolean;
}

export interface TypewriterResult {
  displayLines: string[];
  isAnimating: boolean;
}

export function useTypewriter({
  content,
  speed,
  enabled = true,
  lineByLine = false
}: TypewriterOptions): TypewriterResult {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const rafRef = useRef<number | null>(null);
  const positionRef = useRef({ lineIndex: 0, charIndex: 0 });
  const timingsRef = useRef({ lastTime: 0 });

  // Build display lines when indices change
  useEffect(() => {
    const lines: string[] = [];
    for (let i = 0; i <= currentLineIndex && i < content.length; i++) {
      if (i < currentLineIndex) {
        lines.push(content[i]);
      } else {
        lines.push(content[i].substring(0, currentCharIndex));
      }
    }
    setDisplayLines(lines);
  }, [currentLineIndex, currentCharIndex, content]);

  // Main animation effect
  useEffect(() => {
    if (!enabled || content.length === 0) {
      setIsAnimating(false);
      return;
    }

    // Reset position
    positionRef.current = { lineIndex: 0, charIndex: 0 };
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setIsAnimating(true);
    timingsRef.current.lastTime = 0;

    const msPerUnit = 1000 / speed;
    let shouldContinue = true;

    const animate = (time: number) => {
      if (!shouldContinue) return;

      // Initialize timing
      if (timingsRef.current.lastTime === 0) {
        timingsRef.current.lastTime = time;
      }

      const elapsed = time - timingsRef.current.lastTime;

      if (elapsed >= msPerUnit) {
        timingsRef.current.lastTime = time;

        const pos = positionRef.current;

        if (lineByLine) {
          // Line-by-line mode: advance one line at a time
          const nextLineIdx = pos.lineIndex + 1;
          if (nextLineIdx >= content.length) {
            // All done
            shouldContinue = false;
            setIsAnimating(false);
          } else {
            pos.lineIndex = nextLineIdx;
            pos.charIndex = 0;
            setCurrentLineIndex(nextLineIdx);
            setCurrentCharIndex(0);
          }
        } else {
          // Character-by-character mode
          const currentLine = content[pos.lineIndex];

          if (!currentLine) {
            // Done animating
            shouldContinue = false;
            setIsAnimating(false);
          } else {
            const nextChar = pos.charIndex + 1;

            if (nextChar > currentLine.length) {
              // Move to next line
              const nextLineIdx = pos.lineIndex + 1;
              if (nextLineIdx >= content.length) {
                // All done
                shouldContinue = false;
                setIsAnimating(false);
              } else {
                pos.lineIndex = nextLineIdx;
                pos.charIndex = 0;
                setCurrentLineIndex(nextLineIdx);
                setCurrentCharIndex(0);
              }
            } else {
              // Continue current line
              pos.charIndex = nextChar;
              setCurrentCharIndex(nextChar);
            }
          }
        }
      }

      if (shouldContinue) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      shouldContinue = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, content, speed, lineByLine]);

  return {
    displayLines,
    isAnimating
  };
}
