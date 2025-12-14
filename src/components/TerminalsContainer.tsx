import { useRef, ReactNode } from 'react';
import { Divider } from './Divider';
import { ColorMode } from '../terminal/terminal';

interface TerminalsContainerProps {
  colorMode: ColorMode;
  dividerColors: { normal: string; hover: string };
  terminal0: ReactNode;
  terminal1: ReactNode;
  displayValue: number; // Flex percentage from animation/drag
  dragHandlers: { onMouseDown: () => void };
  onDividerDragStart?: () => void;
}

/**
 * Container for two terminals with a draggable horizontal divider between them
 * Animation and drag logic is managed by parent via useTerminalAnimation
 */
export const TerminalsContainer = ({
  colorMode,
  dividerColors,
  terminal0,
  terminal1,
  displayValue,
  dragHandlers,
  onDividerDragStart
}: TerminalsContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Terminal 0 with flexible sizing */}
      <div
        style={{
          flex: `0 0 ${displayValue}%`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: 0 // Force height to be 0 and let flex control it
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {terminal0}
        </div>
      </div>

      {/* Horizontal Divider - draggable */}
      <Divider
        axis="y"
        isDraggable={true}
        onMouseDown={dragHandlers.onMouseDown}
        onDragStart={onDividerDragStart}
        colors={dividerColors}
      />

      {/* Terminal 1 takes remaining space */}
      <div
        style={{
          flex: `1 1 ${100 - displayValue}%`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: 0 // Force height to be 0 and let flex control it
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {terminal1}
        </div>
      </div>
    </div>
  );
};
