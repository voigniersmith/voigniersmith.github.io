import { Command, CommandDeps } from './types';
import { getFileLink } from '../data/fileRegistry';

export function createLinkCommands(deps: CommandDeps): Command[] {
  const { createOutput, fileCheck } = deps;

  return [
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'view-source',
      description: "'view-source': navigate to the React Terminal UI github source",
      execute: (input, ld) => {
        ld.push(createOutput('opening source code in new window...'));
        window.open('https://github.com/voigniersmith/voigniersmith.github.io', '_blank');
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'view-react-docs',
      description: "'view-react-docs': navigate to the react docs",
      execute: (input, ld) => {
        ld.push(createOutput('opening React documentation in new window...'));
        window.open('https://reactjs.org/docs/getting-started.html', '_blank');
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'hello there',
      description: "'hello there': easter egg response",
      execute: (input, ld) => {
        ld.push(createOutput('General Kenobi...'));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'use the force',
      description: "'use the force': may the force be with you",
      execute: (input, ld) => {
        ld.push(createOutput('May the Force be with you...'));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'i am your father',
      description: "'i am your father': classic vader moment",
      execute: (input, ld) => {
        ld.push(createOutput('No... that is not true... that is impossible!'));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'do or do not',
      description: "'do or do not': yoda wisdom",
      execute: (input, ld) => {
        ld.push(createOutput('There is no try.'));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'gotta catch em all',
      description: "'gotta catch em all': pokemon reference",
      execute: (input, ld) => {
        ld.push(createOutput('Gotta catch \'em all! Pokemon!'));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'the answer is',
      description: "'the answer is': hitchhiker's guide reference",
      execute: (input, ld) => {
        ld.push(createOutput('42'));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'all your base',
      description: "'all your base': classic meme",
      execute: (input, ld) => {
        ld.push(createOutput('All your base are belong to us.'));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'sudo make me a sandwich',
      description: "'sudo make me a sandwich': XKCD reference",
      execute: (input, ld) => {
        ld.push(createOutput('Only with root access...'));
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
  ];
}
