import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Terminal, { ColorMode, TerminalInput, TerminalOutput } from '../terminal/terminal';
import { useTypewriter } from '../hooks/useTypewriter';
import { useCommandRegistry } from '../hooks/useCommandRegistry';
import { useTerminalAnimation } from '../hooks/useTerminalAnimation';
import { AnimationSpeed } from '../utils/animationSpeed';
import FileTree from '../components/FileTree';
import { Layout } from '../components/Layout';
import { InfoBox } from '../components/InfoBox';
import { Divider } from '../components/Divider';
import { TerminalsContainer } from '../components/TerminalsContainer';
import { start } from '../data/index';
import { getFileContent } from '../data/fileRegistry';
import { recordCommand } from '../utils/visitorStats';
import { recordGlobalCommand } from '../utils/firebase';
import './terminalController.css';

interface TerminalControllerProps {
  shouldAnimate?: boolean;
}

const TerminalController = (props: TerminalControllerProps = {}) => {
  // State
  const [colorMode, setColorMode] = useState(ColorMode.Dark);
  const [lineData0, setLineData0] = useState<React.ReactNode[]>([<TerminalOutput key="initial" />]);
  const [lineData1, setLineData1] = useState<React.ReactNode[]>([<TerminalOutput key="initial" />]);
  const [curdir, setCurdir] = useState('~');
  const [promptStr, setPromptStr] = useState('$');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  // Refs to keep latest values without causing re-renders
  const curdirRef = useRef(curdir);
  const promptStrRef = useRef(promptStr);

  useEffect(() => {
    curdirRef.current = curdir;
  }, [curdir]);

  useEffect(() => {
    promptStrRef.current = promptStr;
  }, [promptStr]);

  // Terminal animation: startup + drag interactions
  // Animations execute sequentially: horizontal first, then vertical
  const animationSegments = useMemo(() => [
    {
      id: 'horizontal-resize',
      duration: 610,
      target: 'horizontal' as const,
      startValue: 100,
      endValue: 80 // Terminals animate
    },
    {
      id: 'vertical-slide',
      duration: 610,
      target: 'vertical' as const,
      startValue: 0,
      endValue: 200 // File explorer slides in from left
    }
  ], []);

  const animation = useTerminalAnimation({
    enabled: true,
    segments: animationSegments,
    axis: 'y'
  });

  const {
    isExpanded,
    horizontalDisplayValue,
    verticalDisplayValue,
    verticalDragHandlers
  } = animation;
  const fileExplorerAnimating = isExpanded;

  // Animation state
  const [animationContent, setAnimationContent] = useState<string[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(AnimationSpeed.MEDIUM);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Typewriter animation hook
  const { displayLines } = useTypewriter({
    content: animationContent,
    speed: animationSpeed,
    enabled: shouldAnimate
  });

  // Initialize with startup animation
  useEffect(() => {
    if (isExpanded) {
      setLineData0([]);
      setAnimationContent(start);
      setAnimationSpeed(AnimationSpeed.MEDIUM);
      setShouldAnimate(true);
    }
  }, [isExpanded]);

  // File explorer animation runs once and stays - no need to reset

  // Update terminal with animation output
  useEffect(() => {
    if (displayLines.length > 0) {
      const outputs = displayLines.map((line, i) => (
        <TerminalOutput key={i}>{line}</TerminalOutput>
      ));
      setLineData0(outputs);
    }
  }, [displayLines]);

  // Command registry callbacks
  const handleAnimation = useCallback((content: string[], speed: number) => {
    setShouldAnimate(false);
    setLineData0([]);
    setAnimationContent(content);
    setAnimationSpeed(speed);
    setTimeout(() => {
      setShouldAnimate(true);
    }, 0);
  }, []);

  const handleStopAnimation = useCallback(() => {
    setShouldAnimate(false);
  }, []);

  const handleTheme = useCallback((colorMode: ColorMode) => {
    setColorMode(colorMode);
  }, []);

  // Callback to update lineData1 from async commands
  const handleUpdateLineData = useCallback((updater: (ld: React.ReactNode[]) => React.ReactNode[]) => {
    setLineData1((prevLd) => updater(prevLd));
  }, []);

  // Callback to update lineData0 directly (for Terminal 0 output without animation)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdateLineData0 = useCallback((updater: (ld: React.ReactNode[]) => React.ReactNode[]) => {
    setLineData0((prevLd) => updater(prevLd));
  }, []);

  // Command registry hook
  const { executeCommand } = useCommandRegistry({
    onAnimation: handleAnimation,
    onCurDir: setCurdir,
    onPrompt: setPromptStr,
    onStopAnimation: handleStopAnimation,
    onTheme: handleTheme,
    getHistory: () => commandHistory,
    onUpdateLineData: handleUpdateLineData,
    onUpdateLineData0: handleUpdateLineData0,
  });

  // Ref to measure Terminal 0 content height
  const terminal0Ref = useRef<HTMLDivElement>(null);

  // Handle drag start on horizontal divider
  const handleHorizontalDividerDragStart = useCallback(() => {
    // Placeholder for any future drag start logic
  }, []);

  // Get theme-aware divider colors
  const getDividerColors = (colorMode: ColorMode) => {
    const colorMap: { [key in ColorMode]: { normal: string; hover: string } } = {
      [ColorMode.Dark]: { normal: '#2a2d33', hover: '#3a3d43' },
      [ColorMode.Light]: { normal: '#d0d0d0', hover: '#b0b0b0' },
      [ColorMode.Dracula]: { normal: '#44475a', hover: '#6272a4' },
      [ColorMode.Nord]: { normal: '#3b4252', hover: '#81a1c1' },
      [ColorMode.Monokai]: { normal: '#3e3d32', hover: '#49483e' },
      [ColorMode.SolarizedDark]: { normal: '#073642', hover: '#268bd2' },
      [ColorMode.GruvBox]: { normal: '#3c3836', hover: '#83a598' },
    };
    return colorMap[colorMode] || colorMap[ColorMode.Dark];
  };

  const dividerColors = getDividerColors(colorMode);

  // File selection handler
  function handleFileSelect(filePath: string) {
    // Extract filename from full path (e.g., "~/projects/shell.cpp" -> "shell.cpp")
    const fileName = filePath.split('/').pop() || filePath;
    const content = getFileContent(fileName);

    if (content) {
      setAnimationContent(content);
      setAnimationSpeed(AnimationSpeed.NORMAL);
      setShouldAnimate(true);
    }
  }

  // Terminal input handlers
  const onInput1 = useCallback((input: string) => {
    if (input.trim()) {
      setCommandHistory((prev) => [...prev, input]);
      recordCommand();
      recordGlobalCommand(input);
    }
    setLineData1((prevLineData1) => {
      const ld = [...prevLineData1];
      ld.push(<TerminalInput key={Date.now()}>{promptStr + ' ' + input}</TerminalInput>);
      const result = executeCommand(input, ld, curdir);
      return result;
    });
  }, [executeCommand, promptStr, curdir]);


  const themeClassName = (() => {
    switch (colorMode) {
      case ColorMode.Light: return 'theme-light';
      case ColorMode.Dracula: return 'theme-dracula';
      case ColorMode.Nord: return 'theme-nord';
      case ColorMode.Monokai: return 'theme-monokai';
      case ColorMode.SolarizedDark: return 'theme-solarized-dark';
      case ColorMode.GruvBox: return 'theme-gruvbox';
      default: return '';
    }
  })();

  return (
    <Layout
      colorMode={colorMode}
      themeClassName={themeClassName}
      sidebar={
        fileExplorerAnimating && (
          <InfoBox
            style={{
              width: `${verticalDisplayValue}px`,
              height: '100%',
              pointerEvents: 'auto'
            }}
          >
            <FileTree currentDir={curdir} onFileSelect={handleFileSelect} colorMode={colorMode} />
          </InfoBox>
        )
      }
      sidebarDivider={
        fileExplorerAnimating && (
          <Divider
            axis="x"
            isDraggable={true}
            onMouseDown={verticalDragHandlers.onMouseDown}
            colors={dividerColors}
          />
        )
      }
      main={
        <div
          className={isExpanded ? 'terminals-container-expanding' : 'terminals-container-hidden'}
          style={{ display: 'flex', flex: isExpanded ? 1 : 0, overflow: 'hidden' }}
        >
          {isExpanded && (
            <TerminalsContainer
              colorMode={colorMode}
              dividerColors={dividerColors}
              onDividerDragStart={handleHorizontalDividerDragStart}
              displayValue={horizontalDisplayValue}
              dragHandlers={animation.horizontalDragHandlers}
              terminal0={
                <Terminal
                  ref={terminal0Ref}
                  name="TERMINAL 0"
                  colorMode={colorMode}
                  num={0}
                  prompt={promptStr}
                  curdir={curdir}
                  readOnly={true}
                  style={{
                    height: '100%',
                    overflow: 'auto'
                  }}
                >
                  {lineData0}
                </Terminal>
              }
              terminal1={
                <Terminal
                  name="TERMINAL 1"
                  colorMode={colorMode}
                  onInput={onInput1}
                  num={1}
                  prompt={promptStr}
                  curdir={curdir}
                  style={{ height: '100%', overflow: 'auto' }}
                >
                  {lineData1}
                </Terminal>
              }
            />
          )}
        </div>
      }
    />
  );
};

export default TerminalController;