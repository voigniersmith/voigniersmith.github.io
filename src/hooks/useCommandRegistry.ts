import React, { useCallback, useRef, useEffect } from 'react';
import { TerminalOutput } from '../terminal/terminal';
import { dir, dir_type } from '../data';

import { Command, CommandDeps } from '../commands/types';
import { createSystemCommands } from '../commands/systemCommands';
import { createFileCommands } from '../commands/fileCommands';
import { createLinkCommands } from '../commands/linkCommands';
import { createInfoCommands } from '../commands/infoCommands';
import { createStatsCommands } from '../commands/statsCommands';

interface CommandCallbacks {
  onAnimation: (content: string[], speed: number) => void;
  onCurDir: (dir: string) => void;
  onPrompt: (prompt: string) => void;
  onStopAnimation?: () => void;
  onTheme?: (colorMode: number) => void;
  getHistory?: () => string[];
  onUpdateLineData?: (updater: (ld: React.ReactNode[]) => React.ReactNode[]) => void;
  onUpdateLineData0?: (updater: (ld: React.ReactNode[]) => React.ReactNode[]) => void;
}

export function useCommandRegistry(callbacks: CommandCallbacks) {
  const { onAnimation, onCurDir, onPrompt, onStopAnimation, onTheme, getHistory, onUpdateLineData, onUpdateLineData0 } = callbacks;

  // Keep callback refs to avoid recreating commands array
  const onAnimationRef = useRef(onAnimation);
  const onCurDirRef = useRef(onCurDir);
  const onPromptRef = useRef(onPrompt);
  const onStopAnimationRef = useRef(onStopAnimation);
  const onThemeRef = useRef(onTheme);
  const getHistoryRef = useRef(getHistory);
  const onUpdateLineDataRef = useRef(onUpdateLineData);
  const onUpdateLineData0Ref = useRef(onUpdateLineData0);

  // Track pending async command executions to prevent duplicates
  const pendingCommandsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    onAnimationRef.current = onAnimation;
    onCurDirRef.current = onCurDir;
    onPromptRef.current = onPrompt;
    onStopAnimationRef.current = onStopAnimation;
    onThemeRef.current = onTheme;
    getHistoryRef.current = getHistory;
    onUpdateLineDataRef.current = onUpdateLineData;
    onUpdateLineData0Ref.current = onUpdateLineData0;
  }, [onAnimation, onCurDir, onPrompt, onStopAnimation, onTheme, getHistory, onUpdateLineData, onUpdateLineData0]);

  // Helper functions
  const fileCheck = useCallback(
    (str: string, curdir: string): string | undefined => {
      const arr = dir[curdir as keyof dir_type];
      return arr.find(element => element.localeCompare(str) === 0);
    },
    []
  );

  // Helper to create terminal output nodes
  const createOutput = useCallback((text: string) => {
    return React.createElement(TerminalOutput, { key: Math.random() }, text);
  }, []);

  // Helper function to execute async commands with duplicate prevention
  const executeAsyncCommand = useCallback(
    (
      commandName: string,
      fetchingMessage: string,
      fetchFn: () => Promise<any>,
      buildOutputFn: (data: any) => string[],
      displayFn: (lines: string[]) => void
    ) => {
      if (!pendingCommandsRef.current.has(commandName)) {
        pendingCommandsRef.current.add(commandName);

        // Spinner animation characters
        const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let spinnerIndex = 0;

        // Start spinner animation in the terminal
        const spinnerInterval = setInterval(() => {
          const spinnerChar = spinnerChars[spinnerIndex % spinnerChars.length];
          const animatedMessage = `${fetchingMessage} ${spinnerChar}`;
          onUpdateLineDataRef.current?.((ld) => {
            const updated = [...ld];
            if (updated.length > 0) {
              // Update the last line (the loading message) with the spinner
              updated[updated.length - 1] = createOutput(animatedMessage);
            }
            return updated;
          });
          spinnerIndex++;
        }, 100);

        (async () => {
          try {
            const data = await fetchFn();
            clearInterval(spinnerInterval);
            const outputLines = buildOutputFn(data);
            displayFn(outputLines);
          } catch (error) {
            clearInterval(spinnerInterval);
            console.error(`Error executing ${commandName}:`, error);
          } finally {
            pendingCommandsRef.current.delete(commandName);
          }
        })();
      }
    },
    [createOutput, onUpdateLineDataRef]
  );

  // Define all commands - memoized to prevent recreation
  const commands: Command[] = React.useMemo(() => {
    const commandDeps: CommandDeps = {
      createOutput,
      onAnimationRef,
      onCurDirRef,
      onPromptRef,
      onStopAnimationRef,
      onThemeRef,
      getHistoryRef,
      onUpdateLineDataRef,
      onUpdateLineData0Ref,
      fileCheck,
      executeAsyncCommand,
    };

    return [
      ...createSystemCommands(commandDeps),
      ...createFileCommands(commandDeps),
      ...createLinkCommands(commandDeps),
      ...createInfoCommands(commandDeps),
      ...createStatsCommands(commandDeps),
    ];
  }, [createOutput, fileCheck, executeAsyncCommand]);

  /**
   * Parse and execute a command
   * @param input - The command string
   * @param lineData - Current terminal line data
   * @param curdir - Current directory
   * @returns Updated line data
   */
  const executeCommand = useCallback(
    (input: string, lineData: React.ReactNode[], curdir: string): React.ReactNode[] => {
      let ld = [...lineData];

      // Try to match a command
      for (const command of commands) {
        if (command.match(input)) {
          ld = command.execute(input, ld, curdir);
          return ld;
        }
      }

      // If no command matched and input is not empty, show error
      if (input) {
        ld.push(createOutput(' '));
        ld.push(createOutput('command not found: ' + input));
      }
      return ld;
    },
    [commands, createOutput]
  );

  return { executeCommand };
}
