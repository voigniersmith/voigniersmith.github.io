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
