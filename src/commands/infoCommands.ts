import { Command, CommandDeps } from './types';
import { help } from '../data';
import { AnimationSpeed } from '../utils/animationSpeed';

export function createInfoCommands(deps: CommandDeps): Command[] {
  const { createOutput, onAnimationRef, onPromptRef, getHistoryRef } = deps;

  return [
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'help',
      description: "'help': display help with all available commands",
      execute: (input, ld) => {
        ld.push(createOutput('loading help...'));
        onAnimationRef.current?.(help, AnimationSpeed.MEDIUM);
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'whoami',
      description: "'whoami': prints info about me, Andrew Smith",
      execute: (input, ld) => {
        ld.push(createOutput('identifying...'));
        onAnimationRef.current?.([], AnimationSpeed.FAST);
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().substring(0, 2).trim() === 'ps',
      description: "'ps [string_prompt]': set prompt string",
      execute: (input, ld) => {
        onPromptRef.current?.(input.substring(3));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'history',
      description: "'history': show command history",
      execute: (input, ld) => {
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
  ];
}
