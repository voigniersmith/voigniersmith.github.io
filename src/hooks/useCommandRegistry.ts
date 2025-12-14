import React, { useCallback, useRef, useEffect } from 'react';
import { TerminalOutput, ColorMode } from '../terminal/terminal';
import { dir, dir_type, help, start } from '../data';
import { getFileContent, getFileLink } from '../data/fileRegistry';
import { AnimationSpeed } from '../utils/animationSpeed';
import { formatFilename } from '../utils/fileFormatter';
import { fetchGitHubStats, formatDate } from '../utils/githubApi';
import { getStats, formatStatsDate } from '../utils/visitorStats';
import { fetchGlobalStats } from '../utils/firebase';

/**
 * Command Registry - Centralized command system for terminal
 *
 * This hook provides a command parsing and execution system.
 * Each command is a matcher function paired with an executor function.
 * This makes it easy for AI agents to:
 * - Add new commands
 * - Modify command behavior
 * - Understand what each command does
 */

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

interface Command {
  match: (input: string) => boolean;
  execute: (input: string, lineData: React.ReactNode[], curdir: string) => React.ReactNode[];
  description: string;
  // Optional: specify which terminal to display output in (0 = top, 1 = bottom, default = 1)
  targetTerminal?: 0 | 1;
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

  const dirCheck = useCallback(
    (dirStr: string): string | undefined => {
      const arr = dir['~' as keyof dir_type];
      return arr.find(element => element.localeCompare(dirStr) === 0);
    },
    []
  );

  // Helper to create terminal output nodes
  const createOutput = (text: string) => {
    return React.createElement(TerminalOutput, { key: Math.random() }, text);
  };

  // Define all commands - memoized to prevent recreation
  const commands: Command[] = React.useMemo(() => [
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'view-source',
      description: "'view-source': navigate to the React Terminal UI github source",
      execute: (input, ld, curdir) => {
        ld.push(createOutput('opening source code in new window...'));
        window.open('https://github.com/voigniersmith/voigniersmith.github.io', '_blank');
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'hello there',
      description: "'hello there': easter egg response",
      execute: (input, ld, curdir) => {
        ld.push(createOutput('General Kenobi...'));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'view-react-docs',
      description: "'view-react-docs': navigate to the react docs",
      execute: (input, ld, curdir) => {
        ld.push(createOutput('opening React documentation in new window...'));
        window.open('https://reactjs.org/docs/getting-started.html', '_blank');
        return ld;
      },
    },
    {
      match: (input) => {
        const cmd = input.toLocaleLowerCase().trim();
        return cmd === 'clear' || cmd === 'exit' || cmd === 'cls';
      },
      description: "'clear' (or 'exit', 'cls'): clear the terminal",
      execute: (input, ld, curdir) => [],
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'start',
      description: "'start': show the start message",
      execute: (input, ld, curdir) => {
        onAnimationRef.current(start, AnimationSpeed.FAST);
        return [];
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'stop',
      description: "'stop': stop the current animation",
      execute: (input, ld, curdir) => {
        if (onStopAnimationRef.current) {
          onStopAnimationRef.current();
        }
        ld.push(createOutput('animation stopped'));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'help',
      description: "'help': display help with all available commands",
      execute: (input, ld, curdir) => {
        ld.push(createOutput('loading help...'));
        onAnimationRef.current(help, AnimationSpeed.MEDIUM);
        return ld;
      },
    },
    {
      match: (input) => input.substring(0, 4).toLocaleLowerCase().trim() === 'echo',
      description: "'echo [str_to_echo]': echo following string",
      execute: (input, ld, curdir) => {
        ld.push(createOutput(input.substring(5)));
        return ld;
      },
    },
    {
      match: (input) => {
        const cmd = input.toLocaleLowerCase().trim().substring(0, 2);
        return cmd === 'ls' || cmd === 'll' || cmd === 'la';
      },
      description: "'ls' (or 'll', 'la'): list contents of current directory",
      execute: (input, ld, curdir) => {
        const args = input.substring(2).trim();
        let targetDir = curdir;

        // If an argument is provided, try to use it as the target directory
        if (args) {
          // Handle current directory explicitly
          if (args === '.' || args === './') {
            targetDir = curdir;
          }
          // Handle absolute paths starting with ~
          else if (args.startsWith('~')) {
            targetDir = args;
          }
          // Handle relative paths
          else {
            targetDir = curdir === '~' ? '~/' + args : curdir + '/' + args;
          }
        }

        // Check if the target directory exists
        const dirContents = dir[targetDir as keyof dir_type];
        if (!dirContents) {
          ld.push(createOutput('ls: ' + (args || '.') + ': no such file or directory'));
          return ld;
        }

        ld.push(createOutput(targetDir + '/'));
        dirContents.forEach((d) => {
          ld.push(createOutput('  ' + formatFilename(d)));
        });
        return ld;
      },
    },
    {
      match: (input) => input.substring(0, 2).toLocaleLowerCase().trim() === 'cd',
      description: "'cd [dir_name]': change directory",
      execute: (input, ld, curdir) => {
        const targetPath = input.substring(3).trim();

        // Handle empty input or '.' (current directory)
        if (!targetPath || targetPath === '.') {
          return ld;
        }

        let newPath = '';

        // Handle '..' (parent directory)
        if (targetPath === '..') {
          if (curdir === '~') {
            // Already at root
            return ld;
          } else {
            // Go back to parent (root in this case)
            newPath = '~';
          }
        }
        // Handle absolute paths starting with ~
        else if (targetPath.startsWith('~')) {
          // Direct absolute path like ~/Documents/file
          const pathExists = dir[(targetPath as any) as keyof dir_type];
          if (pathExists) {
            newPath = targetPath;
          } else {
            ld.push(createOutput('cd: ' + targetPath + ': no such file or directory'));
            return ld;
          }
        }
        // Handle relative paths
        else {
          // Build the full path from current directory
          let fullPath = curdir === '~' ? '~/' + targetPath : curdir + '/' + targetPath;

          // Check if this path exists in our dir structure
          const pathExists = dir[(fullPath as any) as keyof dir_type];
          if (pathExists) {
            newPath = fullPath;
          } else {
            ld.push(createOutput('cd: ' + targetPath + ': no such file or directory'));
            return ld;
          }
        }

        // Update the current directory
        if (newPath) {
          onCurDirRef.current(newPath);
        }

        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'time',
      description: "'time': display current time",
      execute: (input, ld, curdir) => {
        const d = new Date();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}:${seconds}`;
        ld.push(createOutput(timeStr));
        return ld;
      },
    },
    {
      match: (input) => input.substring(0, 5).toLocaleLowerCase().trim() === 'theme',
      description: "'theme [type]': change theme [light, dark, dracula, nord, monokai, solarized-dark, gruvbox]",
      execute: (input, ld, curdir) => {
        const themeName = input.substring(5).trim().toLocaleLowerCase();
        if (!themeName) {
          ld.push(createOutput('theme: missing operand'));
          ld.push(createOutput('available themes: dark, light, dracula, nord, monokai, solarized-dark, gruvbox'));
          return ld;
        }

        const themeMap: { [key: string]: ColorMode } = {
          'dark': ColorMode.Dark,
          'light': ColorMode.Light,
          'dracula': ColorMode.Dracula,
          'nord': ColorMode.Nord,
          'monokai': ColorMode.Monokai,
          'solarized-dark': ColorMode.SolarizedDark,
          'gruvbox': ColorMode.GruvBox,
        };

        const colorMode = themeMap[themeName];
        if (colorMode !== undefined) {
          if (onThemeRef.current) {
            onThemeRef.current(colorMode);
          }
          ld.push(createOutput('theme set to ' + themeName));
        } else {
          ld.push(createOutput('theme: ' + themeName + ': invalid theme'));
          ld.push(createOutput('available themes: dark, light, dracula, nord, monokai, solarized-dark, gruvbox'));
        }
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'pwd',
      description: "'pwd': print working directory",
      execute: (input, ld, curdir) => {
        ld.push(createOutput(curdir));
        return ld;
      },
    },
    {
      match: (input) => {
        const cmd = input.toLocaleLowerCase().trim().substring(0, 4);
        return cmd.startsWith('cat') || cmd.startsWith('show');
      },
      description: "'cat' (or 'show') [file_name]: show file contents",
      execute: (input, ld, curdir) => {
        // Handle both 'cat' and 'show' commands
        const cmdLength = input.toLocaleLowerCase().trim().startsWith('cat') ? 3 : 4;
        const fileName = input.toLocaleLowerCase().substring(cmdLength).trim();
        if (!fileName) {
          ld.push(createOutput('cat: missing operand'));
          ld.push(createOutput('usage: cat <file>'));
          return ld;
        }
        const file = fileCheck(fileName, curdir);
        if (file) {
          const content = getFileContent(file);
          if (content) {
            ld.push(createOutput('displaying ' + file + '...'));
            onAnimationRef.current(content, AnimationSpeed.NORMAL);
          }
        } else {
          ld.push(createOutput('cat: ' + fileName + ': No such file or directory'));
        }
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'whoami',
      description: "'whoami': prints info about me, Andrew Smith",
      execute: (input, ld, curdir) => {
        ld.push(createOutput('identifying...'));
        onAnimationRef.current([], AnimationSpeed.FAST);
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().substring(0, 2).trim() === 'ps',
      description: "'ps [string_prompt]': set prompt string",
      execute: (input, ld, curdir) => {
        onPromptRef.current(input.substring(3));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().substring(0, 2).trim() === 'ln',
      description: "'ln [file_name]': opens appropriate url for file",
      execute: (input, ld, curdir) => {
        const fileName = input.toLocaleLowerCase().substring(3).trim();
        if (!fileName) {
          ld.push(createOutput('ln: missing operand'));
          ld.push(createOutput('usage: ln <file>'));
          return ld;
        }
        const file = fileCheck(fileName, curdir);
        if (file) {
          const link = getFileLink(file);
          if (link) {
            if (link.startsWith('mailto:')) {
              ld.push(createOutput('opening email client...'));
              window.location.href = link;
            } else {
              ld.push(createOutput('opening link in new window...'));
              window.open(link, '_blank');
            }
          } else {
            ld.push(createOutput('ln: ' + file + ': no associated link'));
          }
        } else {
          ld.push(createOutput('ln: ' + fileName + ': no such file or directory'));
        }
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'history',
      description: "'history': show command history",
      execute: (input, ld, curdir) => {
        const history = getHistoryRef.current?.() || [];
        if (history.length === 0) {
          ld.push(createOutput('no command history'));
        } else {
          history.forEach((cmd, index) => {
            ld.push(createOutput(`  ${index + 1}  ${cmd}`));
          });
        }
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'global-stats',
      description: "'global-stats': show aggregate visitor statistics",
      execute: (input, ld, curdir) => {
        ld.push(createOutput('fetching global statistics...'));

        executeAsyncCommand(
          'global-stats',
          'fetching global statistics...',
          () => fetchGlobalStats(),
          (globalStats) => {
            const statsLines: string[] = [];
            statsLines.push('');
            statsLines.push('═════════════════════════════════════════');
            statsLines.push('      GLOBAL PORTFOLIO STATISTICS');
            statsLines.push('═════════════════════════════════════════');
            statsLines.push('');

            if (globalStats) {
              statsLines.push('Overall Usage');
              statsLines.push(`  Total Page Loads:     ${globalStats.totalPageLoads || 0}`);
              statsLines.push(`  Total Commands:       ${globalStats.totalCommands || 0}`);
              statsLines.push(`  Last Page Load:       ${globalStats.lastPageLoad ? formatDate(globalStats.lastPageLoad) : 'Never'}`);
              statsLines.push('');

              // Most used commands
              if (globalStats.commands && Object.keys(globalStats.commands).length > 0) {
                statsLines.push('Most Used Commands');
                const cmds = Object.entries(globalStats.commands)
                  .map(([cmd, count]: [string, any]) => ({ cmd, count }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10);

                cmds.forEach(({ cmd, count }) => {
                  statsLines.push(`  ${cmd}: ${count}`);
                });
                statsLines.push('');
              }
            } else {
              statsLines.push('No global stats available yet.');
              statsLines.push('Make sure Firebase is configured in .env.local');
              statsLines.push('');
            }

            statsLines.push('═════════════════════════════════════════');
            statsLines.push('');

            return statsLines;
          },
          (lines) => {
            if (onUpdateLineData0Ref.current) {
              onUpdateLineData0Ref.current(() => lines.map(line => createOutput(line)));
            }
          }
        );

        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'stats',
      description: "'stats': show your personal session statistics",
      execute: (input, ld, curdir) => {
        ld.push(createOutput(''));
        ld.push(createOutput('═════════════════════════════════════════'));
        ld.push(createOutput('          PORTFOLIO STATISTICS'));
        ld.push(createOutput('═════════════════════════════════════════'));
        ld.push(createOutput(''));
        ld.push(createOutput('fetching statistics...'));

        (async () => {
          try {
            const [githubStats, visitorStats] = await Promise.all([
              fetchGitHubStats(),
              Promise.resolve(getStats()),
            ]);

            const statsLines: React.ReactNode[] = [];

            // GitHub Stats
            if (githubStats) {
              statsLines.push(createOutput('GitHub Repository (voigniersmith.github.io)'));
              statsLines.push(createOutput(`  Stars:        ${githubStats.stars}`));
              statsLines.push(createOutput(`  Forks:        ${githubStats.forks}`));
              statsLines.push(createOutput(`  Watchers:     ${githubStats.watchers}`));
              statsLines.push(createOutput(`  Open Issues:  ${githubStats.openIssues}`));
              statsLines.push(createOutput(`  Language:     ${githubStats.language}`));
              statsLines.push(createOutput(`  Last Update:  ${formatDate(githubStats.lastUpdate)}`));
              statsLines.push(createOutput(''));
            }

            // Visitor Stats
            statsLines.push(createOutput('Visitor Statistics'));
            statsLines.push(createOutput(`  Total Sessions:      ${visitorStats.totalSessions}`));
            statsLines.push(createOutput(`  Commands Executed:   ${visitorStats.commandsExecuted}`));
            statsLines.push(createOutput(`  First Visit:         ${formatStatsDate(visitorStats.firstVisit)}`));
            statsLines.push(createOutput(`  Last Visit:          ${formatStatsDate(visitorStats.lastVisit)}`));
            statsLines.push(createOutput(''));
            statsLines.push(createOutput('═════════════════════════════════════════'));
            statsLines.push(createOutput(''));

            // Update lineData in Terminal 1
            if (onUpdateLineDataRef.current) {
              onUpdateLineDataRef.current((currentLd) => {
                const updated = [...currentLd];
                updated.pop(); // Remove "fetching..." line
                return [...updated, ...statsLines];
              });
            }
          } catch (error) {
            console.error('Error fetching stats:', error);
          }
        })();

        return ld;
      },
    },
  ], []);

  /**
   * Helper function to execute async commands with duplicate prevention
   * @param commandName - Name of command for pending tracking
   * @param fetchingMessage - Message to show while fetching
   * @param fetchFn - Async function that fetches data
   * @param buildOutputFn - Function that converts fetched data to output lines
   * @param displayFn - Function that displays output (onAnimationRef or onUpdateLineData0Ref)
   */
  const executeAsyncCommand = (
    commandName: string,
    fetchingMessage: string,
    fetchFn: () => Promise<any>,
    buildOutputFn: (data: any) => string[],
    displayFn: (lines: string[]) => void
  ) => {
    // Prevent duplicate executions
    if (!pendingCommandsRef.current.has(commandName)) {
      pendingCommandsRef.current.add(commandName);

      (async () => {
        try {
          const data = await fetchFn();
          const outputLines = buildOutputFn(data);
          displayFn(outputLines);
        } catch (error) {
          console.error(`Error executing ${commandName}:`, error);
        } finally {
          pendingCommandsRef.current.delete(commandName);
        }
      })();
    }
  };

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

      // Special handling for async stats command
      if (input.toLocaleLowerCase().trim() === 'stats') {
        ld.push(createOutput('fetching statistics...'));

        executeAsyncCommand(
          'stats',
          'fetching statistics...',
          () => Promise.all([fetchGitHubStats(), Promise.resolve(getStats())]),
          ([githubStats, visitorStats]) => {
            const statsOutput: string[] = [];
            statsOutput.push('');
            statsOutput.push('═════════════════════════════════════════');
            statsOutput.push('          PORTFOLIO STATISTICS');
            statsOutput.push('═════════════════════════════════════════');
            statsOutput.push('');

            if (githubStats) {
              statsOutput.push('GitHub Repository (voigniersmith.github.io)');
              statsOutput.push(`  Stars:        ${githubStats.stars}`);
              statsOutput.push(`  Forks:        ${githubStats.forks}`);
              statsOutput.push(`  Watchers:     ${githubStats.watchers}`);
              statsOutput.push(`  Open Issues:  ${githubStats.openIssues}`);
              statsOutput.push(`  Language:     ${githubStats.language}`);
              statsOutput.push(`  Last Update:  ${formatDate(githubStats.lastUpdate)}`);
              statsOutput.push('');
            }

            statsOutput.push('Visitor Statistics');
            statsOutput.push(`  Total Sessions:      ${visitorStats.totalSessions}`);
            statsOutput.push(`  Commands Executed:   ${visitorStats.commandsExecuted}`);
            statsOutput.push(`  First Visit:         ${formatStatsDate(visitorStats.firstVisit)}`);
            statsOutput.push(`  Last Visit:          ${formatStatsDate(visitorStats.lastVisit)}`);
            statsOutput.push('');
            statsOutput.push('═════════════════════════════════════════');
            statsOutput.push('');

            return statsOutput;
          },
          (lines) => {
            if (onAnimationRef.current) {
              onAnimationRef.current(lines, AnimationSpeed.FAST);
            }
          }
        );

        return ld;
      }

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
    // Exclude commands from dependencies to prevent circular dependency
    // Commands array is defined above and doesn't change during the lifetime of this hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { executeCommand };
}
