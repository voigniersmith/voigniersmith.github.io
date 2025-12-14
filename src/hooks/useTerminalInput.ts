import { useReducer, useCallback, useRef, useEffect } from 'react';
import { commands, dir, dir_type } from '../data';

interface TerminalInputState {
  caretTextBefore: string;
  caretChar: string;
  caretTextAfter: string;
  caretPosition: number;
  commandsHistory: string[];
  historyPointer: number;
  tabMatches?: string[];
  tabMatchIndex?: number;
}

type TerminalInputAction =
  | { type: 'RESET_CARET' }
  | { type: 'UPDATE_TEXT_BEFORE'; payload: string }
  | { type: 'UPDATE_CHAR'; payload: string }
  | { type: 'UPDATE_TEXT_AFTER'; payload: string }
  | { type: 'UPDATE_POSITION'; payload: number }
  | { type: 'ADD_COMMAND_TO_HISTORY'; payload: string }
  | { type: 'SET_HISTORY_POINTER'; payload: number }
  | { type: 'LOAD_PREVIOUS_COMMAND'; payload: string }
  | { type: 'LOAD_NEXT_COMMAND'; payload: string }
  | { type: 'SET_TAB_MATCHES'; payload: { matches: string[]; index: number } }
  | { type: 'NEXT_TAB_MATCH' }
  | { type: 'CLEAR_TAB_MATCHES' };

const initialState: TerminalInputState = {
  caretTextBefore: '',
  caretChar: ' ',
  caretTextAfter: '',
  caretPosition: 0,
  commandsHistory: [],
  historyPointer: 0,
};

function terminalInputReducer(
  state: TerminalInputState,
  action: TerminalInputAction
): TerminalInputState {
  switch (action.type) {
    case 'RESET_CARET':
      return {
        ...state,
        caretChar: ' ',
        caretTextBefore: '',
        caretTextAfter: '',
        caretPosition: 0,
      };
    case 'UPDATE_TEXT_BEFORE':
      return { ...state, caretTextBefore: action.payload };
    case 'UPDATE_CHAR':
      return { ...state, caretChar: action.payload };
    case 'UPDATE_TEXT_AFTER':
      return { ...state, caretTextAfter: action.payload };
    case 'UPDATE_POSITION':
      return { ...state, caretPosition: action.payload };
    case 'ADD_COMMAND_TO_HISTORY':
      return {
        ...state,
        commandsHistory: [...state.commandsHistory, action.payload],
        historyPointer: state.commandsHistory.length + 1,
      };
    case 'SET_HISTORY_POINTER':
      return { ...state, historyPointer: action.payload };
    case 'LOAD_PREVIOUS_COMMAND': {
      const index = Math.max(0, state.historyPointer - 1);
      return {
        ...state,
        caretTextBefore: action.payload,
        caretTextAfter: '',
        caretChar: ' ',
        caretPosition: action.payload.length,
        historyPointer: index,
      };
    }
    case 'LOAD_NEXT_COMMAND': {
      return {
        ...state,
        caretTextBefore: action.payload,
        caretTextAfter: '',
        caretChar: ' ',
        caretPosition: action.payload.length,
        historyPointer: state.historyPointer + 1,
      };
    }
    case 'SET_TAB_MATCHES': {
      return {
        ...state,
        tabMatches: action.payload.matches,
        tabMatchIndex: action.payload.index,
      };
    }
    case 'NEXT_TAB_MATCH': {
      if (!state.tabMatches || state.tabMatches.length === 0) {
        return state;
      }
      const nextIndex = ((state.tabMatchIndex || 0) + 1) % state.tabMatches.length;
      return {
        ...state,
        tabMatchIndex: nextIndex,
      };
    }
    case 'CLEAR_TAB_MATCHES': {
      return {
        ...state,
        tabMatches: undefined,
        tabMatchIndex: undefined,
      };
    }
    default:
      return state;
  }
}

export interface UseTerminalInputOptions {
  onSubmit?: ((input: string) => void) | null;
  focus?: boolean;
  curdir?: string;
}

export function useTerminalInput(options: UseTerminalInputOptions = {}) {
  const { onSubmit, focus = true, curdir = '~' } = options;
  const [state, dispatch] = useReducer(terminalInputReducer, initialState);
  const onSubmitRef = useRef(onSubmit);

  // Keep onSubmitRef synced
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  const handleKeyboardInput = useCallback(
    (event: KeyboardEvent) => {
      if (!focus) {
        return;
      }

      const key = event.key;
      const {
        caretTextBefore,
        caretChar,
        caretTextAfter,
        caretPosition,
        commandsHistory,
        historyPointer,
      } = state;

      // Line Finished (Enter)
      if (key === 'Enter') {
        event.preventDefault();
        const input = (caretTextBefore + caretChar + caretTextAfter).trim();
        if (onSubmitRef.current) {
          onSubmitRef.current(input);
        }
        if (input) {
          dispatch({ type: 'ADD_COMMAND_TO_HISTORY', payload: input });
        }
        dispatch({ type: 'CLEAR_TAB_MATCHES' });
        dispatch({ type: 'RESET_CARET' });
        return;
      }

      // Tab - Command/Directory completion with multiple match cycling
      if (key === 'Tab') {
        event.preventDefault();

        // Check if we're already in a tab completion cycle
        if (state.tabMatches && state.tabMatches.length > 0 && state.tabMatchIndex !== undefined) {
          // Continue cycling through existing matches without recalculating
          const nextIndex = (state.tabMatchIndex + 1) % state.tabMatches.length;
          const nextMatch = state.tabMatches[nextIndex];

          // Determine if we're completing a command or directory
          const parts = caretTextBefore.split(' ');
          const newTextBefore = parts.length > 1
            ? parts[0] + ' ' + nextMatch
            : nextMatch;

          dispatch({
            type: 'SET_TAB_MATCHES',
            payload: { matches: state.tabMatches, index: nextIndex },
          });
          dispatch({
            type: 'UPDATE_TEXT_BEFORE',
            payload: newTextBefore,
          });
          dispatch({
            type: 'UPDATE_POSITION',
            payload: newTextBefore.length,
          });
        } else {
          // First tab press in a new cycle - calculate matches
          const parts = caretTextBefore.split(' ');
          let matches: string[] = [];
          let prefix = '';
          let command = '';

          // Check if we're completing a file/directory argument (has space)
          if (parts.length > 1) {
            command = parts[0];
            prefix = parts[1];
            const directory = dir[curdir as keyof dir_type];
            matches = directory.filter(item =>
              item.toLowerCase().startsWith(prefix.toLowerCase())
            );
          }
          // Check if we're completing a command (no space yet)
          else if (parts.length === 1) {
            prefix = caretTextBefore;
            matches = commands.filter(cmd =>
              cmd.toLowerCase().startsWith(prefix.toLowerCase())
            );
          }

          // If we have matches, show the first one
          if (matches.length > 0) {
            const nextIndex = 0;
            const nextMatch = matches[nextIndex];

            const newTextBefore = parts.length > 1
              ? command + ' ' + nextMatch
              : nextMatch;

            dispatch({
              type: 'SET_TAB_MATCHES',
              payload: { matches, index: nextIndex },
            });
            dispatch({
              type: 'UPDATE_TEXT_BEFORE',
              payload: newTextBefore,
            });
            dispatch({
              type: 'UPDATE_POSITION',
              payload: newTextBefore.length,
            });
          } else {
            // No matches found, clear tab state
            dispatch({ type: 'CLEAR_TAB_MATCHES' });
          }
        }
        return;
      }

      // Backspace
      if (key === 'Backspace') {
        event.preventDefault();
        // Clear tab completion state when user modifies input
        dispatch({ type: 'CLEAR_TAB_MATCHES' });
        dispatch({
          type: 'UPDATE_TEXT_BEFORE',
          payload: caretTextBefore.slice(0, -1),
        });
        if (caretTextBefore.length !== 0) {
          dispatch({ type: 'UPDATE_POSITION', payload: caretPosition - 1 });
        }
        return;
      }

      // Arrow Up - Previous command
      if (key === 'ArrowUp') {
        event.preventDefault();
        if (commandsHistory.length === 0) {
          return;
        }
        const index = Math.max(0, historyPointer - 1);
        const command = commandsHistory[index] || '';
        dispatch({ type: 'LOAD_PREVIOUS_COMMAND', payload: command });
        return;
      }

      // Arrow Down - Next command
      if (key === 'ArrowDown') {
        event.preventDefault();
        if (historyPointer === commandsHistory.length) {
          return;
        }
        const command = commandsHistory[historyPointer] || '';
        dispatch({ type: 'LOAD_NEXT_COMMAND', payload: command });
        return;
      }

      // Arrow Left
      if (key === 'ArrowLeft') {
        event.preventDefault();
        if (caretPosition > 0) {
          dispatch({ type: 'UPDATE_POSITION', payload: caretPosition - 1 });
          dispatch({
            type: 'UPDATE_TEXT_AFTER',
            payload: caretChar + caretTextAfter,
          });
          dispatch({
            type: 'UPDATE_CHAR',
            payload: caretTextBefore.substring(caretTextBefore.length - 1),
          });
          dispatch({
            type: 'UPDATE_TEXT_BEFORE',
            payload: caretTextBefore.slice(0, -1),
          });
        }
        return;
      }

      // Arrow Right
      if (key === 'ArrowRight') {
        event.preventDefault();
        if (caretTextAfter && caretPosition < caretTextBefore.length + caretTextAfter.length) {
          dispatch({ type: 'UPDATE_POSITION', payload: caretPosition + 1 });
          dispatch({
            type: 'UPDATE_TEXT_BEFORE',
            payload: caretTextBefore + caretChar,
          });
          dispatch({
            type: 'UPDATE_CHAR',
            payload: caretTextAfter.substring(0, 1),
          });
          dispatch({
            type: 'UPDATE_TEXT_AFTER',
            payload: caretTextAfter.substring(1),
          });
        }
        return;
      }

      // Paste (Cmd/Ctrl + V)
      if ((event.metaKey || event.ctrlKey) && key.toLowerCase() === 'v') {
        event.preventDefault();
        navigator.clipboard.readText().then((pastedText) => {
          dispatch({
            type: 'UPDATE_TEXT_BEFORE',
            payload: caretTextBefore + pastedText,
          });
          dispatch({
            type: 'UPDATE_POSITION',
            payload: caretPosition + pastedText.length,
          });
        });
        return;
      }

      // Copy (Cmd/Ctrl + C)
      if ((event.metaKey || event.ctrlKey) && key.toLowerCase() === 'c') {
        event.preventDefault();
        const w = window.getSelection();
        if (w) {
          navigator.clipboard.writeText(w.toString());
        }
        return;
      }

      // Regular character input
      if (key && key.length === 1) {
        event.preventDefault();
        // Clear tab completion state when user types new character
        dispatch({ type: 'CLEAR_TAB_MATCHES' });
        dispatch({
          type: 'UPDATE_POSITION',
          payload: caretPosition + 1,
        });
        dispatch({
          type: 'UPDATE_TEXT_BEFORE',
          payload: caretTextBefore + key,
        });
      }
    },
    [state, focus, curdir]
  );

  // Bind keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardInput as any);
    return () => {
      document.removeEventListener('keydown', handleKeyboardInput as any);
    };
  }, [handleKeyboardInput]);

  return {
    ...state,
    handleKeyboardInput,
  };
}
