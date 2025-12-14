import React from 'react';

export interface Command {
  match: (input: string) => boolean;
  execute: (input: string, lineData: React.ReactNode[], curdir: string) => React.ReactNode[];
  description: string;
  targetTerminal?: 0 | 1;
}

export interface CommandDeps {
  createOutput: (text: string) => React.ReactElement;
  onAnimationRef: React.MutableRefObject<((content: string[], speed: number) => void) | undefined>;
  onCurDirRef: React.MutableRefObject<((dir: string) => void) | undefined>;
  onPromptRef: React.MutableRefObject<((prompt: string) => void) | undefined>;
  onStopAnimationRef: React.MutableRefObject<(() => void) | undefined>;
  onThemeRef: React.MutableRefObject<((colorMode: number) => void) | undefined>;
  getHistoryRef: React.MutableRefObject<(() => string[]) | undefined>;
  onUpdateLineDataRef: React.MutableRefObject<((updater: (ld: React.ReactNode[]) => React.ReactNode[]) => void) | undefined>;
  onUpdateLineData0Ref: React.MutableRefObject<((updater: (ld: React.ReactNode[]) => React.ReactNode[]) => void) | undefined>;
  fileCheck: (str: string, curdir: string) => string | undefined;
  executeAsyncCommand: (
    commandName: string,
    fetchingMessage: string,
    fetchFn: () => Promise<any>,
    buildOutputFn: (data: any) => string[],
    displayFn: (lines: string[]) => void
  ) => void;
}
