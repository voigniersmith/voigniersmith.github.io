import { Command, CommandDeps } from './types';
import { dir, dir_type } from '../data';
import { getFileContent } from '../data/fileRegistry';
import { formatFilename } from '../utils/fileFormatter';
import { AnimationSpeed } from '../utils/animationSpeed';

export function createFileCommands(deps: CommandDeps): Command[] {
  const { createOutput, fileCheck, onAnimationRef } = deps;

  return [
    {
      match: (input) => {
        const cmd = input.toLocaleLowerCase().trim().substring(0, 2);
        return cmd === 'ls' || cmd === 'll' || cmd === 'la';
      },
      description: "'ls' (or 'll', 'la'): list contents of current directory",
      execute: (input, ld, curdir) => {
        const args = input.substring(2).trim();
        let targetDir = curdir;

        if (args) {
          if (args === '.' || args === './') {
            targetDir = curdir;
          } else if (args.startsWith('~')) {
            targetDir = args;
          } else {
            targetDir = curdir === '~' ? '~/' + args : curdir + '/' + args;
          }
        }

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

        if (!targetPath || targetPath === '.') {
          return ld;
        }

        let newPath = '';

        if (targetPath === '..') {
          if (curdir === '~') {
            return ld;
          } else {
            newPath = '~';
          }
        } else if (targetPath.startsWith('~')) {
          const pathExists = dir[(targetPath as any) as keyof dir_type];
          if (pathExists) {
            newPath = targetPath;
          } else {
            ld.push(createOutput('cd: ' + targetPath + ': no such file or directory'));
            return ld;
          }
        } else {
          let fullPath = curdir === '~' ? '~/' + targetPath : curdir + '/' + targetPath;
          const pathExists = dir[(fullPath as any) as keyof dir_type];
          if (pathExists) {
            newPath = fullPath;
          } else {
            ld.push(createOutput('cd: ' + targetPath + ': no such file or directory'));
            return ld;
          }
        }

        if (newPath) {
          const onCurDirRef = deps.onCurDirRef;
          onCurDirRef.current?.(newPath);
        }

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
            onAnimationRef.current?.(content, AnimationSpeed.NORMAL);
          }
        } else {
          ld.push(createOutput('cat: ' + fileName + ': No such file or directory'));
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
  ];
}
