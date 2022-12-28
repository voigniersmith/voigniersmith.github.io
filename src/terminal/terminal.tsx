import { useState, useEffect, useRef, KeyboardEvent, ReactNode } from 'react';
import { commands, dir, dir_type } from '../data';
import TerminalInput from './linetypes/TerminalInput';
import TerminalOutput from './linetypes/TerminalOutput';
import './style.css';

export enum ColorMode {
  Light,
  Dark
}

export interface Props {
  name?: string
  prompt?: string
  colorMode?: ColorMode
  children?: ReactNode;
  onInput?: ((input: string) => void) | null | undefined,
  num: number,
  curdir?: string,
}

const Terminal = ({name, colorMode, onInput, prompt, children, num, curdir}: Props) => {
  /* HOOKS */
  const [caretPosition, setCaretPosition] = useState(0);
  const [caretChar, setCaretChar] = useState(" ");
  const [commandsHistory, setCommandsHistory] = useState([] as string []);
  const [historyPointer, setHistoryPointer] = useState(0);
  const [caretTextBefore, setCaretTextBefore] = useState("");
  const [caretTextAfter, setCaretTextAfter] = useState("");
  const [promptStr, setPromptStr] = useState(prompt || '$');
  
  /* CONSTS */
  const focus = (num !== 0) ? true : false;
  const terminalNum = "react-terminal-" + num;
  const scrollIntoViewRef = useRef<HTMLDivElement>(null)

  /* EFFECTS */
  // Scroll the last line of input into view
  useEffect(() => {
    scrollIntoViewRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [children]);

  // Binding Event Listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyboardInput as any);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("keydown", handleKeyboardInput as any);
    };
  });

  // Set this up so focus is based on event.
  // useEffect(() => {
  //   if (onInput == null) {
  //     return;
  //   }
  //   // keep reference to listeners so we can perform cleanup
  //   const elListeners: { terminalEl: Element; listener: EventListenerOrEventListenerObject }[] = [];
  //   for (const terminalEl of document.getElementsByClassName('react-terminal-wrapper')) {
  //     const listener = (e: Event) => {
  //       if (terminalEl.contains(e.target as Node) && terminalEl.contains(document.getElementsByClassName(terminalNum)[0])) {
  //         setFocus(true);
  //       } else {
  //         setFocus(false);
  //       }
  //     }
  //     terminalEl?.addEventListener('click', listener);
  //     elListeners.push({ terminalEl, listener });
  //   }
  //   return function cleanup () {
  //     elListeners.forEach(elListener => {
  //       elListener.terminalEl.removeEventListener('click', elListener.listener);
  //     });
  //   }
  // }, [onInput, terminalNum]);

  // Ensure Prompt is Updated
  useEffect(() => {
    setPromptStr(prompt || '$');
  }, [prompt])

  /* FUNCTIONS */
  // Append command to history
  function appendCommand(command: string) {
    if (!command) {
      return;
    }

    setCommandsHistory(commandsHistory.concat(command));
    setHistoryPointer(historyPointer + 1);
  }

  // Get last command
  function getPreviousCommand() {
    if (historyPointer === 0) {
      return commandsHistory[0];
    }

    const command = commandsHistory[historyPointer - 1];
    if (historyPointer > 0) {
      setHistoryPointer(historyPointer - 1);
    }

    return command;
  }

  // Get next command
  function getNextCommand() {
    if (historyPointer < commandsHistory.length) {
      const command = commandsHistory[historyPointer + 1];
      setHistoryPointer(historyPointer + 1);
      return command;
    }
    return "";
  }

  /* HANDLERS */
  // Keyboard Input Handler
  const handleKeyboardInput = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const key = event.key;

    if (!focus) {
      return;
    }

    // Line Finished
    if (onInput != null && key === "Enter") {
      // Update Terminal Controller
      onInput((caretTextBefore + caretChar + caretTextAfter).trim());
      
      // Add to history
      appendCommand((caretTextBefore + caretChar + caretTextAfter).trim());
      
      // Update Visible Line
      setCaretChar(" ");
      setCaretTextBefore("");
      setCaretTextAfter("");
      setCaretPosition(0);
      return;
    }

    // Control Keys
    if (key === "Tab") {
      if (caretTextBefore.split(" ").length > 1) {
        const directory = dir[curdir as keyof dir_type];
        for (let i = 0; i < directory.length; i++) {
          if (caretTextBefore.split(" ")[1].localeCompare(directory[i].substring(0, caretTextBefore.split(" ")[1].length)) === 0) {
            setCaretTextBefore(caretTextBefore.split(" ")[0] + " " + directory[i]);
            setCaretPosition(directory[i].length);
            return;
          }
        }
      } else if (caretTextBefore.split(" ").length === 1) {
        const commandList = commands;
        for (let i = 0; i < commandList.length; i++) {
          if (caretTextBefore.localeCompare(commandList[i].substring(0, caretTextBefore.length)) === 0) {
            setCaretTextBefore(commandList[i]);
            setCaretPosition(commandList[i].length);
            return;
          }
        }
      }
    } else if (key === "Backspace") {
      setCaretTextBefore(caretTextBefore.slice(0, -1));
      if (caretTextBefore.length !== 0) setCaretPosition(caretPosition - 1);
    } else if (key === "ArrowUp") {
      // Does history exist?
      if (commandsHistory.length === 0) {
        return;
      }

      // Update Line to History
      const command = getPreviousCommand();
      setCaretTextBefore(command);
      setCaretTextAfter("");

      // Fix Caret Location
      setCaretPosition(command.length);
      setCaretChar(" ");
    } else if (key === "ArrowDown") {
      // Make sure can traverese
      if (historyPointer === commandsHistory.length) {
        return;
      }

      // Update Line with History
      const command = getNextCommand();
      setCaretTextBefore(command);
      setCaretTextAfter("");

      // Fix Caret Location
      setCaretChar(" ");
      if (command) {
        setCaretPosition(command.length);
      } else {
        setCaretTextBefore("");
        setCaretPosition(0);
      }
    } else if (key === "ArrowLeft") {
      if (caretPosition > 0) {
        setCaretPosition(caretPosition - 1);
      } else {
        return;
      }

      setCaretTextAfter(caretChar + caretTextAfter);  
      setCaretChar(caretTextBefore.substring(caretTextBefore.length - 1));
      setCaretTextBefore(caretTextBefore.slice(0, -1));
    } else if (key === "ArrowRight") {      
      if (caretTextAfter && caretPosition < (caretTextBefore.length + (caretTextAfter.length))) {
        setCaretPosition(caretPosition + 1);
      } else {
        return;
      }
      
      setCaretTextBefore(caretTextBefore + caretChar);
      setCaretChar(caretTextAfter.substring(0, 1));
      setCaretTextAfter(caretTextAfter.substring(1));
    } else if ((event.metaKey || event.ctrlKey) && key.toLowerCase() === "v") {
      navigator.clipboard.readText()
      .then(pastedText => {
        setCaretTextBefore(caretTextBefore + pastedText);
        setCaretPosition(caretPosition + pastedText.length);
      });
    } else if ((event.metaKey || event.ctrlKey) && key.toLowerCase() === "c") {
      const w = window.getSelection();
      if (w) {
        const selectedText = w.toString();
        navigator.clipboard.writeText(selectedText)
        .then(() => {
          setCaretTextBefore(caretTextBefore);
          setCaretTextAfter(caretTextAfter);
          setCaretPosition(caretPosition);
        });
      }
    } else {
      if (key && key.length === 1) {
        setCaretPosition(caretPosition + 1);
        setCaretTextBefore(caretTextBefore + key);
      }
    }
  }

  // Theme State
  const classes = ['react-terminal-wrapper'];
  if (colorMode === ColorMode.Light) {
    classes.push('react-terminal-light');
  }

  // New Input Component
  return (
    <div className={ classes.join(' ') } data-terminal-name={ name }>
      <div className={terminalNum}>
        {children}
        
        {
          focus ? (
            <div className='react-terminal-line'>
              <span style={{ color: 'white', }}>{promptStr + " "}</span>

              <span className='preWhiteSpace'>{caretTextBefore}</span>

              <pre className='caret-block'>
                <span>{caretChar}</span>
              </pre>

              <span className='preWhiteSpace'>{caretTextAfter}</span>
            </div>
          ) : (
            <div className='react-terminal-line'>
              {/* <span style={{ color: 'white', }}>{promptStr + " "}</span>

              <span className='preWhiteSpace'>{caretTextBefore}</span>
              <span>{caretChar}</span>
              <span className='preWhiteSpace'>{caretTextAfter}</span> */}
            </div>
          )
        }

        <div ref={ scrollIntoViewRef }></div>
      </div>

    </div>
  );
}

export { TerminalInput, TerminalOutput };
export default Terminal;