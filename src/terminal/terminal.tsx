import { useState, useEffect, useRef, ReactNode, CSSProperties, forwardRef } from 'react';
import { useTerminalInput } from '../hooks/useTerminalInput';
import TerminalInput from './linetypes/TerminalInput';
import TerminalOutput from './linetypes/TerminalOutput';
import './style.css';


export enum ColorMode {
  Dark = 0,           // Default dark theme (VS Code dark)
  Light = 1,          // Light theme
  Dracula = 2,        // Dracula theme
  Nord = 3,           // Nord theme (cool blues)
  Monokai = 4,        // Monokai theme
  SolarizedDark = 5,  // Solarized dark
  GruvBox = 6,        // Gruvbox theme (warm, earthy)
}

export interface Props {
  name?: string
  prompt?: string
  colorMode?: ColorMode
  children?: ReactNode;
  onInput?: ((input: string) => void) | null | undefined,
  num: number,
  curdir?: string,
  style?: CSSProperties,
  onGetHistory?: () => string[];
  readOnly?: boolean;
}

const Terminal = forwardRef<HTMLDivElement, Props>(({name, colorMode, onInput, prompt, children, num, curdir, style, onGetHistory, readOnly = false}: Props, ref) => {
  /* HOOKS */
  const terminalInput = useTerminalInput({
    onSubmit: onInput,
    focus: !readOnly,
    curdir: curdir || '~',
  });

  const [promptStr, setPromptStr] = useState(prompt || '$');

  /* CONSTS */
  const terminalNum = "react-terminal-" + num;
  const scrollIntoViewRef = useRef<HTMLDivElement>(null)

  /* EFFECTS */
  // Scroll the last line of input into view
  useEffect(() => {
    scrollIntoViewRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [children]);

  // Ensure Prompt is Updated
  useEffect(() => {
    setPromptStr(prompt || '$');
  }, [prompt])

  // Theme State
  const classes = ['react-terminal-wrapper'];
  const themeNames: { [key in ColorMode]: string } = {
    [ColorMode.Dark]: 'react-terminal-dark',
    [ColorMode.Light]: 'react-terminal-light',
    [ColorMode.Dracula]: 'react-terminal-dracula',
    [ColorMode.Nord]: 'react-terminal-nord',
    [ColorMode.Monokai]: 'react-terminal-monokai',
    [ColorMode.SolarizedDark]: 'react-terminal-solarized-dark',
    [ColorMode.GruvBox]: 'react-terminal-gruvbox',
  };
  if (colorMode !== undefined && colorMode in themeNames) {
    classes.push(themeNames[colorMode as ColorMode]);
  }

  // New Input Component
  return (
    <div ref={ref} className={ classes.join(' ') } data-terminal-name={ name } style={style}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Scrollable output section */}
        <div className={terminalNum} style={{ flex: '1 1 auto', overflow: 'auto' }}>
          {children}
          <div ref={ scrollIntoViewRef }></div>
        </div>

        {/* Sticky input section */}
        {!readOnly ? (
          <div className='react-terminal-line' style={{ flexShrink: 0, paddingLeft: '12px', paddingRight: '12px' }}>
            <span style={{ color: 'white', }}>{promptStr + " "}</span>

            <span className='preWhiteSpace'>{terminalInput.caretTextBefore}</span>

            <pre className='caret-block'>
              <span>{terminalInput.caretChar}</span>
            </pre>

            <span className='preWhiteSpace'>{terminalInput.caretTextAfter}</span>
          </div>
        ) : (
          <div className='react-terminal-line' style={{ flexShrink: 0, paddingLeft: '12px', paddingRight: '12px' }}>
          </div>
        )}

        {/* Footer with terminal name */}
        {name && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '28px',
            backgroundColor: '#0d0f12',
            borderTop: '1px solid #2a2e36',
            paddingLeft: '12px',
            paddingRight: '12px',
            fontSize: '1em',
            color: '#888',
            fontFamily: '"Lucida Console", Courier, monospace',
            flexShrink: 0
          }}>
            <span>│ {name}</span>
            {readOnly && <span>[RO]</span>}
          </div>
        )}
      </div>
    </div>
  );
});

Terminal.displayName = 'Terminal';

export { TerminalInput, TerminalOutput };
export default Terminal;