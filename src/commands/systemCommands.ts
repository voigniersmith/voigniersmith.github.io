import { Command, CommandDeps } from './types';
import { AnimationSpeed } from '../utils/animationSpeed';
import { start } from '../data';
import { ColorMode } from '../terminal/terminal';

export function createSystemCommands(deps: CommandDeps): Command[] {
  const { createOutput, onAnimationRef, onStopAnimationRef, onThemeRef } = deps;

  return [
    {
      match: (input) => {
        const cmd = input.toLocaleLowerCase().trim();
        return cmd === 'clear' || cmd === 'exit' || cmd === 'cls';
      },
      description: "'clear' (or 'exit', 'cls'): clear the terminal",
      execute: () => [],
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'start',
      description: "'start': show the start message",
      execute: (input, ld) => {
        onAnimationRef.current?.(start, AnimationSpeed.FAST);
        return [];
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'stop',
      description: "'stop': stop the current animation",
      execute: (input, ld) => {
        onStopAnimationRef.current?.();
        ld.push(createOutput('animation stopped'));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'time',
      description: "'time': display current time",
      execute: (input, ld) => {
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
      execute: (input, ld) => {
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
          onThemeRef.current?.(colorMode);
          ld.push(createOutput('theme set to ' + themeName));
        } else {
          ld.push(createOutput('theme: ' + themeName + ': invalid theme'));
          ld.push(createOutput('available themes: dark, light, dracula, nord, monokai, solarized-dark, gruvbox'));
        }
        return ld;
      },
    },
    {
      match: (input) => input.substring(0, 4).toLocaleLowerCase().trim() === 'echo',
      description: "'echo [str_to_echo]': echo following string",
      execute: (input, ld) => {
        ld.push(createOutput(input.substring(5)));
        return ld;
      },
    },
  ];
}
