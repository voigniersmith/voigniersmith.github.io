/**
 * File Registry - Maps files to their content and external links
 *
 * This module centralizes all file content and link mappings that were previously
 * hardcoded in TerminalController. This makes the data easily accessible and
 * maintainable by AI agents working in this directory.
 */

import {
  help,
  start,
  floppy19,
  bash42,
  butterfly19,
  omega7,
  xinu8,
  chessboard,
  resume,
  me41,
  me81,
  raspberrypi11,
} from './index';

import {
  bugdetectDes,
  chessDes,
  cryptocalcDes,
  moodifyDes,
  mymallocDes,
  omiliaDes,
  pagingDes,
  pppsDes,
  shellDes,
  voigniersmithDes,
} from './descripts';

/**
 * Maps file names to their content (string arrays for animation)
 * Each entry is an array of strings that will be animated character-by-character
 */
export const FILE_CONTENT_MAP: Record<string, string[]> = {
  'ppps.cpp': pppsDes,
  'shell.cpp': [...bash42, ' ', ...shellDes],
  'bash42': [...bash42, ' ', ...shellDes],
  'omilia.js': [...omega7, ' ', ...omiliaDes],
  'omega7': [...omega7, ' ', ...omiliaDes],
  'mymalloc.c': [...floppy19, ' ', ...mymallocDes],
  'floppy19': [...floppy19, ' ', ...mymallocDes],
  'bugdetect.java': [...butterfly19, ' ', ...bugdetectDes],
  'butterfly19': [...butterfly19, ' ', ...bugdetectDes],
  'voigniersmith.js': voigniersmithDes,
  'paging.c': pagingDes,
  'chess.c': [...chessboard, ' ', ...chessDes],
  'chessboard': [...chessboard, ' ', ...chessDes],
  'cryptocalc.py': cryptocalcDes,
  'moodify.js': moodifyDes,
  'xinu.c': [...xinu8],
  'xinu8': [...xinu8],
  'resume.txt': resume,
  'resume': resume,
  'me81': me81,
  'me41': me41,
  'raspberrypi11': raspberrypi11,
};

/**
 * Maps file names to external URLs for the 'ln' (link) command
 * Can be either web URLs or mailto: links
 */
export const FILE_LINK_MAP: Record<string, string> = {
  'ppps.cpp': 'https://github.com/voigniersmith/CS535FinalProject',
  'shell.cpp': 'https://github.com/voigniersmith/Shell',
  'bash42': 'https://github.com/voigniersmith/Shell',
  'omilia.js': 'https://github.com/voigniersmith/omilia',
  'omega7': 'https://github.com/voigniersmith/omilia',
  'mymalloc.c': 'https://github.com/voigniersmith/myMalloc',
  'floppy19': 'https://github.com/voigniersmith/myMalloc',
  'bugdetect.java': 'https://github.com/voigniersmith/clang-bug-detector',
  'butterfly19': 'https://github.com/voigniersmith/clang-bug-detector',
  'voigniersmith.js': 'https://github.com/voigniersmith/voigniersmith.github.io',
  'paging.c': 'https://github.com/voigniersmith/pagingx86',
  'chess.c': 'https://github.com/voigniersmith/parallel_chess',
  'chessboard': 'https://github.com/voigniersmith/parallel_chess',
  'cryptocalc.py': 'https://github.com/voigniersmith/cs555-algorand-mpc',
  'moodify.js': 'https://github.com/nguyldo/moodify',
  'xinu.c': 'https://xinu.cs.purdue.edu',
  'xinu8': 'https://xinu.cs.purdue.edu',
  'resume.txt': 'https://docs.google.com/document/d/1EPNoUclm8Qs0Vbad_wvpiwvWjLRynip3JYSporWPdGM/edit?usp=sharing',
  'resume': 'https://docs.google.com/document/d/1EPNoUclm8Qs0Vbad_wvpiwvWjLRynip3JYSporWPdGM/edit?usp=sharing',
  'me81': 'https://www.instagram.com/andrewnook4/',
  'me41': 'https://www.instagram.com/andrewnook4/',
  'raspberrypi11': 'https://www.raspberrypi.org',
  'gmail': 'mailto:voigniersmith@gmail.com',
  'school_email': 'mailto:smit3407@purdue.edu',
  'instagram': 'https://www.instagram.com/andrewnook4/',
  'github': 'https://github.com/voigniersmith',
  'linkedin': 'https://www.linkedin.com/in/voigniersmith/',
  'README.md': 'https://www.github.com/voigniersmith/voigniersmith.github.io',
};

/**
 * Get file content by name
 * @param fileName - Name of the file
 * @returns Content array or null if not found
 */
export function getFileContent(fileName: string): string[] | null {
  return FILE_CONTENT_MAP[fileName] || null;
}

/**
 * Get external link for a file
 * @param fileName - Name of the file
 * @returns URL string or null if not found
 */
export function getFileLink(fileName: string): string | null {
  return FILE_LINK_MAP[fileName] || null;
}
