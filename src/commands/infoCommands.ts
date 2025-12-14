import { Command, CommandDeps } from './types';
import { help } from '../data';
import { MAN_PAGES, PROJECTS } from '../data/manPages';
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
    {
      match: (input) => {
        const cmd = input.toLocaleLowerCase().trim();
        return cmd === 'man' || cmd.startsWith('man ');
      },
      description: "'man [command]': display detailed documentation for a command",
      execute: (input, ld) => {
        const args = input.toLocaleLowerCase().trim().substring(3).trim();

        if (!args) {
          ld.push(createOutput(''));
          ld.push(createOutput('Usage: man <command>'));
          ld.push(createOutput(''));
          ld.push(createOutput('Available man pages:'));
          Object.keys(MAN_PAGES).forEach((cmd) => {
            ld.push(createOutput(`  man ${cmd}`));
          });
          ld.push(createOutput(''));
          return ld;
        }

        const manPage = MAN_PAGES[args];
        if (!manPage) {
          ld.push(createOutput(`man: no manual entry for "${args}"`));
          return ld;
        }

        ld.push(createOutput(''));
        ld.push(createOutput(`NAME`));
        ld.push(createOutput(`  ${manPage.name} - ${manPage.description}`));
        ld.push(createOutput(''));
        ld.push(createOutput(`USAGE`));
        ld.push(createOutput(`  ${manPage.usage}`));
        ld.push(createOutput(''));
        ld.push(createOutput(`EXAMPLES`));
        manPage.examples.forEach((example) => {
          ld.push(createOutput(`  ${example}`));
        });
        if (manPage.relatedCommands && manPage.relatedCommands.length > 0) {
          ld.push(createOutput(''));
          ld.push(createOutput(`SEE ALSO`));
          ld.push(createOutput(`  ${manPage.relatedCommands.join(', ')}`));
        }
        ld.push(createOutput(''));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'projects',
      description: "'projects': list all your projects",
      execute: (input, ld) => {
        ld.push(createOutput(''));
        ld.push(createOutput('Available Projects:'));
        ld.push(createOutput(''));
        PROJECTS.forEach((project) => {
          ld.push(createOutput(`  ${project.filename.padEnd(20)} ${project.description}`));
        });
        ld.push(createOutput(''));
        ld.push(createOutput('Use "cat [filename]" to view project details'));
        ld.push(createOutput('Use "ln [filename]" to open the GitHub repository'));
        ld.push(createOutput(''));
        return ld;
      },
    },
  ];
}
